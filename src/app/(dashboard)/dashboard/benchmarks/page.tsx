'use client'

import { BarChart3, TrendingUp, Inbox } from 'lucide-react'
import { trpc } from '@/lib/trpc/react'
import { BenchmarkCard } from '@/components/benchmarks/benchmark-card'
import { BenchmarkChart } from '@/components/benchmarks/benchmark-chart'

/**
 * Skeleton de carregamento para a grid de benchmark cards.
 * Exibe 4 cards animados enquanto os dados são carregados.
 */
function BenchmarksSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white p-6"
        >
          {/* Cabeçalho placeholder */}
          <div className="mb-4 flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200" />
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
          {/* Valores placeholder */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="h-16 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-16 animate-pulse rounded-lg bg-slate-100" />
          </div>
          {/* Barra placeholder */}
          <div className="h-2 w-full animate-pulse rounded-full bg-slate-200" />
        </div>
      ))}
    </div>
  )
}

/**
 * Empty state — exibido quando a organização não possui benchmarks.
 * Orienta o usuário a processar contratos para gerar comparações.
 */
function BenchmarksEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-20 text-center">
      {/* Ícone decorativo */}
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
        <Inbox className="h-8 w-8 text-indigo-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">
        No benchmarks yet
      </h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Market benchmarks will be generated automatically when your contracts
        are analyzed. Upload and process contracts to see how they compare
        with market averages.
      </p>
    </div>
  )
}

/**
 * Página de Benchmarks de Mercado.
 *
 * Exibe comparações entre métricas dos contratos da organização
 * e dados agregados do mercado, incluindo:
 * - Grid de BenchmarkCards com percentis individuais
 * - Gráfico de barras comparativo (Recharts)
 * - Empty state orientativo quando não há benchmarks
 *
 * Dados carregados via tRPC: benchmark.summary
 *
 * Rota: /dashboard/benchmarks
 */
export default function BenchmarksPage() {
  /** Busca o resumo de benchmarks da organização */
  const { data: benchmarks, isLoading } = trpc.benchmark.summary.useQuery()

  /**
   * Transforma os benchmarks em dados para o gráfico.
   * Converte valores numéricos de string (numeric do Postgres) para number.
   */
  const chartData = benchmarks?.map((b) => ({
    name: b.metric
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    yourValue: Number(b.yourValue) || 0,
    marketAvg: Number(b.marketAvg) || 0,
  })) ?? []

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex items-start gap-4">
        {/* Ícone do módulo */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
          <BarChart3 className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Market Benchmarks
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Compare your contract metrics with industry averages and identify
            optimization opportunities.
          </p>
        </div>
      </div>

      {/* Estado de carregamento */}
      {isLoading && <BenchmarksSkeleton />}

      {/* Empty state — sem benchmarks */}
      {!isLoading && (!benchmarks || benchmarks.length === 0) && (
        <BenchmarksEmptyState />
      )}

      {/* Conteúdo principal — benchmarks disponíveis */}
      {!isLoading && benchmarks && benchmarks.length > 0 && (
        <>
          {/* Grid de cards individuais */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benchmarks.map((b) => (
              <BenchmarkCard
                key={b.id}
                metric={b.metric}
                yourValue={Number(b.yourValue) || 0}
                marketAvg={Number(b.marketAvg) || 0}
                percentile={b.percentile ?? 50}
              />
            ))}
          </div>

          {/* Gráfico de barras comparativo */}
          <BenchmarkChart data={chartData} />
        </>
      )}
    </div>
  )
}
