/**
 * Módulo de Verificação Cloudflare Turnstile
 *
 * Turnstile é a alternativa do Cloudflare ao CAPTCHA tradicional, oferecendo
 * proteção contra bots sem fricção para o usuário. Este módulo cuida da
 * validação server-side do token gerado pelo widget no frontend.
 *
 * Documentação oficial: https://developers.cloudflare.com/turnstile/
 *
 * Variáveis de ambiente necessárias:
 * - TURNSTILE_SECRET_KEY: Chave secreta do painel Cloudflare (server-side only)
 * - NEXT_PUBLIC_TURNSTILE_SITE_KEY: Chave do site para o widget (client-side)
 *
 * Comportamento por ambiente:
 * - Produção: Turnstile DEVE estar configurado, caso contrário falha
 * - Desenvolvimento: Se não configurado, permite com aviso no console
 */

// ==================== CONSTANTES ====================

/** URL da API de verificação do Cloudflare Turnstile */
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** Timeout para a chamada à API do Cloudflare (10 segundos) */
const VERIFY_TIMEOUT_MS = 10_000;

// ==================== TIPOS ====================

/** Resposta da API de verificação do Cloudflare Turnstile */
interface TurnstileApiResponse {
  /** Se a verificação foi bem-sucedida */
  success: boolean;
  /** Timestamp do desafio (formato ISO) */
  challenge_ts?: string;
  /** Hostname do site onde o desafio foi resolvido */
  hostname?: string;
  /** Lista de códigos de erro se a verificação falhou */
  'error-codes'?: string[];
  /** Ação passada ao renderizar o widget */
  action?: string;
  /** Dados customizados (cdata) passados ao renderizar */
  cdata?: string;
}

// ==================== FUNÇÃO PRINCIPAL ====================

/**
 * Verifica um token Turnstile no server-side.
 *
 * Faz uma chamada POST à API do Cloudflare para validar o token
 * gerado pelo widget no frontend. Inclui tratamento de erros,
 * timeout e diferenciação entre ambientes (dev/prod).
 *
 * @param token - Token cf-turnstile-response vindo do frontend
 * @param ip - IP do cliente (opcional, melhora precisão da verificação)
 * @returns true se o token é válido, false caso contrário
 *
 * @example
 * ```ts
 * const isValid = await verifyTurnstileToken(body.turnstileToken, clientIp);
 * if (!isValid) {
 *   return new Response('Verificação de segurança falhou', { status: 403 });
 * }
 * ```
 */
export async function verifyTurnstileToken(token: string, ip?: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  const isProduction = process.env.NODE_ENV === 'production';

  // Verificar se a chave secreta está configurada
  if (!secretKey) {
    if (isProduction) {
      // Em produção, a falta da chave é um erro crítico de configuração
      console.error('[Turnstile] TURNSTILE_SECRET_KEY não configurada em PRODUÇÃO — risco de segurança!');
      return false;
    }

    // Em desenvolvimento, permitir sem verificação para facilitar testes locais
    console.warn('[Turnstile] TURNSTILE_SECRET_KEY não configurada — pulando validação em modo dev');
    return true;
  }

  // Verificar se o token foi fornecido
  if (!token || typeof token !== 'string' || token.trim() === '') {
    if (isProduction) {
      console.error('[Turnstile] Token não fornecido em PRODUÇÃO');
      return false;
    }

    // Em desenvolvimento sem token, permitir com aviso
    console.warn('[Turnstile] Token não fornecido — pulando validação em modo dev');
    return true;
  }

  try {
    // Montar os dados do formulário para a requisição de verificação
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);

    // Incluir IP se fornecido (melhora a precisão da verificação)
    if (ip) {
      formData.append('remoteip', ip);
    }

    // Criar AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

    // Chamar API do Cloudflare Turnstile
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      signal: controller.signal,
    });

    // Limpar timeout
    clearTimeout(timeoutId);

    // Verificar status HTTP
    if (!response.ok) {
      console.error(`[Turnstile] API retornou status ${response.status}: ${response.statusText}`);
      return false;
    }

    // Parsear resposta
    const result: TurnstileApiResponse = await response.json();

    if (result.success) {
      return true;
    }

    // Log dos códigos de erro para diagnóstico
    const errorCodes = result['error-codes'] || [];
    console.warn('[Turnstile] Validação falhou:', errorCodes.join(', '));

    return false;
  } catch (error) {
    // Tratar erro de timeout separadamente
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[Turnstile] Timeout ao verificar token (limite:', VERIFY_TIMEOUT_MS, 'ms)');
      return false;
    }

    // Erros de rede ou parsing
    console.error('[Turnstile] Erro de rede durante verificação:', error);
    return false;
  }
}
