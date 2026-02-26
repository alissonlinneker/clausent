import type { Metadata } from 'next'
import { SettingsGeneral } from '@/components/dashboard/settings-general'

/** Metadados da página de configurações */
export const metadata: Metadata = {
  title: 'Settings',
}

/**
 * Página de configurações gerais.
 *
 * Permite editar:
 * - Nome e email do perfil
 * - Idioma preferido
 * - Notificações
 */
export default function SettingsPage() {
  return <SettingsGeneral />
}
