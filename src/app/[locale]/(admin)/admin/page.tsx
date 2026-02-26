import { AdminDashboard } from '@/components/admin/admin-dashboard'

/**
 * Página principal do painel administrativo.
 *
 * Exibe o dashboard com KPIs, gráficos de receita,
 * crescimento de usuários, distribuição de planos
 * e feed de atividades recentes.
 *
 * Rota: /[locale]/admin
 */
export default function AdminDashboardPage() {
  return <AdminDashboard />
}
