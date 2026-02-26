'use client'

import Link from 'next/link'
import { FileText, Plus, Inbox } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { trpc } from '@/lib/trpc/react'
import { cn } from '@/lib/utils'

/**
 * Mapeamento de cores para badges de status de contrato.
 * Cada status possui classes de cor do Tailwind para fundo e texto.
 *
 * - active: Verde (emerald) — contrato em vigor
 * - expiring: Âmbar (amber) — contrato prestes a expirar
 * - expired: Vermelho (red) — contrato expirado
 * - renewed: Azul (blue) — contrato renovado
 * - cancelled: Cinza (slate) — contrato cancelado
 */
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  expiring: 'bg-amber-100 text-amber-700 border-amber-200',
  expired: 'bg-red-100 text-red-700 border-red-200',
  renewed: 'bg-blue-100 text-blue-700 border-blue-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
}

/**
 * Retorna as classes CSS para o badge de risk score.
 * Usa escala de cores baseada no nível de risco:
 *
 * - 0-30: Verde (baixo risco)
 * - 31-60: Âmbar (risco moderado)
 * - 61-100: Vermelho (alto risco)
 * - null/undefined: Cinza (sem análise)
 */
function getRiskScoreColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'bg-slate-100 text-slate-500 border-slate-200'
  if (score <= 30) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (score <= 60) return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-red-100 text-red-700 border-red-200'
}

/**
 * Formata valor monetário com símbolo da moeda.
 * Exemplo: formatCurrency(1500, "USD") → "$1,500.00"
 */
function formatCurrency(value: string | null | undefined, currency: string = 'USD'): string {
  if (!value) return '—'

  const num = parseFloat(value)
  if (isNaN(num)) return '—'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

/**
 * Formata uma data para exibição em formato curto.
 * Exemplo: "2026-12-31" → "Dec 31, 2026"
 */
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'

  const d = typeof date === 'string' ? new Date(date) : date

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d)
}

/**
 * Componente de estado vazio — exibido quando não há contratos.
 * Inclui ícone decorativo, mensagem explicativa e CTA para criar o primeiro contrato.
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Ícone decorativo com fundo indigo sutil */}
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
        <Inbox className="h-8 w-8 text-indigo-400" />
      </div>

      <h3 className="text-base font-semibold text-slate-900">
        No contracts yet
      </h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        Upload your first contract to start getting risk analysis,
        renewal alerts, and cost optimization insights.
      </p>

      {/* Botão CTA para adicionar primeiro contrato */}
      <Button asChild className="mt-6 bg-indigo-600 text-white hover:bg-indigo-700">
        <Link href="/dashboard/contracts/new">
          <Plus className="mr-2 h-4 w-4" />
          Add Your First Contract
        </Link>
      </Button>
    </div>
  )
}

/**
 * Skeleton de loading para a tabela de contratos.
 * Exibe linhas animadas enquanto os dados são carregados.
 */
function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-2">
          <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-12 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  )
}

/**
 * Componente de lista/tabela de contratos.
 *
 * Funcionalidades:
 * - Busca contratos via tRPC (contract.list)
 * - Exibe em tabela com colunas: Title, Category, Status, Risk Score, Value, Expiration
 * - Badges coloridos para status e risk score
 * - Empty state quando não há contratos
 * - Loading skeleton durante carregamento
 * - Link para detalhes de cada contrato
 * - Botão "Add Contract" no topo
 */
export function ContractList() {
  /** Buscar lista de contratos via tRPC */
  const { data: contracts, isLoading } = trpc.contract.list.useQuery()

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      {/* Cabeçalho com título e botão de ação */}
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Ícone decorativo */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
            <FileText className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Contracts
            </CardTitle>
            <p className="text-sm text-slate-500">
              {contracts?.length
                ? `${contracts.length} contract${contracts.length !== 1 ? 's' : ''}`
                : 'Manage your contracts'}
            </p>
          </div>
        </div>

        {/* Botão para adicionar novo contrato */}
        <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700">
          <Link href="/dashboard/contracts/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Contract
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {/* Estado de carregamento */}
        {isLoading && <TableSkeleton />}

        {/* Empty state — sem contratos */}
        {!isLoading && (!contracts || contracts.length === 0) && <EmptyState />}

        {/* Tabela de contratos — exibida quando há dados */}
        {!isLoading && contracts && contracts.length > 0 && (
          <div className="rounded-lg border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Title
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Category
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Risk Score
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Value
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Expiration
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {contracts.map((contract) => (
                  <TableRow
                    key={contract.id}
                    className="group cursor-pointer transition-colors hover:bg-indigo-50/30"
                  >
                    {/* Título — link para detalhes do contrato */}
                    <TableCell>
                      <Link
                        href={`/dashboard/contracts/${contract.id}`}
                        className="flex items-center gap-2 text-sm font-medium text-slate-900 group-hover:text-indigo-700"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-indigo-500" />
                        <span className="truncate max-w-[200px]">
                          {contract.title}
                        </span>
                      </Link>
                    </TableCell>

                    {/* Categoria com capitalização */}
                    <TableCell>
                      <span className="text-sm capitalize text-slate-600">
                        {contract.category}
                      </span>
                    </TableCell>

                    {/* Badge de status com cores dinâmicas */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs font-medium capitalize',
                          STATUS_COLORS[contract.status] || STATUS_COLORS.cancelled
                        )}
                      >
                        {contract.status}
                      </Badge>
                    </TableCell>

                    {/* Badge de risk score com cores baseadas no nível */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs font-medium',
                          getRiskScoreColor(contract.riskScore)
                        )}
                      >
                        {contract.riskScore !== null && contract.riskScore !== undefined
                          ? `${contract.riskScore}/100`
                          : 'N/A'}
                      </Badge>
                    </TableCell>

                    {/* Valor formatado com moeda */}
                    <TableCell>
                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(contract.totalValue, contract.currency ?? 'USD')}
                      </span>
                    </TableCell>

                    {/* Data de expiração formatada */}
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {formatDate(contract.endDate)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
