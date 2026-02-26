import type { Metadata } from 'next'
import { DashboardOverview } from '@/components/dashboard/overview'

/** Metadados da página principal do dashboard */
export const metadata: Metadata = {
  title: 'Dashboard',
}

/**
 * Página principal do dashboard.
 *
 * Exibe o overview com:
 * - Cards de métricas (contratos, alertas, savings, risco)
 * - Gráfico de atividade recente
 * - Lista de contratos recentes
 * - Alertas pendentes
 */
export default function DashboardPage() {
  return <DashboardOverview />
}
