import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/lib/i18n/routing'
import { Providers } from '@/components/providers'
import { Toaster } from 'sonner'
import '../globals.css'

/** Fonte Inter — limpa e profissional para SaaS B2B */
const inter = Inter({ subsets: ['latin'] })

/**
 * Layout principal do locale.
 *
 * Este é o layout que envolve todas as páginas dentro de /[locale]/.
 * Responsabilidades:
 * - Define o atributo lang no <html> com base no locale ativo
 * - Carrega as mensagens de tradução e disponibiliza via NextIntlClientProvider
 * - Inclui o Providers (React Query, etc.)
 * - Inclui o Toaster para notificações (sonner)
 * - Aplica a fonte Inter e os estilos globais
 *
 * Valida se o locale da URL é suportado; caso contrário, retorna 404.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  /** Obtém o locale dos parâmetros da rota */
  const { locale } = await params

  /** Valida se o locale é suportado pela aplicação */
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound()
  }

  /** Carrega todas as mensagens de tradução do locale ativo */
  const messages = await getMessages()

  return (
    <html lang={locale} className={inter.className}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* Provider de traduções — disponibiliza useTranslations() em toda a árvore */}
        <NextIntlClientProvider messages={messages}>
          {/* Providers client-side (React Query, etc.) */}
          <Providers>
            {children}
          </Providers>

          {/* Toaster para notificações toast (sonner) */}
          <Toaster richColors position="top-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
