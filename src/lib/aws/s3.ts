/**
 * Módulo de integração com Amazon S3 para o Clausent.
 *
 * Responsável por:
 * - Gerar URLs pré-assinadas para upload direto do browser (PutObject)
 * - Gerar URLs pré-assinadas para download seguro (GetObject)
 * - Deletar objetos do bucket
 *
 * As keys dos arquivos seguem o padrão:
 *   contracts/{userId}/{timestamp}-{uuid}.{ext}
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getAwsClientConfig, S3_BUCKET } from './config';

// ==================== Cliente S3 (lazy init) ====================

/** Instância singleton do S3Client — inicializada sob demanda */
let _s3Client: S3Client | null = null;

/**
 * Retorna a instância do S3Client, criando-a se necessário.
 * Usa lazy initialization para evitar erros em tempo de build.
 */
export function getS3Client(): S3Client {
  if (!_s3Client) {
    _s3Client = new S3Client(getAwsClientConfig());
  }
  return _s3Client;
}

// ==================== Constantes ====================

/** Tempo de expiração da URL de upload pré-assinada (15 minutos) */
const UPLOAD_URL_EXPIRATION_SECONDS = 15 * 60;

/** Tempo de expiração da URL de download pré-assinada (1 hora) */
const DOWNLOAD_URL_EXPIRATION_SECONDS = 60 * 60;

// ==================== Funções ====================

/**
 * Gera uma key única para armazenamento no S3.
 * Formato: contracts/{userId}/{timestamp}-{uuid}.{ext}
 *
 * @param userId - ID do usuário dono do arquivo
 * @param extension - Extensão do arquivo (ex: "pdf", "png")
 * @returns A key gerada para o objeto no S3
 */
function generateS3Key(userId: string, extension: string): string {
  const timestamp = Date.now();
  const uuid = crypto.randomUUID();
  /** Remove o ponto inicial da extensão, se houver */
  const ext = extension.replace(/^\./, '');

  return `contracts/${userId}/${timestamp}-${uuid}.${ext}`;
}

/**
 * Gera uma URL pré-assinada para upload direto do browser via PUT.
 *
 * O cliente faz o upload diretamente para o S3 sem passar pelo servidor,
 * reduzindo latência e consumo de banda no backend.
 *
 * @param key - Key do objeto no S3 (usar generateS3Key para gerar)
 * @param contentType - MIME type do arquivo (ex: "application/pdf")
 * @param maxSizeBytes - Tamanho máximo permitido em bytes
 * @returns Objeto com a URL pré-assinada e a key do objeto
 */
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  maxSizeBytes: number
): Promise<{ url: string; key: string }> {
  const s3 = getS3Client();

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType,
    /** Limita o tamanho do upload via ContentLength */
    ContentLength: maxSizeBytes,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: UPLOAD_URL_EXPIRATION_SECONDS,
  });

  return { url, key };
}

/**
 * Gera uma URL pré-assinada para download seguro de um arquivo.
 *
 * A URL expira em 1 hora. Ideal para permitir que o usuário
 * baixe documentos sem expor credenciais AWS.
 *
 * @param key - Key do objeto no S3
 * @returns URL pré-assinada para download (GET)
 */
export async function generatePresignedDownloadUrl(
  key: string
): Promise<string> {
  const s3 = getS3Client();

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: DOWNLOAD_URL_EXPIRATION_SECONDS,
  });

  return url;
}

/**
 * Deleta um objeto do bucket S3.
 *
 * Operação idempotente — não lança erro se o objeto não existir.
 *
 * @param key - Key do objeto a ser deletado
 */
export async function deleteObject(key: string): Promise<void> {
  const s3 = getS3Client();

  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  await s3.send(command);
}

// ==================== Exportação de utilitários ====================

export { generateS3Key, S3_BUCKET };
