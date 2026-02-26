import { ContractList } from '@/components/contracts/contract-list'

/**
 * Página de listagem de contratos do dashboard.
 *
 * Exibe todos os contratos da organização em formato de tabela
 * com filtros de status, risk score e busca por título.
 * Renderiza o componente ContractList que faz a query via tRPC.
 *
 * Rota: /dashboard/contracts
 */
export default function ContractsPage() {
  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          Contracts
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Upload, manage and analyze all your contracts in one place.
        </p>
      </div>

      {/* Lista de contratos — componente client-side com tRPC */}
      <ContractList />
    </div>
  )
}
