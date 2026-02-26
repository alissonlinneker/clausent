import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { z } from 'zod'

/**
 * Schema de validação para a requisição de presigned URL.
 * O cliente envia o nome do arquivo, tipo MIME e tamanho
 * para que o servidor gere uma URL segura para upload direto ao S3.
 */
const presignedUrlSchema = z.object({
  /** Nome original do arquivo */
  filename: z.string().min(1).max(255),
  /** Tipo MIME — apenas PDF e DOCX */
  contentType: z.enum([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]),
  /** Tamanho em bytes — máximo 25MB */
  fileSize: z.number().int().positive().max(25 * 1024 * 1024),
})

/**
 * API para gerar URL pré-assinada de upload ao S3.
 *
 * Fluxo:
 * 1. Verifica autenticação via Better Auth (sessão)
 * 2. Valida os dados da requisição (filename, contentType, fileSize)
 * 3. Gera presigned URL via AWS S3
 * 4. Retorna a URL + key para o cliente fazer upload direto
 *
 * O upload direto ao S3 evita o limite de 4.5MB do Vercel
 * e permite arquivos de até 25MB.
 *
 * Método: POST
 * Content-Type: application/json
 * Body: { filename: string, contentType: string, fileSize: number }
 * Response: { uploadUrl: string, key: string } | { error: string }
 */
export async function POST(req: Request) {
  try {
    /**
     * Verificar autenticação via Better Auth.
     * TODO: Integrar com Better Auth quando o módulo estiver pronto.
     * Por enquanto, verifica se há sessão via header.
     */
    const headersList = await headers()
    const authHeader = headersList.get('authorization')

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    /** Extrair e validar o body da requisição */
    const body = await req.json()
    const result = presignedUrlSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const { filename, contentType, fileSize } = result.data

    /**
     * Gerar presigned URL para upload direto ao S3.
     * Importação dinâmica para evitar carregar o SDK desnecessariamente.
     */
    const { generatePresignedUploadUrl } = await import('@/lib/aws/s3')

    /** Gerar a key do S3 com o userId (será substituído pela sessão real) */
    const userId = 'temp-user-id' // TODO: Extrair do Better Auth session
    const key = `contracts/${userId}/${Date.now()}-${filename}`

    const { url } = await generatePresignedUploadUrl(key, contentType, fileSize)

    return NextResponse.json({
      uploadUrl: url,
      key,
    })
  } catch (error) {
    console.error('[Upload] Erro ao gerar presigned URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}
