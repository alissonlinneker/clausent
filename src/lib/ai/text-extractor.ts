import { extractTextFromS3 } from '@/lib/aws/textract'

/**
 * Extrai texto de um documento armazenado no S3.
 *
 * Utiliza Amazon Textract para OCR de PDFs e imagens.
 * Para DOCX, faz uma extração simplificada via XML parsing.
 *
 * @param s3Key - Chave do arquivo no bucket S3
 * @param mimeType - Tipo MIME do arquivo
 * @returns Texto extraído do documento
 * @throws Error se o tipo de arquivo não for suportado
 */
export async function extractText(
  s3Key: string,
  mimeType: string
): Promise<string> {
  const bucket = process.env.AWS_S3_BUCKET || 'clausent-uploads'

  /** PDFs e imagens — usar Amazon Textract para OCR */
  if (
    mimeType === 'application/pdf' ||
    mimeType.startsWith('image/')
  ) {
    return extractTextFromS3(bucket, s3Key)
  }

  /** DOCX — download e extração via XML parsing */
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return extractDocxFromS3(bucket, s3Key)
  }

  throw new Error(`Tipo de arquivo não suportado para extração: ${mimeType}`)
}

/**
 * Extrai texto de um DOCX armazenado no S3.
 *
 * DOCX é um ZIP contendo XMLs. O conteúdo textual
 * fica nas tags <w:t> do word/document.xml.
 *
 * @param bucket - Nome do bucket S3
 * @param key - Chave do arquivo no S3
 * @returns Texto extraído do DOCX
 */
async function extractDocxFromS3(bucket: string, key: string): Promise<string> {
  /** Importar S3 para download do arquivo */
  const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3')
  const { getAwsClientConfig } = await import('@/lib/aws/config')

  const client = new S3Client(getAwsClientConfig())
  const response = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key })
  )

  /** Converter stream para buffer */
  const body = response.Body
  if (!body) throw new Error('Arquivo vazio no S3')

  const chunks: Uint8Array[] = []
  const reader = body.transformToWebStream().getReader()

  let done = false
  while (!done) {
    const result = await reader.read()
    done = result.done
    if (result.value) chunks.push(result.value)
  }

  const buffer = Buffer.concat(chunks)
  const content = buffer.toString('utf-8')

  /**
   * Extrair texto de tags <w:t> do formato Office Open XML.
   * Estas tags contêm o texto real do documento Word.
   */
  const textMatches = content.match(/<w:t[^>]*>([^<]*)<\/w:t>/g)

  if (!textMatches || textMatches.length === 0) {
    /** Fallback: limpar todas as tags XML e retornar texto bruto */
    return content
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /** Juntar texto de todas as tags <w:t> */
  return textMatches
    .map((match) => match.replace(/<[^>]+>/g, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}
