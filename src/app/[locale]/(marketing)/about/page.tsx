import { Metadata } from 'next'
import { AboutContent } from '@/components/marketing/about-content'

/** Metadados SEO e Open Graph da página "Sobre" */
export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about Clausent — our mission, values, and the team behind AI-powered contract intelligence for SMBs.',
  openGraph: {
    title: 'About — Clausent',
    description:
      'Learn about Clausent — our mission, values, and the team behind AI-powered contract intelligence for SMBs.',
    url: 'https://clausent.com/about',
    siteName: 'Clausent',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'About Clausent — the team behind contract intelligence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About — Clausent',
    description:
      'Learn about Clausent — our mission, values, and the team behind AI-powered contract intelligence for SMBs.',
    images: ['/og-image.png'],
  },
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
