import { AdminPayments } from '@/components/admin/admin-payments'

/**
 * Página de gestão de pagamentos do painel administrativo.
 *
 * Exibe receita por período, transações recentes,
 * mudanças de assinatura e solicitações de reembolso.
 *
 * Rota: /[locale]/admin/payments
 */
export default function AdminPaymentsPage() {
  return <AdminPayments />
}
