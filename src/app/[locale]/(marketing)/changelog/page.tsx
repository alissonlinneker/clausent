import { Metadata } from 'next'
import { ChangelogContent } from '@/components/marketing/changelog-content'

/** Metadados SEO da página de changelog */
export const metadata: Metadata = {
  title: 'Changelog',
  description:
    'Track every improvement, new feature, and bug fix shipped by Clausent. We build in public.',
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
