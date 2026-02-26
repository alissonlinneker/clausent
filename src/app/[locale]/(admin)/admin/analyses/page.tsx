import { AdminAnalyses } from '@/components/admin/admin-analyses'

/**
 * Página de gestão de análises do painel administrativo.
 *
 * Monitora a fila de processamento de contratos,
 * exibe o pipeline de análise e permite reprocessar
 * análises com falha.
 *
 * Rota: /[locale]/admin/analyses
 */
export default function AdminAnalysesPage() {
  return <AdminAnalyses />
}
