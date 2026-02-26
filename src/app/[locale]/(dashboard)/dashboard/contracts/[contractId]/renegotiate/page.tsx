import type { Metadata } from 'next'
import { RenegotiationView } from '@/components/dashboard/renegotiation-view'

/** Metadados da página de renegociação */
export const metadata: Metadata = {
  title: 'Renegotiation Playbook',
}

/**
 * Página de renegociação de contrato.
 *
 * Recebe o contractId via parâmetros dinâmicos da rota e
 * delega a renderização para o componente client RenegotiationView.
 *
 * Rota: /dashboard/contracts/[contractId]/renegotiate
 */
export default async function RenegotiatePage({
  params,
}: {
  params: Promise<{ contractId: string }>
}) {
  const { contractId } = await params

  return <RenegotiationView contractId={contractId} />
}
