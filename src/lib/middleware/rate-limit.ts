/**
 * Rate limiter simplificado baseado em memória.
 *
 * Implementação minimalista para uso direto em procedimentos
 * tRPC e API Routes. Para produção distribuída, substituir
 * pelo Upstash Redis (@upstash/ratelimit).
 *
 * Diferente do RateLimiter em security/rate-limit.ts (que é
 * uma classe completa com sliding window), este módulo
 * oferece uma função simples de verificação para uso inline
 * em middlewares e handlers.
 *
 * LIMITAÇÕES:
 * - Não persiste entre reinicializações do servidor
 * - Não compartilha estado entre instâncias serverless
 * - Adequado apenas para desenvolvimento e single-instance
 */

/* ---- Tipos ---- */

/** Entrada no store de rate limiting */
interface RateLimitEntry {
  /** Contador de requisições na janela atual */
  count: number
  /** Timestamp de reset da janela (em ms) */
  resetAt: number
}

/** Resultado da verificação de rate limit */
interface RateLimitResult {
  /** Se a requisição foi permitida */
  success: boolean
  /** Requisições restantes na janela */
  remaining: number
}

/* ---- Store em memória ---- */

/**
 * Store global de rate limiting.
 * Chave: identificador do cliente (IP, userId, etc.)
 * Valor: contagem de requisições e timestamp de reset
 */
const rateLimitMap = new Map<string, RateLimitEntry>()

/* ---- Limpeza periódica ---- */

/** Intervalo entre limpezas automáticas do store (5 minutos) */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000

/** Timestamp da última limpeza */
let lastCleanup = Date.now()

/**
 * Remove entradas expiradas do store para evitar vazamento de memória.
 * Executada de forma lazy (piggyback) nas chamadas de rateLimit().
 */
function cleanupExpired(): void {
  const now = Date.now()

  /** Respeitar intervalo mínimo entre limpezas */
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return

  lastCleanup = now

  const entries = Array.from(rateLimitMap.entries())
  for (const [key, entry] of entries) {
    if (now >= entry.resetAt) {
      rateLimitMap.delete(key)
    }
  }
}

/* ---- Função principal ---- */

/**
 * Verifica e aplica rate limiting para o identificador fornecido.
 *
 * Usa algoritmo de janela fixa (fixed window): cada identificador
 * tem um contador que é resetado após o período da janela.
 *
 * @param params.key - Identificador único do cliente (IP, userId, chave composta)
 * @param params.limit - Número máximo de requisições permitidas na janela
 * @param params.window - Tamanho da janela em segundos
 *
 * @returns Objeto com status de permissão e requisições restantes
 *
 * @example
 * ```ts
 * const result = rateLimit({ key: `api:${userId}`, limit: 30, window: 60 })
 * if (!result.success) {
 *   throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })
 * }
 * ```
 */
export function rateLimit(params: {
  key: string
  limit: number
  window: number
}): RateLimitResult {
  /** Executar limpeza periódica (lazy) */
  cleanupExpired()

  const now = Date.now()
  const windowMs = params.window * 1000

  /** Buscar entrada existente ou criar nova */
  let entry = rateLimitMap.get(params.key)

  /** Se a entrada expirou ou não existe, criar nova janela */
  if (!entry || now >= entry.resetAt) {
    entry = {
      count: 1,
      resetAt: now + windowMs,
    }
    rateLimitMap.set(params.key, entry)

    return {
      success: true,
      remaining: params.limit - 1,
    }
  }

  /** Incrementar contador */
  entry.count++

  /** Verificar se excedeu o limite */
  if (entry.count > params.limit) {
    return {
      success: false,
      remaining: 0,
    }
  }

  return {
    success: true,
    remaining: params.limit - entry.count,
  }
}

/* ---- Helpers pré-configurados ---- */

/**
 * Rate limit para endpoints de API genéricos.
 * 30 requisições por minuto por identificador.
 */
export function apiRateLimit(key: string): RateLimitResult {
  return rateLimit({ key: `api:${key}`, limit: 30, window: 60 })
}

/**
 * Rate limit para endpoints de autenticação.
 * 5 requisições por minuto por identificador.
 */
export function authRateLimit(key: string): RateLimitResult {
  return rateLimit({ key: `auth:${key}`, limit: 5, window: 60 })
}

/**
 * Rate limit para endpoints de upload.
 * 10 requisições por minuto por identificador.
 */
export function uploadRateLimit(key: string): RateLimitResult {
  return rateLimit({ key: `upload:${key}`, limit: 10, window: 60 })
}
