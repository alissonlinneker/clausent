/**
 * Setup global de testes — executado antes de cada suite.
 *
 * Configura mocks para dependências externas que não devem
 * ser carregadas durante os testes (Next.js, next-intl,
 * framer-motion, etc.).
 */

import { vi } from 'vitest'

/* ================================================================
 * Mock: next/navigation
 * Simula hooks de navegação do Next.js App Router.
 * ================================================================ */
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))

/* ================================================================
 * Mock: next-intl
 * Simula as funções de internacionalização.
 * Retorna a chave de tradução como valor (para facilitar asserts).
 * ================================================================ */
vi.mock('next-intl', () => ({
  useTranslations: () => {
    /** Função de tradução que retorna a chave recebida */
    const t = (key: string) => key
    return t
  },
  useLocale: () => 'en',
  useMessages: () => ({}),
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}))

/* ================================================================
 * Mock: @/lib/i18n/navigation
 * Simula o módulo de navegação internacionalizada.
 * O componente Link renderiza uma tag <a> simples.
 * ================================================================ */
vi.mock('@/lib/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => {
    const { createElement } = require('react')
    return createElement('a', { href, ...props }, children)
  },
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/dashboard',
  redirect: vi.fn(),
}))

/* ================================================================
 * Mock: framer-motion
 * Substitui componentes animados por elementos HTML simples.
 * Evita erros de renderização e torna testes determinísticos.
 * ================================================================ */
vi.mock('framer-motion', () => {
  const { createElement, forwardRef } = require('react')

  return {
    motion: new Proxy(
      {},
      {
        get: (_target: unknown, prop: string) => {
          /** Para cada tag HTML (div, span, etc.), retorna um componente simples */
          return forwardRef((props: Record<string, unknown>, ref: unknown) => {
            const {
              initial: _initial,
              animate: _animate,
              exit: _exit,
              transition: _transition,
              whileHover: _whileHover,
              whileTap: _whileTap,
              whileInView: _whileInView,
              variants: _variants,
              ...validProps
            } = props
            return createElement(prop, { ...validProps, ref })
          })
        },
      }
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useAnimation: () => ({
      start: vi.fn(),
      stop: vi.fn(),
    }),
    useInView: () => true,
    useMotionValue: (initial: number) => ({
      get: () => initial,
      set: vi.fn(),
      onChange: vi.fn(),
    }),
  }
})

/* ================================================================
 * Mock: resend
 * Simula o cliente Resend para evitar chamadas reais à API.
 * ================================================================ */
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: 'mock-email-id' }, error: null }),
    },
  })),
}))

/* ================================================================
 * Variáveis de ambiente padrão para testes
 * ================================================================ */
process.env.NEXT_PUBLIC_APP_URL = 'https://test.clausent.com'
process.env.RESEND_API_KEY = 're_test_mock_key'
process.env.EMAIL_FROM = 'Test <test@clausent.com>'
