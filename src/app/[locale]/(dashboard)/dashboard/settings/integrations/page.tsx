import type { Metadata } from 'next'
import { IntegrationsSettings } from '@/components/dashboard/integrations-settings'

/** Metadados da página de integrações */
export const metadata: Metadata = {
  title: 'Integrations',
}

/**
 * Página de integrações com serviços externos.
 *
 * Exibe:
 * - Grid de integrações (Slack, Teams, Google Drive, Zapier, Salesforce, HubSpot)
 * - Status de conexão e opções de configuração
 * - Seção de webhooks com URL, seleção de eventos e teste
 */
export default function IntegrationsPage() {
  return <IntegrationsSettings />
}
