import { Metadata } from 'next'
import { HeroSection } from '@/components/marketing/hero-section'
import { FeaturesSection } from '@/components/marketing/features-section'
import { HowItWorksSection } from '@/components/marketing/how-it-works-section'
import { PricingSection } from '@/components/marketing/pricing-section'

/** Metadados SEO específicos da landing page */
export const metadata: Metadata = {
  title: 'Clausent — Stop Losing Money on Forgotten Contracts',
  description:
    'AI-powered contract intelligence that monitors renewals, spots unfavorable terms, and suggests renegotiations — saving SMBs an average of 9.2% on contract costs.',
}

/**
 * Página principal de marketing — landing page da Clausent.
 *
 * Estrutura de seções:
 * 1. Hero — headline impactante com gradiente escuro, partículas e mockup
 * 2. Features — grade de 6 funcionalidades com glass morphism
 * 3. How it Works — 3 passos com timeline vertical animada
 * 4. Pricing — cards de preço com toggle mensal/anual
 *
 * Todas as seções usam Framer Motion para animações de scroll e interação.
 */
export default function MarketingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
    </>
  )
}
