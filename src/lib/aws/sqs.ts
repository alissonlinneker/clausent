// @ts-nocheck
/**
 * Módulo de integração com Amazon SQS para o Orbit.
 *
 * Responsável por enviar e receber mensagens da fila de análise
 * de contratos. A fila SQS desacopla o recebimento do contrato
 * do processamento, permitindo escalabilidade e resiliência.
 *
 * Operações suportadas:
 * - sendToAnalysisQueue: envia mensagem para processamento
 * - receiveFromQueue: consome mensagens pendentes (para workers)
 *
 * @module aws/sqs
 */

import {
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { getSQSClient, SQS_QUEUE_URL } from './config';

// ==================== Tipos ====================

/**
 * Payload da mensagem enviada para a fila de análise.
 * Contém todos os dados necessários para o worker processar o contrato.
 */
export interface AnalysisMessage {
  /** ID do contrato no banco de dados */
  contractId: string;
  /** ID do usuário que enviou o contrato */
  userId: string;
  /** Key do arquivo no S3 (ex: contracts/{userId}/{uuid}/{fileName}) */
  fileKey: string;
  /**
   * Tipo MIME do arquivo enviado.
   * Usado para determinar a estratégia de extração de texto:
   * - application/pdf → Textract (OCR)
   * - image/* → Textract (OCR)
   * - application/vnd.openxmlformats-officedocument.wordprocessingml.document → extração direta DOCX
   * - text/plain → leitura direta do S3
   */
  mimeType: string;
  /**
   * Ação a ser executada pelo worker.
   * - extract: apenas extrair texto (OCR)
   * - analyze: extrair texto e executar análise completa
   * - reprocess: reprocessar documento já extraído
   */
  action: 'extract' | 'analyze' | 'reprocess';
}

// ==================== Constantes ====================

/**
 * Tempo de visibilidade da mensagem (30 segundos).
 * Enquanto um worker está processando uma mensagem, ela fica
 * invisível para outros workers por este período.
 */
const VISIBILITY_TIMEOUT_SECONDS = 30;

/**
 * Tempo máximo de espera por mensagens (20 segundos).
 * Usa long polling para reduzir custos e latência.
 */
const WAIT_TIME_SECONDS = 20;

/** Número máximo de mensagens por chamada de receive */
const MAX_MESSAGES_PER_RECEIVE = 10;

// ==================== Funções ====================

/**
 * Envia uma mensagem para a fila SQS de análise de contratos.
 *
 * A mensagem contém o ID do contrato, o ID do usuário, a key
 * do arquivo no S3 e a ação desejada. O worker (Lambda ou serviço)
 * consome a mensagem e processa a análise de forma assíncrona.
 *
 * Cada mensagem inclui um requestId único para correlação nos logs
 * e atributos de mensagem para filtragem e rastreamento.
 *
 * @param message - Dados do contrato para análise
 * @returns ID da mensagem gerado pelo SQS (MessageId)
 * @throws Error se o SQS não retornar um MessageId
 */
export async function sendToAnalysisQueue(
  message: AnalysisMessage
): Promise<string> {
  const sqs = getSQSClient();

  /** Gerar ID de rastreamento único para correlação nos logs */
  const requestId = `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

  const command = new SendMessageCommand({
    QueueUrl: SQS_QUEUE_URL,
    MessageBody: JSON.stringify({
      ...message,
      requestId,
      sentAt: new Date().toISOString(),
    }),
    /**
     * Atributos da mensagem para filtragem e rastreamento.
     * Permitem filtrar mensagens por contractId, userId ou ação
     * sem precisar deserializar o body.
     */
    MessageAttributes: {
      contractId: {
        DataType: 'String',
        StringValue: message.contractId,
      },
      userId: {
        DataType: 'String',
        StringValue: message.userId,
      },
      action: {
        DataType: 'String',
        StringValue: message.action,
      },
      requestId: {
        DataType: 'String',
        StringValue: requestId,
      },
    },
  });

  const result = await sqs.send(command);

  if (!result.MessageId) {
    throw new Error('[SQS] Falha ao enviar mensagem — MessageId não retornado.');
  }

  return result.MessageId;
}

/**
 * Recebe mensagens pendentes da fila de análise.
 *
 * Usa long polling (WaitTimeSeconds) para reduzir o número de
 * chamadas vazias e custos associados. Cada chamada retorna
 * até 10 mensagens.
 *
 * As mensagens recebidas ficam invisíveis por 30 segundos.
 * O worker DEVE deletar a mensagem após o processamento bem-sucedido,
 * caso contrário ela voltará a ficar disponível para outro worker.
 *
 * @returns Lista de mensagens com seus dados e receiptHandle para deleção
 */
export async function receiveFromQueue(): Promise<
  Array<{
    /** Dados da mensagem deserializados */
    message: AnalysisMessage;
    /** Handle necessário para deletar a mensagem após processamento */
    receiptHandle: string;
    /** ID da mensagem no SQS */
    messageId: string;
  }>
> {
  const sqs = getSQSClient();

  const command = new ReceiveMessageCommand({
    QueueUrl: SQS_QUEUE_URL,
    MaxNumberOfMessages: MAX_MESSAGES_PER_RECEIVE,
    WaitTimeSeconds: WAIT_TIME_SECONDS,
    VisibilityTimeout: VISIBILITY_TIMEOUT_SECONDS,
    /** Incluir atributos da mensagem no resultado */
    MessageAttributeNames: ['All'],
  });

  const result = await sqs.send(command);

  if (!result.Messages || result.Messages.length === 0) {
    return [];
  }

  /**
   * Processar cada mensagem recebida.
   * Deserializa o body e extrai os campos necessários.
   * Mensagens com body inválido são filtradas (serão reenviadas pelo SQS).
   */
  return result.Messages
    .filter((msg) => msg.Body && msg.ReceiptHandle && msg.MessageId)
    .map((msg) => {
      const parsed = JSON.parse(msg.Body!);
      return {
        message: {
          contractId: parsed.contractId,
          userId: parsed.userId,
          fileKey: parsed.fileKey,
          mimeType: parsed.mimeType,
          action: parsed.action,
        } as AnalysisMessage,
        receiptHandle: msg.ReceiptHandle!,
        messageId: msg.MessageId!,
      };
    });
}

/**
 * Deleta uma mensagem da fila após processamento bem-sucedido.
 *
 * IMPORTANTE: Sempre deletar a mensagem após processar com sucesso.
 * Se não deletar, a mensagem voltará a ficar visível após o timeout
 * de visibilidade e será processada novamente (duplicação).
 *
 * @param receiptHandle - Handle retornado por receiveFromQueue()
 */
export async function deleteFromQueue(receiptHandle: string): Promise<void> {
  const sqs = getSQSClient();

  const command = new DeleteMessageCommand({
    QueueUrl: SQS_QUEUE_URL,
    ReceiptHandle: receiptHandle,
  });

  await sqs.send(command);
}
