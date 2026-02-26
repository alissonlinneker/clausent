'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  Edit,
  FileText,
  Package,
  RefreshCw,
  Sparkles,
  Trash2,
  Bell,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import { RiskBadge } from './risk-badge'
import { ContractStatusBadge } from './contract-status-badge'
import { ClauseList } from './clause-list'

import type { Contract } from '@/lib/db/schema/contracts'
import type { ContractClause } from '@/lib/db/schema/contract-clauses'
import type { ContractAlert } from '@/lib/db/schema/contract-alerts'
import type { ContractBenchmark } from '@/lib/db/schema/contract-benchmarks'

/**
 * Tipo do contrato com dados relacionados incluídos.
 * Reflete o retorno do tRPC getById que inclui clauses, alerts e benchmarks.
 */
interface ContractWithRelations extends Contract {
  clauses: ContractClause[]
  alerts: ContractAlert[]
  benchmarks: ContractBenchmark[]
}

/** Props do componente ContractDetail */
interface ContractDetailProps {
  /** Contrato com cláusulas, alertas e benchmarks */
  contract: ContractWithRelations
}

/**
 * Formata valor monetário com símbolo da moeda.
 * Exemplo: formatCurrency("1500.00", "USD") → "$1,500.00"
 */
function formatCurrency(value: string | null | undefined, currency: string = 'USD'): string {
  if (!value) return '—'
  const num = parseFloat(value)
  if (isNaN(num)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

/**
 * Formata uma data para exibição amigável.
 * Exemplo: Date → "Feb 26, 2026"
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
 * Configuração visual para tipos de alerta.
 * Cada tipo de alerta possui ícone e cores específicas.
 */
const ALERT_TYPE_CONFIG: Record<string, { label: string; colors: string }> = {
  expiration: { label: 'Expiration', colors: 'bg-red-100 text-red-700' },
  renewal: { label: 'Renewal', colors: 'bg-blue-100 text-blue-700' },
  notice_period: { label: 'Notice Period', colors: 'bg-amber-100 text-amber-700' },
  review: { label: 'Review', colors: 'bg-indigo-100 text-indigo-700' },
}

/**
 * Componente de detalhe completo de um contrato.
 *
 * Seções:
 * 1. Header — título, status, risk score (variante large)
 * 2. Grid de informações — dados gerais do contrato em 2 colunas
 * 3. Summary — resumo gerado pela análise
 * 4. Extracted Clauses — lista de cláusulas com destaque por risco
 * 5. Scheduled Alerts — alertas programados (renovação, expiração, etc.)
 * 6. Actions — botões de ação (editar, deletar, gerar pacote)
 *
 * Quando o contrato está em processamento, exibe skeleton/loading parcial.
 */
export function ContractDetail({ contract }: ContractDetailProps) {
  /** Verificar se o contrato ainda está sendo processado */
  const isProcessing = contract.processingStatus !== 'completed'

  /**
   * Extrai o resumo do contrato do campo aiSummary (jsonb).
   * O campo pode conter um objeto com chave 'summary' ou ser uma string direta.
   */
  const aiSummary = (() => {
    if (!contract.aiSummary) return null
    if (typeof contract.aiSummary === 'string') return contract.aiSummary
    if (typeof contract.aiSummary === 'object' && 'summary' in (contract.aiSummary as Record<string, unknown>)) {
      return (contract.aiSummary as Record<string, string>).summary
    }
    return JSON.stringify(contract.aiSummary)
  })()

  return (
    <div className="space-y-6">
      {/* =========================================== */}
      {/* Navegação — voltar para lista de contratos  */}
      {/* =========================================== */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-4 text-slate-500 hover:text-slate-700"
        >
          <Link href="/dashboard/contracts">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Contracts
          </Link>
        </Button>
      </div>

      {/* =========================================== */}
      {/* HEADER — Título, Status e Risk Score        */}
      {/* =========================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          {/* Título do contrato */}
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {contract.title}
          </h1>

          {/* Badges de status e categoria */}
          <div className="flex flex-wrap items-center gap-2">
            <ContractStatusBadge
              status={contract.status}
              processingStatus={contract.processingStatus}
            />
            <Badge
              variant="outline"
              className="border-slate-200 capitalize text-slate-600"
            >
              {contract.category}
            </Badge>
          </div>
        </div>

        {/* Risk Score — variante large com ícone Shield */}
        <RiskBadge score={contract.riskScore} variant="large" />
      </div>

      <Separator />

      {/* =========================================== */}
      {/* GRID DE INFORMAÇÕES — Dados do contrato     */}
      {/* =========================================== */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-slate-900">
            <FileText className="h-4 w-4 text-indigo-500" />
            Contract Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Contraparte */}
            <InfoItem
              icon={Building2}
              label="Counterparty"
              value={contract.counterparty || '—'}
            />

            {/* Categoria */}
            <InfoItem
              icon={FileText}
              label="Category"
              value={contract.category}
              capitalize
            />

            {/* Data de início */}
            <InfoItem
              icon={Calendar}
              label="Start Date"
              value={formatDate(contract.startDate)}
            />

            {/* Data de término */}
            <InfoItem
              icon={Calendar}
              label="End Date"
              value={formatDate(contract.endDate)}
            />

            {/* Valor total */}
            <InfoItem
              icon={DollarSign}
              label="Total Value"
              value={formatCurrency(contract.totalValue, contract.currency ?? 'USD')}
              highlight
            />

            {/* Valor mensal */}
            <InfoItem
              icon={DollarSign}
              label="Monthly Value"
              value={formatCurrency(contract.monthlyValue, contract.currency ?? 'USD')}
            />

            {/* Moeda */}
            <InfoItem
              icon={DollarSign}
              label="Currency"
              value={contract.currency ?? 'USD'}
            />

            {/* Auto-renovação */}
            <InfoItem
              icon={RefreshCw}
              label="Auto-Renew"
              value={contract.autoRenew ? 'Yes' : 'No'}
            />

            {/* Período de aviso prévio */}
            <InfoItem
              icon={Clock}
              label="Notice Period"
              value={
                contract.noticePeriodDays
                  ? `${contract.noticePeriodDays} days`
                  : '—'
              }
            />

            {/* Termos de renovação */}
            <InfoItem
              icon={FileText}
              label="Renewal Terms"
              value={contract.renewalTerms || '—'}
              fullWidth
            />
          </div>
        </CardContent>
      </Card>

      {/* =========================================== */}
      {/* SUMMARY — Resumo gerado pela análise        */}
      {/* =========================================== */}
      {isProcessing ? (
        /* Skeleton de loading quando o contrato está sendo processado */
        <Card className="border-indigo-200 bg-indigo-50/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-indigo-900">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              Analysis Summary
            </CardTitle>
            <CardDescription className="text-indigo-600/70">
              Processing contract — analysis will appear here shortly...
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Skeleton animado simulando parágrafos de texto */}
            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-indigo-200/50" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-indigo-200/50" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-indigo-200/50" />
            </div>
          </CardContent>
        </Card>
      ) : aiSummary ? (
        /* Card destacado com fundo indigo para o resumo */
        <Card className="border-indigo-200 bg-indigo-50/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-indigo-900">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-indigo-900/80">
              {aiSummary}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* =========================================== */}
      {/* CLÁUSULAS EXTRAÍDAS                         */}
      {/* =========================================== */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-slate-900">
            <FileText className="h-4 w-4 text-indigo-500" />
            Extracted Clauses
          </CardTitle>
          <CardDescription>
            {isProcessing
              ? 'Clauses will be extracted after processing is complete.'
              : `${contract.clauses.length} clause${contract.clauses.length !== 1 ? 's' : ''} identified`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isProcessing ? (
            /* Skeleton para cláusulas em processamento */
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 p-4"
                >
                  <div className="h-5 w-5 animate-pulse rounded bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <div className="h-5 w-20 animate-pulse rounded-full bg-slate-200" />
                      <div className="h-5 w-14 animate-pulse rounded-full bg-slate-200" />
                    </div>
                    <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ClauseList clauses={contract.clauses} />
          )}
        </CardContent>
      </Card>

      {/* =========================================== */}
      {/* ALERTAS AGENDADOS                           */}
      {/* =========================================== */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-slate-900">
            <Bell className="h-4 w-4 text-indigo-500" />
            Scheduled Alerts
          </CardTitle>
          <CardDescription>
            {contract.alerts.length > 0
              ? `${contract.alerts.length} alert${contract.alerts.length !== 1 ? 's' : ''} scheduled`
              : 'No alerts configured for this contract.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contract.alerts.length > 0 ? (
            <div className="space-y-2">
              {contract.alerts.map((alert) => {
                /** Buscar configuração visual do tipo de alerta */
                const typeConfig = ALERT_TYPE_CONFIG[alert.type] || {
                  label: alert.type,
                  colors: 'bg-slate-100 text-slate-600',
                }

                /** Determinar status visual do alerta */
                const isSent = !!alert.sentAt
                const isDismissed = !!alert.dismissed

                return (
                  <div
                    key={alert.id}
                    className={cn(
                      'flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 transition-colors',
                      isDismissed && 'opacity-50',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Ícone de status do alerta */}
                      {isSent ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : isDismissed ? (
                        <XCircle className="h-4 w-4 shrink-0 text-slate-400" />
                      ) : (
                        <Clock className="h-4 w-4 shrink-0 text-amber-500" />
                      )}

                      <div>
                        {/* Badge de tipo do alerta */}
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            typeConfig.colors,
                          )}
                        >
                          {typeConfig.label}
                        </span>

                        {/* Data de disparo formatada */}
                        <p className="mt-0.5 text-sm text-slate-600">
                          {formatDate(alert.triggerDate)}
                        </p>
                      </div>
                    </div>

                    {/* Status badge do alerta */}
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        isSent
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : isDismissed
                            ? 'border-slate-200 bg-slate-50 text-slate-500'
                            : 'border-amber-200 bg-amber-50 text-amber-700',
                      )}
                    >
                      {isSent ? 'Sent' : isDismissed ? 'Dismissed' : 'Pending'}
                    </Badge>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Estado vazio para alertas */
            <div className="py-6 text-center text-sm text-slate-500">
              No alerts have been scheduled for this contract yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* =========================================== */}
      {/* AÇÕES — Editar, Deletar, Gerar Pacote       */}
      {/* =========================================== */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">
            Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {/* Botão Editar — outline */}
            <Button variant="outline" asChild>
              <Link href={`/dashboard/contracts/${contract.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Contract
              </Link>
            </Button>

            {/* Botão Deletar — destructive (vermelho) */}
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>

            {/* Botão Gerar Pacote de Renegociação — primary indigo */}
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
              <Package className="mr-2 h-4 w-4" />
              Generate Renegotiation Package
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Componente auxiliar para itens de informação no grid.
 * Exibe ícone, label e valor em layout padronizado.
 */
function InfoItem({
  icon: Icon,
  label,
  value,
  capitalize = false,
  highlight = false,
  fullWidth = false,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  capitalize?: boolean
  highlight?: boolean
  fullWidth?: boolean
}) {
  return (
    <div className={cn('flex items-start gap-3', fullWidth && 'sm:col-span-2')}>
      {/* Ícone decorativo */}
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>

      <div>
        {/* Label do campo */}
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>
        {/* Valor do campo */}
        <p
          className={cn(
            'mt-0.5 text-sm text-slate-700',
            capitalize && 'capitalize',
            highlight && 'font-semibold text-slate-900',
          )}
        >
          {value}
        </p>
      </div>
    </div>
  )
}
