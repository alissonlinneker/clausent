import { AdminEmails } from '@/components/admin/admin-emails'

/**
 * Página de logs de e-mail do painel administrativo.
 *
 * Monitora envios, entregas, bounces e permite
 * visualizar templates de e-mail da plataforma.
 *
 * Rota: /[locale]/admin/emails
 */
export default function AdminEmailsPage() {
  return <AdminEmails />
}
