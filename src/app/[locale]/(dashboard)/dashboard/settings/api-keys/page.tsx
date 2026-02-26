import type { Metadata } from 'next'
import { ApiKeysSettings } from '@/components/dashboard/api-keys-settings'

/** Metadados da página de chaves de API */
export const metadata: Metadata = {
  title: 'API Keys',
}

/**
 * Página de gerenciamento de chaves de API.
 *
 * Permite:
 * - Visualizar e copiar chaves existentes
 * - Gerar novas chaves
 * - Revogar chaves ativas
 * - Consultar estatísticas de uso da API
 * - Ver exemplo de integração com curl
 */
export default function ApiKeysPage() {
  return <ApiKeysSettings />
}
