import type { Metadata } from 'next'
import { ProfileSettings } from '@/components/dashboard/profile-settings'

/** Metadados da página de configurações de perfil */
export const metadata: Metadata = {
  title: 'Profile Settings',
}

/**
 * Página de configurações de perfil do usuário.
 *
 * Permite editar:
 * - Avatar, nome, empresa, cargo e telefone
 * - Fuso horário e idioma preferido
 * - Exclusão de conta
 */
export default function ProfileSettingsPage() {
  return <ProfileSettings />
}
