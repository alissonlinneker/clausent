// @ts-nocheck
/**
 * Rota de API para geração de URL pré-assinada de upload ao S3.
 *
 * Fluxo completo:
 * 1. Verifica autenticação via header Authorization
 * 2. Aplica rate limiting por IP (10 requisições por minuto)
 * 3. Valida os dados da requisição (fileName, mimeType)
 * 4. Gera presigned URL via módulo AWS S3
 * 5. Retorna a URL + fileKey para o cliente fazer upload direto
 *
 * O upload direto ao S3 evita o limite de payload do Vercel
 * e permite arquivos de até 50MB.
 *
 * Método: POST
 * Content-Type: application/json
 * Body: { fileName: string, mimeType: string }
 * Response: { uploadUrl: string, fileKey: string } | { error: string }
 *
 * @module api/upload
 */

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { generateUploadUrl, ALLOWED_MIME_TYPES } from '@/lib/aws/s3';

// ==================== Rate Limiting em memória ====================

/**
 * Mapa de rate limiting por IP.
 * Armazena timestamps das requisições recentes para cada IP.
 * Em produção, substituir por Redis (Upstash) para suportar múltiplas instâncias.
 */
const rateLimitMap = new Map<string, number[]>();

/** Número máximo de requisições por janela de tempo */
const RATE_LIMIT_MAX_REQUESTS = 10;

/** Janela de tempo para rate limiting (1 minuto em milissegundos) */
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

/**
 * Verifica se o IP atingiu o limite de requisições.
 *
 * Remove timestamps expirados e verifica se o número de requisições
 * dentro da janela atual excede o máximo permitido.
 *
 * @param ip - Endereço IP do cliente
 * @returns true se o limite foi atingido, false caso contrário
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];

  /** Filtrar apenas timestamps dentro da janela atual */
  const recentTimestamps = timestamps.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );

  if (recentTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  /** Registrar a requisição atual */
  recentTimestamps.push(now);
  rateLimitMap.set(ip, recentTimestamps);

  return false;
}

// ==================== Schema de validação ====================

/**
 * Schema Zod para validação do body da requisição.
 * Aceita apenas tipos MIME permitidos pelo módulo S3.
 */
const uploadRequestSchema = z.object({
  /** Nome original do arquivo enviado pelo usuário */
  fileName: z.string().min(1, 'Nome do arquivo é obrigatório').max(255),
  /** Tipo MIME — deve ser um dos tipos permitidos (PDF, DOCX, DOC, TXT) */
  mimeType: z.enum(ALLOWED_MIME_TYPES as unknown as [string, ...string[]], {
    errorMap: () => ({
      message: `Tipo de arquivo não permitido. Aceitos: ${ALLOWED_MIME_TYPES.join(', ')}`,
    }),
  }),
});

// ==================== Handler POST ====================

/**
 * Handler POST para geração de presigned URL de upload.
 *
 * Etapas:
 * 1. Extrair IP do cliente para rate limiting
 * 2. Verificar autenticação via header Authorization
 * 3. Aplicar rate limiting (10 req/min por IP)
 * 4. Validar body da requisição com Zod
 * 5. Gerar presigned URL via módulo S3
 * 6. Retornar URL e fileKey ao cliente
 *
 * @param req - Objeto Request do Next.js
 * @returns NextResponse com a URL pré-assinada ou erro
 */
export async function POST(req: Request) {
  try {
    const headersList = await headers();

    // ---- Etapa 1: Extrair IP do cliente ----
    const clientIp =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headersList.get('x-real-ip') ||
      'unknown';

    // ---- Etapa 2: Verificar autenticação ----
    /**
     * Verifica se há token de autenticação no header.
     * TODO: Integrar com Clerk para validação real do token
     * e extração do userId da sessão autenticada.
     */
    const authHeader = headersList.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Autenticação necessária.' },
        { status: 401 }
      );
    }

    // ---- Etapa 3: Rate limiting ----
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Limite de requisições excedido. Tente novamente em 1 minuto.' },
        { status: 429 }
      );
    }

    // ---- Etapa 4: Validar body ----
    const body = await req.json();
    const validation = uploadRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos.',
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { fileName, mimeType } = validation.data;

    // ---- Etapa 5: Gerar presigned URL ----
    /**
     * Extrai o userId do token de autenticação.
     * TODO: Substituir pelo userId real da sessão Clerk.
     */
    const userId = 'temp-user-id';

    const { uploadUrl, fileKey } = await generateUploadUrl(
      fileName,
      mimeType,
      userId
    );

    // ---- Etapa 6: Retornar resultado ----
    return NextResponse.json({ uploadUrl, fileKey });
  } catch (error) {
    console.error('[Upload] Erro ao gerar presigned URL:', error);

    return NextResponse.json(
      { error: 'Falha ao gerar URL de upload.' },
      { status: 500 }
    );
  }
}
