import { MarketingHeader } from '@/components/layout/marketing-header'
import { MarketingFooter } from '@/components/layout/marketing-footer'
import { SkipLink } from '@/components/shared/skip-link'

/**
 * Layout de marketing com suporte a i18n.
 *
 * Envolve todas as páginas dentro do route group (marketing)
 * dentro de /[locale]/(marketing)/.
 *
 * Inclui:
 * - Skip link de acessibilidade (WCAG 2.1 AA — critério 2.4.1)
 * - Header fixo com efeito glass morphism (sticky, transparente no topo)
 * - Conteúdo principal (children)
 * - Footer profissional com links e newsletter
 *
 * O route group (marketing) separa as páginas públicas (landing, pricing)
 * das páginas autenticadas (dashboard, settings).
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SkipLink />
      <MarketingHeader />
      <main id="main-content">{children}</main>
      <MarketingFooter />
    </>
  )
}
