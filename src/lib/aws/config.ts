// @ts-nocheck
/**
 * Configuração base do AWS SDK v3 para o projeto Orbit.
 *
 * Centraliza a criação de clientes AWS pré-configurados (S3, SQS, Lambda, Textract).
 * Todas as credenciais são carregadas a partir de variáveis de ambiente — NUNCA
 * hardcodar chaves ou segredos neste arquivo.
 *
 * Variáveis de ambiente necessárias:
 * - AWS_REGION — Região AWS (padrão: us-east-1)
 * - AWS_ACCESS_KEY_ID — Chave de acesso da conta AWS
 * - AWS_SECRET_ACCESS_KEY — Chave secreta da conta AWS
 * - AWS_S3_BUCKET — Nome do bucket S3 para uploads
 * - AWS_SQS_ANALYSIS_QUEUE_URL — URL completa da fila SQS de análise
 *
 * @module aws/config
 */

import { S3Client } from '@aws-sdk/client-s3';
import { SQSClient } from '@aws-sdk/client-sqs';
import { TextractClient } from '@aws-sdk/client-textract';

// ==================== Região ====================

/** Região AWS configurada via variável de ambiente (padrão: us-east-1) */
export const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

// ==================== Credenciais ====================

/**
 * Retorna o objeto de credenciais para os clientes AWS.
 *
 * Lê as chaves das variáveis de ambiente padrão da AWS.
 * Lança um erro explícito se as variáveis não estiverem definidas,
 * evitando falhas silenciosas em runtime.
 *
 * @returns Objeto com accessKeyId e secretAccessKey
 * @throws Error se as variáveis de ambiente não estiverem configuradas
 */
export function getAwsCredentials() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      '[AWS] Credenciais não configuradas. ' +
      'Defina AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY nas variáveis de ambiente.'
    );
  }

  return { accessKeyId, secretAccessKey };
}

// ==================== Recursos ====================

/** Nome do bucket S3 para uploads de contratos e documentos */
export const S3_BUCKET = process.env.AWS_S3_BUCKET || 'orbit-uploads';

/** URL completa da fila SQS para análise assíncrona de contratos */
export const SQS_QUEUE_URL =
  process.env.AWS_SQS_ANALYSIS_QUEUE_URL ||
  `https://sqs.${AWS_REGION}.amazonaws.com/000000000000/orbit-analysis-queue`;

/** URL da Dead Letter Queue para mensagens com falha no processamento */
export const SQS_DLQ_URL =
  process.env.AWS_SQS_DLQ_URL ||
  `https://sqs.${AWS_REGION}.amazonaws.com/000000000000/orbit-analysis-dlq`;

// ==================== Configuração base ====================

/**
 * Retorna a configuração base compartilhada por todos os clientes AWS.
 * Inclui região e credenciais autenticadas.
 *
 * @returns Configuração pronta para ser passada aos construtores dos clientes
 */
export function getAwsClientConfig() {
  return {
    region: AWS_REGION,
    credentials: getAwsCredentials(),
  };
}

// ==================== Clientes pré-configurados (lazy init) ====================

/**
 * Cada cliente usa o padrão singleton com lazy initialization.
 * Isso evita instanciação desnecessária em tempo de build (especialmente
 * no ambiente serverless do Vercel/Next.js) e garante que as variáveis
 * de ambiente já estejam disponíveis quando o cliente for criado.
 */

/** Instância singleton do S3Client */
let _s3Client: S3Client | null = null;

/**
 * Retorna o cliente S3 pré-configurado.
 * Usado para operações de upload, download e deleção de arquivos.
 *
 * @returns Instância do S3Client com região e credenciais configuradas
 */
export function getS3Client(): S3Client {
  if (!_s3Client) {
    _s3Client = new S3Client(getAwsClientConfig());
  }
  return _s3Client;
}

/** Instância singleton do SQSClient */
let _sqsClient: SQSClient | null = null;

/**
 * Retorna o cliente SQS pré-configurado.
 * Usado para enviar e receber mensagens da fila de análise.
 *
 * @returns Instância do SQSClient com região e credenciais configuradas
 */
export function getSQSClient(): SQSClient {
  if (!_sqsClient) {
    _sqsClient = new SQSClient(getAwsClientConfig());
  }
  return _sqsClient;
}

/** Instância singleton do TextractClient */
let _textractClient: TextractClient | null = null;

/**
 * Retorna o cliente Textract pré-configurado.
 * Usado para extração de texto (OCR) de documentos armazenados no S3.
 *
 * @returns Instância do TextractClient com região e credenciais configuradas
 */
export function getTextractClient(): TextractClient {
  if (!_textractClient) {
    _textractClient = new TextractClient(getAwsClientConfig());
  }
  return _textractClient;
}
