import { Metadata } from 'next'
import { PricingContent } from './pricing-content'

/** Metadados SEO específicos da página de preços */
export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple, transparent pricing for contract intelligence. Plans starting at $29/month.',
}

/**
 * Página standalone de Pricing (/pricing).
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
