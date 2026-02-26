import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'

/**
 * Layout principal do dashboard.
 *
 * Estrutura:
 * - Flex horizontal com sidebar fixa (w-64) à esquerda em desktop
 * - Sidebar oculta em mobile (acessível via Sheet no header)
 * - Área de conteúdo à direita com header fixo no topo
 * - Conteúdo principal com scroll independente e padding
 * - Background slate-50 (#F8FAFC) para consistência visual
 *
 * Este layout é compartilhado por todas as páginas dentro do
 * grupo de rotas (dashboard), incluindo overview, contratos,
 * alertas, benchmarks e configurações.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar fixa — visível apenas em desktop (lg+) */}
      <div className="hidden lg:flex">
        <DashboardSidebar />
      </div>

      {/* Área de conteúdo principal — ocupa o espaço restante */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header com navegação, busca e controles do usuário */}
        <DashboardHeader />

        {/* Conteúdo da página com scroll independente */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
