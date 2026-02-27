import { Metadata } from 'next'
import { PrivacyContent } from '@/components/marketing/privacy-content'

/** Metadados SEO e Open Graph da página de Política de Privacidade */
export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Clausent Privacy Policy — how we collect, use, and protect your data on our contract intelligence platform.',
  openGraph: {
    title: 'Privacy Policy — Clausent',
    description:
      'Clausent Privacy Policy — how we collect, use, and protect your data on our contract intelligence platform.',
    url: 'https://clausent.com/privacy',
    siteName: 'Clausent',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Clausent Privacy Policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy — Clausent',
    description:
      'Clausent Privacy Policy — how we collect, use, and protect your data on our contract intelligence platform.',
    images: ['/og-image.png'],
  },
}

/**
 * Página de Política de Privacidade — rota /[locale]/privacy.
 *
 * Server component que exporta metadata para SEO e renderiza
 * o conteúdo client-side (PrivacyContent) com as 8 seções sobre
 * tratamento de dados e privacidade.
 */
export default function PrivacyPage() {
  return <PrivacyContent />
}
