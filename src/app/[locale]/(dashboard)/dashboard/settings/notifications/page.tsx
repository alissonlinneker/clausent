import type { Metadata } from 'next'
import { NotificationSettings } from '@/components/dashboard/notification-settings'

/** Metadados da página de notificações */
export const metadata: Metadata = {
  title: 'Notification Preferences',
}

/**
 * Página de preferências de notificações.
 *
 * Permite configurar:
 * - Notificações por e-mail (renovação, risco, análise, equipe, resumo semanal)
 * - Notificações in-app com toggles similares
 * - Horário de silêncio (quiet hours)
 */
export default function NotificationsPage() {
  return <NotificationSettings />
}
