'use client'

import { useTranslations } from 'next-intl'
import {
  FileText,
  Bell,
  TrendingDown,
  Shield,
  Upload,
  ArrowUpRight,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/lib/i18n/navigation'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

/* =================================================================
   DADOS MOCK
   Simulam o estado real do dashboard com números realistas.
   Serão substituídos por chamadas ao backend quando disponível.
   ================================================================= */

/** Estatísticas globais do portfólio de contratos */
const MOCK_STATS = {
  totalContracts: 24,
  activeContracts: 18,
  expiringContracts: 3,
  totalSavings: 47250,
  averageRisk: 38,
}

/** Evolução mensal para o gráfico de área */
const MOCK_CHART_DATA = [
  { month: 'Sep', contracts: 8, savings: 12000 },
  { month: 'Oct', contracts: 12, savings: 18500 },
  { month: 'Nov', contracts: 15, savings: 24000 },
  { month: 'Dec', contracts: 18, savings: 31000 },
  { month: 'Jan', contracts: 21, savings: 39500 },
  { month: 'Feb', contracts: 24, savings: 47250 },
]

/** Contratos recentes com dados de risco e renovação */
const MOCK_RECENT_CONTRACTS = [
  {
    name: 'AWS Enterprise License',
    vendor: 'Amazon Web Services',
    risk: 28,
    status: 'completed' as const,
    value: 156000,
    daysUntilRenewal: 45,
  },
  {
    name: 'Salesforce CRM Suite',
    vendor: 'Salesforce',
    risk: 65,
    status: 'completed' as const,
    value: 84000,
    daysUntilRenewal: 12,
  },
  {
    name: 'Office 365 Business',
    vendor: 'Microsoft',
    risk: 15,
    status: 'completed' as const,
    value: 36000,
    daysUntilRenewal: 89,
  },
  {
    name: 'Slack Enterprise Grid',
    vendor: 'Slack Technologies',
    risk: 42,
    status: 'analyzing' as const,
    value: 24000,
    daysUntilRenewal: 156,
  },
  {
    name: 'Zoom Business Plus',
    vendor: 'Zoom Video',
    risk: 71,
    status: 'completed' as const,
    value: 18000,
    daysUntilRenewal: 8,
  },
]

/** Alertas urgentes — renovações e riscos detectados */
const MOCK_ALERTS = [
  {
    type: 'renewal' as const,
    contract: 'Zoom Business Plus',
    daysLeft: 8,
    message: '',
    priority: 'critical' as const,
  },
  {
    type: 'renewal' as const,
    contract: 'Salesforce CRM Suite',
    daysLeft: 12,
    message: '',
    priority: 'high' as const,
  },
  {
    type: 'risk' as const,
    contract: 'Slack Enterprise Grid',
    daysLeft: 0,
    message: 'Analysis complete — medium risk detected',
    priority: 'medium' as const,
  },
]

/* =================================================================
   CONFIGURAÇÃO DOS STAT CARDS
   Cada card mapeia para uma chave de tradução e exibe um KPI.
   ================================================================= */

/** Definição dos 4 cards de métricas do topo */
const STAT_CARDS = [
  {
    labelKey: 'totalContracts' as const,
    value: MOCK_STATS.totalContracts.toString(),
    change: '+12%',
    changePositive: true,
    icon: FileText,
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-600',
  },
  {
    labelKey: 'activeContracts' as const,
    value: MOCK_STATS.activeContracts.toString(),
    change: '+8%',
    changePositive: true,
    icon: Shield,
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    labelKey: 'expiringContracts' as const,
    value: MOCK_STATS.expiringContracts.toString(),
    change: '-2',
    changePositive: false,
    icon: Bell,
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
  {
    labelKey: 'totalSavings' as const,
    value: `$${MOCK_STATS.totalSavings.toLocaleString('en-US')}`,
    change: '+23%',
    changePositive: true,
    icon: TrendingDown,
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-600',
  },
]

/* =================================================================
   UTILITÁRIOS
   Funções auxiliares para formatação e lógica de exibição.
   ================================================================= */

/**
 * Retorna a classe de cor baseada no score de risco.
 * - 0-25: verde (baixo risco)
 * - 26-50: amarelo (risco moderado)
 * - 51-75: laranja (risco elevado)
 * - 76-100: vermelho (risco crítico)
 */
function getRiskColor(risk: number): {
  bar: string
  bg: string
  text: string
} {
  if (risk <= 25) return { bar: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' }
  if (risk <= 50) return { bar: 'bg-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700' }
  if (risk <= 75) return { bar: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700' }
  return { bar: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' }
}

/**
 * Retorna as classes de estilo para cada nível de prioridade de alerta.
 * Mapeia critical/high/medium para cores visuais distintas.
 */
function getAlertPriorityStyles(priority: 'critical' | 'high' | 'medium'): {
  bg: string
  text: string
  border: string
  dot: string
} {
  switch (priority) {
    case 'critical':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-red-500',
      }
    case 'high':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        dot: 'bg-orange-500',
      }
    case 'medium':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        dot: 'bg-yellow-500',
      }
  }
}

/**
 * Formata valor monetário no padrão USD compacto.
 * Ex: 156000 -> "$156K"
 */
function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value.toLocaleString('en-US')}`
}

/* =================================================================
   COMPONENTES AUXILIARES
   Subcomponentes extraídos para manter o componente principal limpo.
   ================================================================= */

/**
 * Tooltip customizado para o gráfico Recharts.
 * Segue o design system neobrutalism com borda e sombra.
 * Recebe as labels traduzidas via props para evitar uso de hooks fora de componente React.
 */
function CustomTooltip({
  active,
  payload,
  label,
  contractsLabel,
  savingsLabel,
}: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string }>
  label?: string
  contractsLabel?: string
  savingsLabel?: string
}) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
      <p className="text-sm font-semibold text-slate-900 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-xs text-slate-500">
          {entry.dataKey === 'contracts' ? contractsLabel : savingsLabel}:{' '}
          <span className="font-medium text-slate-700">
            {entry.dataKey === 'savings'
              ? `$${entry.value.toLocaleString('en-US')}`
              : entry.value}
          </span>
        </p>
      ))}
    </div>
  )
}

/* =================================================================
   VARIANTES DE ANIMAÇÃO (Framer Motion)
   Definem as transições de entrada dos elementos do dashboard.
   ================================================================= */

/** Container pai — orquestra o stagger dos filhos */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

/** Variante dos stat cards — surgem de baixo com fade */
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
}

/** Variante para seções maiores — fade com escala sutil */
const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
}

/* =================================================================
   COMPONENTE PRINCIPAL
   ================================================================= */

/**
 * Componente de overview do dashboard.
 *
 * Exibe o estado geral do portfólio de contratos com:
 * - 4 stat cards animados com KPIs e variação percentual
 * - Gráfico de área mostrando evolução de contratos e savings
 * - Painel lateral de alertas urgentes
 * - Tabela de contratos recentes com risk score e status
 */
export function DashboardOverview() {
  const t = useTranslations('dashboard')

  /** Indica se existem contratos no portfólio */
  const hasContracts = true

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ============================================================
          CABEÇALHO — Saudação e botão de upload
          ============================================================ */}
      <motion.div
        className="flex items-center justify-between"
        variants={cardVariants}
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('welcome', { name: '' })}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t('overview')}</p>
        </div>
        <Link href="/dashboard/contracts/new">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2">
            <Upload className="h-4 w-4" />
            {t('uploadContract')}
          </Button>
        </Link>
      </motion.div>

      {/* ============================================================
          STAT CARDS — 4 KPIs com animação stagger
          ============================================================ */}
      {hasContracts && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STAT_CARDS.map((card) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.labelKey}
                  variants={cardVariants}
                  className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.08)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 cursor-default"
                >
                  {/* Ícone e seta decorativa */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl ${card.bgLight} flex items-center justify-center`}
                    >
                      <Icon className={`h-5 w-5 ${card.textColor}`} />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-300" />
                  </div>

                  {/* Valor principal */}
                  <p className="text-2xl font-bold text-slate-900">
                    {card.value}
                  </p>

                  {/* Label traduzível e indicador de variação */}
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-slate-500">
                      {t(card.labelKey)}
                    </p>
                    <span
                      className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${
                        card.changePositive
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {card.change}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* ============================================================
              GRÁFICO + ALERTAS — Layout de 2/3 + 1/3
              ============================================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ---------- Gráfico de área — evolução do portfólio ---------- */}
            <motion.div
              variants={sectionVariants}
              className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {t('contractPortfolio')}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {t('chartSubtitle')}
                  </p>
                </div>

                {/* Legenda do gráfico */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                    <span className="text-xs text-slate-500">{t('chartContracts')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs text-slate-500">{t('chartSavings')}</span>
                  </div>
                </div>
              </div>

              {/* Gráfico Recharts responsivo */}
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart
                    data={MOCK_CHART_DATA}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  >
                    {/* Definição dos gradientes para as áreas */}
                    <defs>
                      <linearGradient
                        id="gradientContracts"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#0d9488"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor="#0d9488"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                      <linearGradient
                        id="gradientSavings"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10b981"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="100%"
                          stopColor="#10b981"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="contracts"
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="savings"
                      orientation="right"
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
                    />
                    <Tooltip content={<CustomTooltip contractsLabel={t('chartContracts')} savingsLabel={t('chartSavings')} />} />

                    {/* Área de contratos (eixo esquerdo) */}
                    <Area
                      yAxisId="contracts"
                      type="monotone"
                      dataKey="contracts"
                      stroke="#0d9488"
                      strokeWidth={2.5}
                      fill="url(#gradientContracts)"
                      dot={{
                        r: 4,
                        fill: '#0d9488',
                        stroke: '#fff',
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 6,
                        fill: '#0d9488',
                        stroke: '#fff',
                        strokeWidth: 2,
                      }}
                    />

                    {/* Área de savings (eixo direito) */}
                    <Area
                      yAxisId="savings"
                      type="monotone"
                      dataKey="savings"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      fill="url(#gradientSavings)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* ---------- Painel lateral de alertas ---------- */}
            <motion.div
              variants={sectionVariants}
              className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  {t('alerts')}
                </h2>
                <Badge
                  variant="destructive"
                  className="text-[10px] px-2 py-0.5"
                >
                  {MOCK_ALERTS.length}
                </Badge>
              </div>

              {/* Lista de alertas com estilos por prioridade */}
              <div className="space-y-3">
                {MOCK_ALERTS.map((alert, index) => {
                  const styles = getAlertPriorityStyles(alert.priority)
                  const AlertIcon =
                    alert.type === 'renewal' ? Bell : AlertTriangle

                  return (
                    <motion.div
                      key={`${alert.contract}-${index}`}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className={`rounded-xl border ${styles.border} ${styles.bg} p-3.5`}
                    >
                      {/* Cabeçalho do alerta — ícone + prioridade */}
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${styles.bg}`}
                        >
                          <AlertIcon
                            className={`h-3.5 w-3.5 ${styles.text}`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {alert.contract}
                          </p>
                          <p className={`text-xs mt-0.5 ${styles.text}`}>
                            {alert.type === 'renewal'
                              ? t('daysLeft', { count: alert.daysLeft })
                              : alert.message}
                          </p>
                        </div>

                        {/* Indicador visual de prioridade */}
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${styles.dot}`}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Botão para ver todos os alertas */}
              <Button
                variant="ghost"
                className="w-full mt-4 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl text-sm"
              >
                {t('viewAllAlerts')}
                <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </motion.div>
          </div>

          {/* ============================================================
              CONTRATOS RECENTES — Tabela completa
              ============================================================ */}
          <motion.div
            variants={sectionVariants}
            className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] overflow-hidden"
          >
            {/* Cabeçalho da tabela */}
            <div className="px-6 py-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {t('recentActivity')}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {t('latestAnalyzed')}
                  </p>
                </div>
                <Link href="/dashboard/contracts">
                  <Button
                    variant="ghost"
                    className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl text-sm gap-1"
                  >
                    {t('viewAll')}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Corpo da tabela — responsivo com scroll horizontal */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th scope="col" className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      {t('tableContract')}
                    </th>
                    <th scope="col" className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      {t('tableRiskScore')}
                    </th>
                    <th scope="col" className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      {t('tableValue')}
                    </th>
                    <th scope="col" className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      {t('tableRenewal')}
                    </th>
                    <th scope="col" className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
                      {t('tableStatus')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_RECENT_CONTRACTS.map((contract, index) => {
                    const riskColors = getRiskColor(contract.risk)
                    const isUrgentRenewal = contract.daysUntilRenewal <= 14

                    return (
                      <motion.tr
                        key={contract.name}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 + index * 0.06 }}
                        className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/60 transition-colors duration-150 cursor-pointer"
                      >
                        {/* Nome e vendor do contrato */}
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {contract.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {contract.vendor}
                            </p>
                          </div>
                        </td>

                        {/* Risk score com barra visual proporcional */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${riskColors.bar} transition-all duration-500`}
                                style={{ width: `${contract.risk}%` }}
                              />
                            </div>
                            <span
                              className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${riskColors.bg} ${riskColors.text}`}
                            >
                              {contract.risk}
                            </span>
                          </div>
                        </td>

                        {/* Valor monetário do contrato */}
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-900">
                            {formatCurrency(contract.value)}
                          </p>
                        </td>

                        {/* Dias até renovação — destaque se urgente */}
                        <td className="px-6 py-4">
                          <span
                            className={`text-sm ${
                              isUrgentRenewal
                                ? 'font-semibold text-red-600'
                                : 'text-slate-600'
                            }`}
                          >
                            {contract.daysUntilRenewal}d
                          </span>
                        </td>

                        {/* Status badge — completed ou analyzing */}
                        {/* Status badge — concluído ou em análise */}
                        <td className="px-6 py-4">
                          {contract.status === 'completed' ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium hover:bg-emerald-50">
                              {t('statusCompleted')}
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium hover:bg-amber-50">
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              {t('statusAnalyzing')}
                            </Badge>
                          )}
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      {/* ============================================================
          ESTADO VAZIO — Exibido quando não há contratos no portfólio
          ============================================================ */}
      {!hasContracts && (
        <motion.div
          variants={sectionVariants}
          className="rounded-2xl bg-white border border-slate-200 p-12 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] text-center"
        >
          <div className="mx-auto w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-6">
            <FileText className="h-8 w-8 text-teal-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {t('noContracts')}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            {t('noContractsDescription')}
          </p>
          <Link href="/dashboard/contracts/new">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2">
              <Upload className="h-4 w-4" />
              {t('uploadFirst')}
            </Button>
          </Link>
        </motion.div>
      )}
    </motion.div>
  )
}
