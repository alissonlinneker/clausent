import type { Metadata } from 'next'
import { ReportsPage } from '@/components/dashboard/reports-page'

/** Metadados da página de relatórios e exportação */
export const metadata: Metadata = {
  title: 'Reports & Export',
}

/**
 * Página de relatórios — geração e download de reports.
 *
 * Permite acessar relatórios pré-configurados,
 * criar relatórios customizados e visualizar histórico.
 */
export default function ReportsRoute() {
  return <ReportsPage />
}
