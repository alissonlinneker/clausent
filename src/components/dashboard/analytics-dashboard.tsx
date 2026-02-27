'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  DollarSign,
  FileText,
  Shield,
  Clock,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  ChevronRight,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'

/* =================================================================
   DADOS MOCK — ESTATÍSTICAS GLOBAIS
   Simulam os KPIs principais do portfólio de contratos.
   Serão substituídos por chamadas ao backend quando disponível.
   ================================================================= */

/** Estatísticas gerais exibidas nos stat cards */
const MOCK_STATS = {
  totalSavings: 47250,
  savingsChange: 12.3,
  contractsAnalyzed: 156,
  contractsWeekChange: 8,
  averageRisk: 42,
  riskChange: -5,
  timeSaved: 320,
}

/* =================================================================
   DADOS MOCK — GRÁFICOS
   Dados mensais e categorizados para as visualizações Recharts.
   ================================================================= */

/** Dados de economia mensal para o AreaChart principal (12 meses) */
const MOCK_SAVINGS_DATA = [
  { month: 'Mar', savings: 18200 },
  { month: 'Apr', savings: 21400 },
  { month: 'May', savings: 19800 },
  { month: 'Jun', savings: 24600 },
  { month: 'Jul', savings: 28300 },
  { month: 'Aug', savings: 26100 },
  { month: 'Sep', savings: 31500 },
  { month: 'Oct', savings: 34200 },
  { month: 'Nov', savings: 37800 },
  { month: 'Dec', savings: 39400 },
  { month: 'Jan', savings: 42100 },
  { month: 'Feb', savings: 47250 },
]

/** Distribuição de risco para o PieChart */
const MOCK_RISK_DATA = [
  { name: 'Low', value: 45, color: '#10b981' },
  { name: 'Medium', value: 30, color: '#f59e0b' },
  { name: 'High', value: 18, color: '#f97316' },
  { name: 'Critical', value: 7, color: '#ef4444' },
]

/** Contratos por categoria para o BarChart */
const MOCK_CATEGORY_DATA = [
  { category: 'SaaS', contracts: 42 },
  { category: 'Cloud', contracts: 35 },
  { category: 'Marketing', contracts: 28 },
  { category: 'Legal', contracts: 22 },
  { category: 'HR', contracts: 18 },
  { category: 'Facilities', contracts: 11 },
]

/** Atividade mensal — uploads vs análises concluídas (6 meses) */
const MOCK_ACTIVITY_DATA = [
  { month: 'Sep', uploads: 12, analyses: 10 },
  { month: 'Oct', uploads: 18, analyses: 16 },
  { month: 'Nov', uploads: 22, analyses: 20 },
  { month: 'Dec', uploads: 15, analyses: 14 },
  { month: 'Jan', uploads: 28, analyses: 25 },
  { month: 'Feb', uploads: 32, analyses: 29 },
]

/** Top 5 oportunidades de economia identificadas pela análise */
const MOCK_INSIGHTS = [
  { contract: 'AWS Enterprise License', savings: 18500, category: 'Cloud' },
  { contract: 'Salesforce CRM Suite', savings: 12300, category: 'SaaS' },
  { contract: 'HubSpot Marketing Pro', savings: 8700, category: 'Marketing' },
  { contract: 'Datadog Monitoring', savings: 5200, category: 'SaaS' },
  { contract: 'WeWork Office Lease', savings: 4800, category: 'Facilities' },
]

/** Opções do filtro de período temporal — chave i18n */
const DATE_RANGE_OPTIONS = [
  { labelKey: 'dateRangeThisMonth', value: 'this-month' },
  { labelKey: 'dateRangeLast3Months', value: 'last-3-months' },
  { labelKey: 'dateRangeLast6Months', value: 'last-6-months' },
  { labelKey: 'dateRangeThisYear', value: 'this-year' },
  { labelKey: 'dateRangeCustom', value: 'custom' },
]

/* =================================================================
   CONFIGURAÇÃO DOS STAT CARDS
   Cada card mapeia para uma métrica-chave de analytics.
   ================================================================= */

/** Definição dos 4 cards de métricas do topo */
const STAT_CARDS = [
  {
    labelKey: 'statTotalSavings',
    value: `$${MOCK_STATS.totalSavings.toLocaleString('en-US')}`,
    change: `+${MOCK_STATS.savingsChange}%`,
    changeDescKey: 'statVsLastMonth',
    changePositive: true,
    icon: DollarSign,
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-600',
  },
  {
    labelKey: 'statContractsAnalyzed',
    value: MOCK_STATS.contractsAnalyzed.toString(),
    change: `+${MOCK_STATS.contractsWeekChange}`,
    changeDescKey: 'statThisWeek',
    changePositive: true,
    icon: FileText,
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    labelKey: 'statAverageRisk',
    value: `${MOCK_STATS.averageRisk}/100`,
    change: `${MOCK_STATS.riskChange}`,
    changeDescKey: 'statVsLastMonth',
    changePositive: true,
    icon: Shield,
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-600',
  },
  {
    labelKey: 'statTimeSaved',
    value: `${MOCK_STATS.timeSaved}h`,
    change: 'estimated',
    changeDescKey: '',
    changePositive: true,
    icon: Clock,
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-600',
  },
]

/* =================================================================
   COMPONENTES AUXILIARES
   Subcomponentes extraídos para tooltips e seções internas.
   ================================================================= */

/**
 * Tooltip customizado para o gráfico de economia.
 * Segue o design system neobrutalism com borda e sombra.
 */
function SavingsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string }>
  label?: string
}) {
  /** Hook de tradução para labels do tooltip */
  const t = useTranslations('dashboard')

  if (!active || !payload || payload.length === 0) return null

  /** Mapa de labels traduzidos por dataKey */
  const labelMap: Record<string, string> = {
    savings: t('tooltipSavings'),
    uploads: t('tooltipUploads'),
    analyses: t('tooltipAnalyses'),
  }

  return (
    <div className="rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
      <p className="text-sm font-semibold text-slate-900 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-xs text-slate-500">
          {labelMap[entry.dataKey] ?? entry.dataKey}:{' '}
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

/**
 * Tooltip customizado para o gráfico de barras por categoria.
 */
function CategoryTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string }>
  label?: string
}) {
  /** Hook de tradução para labels do tooltip */
  const t = useTranslations('dashboard')

  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
      <p className="text-sm font-semibold text-slate-900 mb-1">{label}</p>
      <p className="text-xs text-slate-500">
        {t('tooltipContracts')}: <span className="font-medium text-slate-700">{payload[0].value}</span>
      </p>
    </div>
  )
}

/**
 * Tooltip customizado para o PieChart de distribuição de risco.
 */
function RiskPieTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
}) {
  /** Hook de tradução para labels do tooltip */
  const t = useTranslations('dashboard')

  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
      <p className="text-sm font-semibold text-slate-900">{payload[0].name} {t('riskSuffix')}</p>
      <p className="text-xs text-slate-500 mt-0.5">
        <span className="font-medium text-slate-700">{payload[0].value}%</span> {t('tooltipOfContracts')}
      </p>
    </div>
  )
}

/* =================================================================
   VARIANTES DE ANIMACAO (Framer Motion)
   Definem as transicoes de entrada dos elementos do dashboard.
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

/** Variante para seções maiores — fade com deslocamento vertical */
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

/** Variante para itens de lista — stagger sequencial */
const listItemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.0, 0.0, 0.58, 1.0] as [number, number, number, number],
    },
  },
}

/* =================================================================
   COMPONENTE PRINCIPAL
   ================================================================= */

/**
 * Dashboard de analytics completo com visualizações ricas.
 *
 * Exibe métricas detalhadas do portfólio de contratos:
 * - 4 stat cards animados com KPIs (savings, contratos, risco, tempo)
 * - Gráfico de área de economia ao longo do tempo (12 meses)
 * - PieChart de distribuição de risco
 * - BarChart de contratos por categoria
 * - AreaChart de atividade mensal (uploads vs análises)
 * - Painel de insights com top 5 oportunidades de economia
 * - Filtro de período temporal
 */
export function AnalyticsDashboard() {
  /** Hook de traduções para chaves do dashboard */
  const t = useTranslations('dashboard')

  /** Estado do filtro de período selecionado */
  const [dateRange, setDateRange] = useState('this-year')

  /** Tendência geral de risco — calculada comparando períodos */
  const riskTrending = MOCK_STATS.riskChange < 0 ? 'improving' : 'worsening'

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ============================================================
          CABEÇALHO — Título + filtro de período
          ============================================================ */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        variants={cardVariants}
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('analytics')}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('analyticsSubtitle')}
          </p>
        </div>

        {/* Filtro de período — botões de seleção rápida */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]">
          {DATE_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setDateRange(option.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                dateRange === option.value
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              )}
            >
              {t(option.labelKey)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ============================================================
          STAT CARDS — 4 KPIs com animação stagger
          ============================================================ */}
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

              {/* Label descritivo e indicador de variação */}
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-slate-500">{t(card.labelKey)}</p>
              </div>

              {/* Badge de variação com contexto */}
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={cn(
                    'text-xs font-medium px-1.5 py-0.5 rounded-md',
                    card.changePositive
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-50 text-amber-600'
                  )}
                >
                  {card.change}
                </span>
                {card.changeDescKey && (
                  <span className="text-xs text-slate-400">
                    {t(card.changeDescKey)}
                  </span>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ============================================================
          GRÁFICOS SUPERIORES — Savings Over Time + Risk Distribution
          Layout 2/3 + 1/3
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ---------- Gráfico de área — economia ao longo do tempo ---------- */}
        <motion.div
          variants={sectionVariants}
          className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]"
        >
          {/* Cabeçalho com legenda */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {t('savingsOverTime')}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {t('savingsOverTimeDesc')}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <span className="text-xs text-slate-500">{t('totalSavingsAmount')}</span>
            </div>
          </div>

          {/* Container responsivo do gráfico Recharts */}
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart
                data={MOCK_SAVINGS_DATA}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                {/* Gradiente de preenchimento da área */}
                <defs>
                  <linearGradient id="gradientSavingsAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity={0.02} />
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
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<SavingsTooltip />} />

                {/* Área de economia com gradiente teal */}
                <Area
                  type="monotone"
                  dataKey="savings"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  fill="url(#gradientSavingsAnalytics)"
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
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ---------- PieChart — distribuição de risco ---------- */}
        <motion.div
          variants={sectionVariants}
          className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]"
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              {t('riskDistribution')}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {t('riskDistributionBreakdown')}
            </p>
          </div>

          {/* Gráfico de pizza responsivo */}
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={MOCK_RISK_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#fff"
                >
                  {MOCK_RISK_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<RiskPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legenda customizada abaixo do gráfico */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {MOCK_RISK_DATA.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-slate-600">
                  {entry.name}{' '}
                  <span className="font-semibold text-slate-900">{entry.value}%</span>
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ============================================================
          GRÁFICOS INFERIORES — Contratos por Categoria + Atividade Mensal
          Layout 1/2 + 1/2
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ---------- BarChart — contratos por categoria ---------- */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {t('contractsByCategory')}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {t('contractsByCategoryDesc')}
              </p>
            </div>
          </div>

          {/* Gráfico de barras responsivo */}
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart
                data={MOCK_CATEGORY_DATA}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CategoryTooltip />} />
                <Bar
                  dataKey="contracts"
                  fill="#0d9488"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ---------- AreaChart — atividade mensal (uploads vs análises) ---------- */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {t('monthlyActivity')}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {t('monthlyActivityDesc')}
              </p>
            </div>

            {/* Legenda do gráfico */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                <span className="text-xs text-slate-500">{t('tooltipUploads')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-500">{t('tooltipAnalyses')}</span>
              </div>
            </div>
          </div>

          {/* Gráfico de área dual responsivo */}
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart
                data={MOCK_ACTIVITY_DATA}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                {/* Gradientes de preenchimento das áreas */}
                <defs>
                  <linearGradient id="gradientUploads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradientAnalyses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
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
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<SavingsTooltip />} />

                {/* Área de uploads */}
                <Area
                  type="monotone"
                  dataKey="uploads"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  fill="url(#gradientUploads)"
                  dot={{
                    r: 3,
                    fill: '#0d9488',
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 5,
                    fill: '#0d9488',
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                />

                {/* Área de análises concluídas */}
                <Area
                  type="monotone"
                  dataKey="analyses"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  fill="url(#gradientAnalyses)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* ============================================================
          TOP INSIGHTS — Oportunidades de economia + tendência de risco
          ============================================================ */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] overflow-hidden"
      >
        {/* Cabeçalho do painel de insights */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {t('topInsights')}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {t('topInsightsDesc')}
                </p>
              </div>
            </div>

            {/* Indicador de tendência de risco */}
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl border',
                riskTrending === 'improving'
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-red-50 border-red-200'
              )}
            >
              {riskTrending === 'improving' ? (
                <TrendingDown className="h-4 w-4 text-emerald-600" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-600" />
              )}
              <span
                className={cn(
                  'text-xs font-semibold',
                  riskTrending === 'improving'
                    ? 'text-emerald-700'
                    : 'text-red-700'
                )}
              >
                {riskTrending === 'improving' ? t('riskImproving') : t('riskWorsening')}
              </span>
            </div>
          </div>
        </div>

        {/* Lista de top 5 oportunidades de economia */}
        <motion.div
          className="divide-y divide-slate-100"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {MOCK_INSIGHTS.map((insight, index) => (
            <motion.div
              key={insight.contract}
              variants={listItemVariants}
              className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors duration-150"
            >
              {/* Informações do contrato */}
              <div className="flex items-center gap-4">
                {/* Número de ranking */}
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-teal-600">{index + 1}</span>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {insight.contract}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {insight.category}
                  </p>
                </div>
              </div>

              {/* Economia potencial + botão de ação */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">
                    ${insight.savings.toLocaleString('en-US')}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                    {t('potentialSavings')}
                  </p>
                </div>

                <Link href="/dashboard/contracts">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg h-8 px-3"
                  >
                    {t('insightReview')}
                    <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Rodapé com totalizador */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-50 to-emerald-50 border-t border-teal-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              {t('totalPotentialSavings')}
            </p>
            <p className="text-lg font-bold text-teal-600">
              ${MOCK_INSIGHTS.reduce((sum, i) => sum + i.savings, 0).toLocaleString('en-US')}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
