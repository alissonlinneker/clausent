import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

/** Fonte Inter — limpa e profissional para SaaS B2B */
const inter = Inter({ subsets: ['latin'] })

/** Metadados globais da aplicação */
export const metadata: Metadata = {
  title: 'Clausent — Contract Intelligence for SMBs',
  description:
    'Stop losing money on contracts you forgot you had. AI-powered contract monitoring, risk analysis, and renegotiation for small businesses.',
}

/**
 * Layout raiz da aplicação.
 * Envolve toda a árvore de componentes com o ClerkProvider
 * para garantir que a autenticação esteja disponível em todas as páginas.
 * A publishableKey é passada explicitamente para evitar erros em build time.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      dynamic
    >
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
