/**
 * Módulo de Security Headers
 *
 * Retorna headers de segurança HTTP recomendados para proteger a aplicação
 * contra ataques comuns como XSS, clickjacking, MIME sniffing, etc.
 *
 * Referências:
 * - OWASP Secure Headers: https://owasp.org/www-project-secure-headers/
 * - MDN Security Headers: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
 * - SecurityHeaders.com para auditoria
 *
 * Uso recomendado: aplicar via middleware do Next.js (next.config.ts headers)
 * ou diretamente nas respostas de API routes.
 */

/**
 * Retorna um objeto com os headers de segurança HTTP recomendados.
 *
 * Headers incluídos:
 *
 * - **Content-Security-Policy**: Controla quais recursos o navegador pode carregar.
 *   Configurado de forma restritiva com exceções para self, inline styles (necessários
 *   para Tailwind/shadcn) e fontes do Google.
 *
 * - **X-Frame-Options**: DENY impede que a página seja carregada em iframes,
 *   protegendo contra clickjacking.
 *
 * - **X-Content-Type-Options**: nosniff impede que o navegador faça MIME type
 *   sniffing, forçando o uso do Content-Type declarado.
 *
 * - **Referrer-Policy**: strict-origin-when-cross-origin envia o origin completo
 *   para same-origin, mas apenas o origin (sem path) para cross-origin.
 *
 * - **Permissions-Policy**: Desativa APIs do navegador que não são usadas pela
 *   aplicação (câmera, microfone, geolocalização, etc.).
 *
 * - **Strict-Transport-Security**: Força HTTPS por 1 ano, incluindo subdomínios.
 *   O preload permite inclusão na lista HSTS do navegador.
 *
 * - **X-DNS-Prefetch-Control**: off desativa prefetch de DNS para links na página,
 *   evitando vazamento de informações.
 *
 * @returns Objeto HeadersInit com todos os headers de segurança
 *
 * @example
 * ```ts
 * // No middleware do Next.js
 * import { getSecurityHeaders } from '@/lib/security';
 *
 * export function middleware(request: NextRequest) {
 *   const response = NextResponse.next();
 *   const headers = getSecurityHeaders();
 *   for (const [key, value] of Object.entries(headers)) {
 *     response.headers.set(key, value);
 *   }
 *   return response;
 * }
 * ```
 *
 * @example
 * ```ts
 * // Em uma API route
 * export async function GET() {
 *   return new Response(JSON.stringify({ ok: true }), {
 *     headers: {
 *       'Content-Type': 'application/json',
 *       ...getSecurityHeaders(),
 *     },
 *   });
 * }
 * ```
 */
export function getSecurityHeaders(): HeadersInit {
  return {
    /**
     * Content Security Policy (CSP)
     *
     * Política restritiva que permite apenas recursos do próprio domínio,
     * com exceções necessárias para o funcionamento da aplicação:
     * - 'self': Recursos do mesmo origin
     * - 'unsafe-inline' em style-src: Necessário para Tailwind CSS e shadcn/ui
     * - fonts.googleapis.com / fonts.gstatic.com: Google Fonts
     * - *.clerk.accounts.dev / *.clerk.com: Clerk (autenticação)
     * - *.stripe.com: Stripe (pagamentos)
     * - *.cloudflare.com: Cloudflare Turnstile (CAPTCHA)
     */
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev https://*.clerk.com https://js.stripe.com https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://*.clerk.com https://*.stripe.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://api.stripe.com https://challenges.cloudflare.com",
      "frame-src https://js.stripe.com https://challenges.cloudflare.com https://*.clerk.accounts.dev",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; '),

    /**
     * X-Frame-Options: DENY
     * Impede que a página seja exibida em iframes (anti-clickjacking).
     * Complementa o frame-ancestors 'none' do CSP para navegadores legados.
     */
    'X-Frame-Options': 'DENY',

    /**
     * X-Content-Type-Options: nosniff
     * Impede MIME type sniffing pelo navegador, forçando o uso do
     * Content-Type declarado pelo servidor.
     */
    'X-Content-Type-Options': 'nosniff',

    /**
     * Referrer-Policy: strict-origin-when-cross-origin
     * - Same-origin: Envia URL completa (origin + path + query)
     * - Cross-origin: Envia apenas o origin (sem path/query)
     * - Downgrade HTTPS→HTTP: Não envia referrer
     */
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    /**
     * Permissions-Policy
     * Desativa APIs do navegador que a aplicação não utiliza.
     * Valor vazio () significa "desativado para todos os origins".
     */
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=(self)', // Permitir Payment API para Stripe
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
    ].join(', '),

    /**
     * Strict-Transport-Security (HSTS)
     * Força o navegador a usar HTTPS por 1 ano (31536000 segundos).
     * - includeSubDomains: Aplica a todos os subdomínios
     * - preload: Permite inclusão na lista HSTS preload dos navegadores
     */
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    /**
     * X-DNS-Prefetch-Control: off
     * Desativa prefetch de DNS para links na página, evitando
     * vazamento de informações sobre quais links estão na página.
     */
    'X-DNS-Prefetch-Control': 'off',
  };
}
