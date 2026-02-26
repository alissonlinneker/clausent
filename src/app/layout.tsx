import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

/** Fonte Inter — limpa e profissional para SaaS B2B */
const inter = Inter({ subsets: ['latin'] })

/** Metadados globais da aplicação — SEO completo com Open Graph e Twitter Cards */
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://clausent.com'
  ),
  title: {
    default: 'Clausent — Contract Intelligence for SMBs',
    template: '%s | Clausent',
  },
  description:
    'Stop losing money on contracts you forgot you had. AI-powered contract monitoring, risk analysis, and renegotiation for small businesses.',
  keywords: [
    'contract management',
    'contract intelligence',
    'SMB',
    'risk analysis',
    'contract monitoring',
    'renegotiation',
  ],
  authors: [{ name: 'Clausent' }],
  creator: 'Clausent',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://clausent.com',
    siteName: 'Clausent',
    title: 'Clausent — Contract Intelligence for SMBs',
    description: 'Stop losing money on contracts you forgot you had.',
    images: [
      { url: '/og-image.png', width: 1200, height: 630, alt: 'Clausent' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clausent — Contract Intelligence for SMBs',
    description: 'Stop losing money on contracts you forgot you had.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
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
          <Providers>
            {children}
          </Providers>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
