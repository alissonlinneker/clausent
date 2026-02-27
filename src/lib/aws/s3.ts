// @ts-nocheck
/**
 * Módulo de integração com Amazon S3 para o Orbit.
 *
 * Responsável por:
 * - Gerar URLs pré-assinadas para upload direto do browser (PUT)
 * - Gerar URLs pré-assinadas para download seguro (GET)
 * - Deletar objetos do bucket
 *
 * As keys dos arquivos seguem o padrão:
 *   contracts/{userId}/{uuid}/{fileName}
 *
 * Tipos de arquivo permitidos: PDF, DOCX, DOC, TXT
 * Tamanho máximo de upload: 50MB
 *
 * @module aws/s3
 */

import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Client, S3_BUCKET } from './config';

// ==================== Constantes ====================

/** Tempo de expiração da URL de upload pré-assinada (15 minutos em segundos) */
const UPLOAD_URL_EXPIRATION_SECONDS = 15 * 60;

/** Tempo de expiração da URL de download pré-assinada (1 hora em segundos) */
const DOWNLOAD_URL_EXPIRATION_SECONDS = 60 * 60;

/** Tamanho máximo de upload em bytes (50MB) */
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

/**
 * Tipos MIME permitidos para upload de documentos.
 * Apenas formatos de documentos textuais são aceitos para
 * garantir compatibilidade com o pipeline de OCR e análise.
 */
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/msword', // DOC
  'text/plain', // TXT
] as const;

/** Tipo derivado dos MIME types permitidos para uso em validações */
export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

// ==================== Validação ====================

/**
 * Verifica se o tipo MIME fornecido é permitido para upload.
 *
 * @param mimeType - Tipo MIME a ser validado
 * @returns true se o tipo é permitido, false caso contrário
 */
export function isAllowedMimeType(mimeType: string): mimeType is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

// ==================== Geração de key ====================

/**
 * Gera uma key única para armazenamento no S3.
 *
 * Formato: contracts/{userId}/{uuid}/{fileName}
 *
 * O UUID garante unicidade mesmo para arquivos com o mesmo nome,
 * e o userId permite particionamento lógico por usuário.
 *
 * @param fileName - Nome original do arquivo enviado pelo usuário
 * @param userId - ID do usuário dono do arquivo
 * @returns A key gerada para o objeto no S3
 */
export function generateS3Key(fileName: string, userId: string): string {
  const uuid = crypto.randomUUID();
  /** Sanitizar o nome do arquivo removendo caracteres problemáticos */
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `contracts/${userId}/${uuid}/${sanitizedName}`;
}

// ==================== Funções de presigned URL ====================

/**
 * Gera uma URL pré-assinada para upload direto do browser via PUT.
 *
 * O cliente faz o upload diretamente para o S3 sem passar pelo servidor,
 * reduzindo latência e consumo de banda no backend. A URL expira em 15 minutos.
 *
 * Validações aplicadas:
 * - Content-Type deve ser um dos tipos permitidos (PDF, DOCX, DOC, TXT)
 *
 * @param fileName - Nome original do arquivo
 * @param mimeType - Tipo MIME do arquivo (deve ser um dos permitidos)
 * @param userId - ID do usuário que está fazendo o upload
 * @returns Objeto com a URL pré-assinada e a fileKey do objeto no S3
 * @throws Error se o tipo MIME não for permitido
 */
export async function generateUploadUrl(
  fileName: string,
  mimeType: string,
  userId: string
): Promise<{ uploadUrl: string; fileKey: string }> {
  /** Validar tipo MIME antes de gerar a URL */
  if (!isAllowedMimeType(mimeType)) {
    throw new Error(
      `[S3] Tipo de arquivo não permitido: ${mimeType}. ` +
      `Tipos aceitos: ${ALLOWED_MIME_TYPES.join(', ')}`
    );
  }

  const s3 = getS3Client();
  const fileKey = generateS3Key(fileName, userId);

  /**
   * Comando PutObject com Content-Type restrito.
   * O Content-Type na URL pré-assinada garante que o browser
   * só consegue fazer upload com o tipo MIME correto.
   */
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: fileKey,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: UPLOAD_URL_EXPIRATION_SECONDS,
  });

  return { uploadUrl, fileKey };
}

/**
 * Gera uma URL pré-assinada para download seguro de um arquivo.
 *
 * A URL expira em 1 hora. Ideal para permitir que o usuário
 * baixe documentos sem expor credenciais AWS no frontend.
 *
 * @param fileKey - Key do objeto no S3 (retornada pelo upload)
 * @returns URL pré-assinada para download (GET) com expiração de 1 hora
 */
export async function generateDownloadUrl(fileKey: string): Promise<string> {
  const s3 = getS3Client();

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: fileKey,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: DOWNLOAD_URL_EXPIRATION_SECONDS,
  });

  return url;
}

// ==================== Deleção ====================

/**
 * Remove um arquivo do bucket S3.
 *
 * Operação idempotente — não lança erro se o objeto não existir.
 * Útil para limpeza de arquivos após processamento ou quando
 * o usuário solicita exclusão de um contrato.
 *
 * @param fileKey - Key do objeto a ser deletado no S3
 */
export async function deleteFile(fileKey: string): Promise<void> {
  const s3 = getS3Client();

  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: fileKey,
  });

  await s3.send(command);
}
