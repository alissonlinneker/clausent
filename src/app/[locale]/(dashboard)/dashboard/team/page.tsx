import type { Metadata } from 'next'
import { TeamManagement } from '@/components/dashboard/team-management'

/** Metadados da página de gerenciamento de equipe */
export const metadata: Metadata = {
  title: 'Team',
}

/**
 * Página de gerenciamento de equipe — convites, roles e permissões.
 */
export default function TeamPage() {
  return <TeamManagement />
}
