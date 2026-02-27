'use client'

import { motion } from 'framer-motion'
import {
  DollarSign,
  Calendar,
  CalendarDays,
  AlertCircle,
  ExternalLink,
  Eye,
  RotateCcw,
  Download,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

/**
 * Dados mockados de transações.
 * 8 transações com diferentes status e valores.
 */
const TRANSACTIONS = [
  {
    id: 'TXN-4521',
    user: 'Ana Carolina Silva',
    email: 'ana.silva@techcorp.com',
    amount: '$99.00',
    plan: 'Professional',
    status: 'paid' as const,
    date: '26 Fev 2026, 10:32',
    invoiceUrl: '#',
  },
  {
    id: 'TXN-4520',
    user: 'Ricardo Mendes',
    email: 'ricardo@juridicobr.com.br',
    amount: '$249.00',
    plan: 'Business',
    status: 'paid' as const,
    date: '26 Fev 2026, 09:15',
    invoiceUrl: '#',
  },
  {
    id: 'TXN-4519',
    user: 'Fernando Souza',
    email: 'fernando@bancojuridico.com',
    amount: '$249.00',
    plan: 'Business',
    status: 'pending' as const,
    date: '25 Fev 2026, 18:44',
    invoiceUrl: '#',
  },
  {
    id: 'TXN-4518',
    user: 'Pedro Almeida',
    email: 'pedro.almeida@megacorp.com',
    amount: '$99.00',
    plan: 'Professional',
    status: 'paid' as const,
    date: '25 Fev 2026, 14:22',
    invoiceUrl: '#',
  },
  {
    id: 'TXN-4517',
    user: 'Mariana Costa',
    email: 'mariana@legaltech.io',
    amount: '$29.00',
    plan: 'Starter',
    status: 'failed' as const,
    date: '25 Fev 2026, 11:05',
    invoiceUrl: '#',
  },
  {
    id: 'TXN-4516',
    user: 'Camila Rodrigues',
    email: 'camila@contratosmart.com',
    amount: '$29.00',
    plan: 'Starter',
    status: 'refunded' as const,
    date: '24 Fev 2026, 16:30',
    invoiceUrl: '#',
  },
  {
    id: 'TXN-4515',
    user: 'Lucas Martins',
    email: 'lucas@lawfirm.com.br',
    amount: '$99.00',
    plan: 'Professional',
    status: 'paid' as const,
    date: '24 Fev 2026, 10:18',
    invoiceUrl: '#',
  },
  {
    id: 'TXN-4514',
    user: 'Juliana Ferreira',
    email: 'juliana@startuplegal.com',
    amount: '$29.00',
    plan: 'Starter',
    status: 'pending' as const,
    date: '23 Fev 2026, 22:55',
    invoiceUrl: '#',
  },
]

/**
 * Log de mudanças de assinatura recentes.
 * Acompanha upgrades, downgrades e cancelamentos.
 */
const SUBSCRIPTION_CHANGES = [
  {
    id: 1,
    user: 'Tech Solutions Ltda.',
    actionKey: 'paymentsActionUpgrade' as const,
    from: 'Professional',
    to: 'Business',
    date: '26 Fev 2026',
    actionColor: 'text-emerald-700 bg-emerald-50',
  },
  {
    id: 2,
    user: 'Maria Santos',
    actionKey: 'paymentsActionNew' as const,
    from: '—',
    to: 'Starter',
    date: '26 Fev 2026',
    actionColor: 'text-blue-700 bg-blue-50',
  },
  {
    id: 3,
    user: 'Advocacia Pereira',
    actionKey: 'paymentsActionDowngrade' as const,
    from: 'Business',
    to: 'Professional',
    date: '25 Fev 2026',
    actionColor: 'text-amber-700 bg-amber-50',
  },
  {
    id: 4,
    user: 'João Oliveira',
    actionKey: 'paymentsActionCancellation' as const,
    from: 'Starter',
    to: '—',
    date: '24 Fev 2026',
    actionColor: 'text-red-700 bg-red-50',
  },
]

/**
 * Solicitações de reembolso pendentes.
 */
const REFUND_REQUESTS = [
  {
    id: 'REF-001',
    user: 'Camila Rodrigues',
    amount: '$29.00',
    reason: 'Não utilizou o serviço durante o período',
    date: '24 Fev 2026',
    txnId: 'TXN-4516',
  },
  {
    id: 'REF-002',
    user: 'Bruno Nascimento',
    amount: '$99.00',
    reason: 'Cobrado em duplicidade',
    date: '23 Fev 2026',
    txnId: 'TXN-4510',
  },
]

/**
 * Variantes de animação do container.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

/**
 * Variantes de animação dos itens.
 */
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
}

/**
 * AdminPayments — Página de gestão de pagamentos do painel admin.
 *
 * Funcionalidades:
 * - Cards de receita (hoje, semana, mês, pendente)
 * - Tabela de transações com 8 registros (ID, usuário, valor, plano, status, data, fatura)
 * - Log de mudanças de assinatura (upgrade, downgrade, novo, cancelamento)
 * - Seção de solicitações de reembolso pendentes
 *
 * Design: Light Neobrutalism com acentos indigo/violet.
 */
export function AdminPayments() {
  /** Hook de tradução usando namespace admin */
  const t = useTranslations('admin')

  /**
   * Cards de resumo de receita.
   * Exibem métricas financeiras em diferentes períodos.
   */
  const REVENUE_CARDS = [
    {
      titleKey: 'paymentsCardToday' as const,
      value: '$450',
      icon: DollarSign,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      change: '+$120',
      changeType: 'up' as const,
    },
    {
      titleKey: 'paymentsCardWeek' as const,
      value: '$2,340',
      icon: Calendar,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: '+$340',
      changeType: 'up' as const,
    },
    {
      titleKey: 'paymentsCardMonth' as const,
      value: '$12,450',
      icon: CalendarDays,
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      change: '+8.3%',
      changeType: 'up' as const,
    },
    {
      titleKey: 'paymentsCardPending' as const,
      value: '$890',
      icon: AlertCircle,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      change: t('paymentsCardInvoices', { count: 4 }),
      changeType: 'neutral' as const,
    },
  ]

  /**
   * Configuração visual dos status de pagamento.
   * Define ícone, cores e chave de tradução para cada status.
   */
  const PAYMENT_STATUS_CONFIG = {
    paid: {
      labelKey: 'paymentsStatusPaid' as const,
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
    pending: {
      labelKey: 'paymentsStatusPending' as const,
      icon: Clock,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
    },
    failed: {
      labelKey: 'paymentsStatusFailed' as const,
      icon: XCircle,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
    },
    refunded: {
      labelKey: 'paymentsStatusRefunded' as const,
      icon: RefreshCw,
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-700',
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Cabeçalho da página */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('paymentsTitle')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('paymentsSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 text-slate-600 gap-2"
          >
            <Download className="h-4 w-4" />
            {t('paymentsExportCsv')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 text-slate-600 gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            {t('paymentsStripeDashboard')}
          </Button>
        </div>
      </motion.div>

      {/* Cards de receita — 4 períodos */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {REVENUE_CARDS.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.titleKey}
              className={cn(
                'bg-white rounded-2xl border border-slate-200 p-5',
                'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]'
              )}
            >
              <div className="flex items-center justify-between">
                <div className={cn('p-2.5 rounded-xl', card.bgColor)}>
                  <Icon className={cn('h-5 w-5', card.iconColor)} />
                </div>
                {/* Indicador de variação */}
                {card.changeType !== 'neutral' && (
                  <div
                    className={cn(
                      'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg',
                      card.changeType === 'up'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    )}
                  >
                    {card.changeType === 'up' ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {card.change}
                  </div>
                )}
                {card.changeType === 'neutral' && (
                  <span className="text-xs text-slate-500">{card.change}</span>
                )}
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-3">{card.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{t(card.titleKey)}</p>
            </div>
          )
        })}
      </motion.div>

      {/* Tabela de transações */}
      <motion.div
        variants={itemVariants}
        className={cn(
          'bg-white rounded-2xl border border-slate-200 overflow-hidden',
          'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]'
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">{t('paymentsRecentTransactions')}</h3>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-slate-500">
              {t('paymentsPaidOf', { paid: 6, total: 8, percent: ((6 / 8) * 100).toFixed(0) })}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Cabeçalho */}
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('paymentsTableId')}
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('paymentsTableUser')}
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('paymentsTableAmount')}
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('paymentsTablePlan')}
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('paymentsTableStatus')}
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('paymentsTableDate')}
                </th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('paymentsTableInvoice')}
                </th>
              </tr>
            </thead>

            {/* Corpo */}
            <tbody className="divide-y divide-slate-100">
              {TRANSACTIONS.map((txn, index) => {
                const statusConfig = PAYMENT_STATUS_CONFIG[txn.status]
                const StatusIcon = statusConfig.icon

                return (
                  <motion.tr
                    key={txn.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.03 * index }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* ID da transação */}
                    <td className="px-5 py-4">
                      <span className="text-sm font-mono font-medium text-slate-600">
                        {txn.id}
                      </span>
                    </td>

                    {/* Usuário */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{txn.user}</p>
                        <p className="text-xs text-slate-500">{txn.email}</p>
                      </div>
                    </td>

                    {/* Valor */}
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-slate-900">{txn.amount}</span>
                    </td>

                    {/* Plano */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600">{txn.plan}</span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
                          statusConfig.bgColor,
                          statusConfig.textColor
                        )}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {t(statusConfig.labelKey)}
                      </span>
                    </td>

                    {/* Data */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-500">{txn.date}</span>
                    </td>

                    {/* Fatura */}
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1.5"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span className="text-xs">{t('paymentsViewInvoice')}</span>
                      </Button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Grid inferior — Mudanças de assinatura + Reembolsos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Log de mudanças de assinatura */}
        <motion.div
          variants={itemVariants}
          className={cn(
            'bg-white rounded-2xl border border-slate-200 p-6',
            'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]'
          )}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-slate-900">
              {t('paymentsSubscriptionChanges')}
            </h3>
            <CreditCard className="h-4 w-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {SUBSCRIPTION_CHANGES.map((change) => (
              <div
                key={change.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  {/* Badge de ação */}
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase',
                      change.actionColor
                    )}
                  >
                    {t(change.actionKey)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{change.user}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {change.from} → {change.to}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">{change.date}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Solicitações de reembolso */}
        <motion.div
          variants={itemVariants}
          className={cn(
            'bg-white rounded-2xl border border-slate-200 p-6',
            'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]'
          )}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                {t('paymentsRefundRequests')}
              </h3>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-md">
                {t('paymentsRefundPending', { count: REFUND_REQUESTS.length })}
              </span>
            </div>
            <RefreshCw className="h-4 w-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {REFUND_REQUESTS.map((refund) => (
              <div
                key={refund.id}
                className="p-4 rounded-xl border border-amber-100 bg-amber-50/30"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">{refund.id}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">{refund.txnId}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 mt-1">{refund.user}</p>
                    <p className="text-xs text-slate-500 mt-1">{refund.reason}</p>
                  </div>
                  <span className="text-lg font-bold text-slate-900">{refund.amount}</span>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-slate-400">{refund.date}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-lg border-slate-200 text-xs text-slate-600"
                    >
                      {t('paymentsRefundReject')}
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                    >
                      {t('paymentsRefundApprove')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
