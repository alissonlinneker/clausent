/**
 * Módulo AWS do Clausent — ponto de entrada centralizado.
 *
 * Re-exporta todos os submódulos para facilitar importações:
 *   import { generatePresignedUploadUrl, sendAnalysisMessage } from '@/lib/aws';
 */

// Configuração base (região, credenciais, constantes de recursos)
export {
  AWS_REGION,
  S3_BUCKET,
  SQS_QUEUE_URL,
  getAwsCredentials,
  getAwsClientConfig,
} from './config';

// S3 — Upload, download e deleção de arquivos
export {
  getS3Client,
  generatePresignedUploadUrl,
  generatePresignedDownloadUrl,
  deleteObject,
  generateS3Key,
} from './s3';

// SQS — Fila de análise de contratos
export {
  getSQSClient,
  sendAnalysisMessage,
  type AnalysisMessage,
} from './sqs';

// Textract — Extração de texto (OCR) de documentos
export {
  getTextractClient,
  extractTextFromS3,
} from './textract';
