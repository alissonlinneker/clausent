import { put } from '@vercel/blob'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/**
 * Tipos MIME aceitos para upload de contratos.
 * Suportamos PDF e DOCX — os formatos mais comuns para documentos contratuais.
 */
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

/** Limite máximo de tamanho: 10MB em bytes */
const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * API de upload de arquivos de contrato.
 *
 * Fluxo:
 * 1. Verifica autenticação via Clerk
 * 2. Extrai o arquivo do FormData
 * 3. Valida tipo MIME (PDF ou DOCX apenas)
 * 4. Valida tamanho (máximo 10MB)
 * 5. Envia para Vercel Blob Storage com path organizado por userId
 * 6. Retorna a URL pública do arquivo armazenado
 *
 * Método: POST
 * Content-Type: multipart/form-data
 * Body: { file: File }
 * Response: { url: string } | { error: string }
 */
export async function POST(req: Request) {
  /** Verificar autenticação — apenas usuários logados podem fazer upload */
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    )
  }

  /** Extrair o arquivo do FormData enviado pelo cliente */
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json(
      { error: 'Nenhum arquivo enviado' },
      { status: 400 }
    )
  }

  /** Validar tipo MIME — somente PDF e DOCX são aceitos */
  if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
    return NextResponse.json(
      { error: 'Tipo de arquivo não suportado. Envie PDF ou DOCX.' },
      { status: 400 }
    )
  }

  /** Validar tamanho do arquivo — máximo 10MB */
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'Arquivo excede o limite de 10MB' },
      { status: 400 }
    )
  }

  try {
    /**
     * Upload para Vercel Blob Storage.
     * O arquivo é organizado no path: contracts/{userId}/{nomeDoArquivo}
     * Isso facilita a organização e eventual cleanup por usuário.
     */
    const blob = await put(`contracts/${userId}/${file.name}`, file, {
      access: 'public',
    })

    return NextResponse.json({ url: blob.url })
  } catch {
    return NextResponse.json(
      { error: 'Erro ao fazer upload do arquivo. Tente novamente.' },
      { status: 500 }
    )
  }
}
