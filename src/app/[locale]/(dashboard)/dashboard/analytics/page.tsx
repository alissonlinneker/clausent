import type { Metadata } from 'next'
import { AnalyticsDashboard } from '@/components/dashboard/analytics-dashboard'

/** Metadados da página de analytics do dashboard */
export const metadata: Metadata = {
  title: 'Analytics',
}

/**
 * Página de analytics — visualizações detalhadas do portfólio.
 *
 * Exibe gráficos de economia, distribuição de risco,
 * contratos por categoria, atividade mensal e insights.
 */
export default function AnalyticsPage() {
  return <AnalyticsDashboard />
}
