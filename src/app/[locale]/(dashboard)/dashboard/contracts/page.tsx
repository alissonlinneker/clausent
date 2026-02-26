import type { Metadata } from 'next'
import { ContractsList } from '@/components/dashboard/contracts-list'

/** Metadados da página de contratos */
export const metadata: Metadata = {
  title: 'Contracts',
}

/**
 * Página de listagem de contratos.
 *
 * Exibe todos os contratos do usuário com:
 * - Filtros por status e risco
 * - Pesquisa por nome/vendor
 * - Tabela com paginação
 * - Botão de upload
 */
export default function ContractsPage() {
  return <ContractsList />
}
