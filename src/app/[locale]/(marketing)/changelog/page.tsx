import { Metadata } from 'next'
import { ChangelogContent } from '@/components/marketing/changelog-content'

/** Metadados SEO e Open Graph da página de changelog */
export const metadata: Metadata = {
  title: 'Changelog',
  description:
    'Track every improvement, new feature, and bug fix shipped by Clausent. We build in public.',
  openGraph: {
    title: 'Changelog — Clausent',
    description:
      'Track every improvement, new feature, and bug fix shipped by Clausent. We build in public.',
    url: 'https://clausent.com/changelog',
    siteName: 'Clausent',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Clausent Changelog — product updates and releases',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Changelog — Clausent',
    description:
      'Track every improvement, new feature, and bug fix shipped by Clausent. We build in public.',
    images: ['/og-image.png'],
  },
}

/**
 * Página de changelog do produto — rota /[locale]/changelog.
 *
 * Server component que exporta metadata para SEO e renderiza
 * o componente client-side ChangelogContent com timeline vertical,
 * filtros por tipo (Feature, Improvement, Fix), e entradas detalhadas
 * com versão, data, tipo e descrição.
 */
export default function ChangelogPage() {
  return <ChangelogContent />
}
