import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

/** Fonte Inter — limpa e profissional para SaaS B2B */
const inter = Inter({ subsets: ['latin'] })

/**
 * Metadados globais da aplicação — SEO completo com Open Graph e Twitter Cards.
 * Estes metadados servem como fallback; páginas individuais podem sobrescrever.
 */
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
 *
 * Este é o layout mais externo — não inclui providers
 * pois eles são adicionados no layout do [locale].
 * A tag <html> recebe o lang dinamicamente via next-intl.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
