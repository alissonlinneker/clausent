import type { Metadata } from 'next'
import { AlertsList } from '@/components/dashboard/alerts-list'

/** Metadados da página de alertas */
export const metadata: Metadata = {
  title: 'Alerts',
}

/**
 * Página de alertas de renovação e prazos.
 *
 * Exibe todos os alertas pendentes com:
 * - Alertas de renovação próxima
 * - Alertas de expiração
 * - Filtros por urgência
 */
export default function AlertsPage() {
  return <AlertsList />
}
