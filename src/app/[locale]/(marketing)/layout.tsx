import { MarketingHeader } from '@/components/layout/marketing-header'
import { MarketingFooter } from '@/components/layout/marketing-footer'

/**
 * Layout de marketing com suporte a i18n.
 *
 * Envolve todas as páginas dentro do route group (marketing)
 * dentro de /[locale]/(marketing)/.
 *
 * Inclui:
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
      <MarketingHeader />
      <main>{children}</main>
      <MarketingFooter />
    </>
  )
}
