import { Metadata } from 'next'
import { AboutContent } from '@/components/marketing/about-content'

/** Metadados SEO da página "Sobre" */
export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about Clausent — our mission, values, and the team behind AI-powered contract intelligence for SMBs.',
}

/**
 * Página "Sobre" da Clausent — rota /[locale]/about.
 *
 * Server component que exporta metadata para SEO e renderiza
 * o conteúdo client-side (AboutContent) com seções de missão,
 * valores e equipe.
 *
 * Usa next-intl para traduções e Framer Motion para animações.
 */
export default function AboutPage() {
  return <AboutContent />
}
