import type { Metadata } from 'next'
import { SecuritySettings } from '@/components/dashboard/security-settings'

/** Metadados da página de configurações de segurança */
export const metadata: Metadata = {
  title: 'Security Settings',
}

/**
 * Página de configurações de segurança da conta.
 *
 * Permite gerenciar:
 * - Alteração de senha
 * - Autenticação de dois fatores (2FA)
 * - Sessões ativas
 * - Histórico de logins
 * - Exportação de dados (GDPR)
 */
export default function SecuritySettingsPage() {
  return <SecuritySettings />
}
