import type { Metadata } from 'next'
import { RiskDashboard } from '@/components/dashboard/risk-dashboard'

/** Metadados da página de análise de riscos do dashboard */
export const metadata: Metadata = {
  title: 'Risk Analysis',
}

/**
 * Página de análise de riscos — visão consolidada dos riscos
 * identificados em todos os contratos do usuário.
 *
 * Inclui cards de resumo, gráficos de distribuição e tendência,
 * e tabela detalhada com os riscos mais recentes.
 */
export default function RiskPage() {
  return <RiskDashboard />
}
