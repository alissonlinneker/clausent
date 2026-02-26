'use client'

import { use, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronRight,
  FileQuestion,
  Loader2,
  Package,
} from 'lucide-react'
import { trpc } from '@/lib/trpc/react'
import { Button } from '@/components/ui/button'
import {
  RenegotiationPackage,
  RenegotiationPackageSkeleton,
} from '@/components/contracts/renegotiation-package'

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

      {/* Link para voltar à lista */}
      <Button variant="outline" asChild className="mt-6">
        <Link href="/dashboard/contracts">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Contracts
        </Link>
      </Button>
    </div>
  )
}

/**
 * Página de geração e visualização do pacote de renegociação.
 *
 * Funcionalidades:
 * - Extrai contractId dos parâmetros da URL (Next.js 15 async params)
 * - Busca pacote de renegociação existente via tRPC
 * - Se não existe, exibe botão para gerar novo pacote
 * - Se existe, renderiza o componente RenegotiationPackage
 * - Permite regenerar e editar o rascunho de email
 * - Breadcrumb: Contracts > [Contract Name] > Renegotiate
 *
 * Rota: /dashboard/contracts/[contractId]/renegotiate
 */
export default function RenegotiatePage({
  params,
}: {
  params: Promise<{ contractId: string }>
}) {
  /** Desempacotar params usando React.use() (Next.js 15 async params) */
  const { contractId } = use(params)

  /** Utilitário do tRPC para invalidar queries após mutações */
  const utils = trpc.useUtils()

  /** Busca dados do contrato para o breadcrumb */
  const { data: contract, isLoading: isLoadingContract } = trpc.contract.getById.useQuery(
    { id: contractId },
    { enabled: !!contractId },
  )

  /** Busca pacote de renegociação existente para o contrato */
  const {
    data: pkg,
    isLoading: isLoadingPkg,
  } = trpc.renegotiation.getForContract.useQuery(
    { contractId },
    { enabled: !!contractId },
  )

  /** Mutation para gerar novo pacote de renegociação */
  const generateMutation = trpc.renegotiation.generate.useMutation({
    onSuccess: () => {
      /** Invalida a query para buscar o pacote recém-criado */
      utils.renegotiation.getForContract.invalidate({ contractId })
    },
  })

  /** Mutation para atualizar o rascunho de email */
  const updateDraftMutation = trpc.renegotiation.updateDraft.useMutation({
    onSuccess: () => {
      /** Invalida para refletir a edição salva */
      utils.renegotiation.getForContract.invalidate({ contractId })
    },
  })

  /** Handler para gerar/regenerar o pacote */
  const handleGenerate = useCallback(() => {
    generateMutation.mutate({ contractId })
  }, [contractId, generateMutation])

  /** Handler para salvar edições no rascunho de email */
  const handleSaveDraft = useCallback(
    (draftEmail: string) => {
      if (!pkg) return
      updateDraftMutation.mutate({
        packageId: pkg.id,
        draftEmail,
      })
    },
    [pkg, updateDraftMutation],
  )

  /** Estado de carregamento geral */
  const isLoading = isLoadingContract || isLoadingPkg

  /** Se está carregando, exibir skeleton */
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb skeleton */}
        <div className="h-4 w-64 animate-pulse rounded bg-slate-200" />

        {/* Header skeleton */}
        <div>
          <div className="h-8 w-72 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-4 w-96 animate-pulse rounded bg-slate-200" />
        </div>

        <RenegotiationPackageSkeleton />
      </div>
    )
  }

  /** Contrato não encontrado */
  if (!contract) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Renegotiation Package
          </h1>
        </div>
        <ContractNotFound />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* =========================================== */}
      {/* BREADCRUMB — Contracts > Contract > Renegotiate */}
      {/* =========================================== */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link
          href="/dashboard/contracts"
          className="transition-colors hover:text-slate-700"
        >
          Contracts
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/dashboard/contracts/${contractId}`}
          className="max-w-[200px] truncate transition-colors hover:text-slate-700"
        >
          {contract.title}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-900">Renegotiate</span>
      </nav>

      {/* =========================================== */}
      {/* HEADER — Título e descrição                 */}
      {/* =========================================== */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Renegotiation Package
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Generate a data-driven renegotiation strategy for{' '}
          <span className="font-medium text-slate-700">{contract.title}</span>
        </p>
      </div>

      {/* =========================================== */}
      {/* CONTEÚDO — Pacote existente ou gerar novo   */}
      {/* =========================================== */}
      {generateMutation.isPending ? (
        /** Enquanto gera, mostra skeleton com mensagem */
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50/50 px-4 py-3">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            <p className="text-sm font-medium text-indigo-700">
              Analyzing contract data and generating renegotiation strategy...
            </p>
          </div>
          <RenegotiationPackageSkeleton />
        </div>
      ) : pkg ? (
        /** Pacote existe — renderizar componente completo */
        <RenegotiationPackage
          pkg={pkg}
          onRegenerate={handleGenerate}
          onSaveDraft={handleSaveDraft}
          isRegenerating={generateMutation.isPending}
          isSavingDraft={updateDraftMutation.isPending}
        />
      ) : (
        /** Nenhum pacote — exibir CTA para gerar */
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
          {/* Ícone decorativo */}
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
            <Package className="h-8 w-8 text-indigo-500" />
          </div>

          <h2 className="text-lg font-semibold text-slate-900">
            No renegotiation package yet
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Generate a data-driven renegotiation package based on your contract
            clauses, risk analysis, and market benchmarks.
          </p>

          {/* Botão de geração */}
          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="mt-6 bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <Package className="mr-2 h-4 w-4" />
            Generate Renegotiation Package
          </Button>

          {/* Mensagem de erro se a geração falhar */}
          {generateMutation.isError && (
            <p className="mt-4 text-sm text-red-600">
              Failed to generate package. Please try again.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
