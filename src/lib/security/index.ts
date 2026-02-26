/**
 * Módulo de Segurança — Barrel Export
 *
 * Ponto central de exportação para todos os utilitários de segurança
 * da plataforma Orbit. Importar a partir deste arquivo para acesso
 * conveniente a todas as funcionalidades:
 *
 * @example
 * ```ts
 * import {
 *   apiLimiter,
 *   getClientIp,
 *   sanitizePromptInput,
 *   detectPromptInjection,
 *   wrapUserContent,
 *   verifyTurnstileToken,
 *   getSecurityHeaders,
 * } from '@/lib/security';
 * ```
 */

// Rate Limiting — Sliding window com armazenamento em memória
export {
  RateLimiter,
  authLimiter,
  apiLimiter,
  uploadLimiter,
  checkoutLimiter,
  getClientIp,
} from './rate-limit';
export type { RateLimitResult } from './rate-limit';

// Segurança contra Prompt Injection — Sanitização, detecção e wrapping
export {
  sanitizePromptInput,
  detectPromptInjection,
  wrapUserContent,
  DELIMITERS,
  MAX_INPUT_LENGTH,
  MIN_INPUT_LENGTH,
} from './prompt-security';

// Cloudflare Turnstile — Verificação de CAPTCHA server-side
export { verifyTurnstileToken } from './turnstile';

// Security Headers — Headers HTTP de proteção
export { getSecurityHeaders } from './headers';
