// @ts-nocheck
/**
 * Módulo AWS do Orbit — ponto de entrada centralizado.
 *
 * Re-exporta todos os submódulos para facilitar importações:
 *   import { generateUploadUrl, sendToAnalysisQueue } from '@/lib/aws';
 *
 * @module aws
 */

// ---- Configuração base (região, credenciais, clientes, constantes) ----
export {
  AWS_REGION,
  S3_BUCKET,
  SQS_QUEUE_URL,
  SQS_DLQ_URL,
  getAwsCredentials,
  getAwsClientConfig,
  getS3Client,
  getSQSClient,
  getTextractClient,
} from './config';

// ---- S3 — Upload, download e deleção de arquivos ----
export {
  generateUploadUrl,
  generateDownloadUrl,
  deleteFile,
  generateS3Key,
  isAllowedMimeType,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  type AllowedMimeType,
} from './s3';

// ---- SQS — Fila de análise de contratos ----
export {
  sendToAnalysisQueue,
  receiveFromQueue,
  deleteFromQueue,
  type AnalysisMessage,
} from './sqs';

// ---- Textract — Extração de texto (OCR) de documentos ----
export {
  extractText,
  getTextractResult,
  processDocument,
  type TextractResult,
  type TextractBlock,
  type Table,
  type TableCell,
} from './textract';

// ---- Lambda — Handler de processamento ----
export {
  handler as lambdaHandler,
  type SQSLambdaEvent,
  type ProcessingResult,
  type LambdaResponse,
} from './lambda-handler';
