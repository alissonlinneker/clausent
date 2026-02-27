'use client'

import { useState, useMemo, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Calendar,
  AlertTriangle,
  DollarSign,
  Shield,
  FileText,
  Eye,
  EyeOff,
  CheckCheck,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────
 * Tipos de dados para os alertas
 * ───────────────────────────────────────────── */

/** Nível de prioridade do alerta */
type AlertPriority = 'critical' | 'high' | 'medium' | 'low'

/** Categoria/tipo do alerta */
type AlertType = 'renewal' | 'risk' | 'price' | 'compliance' | 'analysis'

/** Estrutura completa de um alerta */
interface Alert {
  id: string
  type: AlertType
  priority: AlertPriority
  title: string
  description: string
  contractName: string
  date: string
  read: boolean
  actionLabel?: string
  actionHref?: string
}

/* ─────────────────────────────────────────────
 * Dados mock realistas para demonstração
 * ───────────────────────────────────────────── */
const INITIAL_ALERTS: Alert[] = [
  {
    id: 'a1',
    type: 'renewal',
    priority: 'critical',
    title: 'Urgent Renewal',
    description:
      'Contract expires in 8 days. Auto-renewal is enabled with unfavorable terms.',
    contractName: 'Zoom Business Plus',
    date: '2026-02-18',
    read: false,
    actionLabel: 'Review Contract',
    actionHref: '/dashboard/contracts/c5',
  },
  {
    id: 'a2',
    type: 'renewal',
    priority: 'high',
    title: 'Renewal Approaching',
    description:
      'Contract renews in 12 days. Notice period ends soon.',
    contractName: 'Salesforce CRM Suite',
    date: '2026-02-14',
    read: false,
    actionLabel: 'Review Contract',
    actionHref: '/dashboard/contracts/c2',
  },
  {
    id: 'a3',
    type: 'risk',
    priority: 'high',
    title: 'High Risk Clause Detected',
    description:
      'Price escalation clause allows up to 7% annual increase. Market average is 3-5%.',
    contractName: 'AWS Enterprise License',
    date: '2026-02-10',
    read: false,
    actionLabel: 'View Analysis',
    actionHref: '/dashboard/contracts/c1',
  },
  {
    id: 'a4',
    type: 'analysis',
    priority: 'medium',
    title: 'Analysis Complete',
    description:
      'AI analysis finished. Risk score: 42/100 (Medium). 5 clauses flagged for review.',
    contractName: 'Slack Enterprise Grid',
    date: '2026-02-08',
    read: true,
    actionLabel: 'View Results',
    actionHref: '/dashboard/contracts/c4',
  },
  {
    id: 'a5',
    type: 'price',
    priority: 'medium',
    title: 'Above Market Pricing',
    description:
      'Your contract pricing is 12% above market average for similar services.',
    contractName: 'Datadog Enterprise',
    date: '2026-02-05',
    read: true,
    actionLabel: 'View Benchmark',
    actionHref: '/dashboard/contracts/c8',
  },
  {
    id: 'a6',
    type: 'compliance',
    priority: 'low',
    title: 'Data Residency Update',
    description:
      'Provider updated their data processing addendum. Review for compliance.',
    contractName: 'HubSpot Marketing Hub',
    date: '2026-02-01',
    read: true,
  },
  {
    id: 'a7',
    type: 'renewal',
    priority: 'low',
    title: 'Renewal in 45 days',
    description:
      'Contract renewal approaching. Current terms are favorable.',
    contractName: 'AWS Enterprise License',
    date: '2026-01-28',
    read: true,
  },
  {
    id: 'a8',
    type: 'analysis',
    priority: 'low',
    title: 'Benchmark Updated',
    description:
      'New market benchmark data available for Cloud Infrastructure category.',
    contractName: 'GitHub Enterprise',
    date: '2026-01-25',
    read: true,
  },
]

/* ─────────────────────────────────────────────
 * Mapas de configuração visual para tipos e
 * prioridades dos alertas
 * ───────────────────────────────────────────── */

/** Mapa de ícones por tipo de alerta */
const TYPE_ICON_MAP: Record<AlertType, typeof Calendar> = {
  renewal: Calendar,
  risk: AlertTriangle,
  price: DollarSign,
  compliance: Shield,
  analysis: FileText,
}

/** Chaves i18n por tipo de alerta */
const TYPE_LABEL_KEY_MAP: Record<AlertType, string> = {
  renewal: 'alertTypeRenewal',
  risk: 'alertTypeRisk',
  price: 'alertTypePrice',
  compliance: 'alertTypeCompliance',
  analysis: 'alertTypeAnalysis',
}

/** Cores da borda esquerda do card por prioridade */
const PRIORITY_BORDER_MAP: Record<AlertPriority, string> = {
  critical: 'border-l-red-500',
  high: 'border-l-amber-500',
  medium: 'border-l-yellow-400',
  low: 'border-l-slate-300',
}

/** Classes do badge de prioridade */
const PRIORITY_BADGE_MAP: Record<AlertPriority, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-amber-100 text-amber-700 border-amber-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-slate-100 text-slate-600 border-slate-200',
}

/** Chaves i18n por prioridade */
const PRIORITY_LABEL_KEY_MAP: Record<AlertPriority, string> = {
  critical: 'alertPriorityCritical',
  high: 'alertPriorityHigh',
  medium: 'alertPriorityMedium',
  low: 'alertPriorityLow',
}

/** Cores de fundo do ícone por tipo */
const TYPE_BG_MAP: Record<AlertType, string> = {
  renewal: 'bg-teal-50 text-teal-600',
  risk: 'bg-red-50 text-red-600',
  price: 'bg-violet-50 text-violet-600',
  compliance: 'bg-sky-50 text-sky-600',
  analysis: 'bg-emerald-50 text-emerald-600',
}

/* ─────────────────────────────────────────────
 * Opções dos filtros de pills/chips
 * ───────────────────────────────────────────── */

/** Opções de filtro por prioridade — chave i18n */
const PRIORITY_OPTIONS: { value: string; labelKey: string }[] = [
  { value: 'all', labelKey: 'filterAll' },
  { value: 'critical', labelKey: 'alertPriorityCritical' },
  { value: 'high', labelKey: 'alertPriorityHigh' },
  { value: 'medium', labelKey: 'alertPriorityMedium' },
  { value: 'low', labelKey: 'alertPriorityLow' },
]

/** Opções de filtro por tipo — chave i18n */
const TYPE_OPTIONS: { value: string; labelKey: string }[] = [
  { value: 'all', labelKey: 'filterAll' },
  { value: 'renewal', labelKey: 'alertTypeRenewal' },
  { value: 'risk', labelKey: 'alertTypeRisk' },
  { value: 'price', labelKey: 'alertTypePrice' },
  { value: 'compliance', labelKey: 'alertTypeCompliance' },
  { value: 'analysis', labelKey: 'alertTypeAnalysis' },
]

/** Opções de filtro por status de leitura — chave i18n */
const STATUS_OPTIONS: { value: string; labelKey: string }[] = [
  { value: 'all', labelKey: 'filterAll' },
  { value: 'unread', labelKey: 'alertStatusUnread' },
  { value: 'read', labelKey: 'alertStatusRead' },
]

/* ─────────────────────────────────────────────
 * Variantes de animação do Framer Motion
 * ───────────────────────────────────────────── */

/** Container — orquestra o stagger dos filhos */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

/** Item individual — entrada com fade + slide */
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  },
}

/* ─────────────────────────────────────────────
 * Componente auxiliar: chip/pill de filtro
 * ───────────────────────────────────────────── */

/**
 * Botão estilo pill para filtros.
 * Muda de aparência conforme o estado ativo.
 */
function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap',
        'border focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40',
        active
          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      )}
    >
      {label}
    </button>
  )
}

/* ─────────────────────────────────────────────
 * Componente principal: AlertsList
 * ───────────────────────────────────────────── */

/**
 * Lista completa de alertas do dashboard.
 *
 * Exibe alertas de renovação, riscos, preço, conformidade
 * e análises dos contratos da empresa.
 *
 * Inclui:
 * - Resumo estatístico no topo (total, não-lidos, críticos, altos)
 * - Filtros por prioridade, tipo e status de leitura
 * - Cards individuais com borda colorida por prioridade
 * - Ações em batch (marcar todos como lidos)
 * - Animações de entrada com stagger via Framer Motion
 * - Estado vazio quando não há alertas
 */
export function AlertsList() {
  const t = useTranslations('dashboard')

  /* ── Estado local ────────────────────────── */

  /** Lista mutável de alertas (estado de leitura pode mudar) */
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS)

  /** Filtro ativo de prioridade */
  const [priorityFilter, setPriorityFilter] = useState('all')

  /** Filtro ativo de tipo */
  const [typeFilter, setTypeFilter] = useState('all')

  /** Filtro ativo de status de leitura */
  const [statusFilter, setStatusFilter] = useState('all')

  /* ── Cálculos derivados ──────────────────── */

  /** Contadores para os mini-cards de resumo */
  const stats = useMemo(() => {
    const total = alerts.length
    const unread = alerts.filter((a) => !a.read).length
    const critical = alerts.filter((a) => a.priority === 'critical').length
    const high = alerts.filter((a) => a.priority === 'high').length
    return { total, unread, critical, high }
  }, [alerts])

  /** Lista filtrada conforme os filtros ativos */
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      /* Filtro de prioridade */
      if (priorityFilter !== 'all' && alert.priority !== priorityFilter) {
        return false
      }
      /* Filtro de tipo */
      if (typeFilter !== 'all' && alert.type !== typeFilter) {
        return false
      }
      /* Filtro de status de leitura */
      if (statusFilter === 'unread' && alert.read) return false
      if (statusFilter === 'read' && !alert.read) return false

      return true
    })
  }, [alerts, priorityFilter, typeFilter, statusFilter])

  /* ── Handlers ────────────────────────────── */

  /** Marca um alerta individual como lido */
  const handleMarkAsRead = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, read: true } : a))
    )
  }, [])

  /** Marca todos os alertas como lidos */
  const handleMarkAllAsRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
  }, [])

  /* ── Renderização ────────────────────────── */

  return (
    <div className="space-y-6">
      {/* ── Cabeçalho com título e botão de ação em batch ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('alerts')}
            {/* Contador de não-lidos ao lado do título */}
            {stats.unread > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold min-w-[22px] h-[22px] px-1.5 align-middle">
                {stats.unread}
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('alertsSubtitle')}
          </p>
        </div>

        {/* Botão "marcar todos como lidos" — só aparece se houver não-lidos */}
        {stats.unread > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            className="rounded-xl border-slate-200 gap-2 text-sm hover:bg-slate-50"
          >
            <CheckCheck className="h-4 w-4" />
            {t('markAllAsRead')}
          </Button>
        )}
      </div>

      {/* ── Mini-cards de resumo estatístico ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total de alertas */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <Bell className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500">{t('totalAlerts')}</p>
            </div>
          </div>
        </div>

        {/* Alertas não-lidos */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
              <EyeOff className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.unread}</p>
              <p className="text-xs text-slate-500">{t('alertStatusUnread')}</p>
            </div>
          </div>
        </div>

        {/* Alertas críticos */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.critical}</p>
              <p className="text-xs text-slate-500">{t('alertPriorityCritical')}</p>
            </div>
          </div>
        </div>

        {/* Alertas de prioridade alta */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.high}</p>
              <p className="text-xs text-slate-500">{t('alertPriorityHigh')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Barra de filtros ── */}
      <div className="space-y-3">
        {/* Filtro por prioridade */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider w-16 shrink-0">
            {t('filterPriority')}
          </span>
          {PRIORITY_OPTIONS.map((opt) => (
            <FilterPill
              key={`priority-${opt.value}`}
              label={t(opt.labelKey)}
              active={priorityFilter === opt.value}
              onClick={() => setPriorityFilter(opt.value)}
            />
          ))}
        </div>

        {/* Filtro por tipo */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider w-16 shrink-0">
            {t('filterType')}
          </span>
          {TYPE_OPTIONS.map((opt) => (
            <FilterPill
              key={`type-${opt.value}`}
              label={t(opt.labelKey)}
              active={typeFilter === opt.value}
              onClick={() => setTypeFilter(opt.value)}
            />
          ))}
        </div>

        {/* Filtro por status de leitura */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider w-16 shrink-0">
            {t('filterStatus')}
          </span>
          {STATUS_OPTIONS.map((opt) => (
            <FilterPill
              key={`status-${opt.value}`}
              label={t(opt.labelKey)}
              active={statusFilter === opt.value}
              onClick={() => setStatusFilter(opt.value)}
            />
          ))}
        </div>
      </div>

      {/* ── Lista de cards de alertas ── */}
      <AnimatePresence mode="wait">
        {filteredAlerts.length === 0 ? (
          /* Estado vazio — nenhum alerta encontrado com os filtros atuais */
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl bg-white border border-slate-200 p-12 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] text-center"
          >
            <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
              <Bell className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {t('noAlerts')}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {t('noAlertsDescription')}
            </p>
          </motion.div>
        ) : (
          /* Lista de alertas filtrados com animação stagger */
          <motion.div
            key={`list-${priorityFilter}-${typeFilter}-${statusFilter}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {filteredAlerts.map((alert) => {
              /* Ícone correspondente ao tipo de alerta */
              const IconComp = TYPE_ICON_MAP[alert.type]

              return (
                <motion.div
                  key={alert.id}
                  variants={itemVariants}
                  layout
                  /* Clique no card marca como lido (se não-lido) */
                  onClick={() => {
                    if (!alert.read) handleMarkAsRead(alert.id)
                  }}
                  className={cn(
                    /* Estilos base do card */
                    'relative rounded-2xl bg-white border border-slate-200',
                    'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]',
                    'border-l-4 p-5 transition-all duration-200',
                    /* Hover lift effect */
                    'hover:shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:-translate-y-0.5',
                    /* Cursor pointer em alertas não-lidos */
                    !alert.read && 'cursor-pointer',
                    /* Fundo levemente diferente para não-lidos */
                    !alert.read && 'bg-slate-50/50',
                    /* Borda esquerda colorida pela prioridade */
                    PRIORITY_BORDER_MAP[alert.priority]
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Indicador de não-lido (bolinha azul) */}
                    <div className="relative shrink-0">
                      {/* Ícone do tipo de alerta */}
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center',
                          TYPE_BG_MAP[alert.type]
                        )}
                      >
                        <IconComp className="h-5 w-5" />
                      </div>

                      {/* Bolinha azul de não-lido — posicionada no canto do ícone */}
                      {!alert.read && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-sky-500 border-2 border-white" />
                      )}
                    </div>

                    {/* Conteúdo principal do alerta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        {/* Título do alerta */}
                        <h3
                          className={cn(
                            'text-sm leading-snug',
                            alert.read
                              ? 'font-medium text-slate-700'
                              : 'font-semibold text-slate-900'
                          )}
                        >
                          {alert.title}
                        </h3>

                        {/* Badge de prioridade no canto superior direito */}
                        <Badge
                          className={cn(
                            'shrink-0 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5',
                            PRIORITY_BADGE_MAP[alert.priority]
                          )}
                        >
                          {t(PRIORITY_LABEL_KEY_MAP[alert.priority])}
                        </Badge>
                      </div>

                      {/* Descrição do alerta */}
                      <p className="text-sm text-slate-500 mb-3 leading-relaxed">
                        {alert.description}
                      </p>

                      {/* Rodapé do card: contract name + data + ação */}
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                          {/* Nome do contrato como chip */}
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg px-2.5 py-1 border border-slate-200">
                            <FileText className="h-3 w-3 text-slate-400" />
                            {alert.contractName}
                          </span>

                          {/* Data do alerta */}
                          <span className="text-xs text-slate-400">
                            {new Date(alert.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>

                          {/* Indicador textual de lido/não-lido */}
                          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400">
                            {alert.read ? (
                              <>
                                <Eye className="h-3 w-3" />
                                {t('alertStatusRead')}
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3" />
                                {t('alertStatusUnread')}
                              </>
                            )}
                          </span>
                        </div>

                        {/* Botão de ação — aparece apenas quando há actionLabel */}
                        {alert.actionLabel && alert.actionHref && (
                          <Link
                            href={alert.actionHref}
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          >
                            <Button
                              size="sm"
                              className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs gap-1.5 h-8 px-3 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                            >
                              {alert.actionLabel}
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
