import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { HeroSection } from '@/components/marketing/hero-section'

/**
 * Importações dinâmicas — seções abaixo da dobra são carregadas
 * sob demanda para reduzir o bundle inicial e melhorar o LCP/FCP.
 */
const FeaturesSection = dynamic(() => import('@/components/marketing/features-section').then(mod => ({ default: mod.FeaturesSection })))
const HowItWorksSection = dynamic(() => import('@/components/marketing/how-it-works-section').then(mod => ({ default: mod.HowItWorksSection })))
const PricingSection = dynamic(() => import('@/components/marketing/pricing-section').then(mod => ({ default: mod.PricingSection })))
const FAQSection = dynamic(() => import('@/components/marketing/faq-section').then(mod => ({ default: mod.FAQSection })))
const CTASection = dynamic(() => import('@/components/marketing/cta-section').then(mod => ({ default: mod.CTASection })))


/** Metadados SEO e Open Graph da landing page */
export const metadata: Metadata = {
  title: 'Clausent — Stop Losing Money on Forgotten Contracts',
  description:
    'AI-powered contract intelligence that monitors renewals, spots unfavorable terms, and suggests renegotiations — saving SMBs an average of 9.2% on contract costs.',
  openGraph: {
    title: 'Clausent — Stop Losing Money on Forgotten Contracts',
    description:
      'AI-powered contract intelligence that monitors renewals, spots unfavorable terms, and suggests renegotiations — saving SMBs an average of 9.2% on contract costs.',
    url: 'https://clausent.com',
    siteName: 'Clausent',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Clausent — AI-powered contract intelligence platform for SMBs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clausent — Stop Losing Money on Forgotten Contracts',
    description:
      'AI-powered contract intelligence that monitors renewals, spots unfavorable terms, and suggests renegotiations — saving SMBs an average of 9.2% on contract costs.',
    images: ['/og-image.png'],
  },
}

/**
 * Página principal de marketing — landing page da Clausent.
 *
 * Rota: /[locale]/ (ex: /, /pt/, /es/, /fr/, /it/, /de/)
 *
 * Estrutura de seções:
 * 1. Hero — headline impactante com gradiente escuro, partículas e mockup
 * 2. Features — grade de 6 funcionalidades com glass morphism
 * 3. How it Works — 3 passos com timeline vertical animada
 * 4. Pricing — cards de preço com toggle mensal/anual
 * 5. FAQ — perguntas frequentes com acordeão animado
 * 6. CTA — chamada para ação final com estatísticas
 *
 * Todas as seções usam Framer Motion para animações de scroll e interação.
 * As strings de UI são carregadas via next-intl (useTranslations) dentro
 * de cada componente de seção.
 */
export default function MarketingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </>
  )
}
