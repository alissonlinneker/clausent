import { Metadata } from 'next'
import { TermsContent } from '@/components/marketing/terms-content'

/** Metadados SEO e Open Graph da página de Termos de Serviço */
export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Read the Clausent Terms of Service — the rules and guidelines for using our contract intelligence platform.',
  openGraph: {
    title: 'Terms of Service — Clausent',
    description:
      'Read the Clausent Terms of Service — the rules and guidelines for using our contract intelligence platform.',
    url: 'https://clausent.com/terms',
    siteName: 'Clausent',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Clausent Terms of Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service — Clausent',
    description:
      'Read the Clausent Terms of Service — the rules and guidelines for using our contract intelligence platform.',
    images: ['/og-image.png'],
  },
}

/**
 * Página de Termos de Serviço — rota /[locale]/terms.
 *
 * Server component que exporta metadata para SEO e renderiza
 * o conteúdo client-side (TermsContent) com as 8 seções legais.
 */
export default function TermsPage() {
  return <TermsContent />
}
