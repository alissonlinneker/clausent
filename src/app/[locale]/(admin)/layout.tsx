import { AdminSidebar } from '@/components/admin/admin-sidebar'

/**
 * Layout principal do painel administrativo.
 *
 * Estrutura:
 * - Sidebar fixa à esquerda (desktop) / drawer (mobile) com navegação admin
 * - Área de conteúdo principal com scroll vertical
 * - Fundo slate-50 para consistência visual
 *
 * Diferenças em relação ao layout do dashboard:
 * - Sidebar com cor indigo (em vez de teal)
 * - Badge "Admin Panel" no header da sidebar
 * - Links específicos de administração
 *
 * Proteção de rotas:
 * - Deve ser feita via middleware verificando role === 'admin'
 * - Rota: /[locale]/(admin)/admin/...
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar administrativa — navegação principal */}
      <AdminSidebar />

      {/* Conteúdo principal — ocupa todo o espaço restante */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Área de conteúdo com padding responsivo */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
