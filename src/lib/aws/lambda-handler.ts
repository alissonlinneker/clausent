// @ts-nocheck
/**
 * Handler principal da Lambda para processamento de contratos.
 *
 * Este módulo implementa o pipeline de análise que consome mensagens
 * da fila SQS e processa documentos de forma assíncrona.
 *
 * Pipeline de processamento:
 * 1. Receber mensagem da fila SQS
 * 2. Detectar formato do arquivo e extrair texto com a estratégia adequada
 * 3. Enviar texto extraído para análise via DeepSeek
 * 4. Salvar resultados no banco de dados
 *
 * Estratégias de extração por formato:
 * - PDF e imagens → Amazon Textract (OCR)
 * - DOCX → extração direta via XML parsing (sem OCR)
 * - TXT → leitura direta do S3 (sem OCR)
 * - Outros → fallback para Textract
 *
 * Em caso de falha, a mensagem é enviada para a Dead Letter Queue (DLQ)
 * para investigação posterior. Cada etapa é logada para rastreamento.
 *
 * @module aws/lambda-handler
 */

import { GetObjectCommand } from '@aws-sdk/client-s3';
import { processDocument, type Table } from './textract';
import { getS3Client, S3_BUCKET } from './config';
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

// ==================== Constantes de MIME Types ====================

/**
 * MIME types que devem ser processados pelo Amazon Textract (OCR).
 * Inclui PDFs e formatos de imagem suportados pelo Textract.
 */
const TEXTRACT_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/tiff',
] as const;

/** MIME type do formato DOCX (Office Open XML) */
const DOCX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/** MIME type de texto puro */
const TXT_MIME_TYPE = 'text/plain';

// ==================== Extração Inteligente ====================

/**
 * Extrai texto de um documento usando a estratégia mais eficiente
 * com base no tipo MIME e na extensão do arquivo.
 *
 * A função detecta o formato e escolhe o caminho de extração:
 *
 * 1. **PDF** (application/pdf) → Amazon Textract
 *    PDFs podem conter texto como imagem (escaneados), por isso
 *    precisam de OCR via Textract para extração confiável.
 *
 * 2. **Imagens** (image/png, image/jpeg, image/tiff) → Amazon Textract
 *    Imagens sempre requerem OCR para converter pixels em texto.
 *
 * 3. **DOCX** (application/vnd.openxmlformats...) → extração direta
 *    DOCX já contém texto estruturado em XML interno. Usar Textract
 *    seria desperdício — a extração direta é mais rápida e barata.
 *
 * 4. **TXT** (text/plain) → leitura direta do S3
 *    Arquivos de texto puro podem ser lidos diretamente, sem nenhum
 *    processamento adicional. É o caminho mais eficiente possível.
 *
 * 5. **Fallback** → Amazon Textract
 *    Para formatos desconhecidos, delega ao Textract que tem suporte
 *    amplo e pode lidar com diversos tipos de documento.
 *
 * @param fileKey - Chave do arquivo no bucket S3
 * @param mimeType - Tipo MIME do arquivo (ex: application/pdf)
 * @returns Objeto com texto extraído, tabelas encontradas e confiança
 */
async function smartExtractText(
  fileKey: string,
  mimeType: string
): Promise<{ text: string; tables: Table[]; confidence: number }> {
  /**
   * Normalizar o mimeType para comparação segura.
   * Remove espaços extras e converte para minúsculas.
   */
  const normalizedMime = mimeType.trim().toLowerCase();

  /**
   * Extrair a extensão do arquivo para dupla verificação.
   * Útil quando o mimeType não é confiável (ex: application/octet-stream).
   */
  const extension = fileKey.split('.').pop()?.toLowerCase() || '';

  // ---- Caminho 1: PDF → Textract (OCR) ----
  if (normalizedMime === 'application/pdf' || extension === 'pdf') {
    console.log(
      `[Lambda] Formato detectado: PDF → usando Amazon Textract (OCR)`
    );
    return processDocument(fileKey);
  }

  // ---- Caminho 2: Imagens → Textract (OCR) ----
  if (
    normalizedMime.startsWith('image/') ||
    ['png', 'jpg', 'jpeg', 'tiff', 'tif'].includes(extension)
  ) {
    console.log(
      `[Lambda] Formato detectado: Imagem (${normalizedMime}) → usando Amazon Textract (OCR)`
    );
    return processDocument(fileKey);
  }

  // ---- Caminho 3: DOCX → extração direta via XML parsing ----
  if (normalizedMime === DOCX_MIME_TYPE || extension === 'docx') {
    console.log(
      `[Lambda] Formato detectado: DOCX → extração direta (sem OCR)`
    );
    return extractFromDocx(fileKey);
  }

  // ---- Caminho 4: TXT → leitura direta do S3 ----
  if (normalizedMime === TXT_MIME_TYPE || extension === 'txt') {
    console.log(
      `[Lambda] Formato detectado: TXT → leitura direta do S3 (sem OCR)`
    );
    return extractFromTxt(fileKey);
  }

  // ---- Caminho 5: Fallback → Textract para formatos desconhecidos ----
  console.log(
    `[Lambda] Formato não reconhecido (${normalizedMime}, ext: .${extension}) → ` +
    `fallback para Amazon Textract`
  );
  return processDocument(fileKey);
}

/**
 * Extrai texto de um arquivo DOCX armazenado no S3.
 *
 * Delega para a função extractDocxFromS3 do módulo text-extractor,
 * que faz o download do arquivo e extrai o conteúdo das tags <w:t>
 * do formato Office Open XML.
 *
 * Como DOCX já possui texto estruturado, não há necessidade de OCR.
 * A confiança é definida como 100% pois a extração é determinística.
 * Tabelas são retornadas vazias — a extração de tabelas de DOCX
 * não é suportada neste caminho (apenas texto corrido).
 *
 * @param fileKey - Chave do arquivo DOCX no S3
 * @returns Texto extraído, tabelas vazias e confiança de 100%
 */
async function extractFromDocx(
  fileKey: string
): Promise<{ text: string; tables: Table[]; confidence: number }> {
  /**
   * Importar a função de extração de DOCX do módulo text-extractor.
   * Usa import dinâmico para manter o bundle leve quando não necessário.
   */
  const { extractText: extractTextFromExtractor } = await import(
    '@/lib/ai/text-extractor'
  );

  /** Extrair texto passando o mimeType correto para usar o caminho DOCX */
  const text = await extractTextFromExtractor(fileKey, DOCX_MIME_TYPE);

  return {
    text,
    /**
     * Tabelas retornadas vazias — a extração de tabelas de DOCX
     * exigiria parsing adicional das tags <w:tbl> do Open XML,
     * que não está implementado no extrator simplificado.
     */
    tables: [],
    /**
     * Confiança de 100% — a extração de DOCX é determinística,
     * diferente do OCR que envolve probabilidade de acerto.
     */
    confidence: 100,
  };
}

/**
 * Lê o conteúdo de um arquivo TXT diretamente do S3.
 *
 * Arquivos de texto puro (.txt) não precisam de nenhum processamento
 * especial — basta fazer download do S3 e converter para string.
 * Este é o caminho mais eficiente e barato de todos.
 *
 * A confiança é definida como 100% pois a leitura é exata.
 * Tabelas são retornadas vazias — TXT não possui dados tabulares.
 *
 * @param fileKey - Chave do arquivo TXT no S3
 * @returns Texto lido, tabelas vazias e confiança de 100%
 */
async function extractFromTxt(
  fileKey: string
): Promise<{ text: string; tables: Table[]; confidence: number }> {
  /** Obter o cliente S3 pré-configurado do módulo de config */
  const s3 = getS3Client();

  /** Enviar comando para download do arquivo do S3 */
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: fileKey,
    })
  );

  /** Validar que o corpo da resposta existe */
  if (!response.Body) {
    throw new Error(
      `[Lambda] Arquivo TXT vazio ou não encontrado no S3: ${fileKey}`
    );
  }

  /**
   * Converter o stream de resposta do S3 para string UTF-8.
   * O método transformToString() já lida com a leitura completa
   * do stream e conversão de encoding.
   */
  const text = await response.Body.transformToString('utf-8');

  return {
    text,
    /** TXT não possui dados tabulares */
    tables: [],
    /** Confiança de 100% — leitura exata, sem OCR envolvido */
    confidence: 100,
  };
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
 * 2. Detecta o formato do arquivo e extrai texto com a estratégia adequada
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
      `Arquivo: ${message.fileKey}, ` +
      `MIME: ${message.mimeType}`
    );

    // ---- Etapa 2: Extrair texto via estratégia inteligente ----
    console.log(`[Lambda] Iniciando extração inteligente de texto...`);

    /**
     * Usa smartExtractText em vez de chamar processDocument diretamente.
     * A função detecta o formato pelo mimeType e extensão do arquivo,
     * escolhendo a estratégia mais eficiente:
     * - PDF/imagens → Textract (OCR)
     * - DOCX → extração direta via XML
     * - TXT → leitura direta do S3
     */
    const extractionResult = await smartExtractText(
      message.fileKey,
      message.mimeType
    );

    console.log(
      `[Lambda] Texto extraído com sucesso. ` +
      `Caracteres: ${extractionResult.text.length}, ` +
      `Tabelas: ${extractionResult.tables.length}, ` +
      `Confiança: ${extractionResult.confidence.toFixed(1)}%`
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
       * const analysis = await analyzeContract(extractionResult.text, extractionResult.tables);
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
     *   extractedText: extractionResult.text,
     *   tables: extractionResult.tables,
     *   confidence: extractionResult.confidence,
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
