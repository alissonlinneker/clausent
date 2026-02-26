import type { Metadata } from 'next'
import { BillingSettings } from '@/components/dashboard/billing-settings'

/** Metadados da página de billing */
export const metadata: Metadata = {
  title: 'Billing',
}

/**
 * Página de billing e assinatura.
 *
 * Exibe:
 * - Plano atual e uso de contratos
 * - Opção de upgrade/downgrade
 * - Link para Stripe Customer Portal
 */
export default function BillingPage() {
  return <BillingSettings />
}
