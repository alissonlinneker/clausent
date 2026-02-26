/**
 * Módulo de integração com Amazon SQS para o Clausent.
 *
 * Responsável por enviar mensagens para a fila de análise de contratos.
 * A fila SQS desacopla o recebimento do contrato do processamento,
 * permitindo escalabilidade e resiliência.
 */

import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { getAwsClientConfig, SQS_QUEUE_URL } from './config';

// ==================== Tipos ====================

/**
 * Payload da mensagem enviada para a fila de análise.
 * Contém os dados necessários para o worker processar o contrato.
 */
export interface AnalysisMessage {
  /** ID do contrato no banco de dados */
  contractId: string;
  /** ID do usuário que enviou o contrato */
  userId: string;
  /** Key do arquivo no S3 (ex: contracts/{userId}/{timestamp}-{uuid}.pdf) */
  s3Key: string;
}

// ==================== Cliente SQS (lazy init) ====================

/** Instância singleton do SQSClient — inicializada sob demanda */
let _sqsClient: SQSClient | null = null;

/**
 * Retorna a instância do SQSClient, criando-a se necessário.
 * Usa lazy initialization para evitar erros em tempo de build.
 */
export function getSQSClient(): SQSClient {
  if (!_sqsClient) {
    _sqsClient = new SQSClient(getAwsClientConfig());
  }
  return _sqsClient;
}

// ==================== Funções ====================

/**
 * Envia uma mensagem para a fila SQS de análise de contratos.
 *
 * A mensagem contém o ID do contrato, o ID do usuário e a key
 * do arquivo no S3. O worker (Lambda ou serviço) consome a mensagem
 * e processa a análise de forma assíncrona.
 *
 * @param payload - Dados do contrato para análise
 * @returns ID da mensagem gerado pelo SQS (MessageId)
 */
export async function sendAnalysisMessage(
  payload: AnalysisMessage
): Promise<string> {
  const sqs = getSQSClient();

  /** Gera um ID de rastreamento único para correlação nos logs */
  const requestId = `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

  const command = new SendMessageCommand({
    QueueUrl: SQS_QUEUE_URL,
    MessageBody: JSON.stringify({
      ...payload,
      requestId,
      sentAt: new Date().toISOString(),
    }),
    /** Atributos da mensagem para filtragem e rastreamento */
    MessageAttributes: {
      contractId: {
        DataType: 'String',
        StringValue: payload.contractId,
      },
      userId: {
        DataType: 'String',
        StringValue: payload.userId,
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
