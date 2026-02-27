// @ts-nocheck
'use client';

/**
 * Componente Cloudflare Turnstile — Widget CAPTCHA sem fricção
 *
 * Renderiza o widget do Cloudflare Turnstile que fornece proteção contra bots
 * sem exigir interação explícita do usuário (diferente de CAPTCHAs tradicionais).
 *
 * O componente carrega o script do Turnstile via useEffect, renderiza o widget
 * dentro de uma div ref e gerencia o ciclo de vida completo (render, reset, cleanup).
 *
 * Variáveis de ambiente:
 * - NEXT_PUBLIC_TURNSTILE_SITE_KEY: Chave pública do site (obrigatória no frontend)
 *
 * @example
 * ```tsx
 * import { Turnstile } from '@/components/shared/turnstile';
 *
 * function LoginForm() {
 *   const [token, setToken] = useState<string | null>(null);
 *
 *   return (
 *     <form>
 *       <Turnstile
 *         siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
 *         onVerify={(t) => setToken(t)}
 *         onError={() => console.error('Falha no CAPTCHA')}
 *         theme="light"
 *       />
 *       <button disabled={!token}>Entrar</button>
 *     </form>
 *   );
 * }
 * ```
 *
 * @see https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
 */

import { useCallback, useEffect, useRef } from 'react';

// ==================== TIPOS ====================

/**
 * Declaração global para o objeto turnstile injetado pelo script do Cloudflare.
 * O script adiciona `window.turnstile` com métodos para controlar o widget.
 */
declare global {
  interface Window {
    turnstile?: {
      /** Renderiza o widget dentro de um container DOM */
      render: (
        container: HTMLElement,
        options: TurnstileRenderOptions,
      ) => string;
      /** Reseta o widget para estado inicial (força nova verificação) */
      reset: (widgetId: string) => void;
      /** Remove o widget do DOM e limpa listeners */
      remove: (widgetId: string) => void;
    };
    /** Callback global chamada quando o script do Turnstile termina de carregar */
    onloadTurnstileCallback?: () => void;
  }
}

/** Opções aceitas pelo método turnstile.render() */
interface TurnstileRenderOptions {
  /** Chave pública do site (site key do painel Cloudflare) */
  sitekey: string;
  /** Callback chamada quando o usuário completa o desafio com sucesso */
  callback?: (token: string) => void;
  /** Callback chamada quando ocorre um erro no widget */
  'error-callback'?: () => void;
  /** Callback chamada quando o token expira (necessita nova verificação) */
  'expired-callback'?: () => void;
  /** Tema visual do widget */
  theme?: 'light' | 'dark' | 'auto';
  /** Tamanho do widget */
  size?: 'normal' | 'compact' | 'flexible';
}

/** Props do componente Turnstile */
export interface TurnstileProps {
  /** Chave pública do site (NEXT_PUBLIC_TURNSTILE_SITE_KEY) */
  siteKey: string;
  /** Callback chamada quando o desafio é resolvido com sucesso */
  onVerify: (token: string) => void;
  /** Callback chamada em caso de erro no widget (opcional) */
  onError?: () => void;
  /** Callback chamada quando o token expira (opcional) */
  onExpire?: () => void;
  /** Tema visual: light, dark ou auto (padrão: auto) */
  theme?: 'light' | 'dark' | 'auto';
  /** Tamanho do widget: normal, compact ou flexible (padrão: normal) */
  size?: 'normal' | 'compact' | 'flexible';
  /** Classes CSS adicionais para o container (opcional) */
  className?: string;
}

// ==================== CONSTANTES ====================

/** URL do script do Cloudflare Turnstile com callback de carregamento */
const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';

/** ID do elemento script para evitar carregamento duplicado */
const SCRIPT_ELEMENT_ID = 'cf-turnstile-script';

// ==================== COMPONENTE ====================

/**
 * Widget Cloudflare Turnstile para verificação anti-bot.
 *
 * Ciclo de vida do componente:
 * 1. Mount: Carrega o script do Turnstile (se ainda não carregado)
 * 2. Script ready: Renderiza o widget dentro da div ref
 * 3. Verificação: Usuário completa o desafio → onVerify(token)
 * 4. Unmount: Remove o widget e limpa recursos
 *
 * @param props - Configurações do widget (siteKey, callbacks, tema, tamanho)
 */
export function Turnstile({
  siteKey,
  onVerify,
  onError,
  onExpire,
  theme = 'auto',
  size = 'normal',
  className,
}: TurnstileProps) {
  /** Referência ao elemento DOM container onde o widget será renderizado */
  const containerRef = useRef<HTMLDivElement>(null);

  /** ID do widget retornado pelo turnstile.render() para controle posterior */
  const widgetIdRef = useRef<string | null>(null);

  /**
   * Renderiza o widget do Turnstile dentro do container.
   * Chamada quando o script já está carregado e o container está disponível.
   */
  const renderWidget = useCallback(() => {
    // Verificar se o container DOM e a API do Turnstile estão disponíveis
    if (!containerRef.current || !window.turnstile) return;

    // Se já existe um widget renderizado, resetar em vez de criar novo
    if (widgetIdRef.current) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch {
        // Widget pode ter sido removido externamente — ignorar erro
        widgetIdRef.current = null;
      }
    }

    // Renderizar novo widget se não existe um ativo
    if (!widgetIdRef.current) {
      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onVerify,
          'error-callback': onError,
          'expired-callback': onExpire,
          theme,
          size,
        });
      } catch (error) {
        console.error('[Turnstile] Erro ao renderizar widget:', error);
        onError?.();
      }
    }
  }, [siteKey, onVerify, onError, onExpire, theme, size]);

  /**
   * Effect principal: carrega o script do Turnstile e renderiza o widget.
   *
   * Fluxo:
   * 1. Verifica se o script já foi carregado anteriormente
   * 2. Se sim e a API está disponível, renderiza imediatamente
   * 3. Se não, injeta o script no DOM e aguarda o callback de carregamento
   * 4. No cleanup (unmount), remove o widget para evitar memory leaks
   */
  useEffect(() => {
    // Verificar se o script já existe no DOM
    const existingScript = document.getElementById(SCRIPT_ELEMENT_ID);

    if (existingScript && window.turnstile) {
      // Script já carregado e API disponível — renderizar imediatamente
      renderWidget();
      return;
    }

    if (!existingScript) {
      // Definir callback global que será chamada quando o script carregar
      window.onloadTurnstileCallback = () => {
        renderWidget();
      };

      // Criar e injetar o elemento script no DOM
      const script = document.createElement('script');
      script.id = SCRIPT_ELEMENT_ID;
      script.src = TURNSTILE_SCRIPT_URL;
      script.async = true;
      script.defer = true;

      // Tratamento de erro no carregamento do script
      script.onerror = () => {
        console.error('[Turnstile] Falha ao carregar script do Cloudflare');
        onError?.();
      };

      document.head.appendChild(script);
    } else {
      // Script existe mas API ainda não carregou — registrar callback
      window.onloadTurnstileCallback = () => {
        renderWidget();
      };
    }

    // Cleanup: remover widget ao desmontar o componente
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Widget pode já ter sido removido — ignorar erro silenciosamente
        }
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget, onError]);

  return (
    <div
      ref={containerRef}
      className={className}
      aria-label="Verificação de segurança Cloudflare Turnstile"
    />
  );
}
