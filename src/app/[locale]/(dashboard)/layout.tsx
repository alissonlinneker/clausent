import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'

/**
 * Layout principal do dashboard.
 *
 * Estrutura:
 * - Sidebar fixa à esquerda (desktop) / drawer (mobile)
 * - Header com breadcrumbs e ações do usuário
 * - Área de conteúdo principal com padding e scroll
 *
 * Proteção de rotas é feita via middleware e Better Auth.
 * Rota: /[locale]/(dashboard)/...
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar — navegação principal */}
      <DashboardSidebar />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header — breadcrumbs, pesquisa, perfil */}
        <DashboardHeader />

        {/* Área de conteúdo */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
