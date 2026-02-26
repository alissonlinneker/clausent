/**
 * Módulo de Rate Limiting — Sliding Window em Memória
 *
 * Implementa um rate limiter baseado em sliding window usando Map (in-memory).
 * Adequado para desenvolvimento e ambientes single-instance. Em produção com
 * múltiplas instâncias, substituir pelo Upstash Redis (@upstash/ratelimit).
 *
 * Limitações do armazenamento em memória:
 * - Dados NÃO persistem entre reinicializações do servidor
 * - Dados NÃO são compartilhados entre instâncias serverless
 * - Cada cold start cria um novo store vazio
 *
 * Mitigações implementadas:
 * 1. Algoritmo de sliding window para maior precisão
 * 2. Detecção de IP via Cloudflare, proxies e fallback
 * 3. Limpeza periódica automática para evitar vazamento de memória
 * 4. Headers informativos para tratamento no cliente
 *
 * Para produção distribuída, considere:
 * - Upstash Redis com @upstash/ratelimit
 * - Vercel KV (Redis gerenciado)
 * - Cloudflare Rate Limiting como primeira camada de defesa
 */

// ==================== TIPOS ====================

/** Entrada individual no store de rate limiting */
interface RateLimitEntry {
  /** Timestamps de cada requisição dentro da janela */
  timestamps: number[];
}

/** Resultado da verificação de rate limit */
export interface RateLimitResult {
  /** Se a requisição é permitida */
  allowed: boolean;
  /** Quantas requisições restam na janela */
  remaining: number;
  /** Segundos até poder tentar novamente (0 se permitido) */
  retryAfter: number;
}

// ==================== CONFIGURAÇÃO DE LIMPEZA ====================

/** Intervalo mínimo entre limpezas do store (1 minuto) */
const CLEANUP_INTERVAL_MS = 60 * 1000;

/** Idade máxima de uma entrada antes de ser removida (1 hora) */
const ENTRY_MAX_AGE_MS = 60 * 60 * 1000;

// ==================== CLASSE PRINCIPAL ====================

/**
 * Rate limiter baseado em sliding window.
 *
 * Cada instância mantém seu próprio store em memória e configuração
 * independente. O algoritmo de sliding window evita ataques de burst
 * nas bordas de janelas fixas.
 *
 * @example
 * ```ts
 * const limiter = new RateLimiter(60_000, 10); // 10 req/min
 * const result = limiter.check('user:123');
 * if (!result.allowed) {
 *   return new Response('Too Many Requests', { status: 429 });
 * }
 * ```
 */
export class RateLimiter {
  /** Store em memória: chave do identificador -> entrada com timestamps */
  private store = new Map<string, RateLimitEntry>();

  /** Timestamp da última limpeza executada */
  private lastCleanup = Date.now();

  /** Tamanho da janela em milissegundos */
  private windowMs: number;

  /** Número máximo de requisições permitidas na janela */
  private maxRequests: number;

  /**
   * Cria uma nova instância do rate limiter.
   *
   * @param windowMs - Tamanho da janela de tempo em milissegundos
   * @param maxRequests - Número máximo de requisições permitidas na janela
   */
  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Verifica se o identificador pode fazer uma requisição.
   *
   * O algoritmo de sliding window funciona assim:
   * 1. Remove timestamps antigos (fora da janela atual)
   * 2. Conta quantos timestamps restam (requisições recentes)
   * 3. Se abaixo do limite, registra a nova requisição
   * 4. Se acima do limite, calcula quando poderá tentar novamente
   *
   * @param identifier - Identificador único (ex: IP, userId, chave composta)
   * @returns Resultado com status de permissão, restantes e retry
   */
  check(identifier: string): RateLimitResult {
    // Executar limpeza periódica (lazy cleanup)
    this.cleanup();

    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Buscar ou criar entrada para este identificador
    let entry = this.store.get(identifier);

    if (!entry) {
      // Primeira requisição deste identificador — criar entrada e permitir
      entry = { timestamps: [now] };
      this.store.set(identifier, entry);
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        retryAfter: 0,
      };
    }

    // Filtrar timestamps para manter apenas os dentro da janela atual
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

    // Verificar se atingiu o limite
    if (entry.timestamps.length >= this.maxRequests) {
      // Calcular quando o timestamp mais antigo na janela vai expirar
      const oldestTimestamp = entry.timestamps[0] ?? now;
      const retryAfterMs = oldestTimestamp + this.windowMs - now;
      const retryAfter = Math.ceil(retryAfterMs / 1000);

      return {
        allowed: false,
        remaining: 0,
        retryAfter: Math.max(retryAfter, 1), // Mínimo 1 segundo
      };
    }

    // Dentro do limite — registrar requisição e permitir
    entry.timestamps.push(now);
    this.store.set(identifier, entry);

    return {
      allowed: true,
      remaining: this.maxRequests - entry.timestamps.length,
      retryAfter: 0,
    };
  }

  /**
   * Limpeza preguiçosa (lazy cleanup) de entradas expiradas.
   *
   * Executada automaticamente a cada chamada de check(), mas com
   * throttling para não impactar performance. Remove entradas cujo
   * último timestamp é mais antigo que ENTRY_MAX_AGE_MS.
   */
  private cleanup(): void {
    const now = Date.now();

    // Respeitar intervalo mínimo entre limpezas
    if (now - this.lastCleanup < CLEANUP_INTERVAL_MS) return;

    this.lastCleanup = now;
    const cutoff = now - ENTRY_MAX_AGE_MS;

    // Usar Array.from() para compatibilidade com target ES2017 (sem downlevelIteration)
    const entries = Array.from(this.store.entries());
    for (const [key, entry] of entries) {
      // Se o timestamp mais recente é antigo demais, remover a entrada toda
      const latestTimestamp = entry.timestamps[entry.timestamps.length - 1] ?? 0;
      if (latestTimestamp < cutoff) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Retorna o tamanho atual do store (para monitoramento/debug).
   */
  get storeSize(): number {
    return this.store.size;
  }

  /**
   * Limpa todo o store (útil para testes).
   */
  reset(): void {
    this.store.clear();
  }
}

// ==================== INSTÂNCIAS PRÉ-CONFIGURADAS ====================

/**
 * Limiter para rotas de autenticação.
 * 5 requisições por minuto — previne brute force em login/registro.
 */
export const authLimiter = new RateLimiter(60 * 1000, 5);

/**
 * Limiter genérico para rotas de API.
 * 30 requisições por minuto — adequado para a maioria dos endpoints.
 */
export const apiLimiter = new RateLimiter(60 * 1000, 30);

/**
 * Limiter para rotas de upload.
 * 10 requisições por minuto — previne abuso de storage.
 */
export const uploadLimiter = new RateLimiter(60 * 1000, 10);

/**
 * Limiter para rotas de checkout/pagamento.
 * 5 requisições por minuto — previne abuso de tentativas de pagamento.
 */
export const checkoutLimiter = new RateLimiter(60 * 1000, 5);

// ==================== FUNÇÃO AUXILIAR ====================

/**
 * Extrai o endereço IP do cliente a partir dos headers da requisição.
 *
 * Ordem de prioridade (do mais confiável para o menos):
 * 1. cf-connecting-ip — Injetado pelo Cloudflare, difícil de falsificar
 * 2. x-real-ip — Injetado por proxies reversos (Vercel, Nginx, etc.)
 * 3. x-forwarded-for — Pode conter múltiplos IPs, pega o primeiro
 * 4. Fallback para 'unknown' se nenhum header estiver presente
 *
 * @param request - Objeto Request padrão da Web API
 * @returns Endereço IP do cliente ou 'unknown'
 */
export function getClientIp(request: Request): string {
  // Cloudflare — prioridade máxima por ser o mais confiável
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  // Proxy reverso (Vercel, Nginx, etc.)
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  // X-Forwarded-For — pegar primeiro IP da cadeia (cliente original)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  return 'unknown';
}
