import { AdminSystemHealth } from '@/components/admin/admin-system-health'

/**
 * Página de saúde do sistema do painel administrativo.
 *
 * Exibe status dos serviços, métricas de desempenho,
 * uso de recursos, incidentes recentes e logs do sistema.
 *
 * Rota: /[locale]/admin/system
 */
export default function AdminSystemHealthPage() {
  return <AdminSystemHealth />
}
