import type { Metadata } from 'next'
import { ContractDetail } from '@/components/dashboard/contract-detail'

/** Metadados da página de detalhe do contrato */
export const metadata: Metadata = {
  title: 'Contract Detail',
}

/**
 * Página de detalhe de um contrato específico.
 *
 * Recebe o contractId via parâmetros dinâmicos da rota e
 * delega a renderização para o componente client ContractDetail.
 *
 * Rota: /dashboard/contracts/[contractId]
 */
export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ contractId: string }>
}) {
  const { contractId } = await params

  return <ContractDetail contractId={contractId} />
}
