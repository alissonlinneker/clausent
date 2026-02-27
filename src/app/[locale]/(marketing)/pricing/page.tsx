import { Metadata } from 'next'
import { PricingContent } from './pricing-content'

/** Metadados SEO e Open Graph da página de preços */
export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple, transparent pricing for contract intelligence. Plans starting at $29/month.',
  openGraph: {
    title: 'Pricing — Clausent',
    description:
      'Simple, transparent pricing for contract intelligence. Plans starting at $29/month.',
    url: 'https://clausent.com/pricing',
    siteName: 'Clausent',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Clausent pricing plans — from free to enterprise',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing — Clausent',
    description:
      'Simple, transparent pricing for contract intelligence. Plans starting at $29/month.',
    images: ['/og-image.png'],
  },
}

/**
 * Página standalone de Pricing — rota /[locale]/pricing.
 *
 * Server component que exporta metadata para SEO e renderiza
 * o conteúdo client-side (PricingContent) com FAQ e planos.
 *
 * A PricingSection é o mesmo componente usado na landing page,
 * garantindo consistência visual entre as páginas.
 */
export default function PricingPage() {
  return <PricingContent />
}
