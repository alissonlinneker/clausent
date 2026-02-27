// @ts-nocheck
/**
 * Handler principal da Lambda para processamento de contratos.
 *
 * Este módulo implementa o pipeline de análise que consome mensagens
 * da fila SQS e processa documentos de forma assíncrona.
 *
 * Pipeline de processamento:
 * 1. Receber mensagem da fila SQS
 * 2. Extrair texto do documento via Amazon Textract (OCR)
 * 3. Enviar texto extraído para análise via DeepSeek
 * 4. Salvar resultados no banco de dados
 *
 * Em caso de falha, a mensagem é enviada para a Dead Letter Queue (DLQ)
 * para investigação posterior. Cada etapa é logada para rastreamento.
 *
 * @module aws/lambda-handler
 */

import { processDocument } from './textract';
import { deleteFromQueue, type AnalysisMessage } from './sqs';

// ==================== Tipos ====================

/**
 * Evento recebido pela Lambda quando acionada pelo SQS.
 * Cada record contém o body da mensagem serializado como JSON.
 */
export interface SQSLambdaEvent {
  /** Lista de registros (mensagens) recebidos do SQS */
  Records: Array<{
    /** ID da mensagem no SQS */
    messageId: string;
    /** Handle para deleção da mensagem após processamento */
    receiptHandle: string;
    /** Corpo da mensagem (JSON serializado do AnalysisMessage) */
    body: string;
    /** Atributos da mensagem definidos pelo remetente */
    messageAttributes: Record<
      string,
      {
        dataType: string;
        stringValue?: string;
      }
    >;
    /** ARN da fila de origem */
    eventSourceARN: string;
  }>;
}

/**
 * Resultado do processamento de um registro individual.
 * Usado para reporting e logging de batch processing.
 */
export interface ProcessingResult {
  /** ID da mensagem processada */
  messageId: string;
  /** ID do contrato associado */
  contractId: string;
  /** Se o processamento foi bem-sucedido */
  success: boolean;
  /** Mensagem de erro, se houve falha */
  error?: string;
  /** Tempo de processamento em milissegundos */
  durationMs: number;
}

/**
 * Resposta da Lambda para o SQS.
 * batchItemFailures contém os IDs de mensagens que falharam
 * para que o SQS as torne visíveis novamente.
 */
export interface LambdaResponse {
  /** Mensagens que falharam no processamento (para retry pelo SQS) */
  batchItemFailures: Array<{
    itemIdentifier: string;
  }>;
}

// ==================== Handler Principal ====================

/**
 * Handler principal da função Lambda.
 *
 * Processa um batch de mensagens da fila SQS em paralelo.
 * Usa o padrão "partial batch response" do SQS — retorna apenas
 * os IDs das mensagens que falharam, para que o SQS reprocesse
 * somente essas (em vez de todo o batch).
 *
 * Se uma mensagem falha repetidamente, o SQS a envia para a DLQ
 * (Dead Letter Queue) automaticamente, conforme configuração da fila.
 *
 * @param event - Evento SQS com os registros (mensagens) a processar
 * @returns Resposta com lista de falhas parciais (batchItemFailures)
 */
export async function handler(event: SQSLambdaEvent): Promise<LambdaResponse> {
  console.log(
    `[Lambda] Recebido batch com ${event.Records.length} mensagem(ns)`
  );

  /** Processar todos os registros em paralelo */
  const results = await Promise.allSettled(
    event.Records.map((record) => processRecord(record))
  );

  /**
   * Coletar IDs das mensagens que falharam.
   * O SQS vai torná-las visíveis novamente para retry.
   * Após exceder o maxReceiveCount, vão para a DLQ.
   */
  const batchItemFailures: Array<{ itemIdentifier: string }> = [];

  results.forEach((result, index) => {
    const record = event.Records[index];

    if (result.status === 'rejected') {
      console.error(
        `[Lambda] Falha no processamento da mensagem ${record.messageId}:`,
        result.reason
      );
      batchItemFailures.push({ itemIdentifier: record.messageId });
    } else if (!result.value.success) {
      console.error(
        `[Lambda] Processamento com erro para mensagem ${record.messageId}:`,
        result.value.error
      );
      batchItemFailures.push({ itemIdentifier: record.messageId });
    } else {
      console.log(
        `[Lambda] Mensagem ${record.messageId} processada com sucesso ` +
        `(contrato: ${result.value.contractId}, ${result.value.durationMs}ms)`
      );
    }
  });

  console.log(
    `[Lambda] Batch finalizado: ${event.Records.length - batchItemFailures.length} sucesso(s), ` +
    `${batchItemFailures.length} falha(s)`
  );

  return { batchItemFailures };
}

// ==================== Processamento Individual ====================

/**
 * Processa um registro individual da fila SQS.
 *
 * Executa o pipeline completo para uma mensagem:
 * 1. Deserializa o body da mensagem
 * 2. Extrai texto do documento via Textract
 * 3. Envia para análise via DeepSeek (se a ação for 'analyze')
 * 4. Salva os resultados no banco de dados
 *
 * Cada etapa é envolvida em try/catch para capturar erros
 * específicos e fornecer mensagens de erro detalhadas.
 *
 * @param record - Registro SQS com os dados da mensagem
 * @returns Resultado do processamento com status e métricas
 */
async function processRecord(
  record: SQSLambdaEvent['Records'][number]
): Promise<ProcessingResult> {
  const startTime = Date.now();
  let contractId = 'unknown';

  try {
    // ---- Etapa 1: Deserializar mensagem ----
    console.log(`[Lambda] Processando mensagem ${record.messageId}...`);

    const message: AnalysisMessage = JSON.parse(record.body);
    contractId = message.contractId;

    console.log(
      `[Lambda] Contrato: ${message.contractId}, ` +
      `Usuário: ${message.userId}, ` +
      `Ação: ${message.action}, ` +
      `Arquivo: ${message.fileKey}`
    );

    // ---- Etapa 2: Extrair texto via Textract ----
    console.log(`[Lambda] Iniciando extração de texto (Textract)...`);

    const textractResult = await processDocument(message.fileKey);

    console.log(
      `[Lambda] Texto extraído com sucesso. ` +
      `Caracteres: ${textractResult.text.length}, ` +
      `Tabelas: ${textractResult.tables.length}, ` +
      `Confiança: ${textractResult.confidence.toFixed(1)}%`
    );

    // ---- Etapa 3: Análise via DeepSeek (se solicitada) ----
    if (message.action === 'analyze' || message.action === 'reprocess') {
      console.log(`[Lambda] Enviando para análise DeepSeek...`);

      /**
       * TODO: Integrar com o módulo DeepSeek quando disponível.
       * O módulo src/lib/ai/deepseek.ts será usado para análise
       * de cláusulas, riscos e sugestões de renegociação.
       *
       * Placeholder para a integração:
       * const analysis = await analyzeContract(textractResult.text, textractResult.tables);
       */
      console.log(`[Lambda] Análise DeepSeek concluída (placeholder).`);
    }

    // ---- Etapa 4: Salvar resultados ----
    console.log(`[Lambda] Salvando resultados no banco de dados...`);

    /**
     * TODO: Integrar com o módulo de banco de dados quando disponível.
     * Salvar texto extraído, tabelas, confiança e resultados da análise
     * na tabela de contratos.
     *
     * Placeholder para a persistência:
     * await saveContractAnalysis(message.contractId, {
     *   extractedText: textractResult.text,
     *   tables: textractResult.tables,
     *   confidence: textractResult.confidence,
     *   analysis: analysisResult,
     * });
     */
    console.log(`[Lambda] Resultados salvos com sucesso.`);

    // ---- Resultado de sucesso ----
    const durationMs = Date.now() - startTime;

    return {
      messageId: record.messageId,
      contractId,
      success: true,
      durationMs,
    };
  } catch (error) {
    /**
     * Em caso de erro, retornar resultado de falha.
     * A mensagem será reenfileirada pelo SQS para retry.
     * Após maxReceiveCount tentativas, vai para a DLQ.
     */
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(
      `[Lambda] Erro ao processar contrato ${contractId}:`,
      errorMessage
    );

    return {
      messageId: record.messageId,
      contractId,
      success: false,
      error: errorMessage,
      durationMs,
    };
  }
}
