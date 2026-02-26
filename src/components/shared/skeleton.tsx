import { cn } from '@/lib/utils'

/**
 * Componente de skeleton loader animado.
 *
 * Exibe um placeholder visual pulsante enquanto o conteúdo
 * real está sendo carregado. Aceita className para customizar
 * tamanho, forma e posição.
 *
 * Variantes comuns via className:
 * - `h-4 w-32` — texto curto
 * - `h-4 w-full` — texto longo
 * - `h-10 w-10 rounded-full` — avatar circular
 * - `h-48 w-full rounded-2xl` — card grande
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-slate-200/60',
        className
      )}
    />
  )
}

/**
 * Skeleton para cards de estatísticas do dashboard.
 * Reproduz o layout dos stat cards com placeholders animados.
 */
export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-4 h-4" />
      </div>
      <Skeleton className="h-7 w-20 mb-2" />
      <Skeleton className="h-4 w-28" />
    </div>
  )
}

/**
 * Skeleton para linhas de tabela.
 * Simula uma tabela em carregamento com linhas pulsantes.
 *
 * @param rows - Número de linhas skeleton a exibir (padrão: 5)
 * @param cols - Número de colunas por linha (padrão: 4)
 */
export function TableSkeleton({
  rows = 5,
  cols = 4,
}: {
  rows?: number
  cols?: number
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Cabeçalho da tabela */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex gap-6">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-20" />
        ))}
      </div>

      {/* Linhas de dados */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-center gap-6 px-6 py-4 border-b border-slate-100 last:border-0"
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              className={cn(
                'h-4',
                colIdx === 0 ? 'w-40' : 'w-20'
              )}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton para gráficos Recharts.
 * Simula um container de gráfico com barra de título e área pulsante.
 */
export function ChartSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}

/**
 * Skeleton para cards de alerta.
 * Simula a lista de alertas em carregamento.
 *
 * @param count - Número de alertas skeleton (padrão: 3)
 */
export function AlertCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] p-4"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton para a página de overview completa do dashboard.
 * Combina stat cards + chart + alerts + tabela de contratos recentes.
 */
export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Chart + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <AlertCardSkeleton />
      </div>

      {/* Tabela de contratos recentes */}
      <TableSkeleton rows={5} cols={5} />
    </div>
  )
}
