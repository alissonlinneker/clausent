import { AlertList } from '@/components/alerts/alert-list'

/**
 * Página de alertas do dashboard.
 *
 * Exibe todos os alertas de contrato da organização com filtros
 * por status (All, Pending, Sent, Dismissed).
 *
 * Os alertas são gerados automaticamente pelo cron job diário
 * e notificam sobre renovações, expirações e períodos de aviso.
 *
 * Rota: /dashboard/alerts
 */
export default function AlertsPage() {
  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          Alerts
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Monitor contract renewals, expirations, and notice periods.
        </p>
      </div>

      {/* Lista de alertas — componente client-side com tRPC */}
      <AlertList />
    </div>
  )
}
