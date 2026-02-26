'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  RefreshCw,
  Clock,
  AlertTriangle,
  FileText,
  Check,
  X,
  Inbox,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/react'
import { cn } from '@/lib/utils'

/**
 * Tipos de filtro disponíveis para a lista de alertas.
 *
 * - all: Exibe todos os alertas
 * - pending: Alertas que ainda não foram enviados nem dispensados
 * - sent: Alertas já enviados por email
 * - dismissed: Alertas dispensados pelo usuário
 */
type AlertFilter = 'all' | 'pending' | 'sent' | 'dismissed'

/**
 * Mapeamento de tipo de alerta para ícone, cor e label.
 * Usado para renderizar cada alerta com identidade visual distinta.
 */
const ALERT_TYPE_CONFIG: Record<string, {
  icon: typeof Bell
  label: string
  bgColor: string
  textColor: string
  borderColor: string
}> = {
  renewal: {
    icon: RefreshCw,
    label: 'Renewal',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
  },
  expiration: {
    icon: AlertTriangle,
    label: 'Expiration',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
  notice: {
    icon: Clock,
    label: 'Notice Period',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
}

/** Configuração padrão para tipos de alerta não mapeados */
const DEFAULT_ALERT_CONFIG = {
  icon: Bell,
  label: 'Alert',
  bgColor: 'bg-indigo-50',
  textColor: 'text-indigo-700',
  borderColor: 'border-indigo-200',
}

/**
 * Formata uma data para exibição amigável.
 * Exemplo: "Feb 26, 2026"
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
 * Calcula e formata os dias restantes até uma data.
 * Retorna string descritiva: "in X days", "today", "overdue by X days".
 */
function getDaysLabel(date: Date | string | null | undefined): { text: string; isUrgent: boolean } {
  if (!date) return { text: '—', isUrgent: false }

  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days < 0) return { text: `overdue by ${Math.abs(days)}d`, isUrgent: true }
  if (days === 0) return { text: 'today', isUrgent: true }
  if (days === 1) return { text: 'tomorrow', isUrgent: true }
  if (days <= 7) return { text: `in ${days} days`, isUrgent: true }
  return { text: `in ${days} days`, isUrgent: false }
}

/**
 * Determina o status visual do alerta para exibição em badge.
 * - Dispensados: cinza
 * - Enviados: verde
 * - Pendentes: amarelo
 */
function getStatusBadge(alert: { sentAt: Date | null; dismissed: boolean | null }): {
  label: string
  className: string
} {
  if (alert.dismissed) {
    return {
      label: 'Dismissed',
      className: 'bg-slate-100 text-slate-500 border-slate-200',
    }
  }
  if (alert.sentAt) {
    return {
      label: 'Sent',
      className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    }
  }
  return {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  }
}

/**
 * Skeleton de carregamento para a lista de alertas.
 * Exibe 4 linhas animadas simulando os cards de alerta.
 */
function AlertListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border border-slate-200 p-4"
        >
          {/* Ícone placeholder */}
          <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200" />
          {/* Conteúdo placeholder */}
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
          </div>
          {/* Badge placeholder */}
          <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
        </div>
      ))}
    </div>
  )
}

/**
 * Empty state — exibido quando não há alertas no filtro ativo.
 */
function AlertEmptyState({ filter }: { filter: AlertFilter }) {
  /** Mensagem contextualizada baseada no filtro */
  const messages: Record<AlertFilter, string> = {
    all: 'No alerts found. Alerts will appear when your contracts need attention.',
    pending: 'No pending alerts. All caught up!',
    sent: 'No sent alerts yet. Email notifications will show here after being sent.',
    dismissed: 'No dismissed alerts.',
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Ícone decorativo */}
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
        <Inbox className="h-8 w-8 text-indigo-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">
        No alerts
      </h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        {messages[filter]}
      </p>
    </div>
  )
}

/**
 * Componente principal de lista de alertas.
 *
 * Funcionalidades:
 * - Busca alertas via tRPC (alert.list)
 * - Filtros: All, Pending, Sent, Dismissed
 * - Cada alerta exibe: ícone por tipo, título do contrato, data, status, ações
 * - Botão dismiss para alertas pendentes
 * - Link para detalhe do contrato
 * - Empty state contextualizado por filtro
 * - Skeleton loading durante carregamento
 */
export function AlertList() {
  /** Filtro ativo — controla quais alertas são exibidos */
  const [filter, setFilter] = useState<AlertFilter>('all')

  /** Busca todos os alertas da organização via tRPC */
  const { data: alerts, isLoading } = trpc.alert.list.useQuery()

  /** Mutation para dispensar um alerta */
  const utils = trpc.useUtils()
  const dismissMutation = trpc.alert.dismiss.useMutation({
    onSuccess: () => {
      /** Invalida o cache para recarregar a lista */
      utils.alert.list.invalidate()
    },
  })

  /** Aplica o filtro selecionado na lista de alertas */
  const filteredAlerts = alerts?.filter((alert) => {
    switch (filter) {
      case 'pending':
        return !alert.sentAt && !alert.dismissed
      case 'sent':
        return alert.sentAt !== null
      case 'dismissed':
        return alert.dismissed === true
      default:
        return true
    }
  })

  /** Tabs de filtro disponíveis com contagem */
  const filterOptions: { value: AlertFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'sent', label: 'Sent' },
    { value: 'dismissed', label: 'Dismissed' },
  ]

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      {/* Cabeçalho com ícone e título */}
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Ícone decorativo do módulo de alertas */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
            <Bell className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Alerts
            </CardTitle>
            <p className="text-sm text-slate-500">
              {alerts?.length
                ? `${alerts.length} alert${alerts.length !== 1 ? 's' : ''} total`
                : 'Contract alert notifications'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Barra de filtros */}
        <div className="mb-4 flex gap-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(option.value)}
              className={cn(
                'text-xs',
                filter === option.value
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Estado de carregamento */}
        {isLoading && <AlertListSkeleton />}

        {/* Empty state — sem alertas no filtro ativo */}
        {!isLoading && (!filteredAlerts || filteredAlerts.length === 0) && (
          <AlertEmptyState filter={filter} />
        )}

        {/* Lista de alertas */}
        {!isLoading && filteredAlerts && filteredAlerts.length > 0 && (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              /** Configuração visual baseada no tipo do alerta */
              const config = ALERT_TYPE_CONFIG[alert.type] || DEFAULT_ALERT_CONFIG
              const AlertIcon = config.icon
              const status = getStatusBadge(alert)
              const daysInfo = getDaysLabel(alert.triggerDate)

              return (
                <div
                  key={alert.id}
                  className={cn(
                    'flex items-center gap-4 rounded-lg border p-4 transition-all duration-200',
                    alert.dismissed
                      ? 'border-slate-200 bg-slate-50/50 opacity-60'
                      : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm'
                  )}
                >
                  {/* Ícone do tipo de alerta */}
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                      config.bgColor
                    )}
                  >
                    <AlertIcon className={cn('h-5 w-5', config.textColor)} />
                  </div>

                  {/* Conteúdo principal */}
                  <div className="min-w-0 flex-1">
                    {/* Linha 1: tipo + título do contrato */}
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-semibold uppercase',
                          config.bgColor,
                          config.textColor,
                          config.borderColor
                        )}
                      >
                        {config.label}
                      </Badge>
                      <Link
                        href={`/dashboard/contracts/${alert.contract.id}`}
                        className="truncate text-sm font-medium text-slate-900 hover:text-indigo-700"
                      >
                        {alert.contract.title}
                      </Link>
                    </div>

                    {/* Linha 2: contraparte + data + dias restantes */}
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      {alert.contract.counterparty && (
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {alert.contract.counterparty}
                        </span>
                      )}
                      <span>{formatDate(alert.triggerDate)}</span>
                      <span
                        className={cn(
                          'font-medium',
                          daysInfo.isUrgent ? 'text-red-600' : 'text-slate-600'
                        )}
                      >
                        {daysInfo.text}
                      </span>
                    </div>
                  </div>

                  {/* Badge de status */}
                  <Badge
                    variant="outline"
                    className={cn('shrink-0 text-xs font-medium', status.className)}
                  >
                    {status.label}
                  </Badge>

                  {/* Ação: dismiss (apenas para alertas não dispensados) */}
                  {!alert.dismissed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissMutation.mutate({ id: alert.id })}
                      disabled={dismissMutation.isPending}
                      className="shrink-0 text-slate-400 hover:text-slate-700"
                      title="Dismiss alert"
                    >
                      {dismissMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  )}

                  {/* Indicador de dispensado */}
                  {alert.dismissed && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                      <Check className="h-4 w-4 text-slate-400" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
