'use client'

import { use } from 'react'
import Link from 'next/link'
import { FileQuestion, ArrowLeft, Loader2 } from 'lucide-react'
import { trpc } from '@/lib/trpc/react'
import { ContractDetail } from '@/components/contracts/contract-detail'
import { Button } from '@/components/ui/button'

/**
 * Skeleton de carregamento para a página de detalhe do contrato.
 * Exibe blocos animados simulando o layout final enquanto os dados carregam.
 */
function ContractDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Skeleton do botão de voltar */}
      <div className="h-8 w-36 animate-pulse rounded bg-slate-200" />

      {/* Skeleton do header — título e risk badge */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="h-8 w-72 animate-pulse rounded bg-slate-200" />
          <div className="flex gap-2">
            <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
          </div>
        </div>
        <div className="h-16 w-40 animate-pulse rounded-xl bg-slate-200" />
      </div>

      {/* Skeleton do separador */}
      <div className="h-px w-full bg-slate-200" />

      {/* Skeleton do card de detalhes */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 h-5 w-40 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-200" />
              <div className="space-y-1">
                <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skeleton do card de summary */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-6 shadow-sm">
        <div className="mb-4 h-5 w-44 animate-pulse rounded bg-indigo-200/50" />
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-indigo-200/50" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-indigo-200/50" />
          <div className="h-4 w-3/5 animate-pulse rounded bg-indigo-200/50" />
        </div>
      </div>
    </div>
  )
}

/**
 * Componente de estado "não encontrado".
 * Exibido quando o contrato não existe ou não pertence à organização.
 */
function ContractNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Ícone decorativo */}
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <FileQuestion className="h-8 w-8 text-slate-400" />
      </div>

      <h2 className="text-lg font-semibold text-slate-900">
        Contract not found
      </h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        This contract doesn&apos;t exist or you don&apos;t have permission to view it.
      </p>

      {/* Link para voltar à lista de contratos */}
      <Button
        variant="outline"
        asChild
        className="mt-6"
      >
        <Link href="/dashboard/contracts">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Contracts
        </Link>
      </Button>
    </div>
  )
}

/**
 * Página de detalhe de um contrato específico.
 *
 * Funcionalidades:
 * - Extrai o contractId dos parâmetros da URL (App Router)
 * - Busca dados completos do contrato via tRPC (contract.getById)
 * - Exibe skeleton enquanto carrega
 * - Exibe mensagem de "not found" quando o contrato não existe
 * - Renderiza ContractDetail com todos os dados relacionados
 *
 * Rota: /dashboard/contracts/[contractId]
 */
export default function ContractDetailPage({
  params,
}: {
  params: Promise<{ contractId: string }>
}) {
  /** Desempacotar params usando React.use() (Next.js 15 async params) */
  const { contractId } = use(params)

  /** Buscar contrato completo via tRPC — inclui clauses, alerts, benchmarks */
  const {
    data: contract,
    isLoading,
    error,
  } = trpc.contract.getById.useQuery(
    { id: contractId },
    { enabled: !!contractId },
  )

  /** Estado de carregamento — exibir skeleton */
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Cabeçalho da página */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Contract Details
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Loading contract information...
          </p>
        </div>
        <ContractDetailSkeleton />
      </div>
    )
  }

  /** Contrato não encontrado ou erro na query */
  if (error || !contract) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Contract Details
          </h1>
        </div>
        <ContractNotFound />
      </div>
    )
  }

  /** Renderizar detalhes do contrato */
  return (
    <div className="space-y-6">
      <ContractDetail contract={contract} />
    </div>
  )
}
