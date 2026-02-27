'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  AlertTriangle,
  ShieldAlert,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ExternalLink,
  TrendingDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'

/* =================================================================
   DADOS MOCK — RESUMO DE RISCOS
   Simulam os KPIs de risco do portfólio de contratos.
   Serão substituídos por chamadas ao backend quando disponível.
   ================================================================= */

/** Resumo consolidado dos riscos do portfólio */
const MOCK_RISK_SUMMARY = {
  totalRisks: 47,
  highRisk: 8,
  mediumRisk: 21,
  lowRisk: 18,
  totalRisksChange: '+5 this month',
  highRiskChange: '+2 this month',
  mediumRiskChange: '-1 vs last month',
  lowRiskChange: '+4 this month',
}

/* =================================================================
   DADOS MOCK — GRÁFICO DE DISTRIBUIÇÃO (DONUT)
   Proporção de riscos por severidade para o PieChart.
   ================================================================= */

/** Distribuição de riscos por nível de severidade */
const MOCK_DISTRIBUTION = [
  { name: 'High', value: 8, color: '#ef4444' },
  { name: 'Medium', value: 21, color: '#f59e0b' },
  { name: 'Low', value: 18, color: '#10b981' },
]

/* =================================================================
   DADOS MOCK — TENDÊNCIA DE RISCOS (6 MESES)
   Evolução mensal da quantidade de riscos por severidade.
   ================================================================= */

/** Dados mensais de tendência de riscos — últimos 6 meses */
const MOCK_TREND = [
  { month: 'Sep', high: 5, medium: 18, low: 12 },
  { month: 'Oct', high: 7, medium: 20, low: 14 },
  { month: 'Nov', high: 6, medium: 22, low: 15 },
  { month: 'Dec', high: 9, medium: 19, low: 16 },
  { month: 'Jan', high: 7, medium: 23, low: 17 },
  { month: 'Feb', high: 8, medium: 21, low: 18 },
]

/* =================================================================
   DADOS MOCK — TABELA DE RISCOS RECENTES
   Lista detalhada dos riscos identificados nos contratos.
   ================================================================= */

/** Tipos de risco suportados e suas configurações visuais */
const RISK_TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  liability: { label: 'Liability', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  termination: { label: 'Termination', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  penalty: { label: 'Penalty', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  compliance: { label: 'Compliance', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  ip: { label: 'IP Rights', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  'data-privacy': { label: 'Data Privacy', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'auto-renewal': { label: 'Auto-Renewal', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  indemnification: { label: 'Indemnification', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
}

/** Configuração visual para cada nível de severidade */
const SEVERITY_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  high: { label: 'High', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  medium: { label: 'Medium', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  low: { label: 'Low', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
}

/** Lista de riscos recentes com dados realistas */
const MOCK_RISKS = [
  {
    id: '1',
    contractName: 'AWS Enterprise License',
    contractId: 'ctr-001',
    riskType: 'liability',
    severity: 'high' as const,
    clause: 'Section 8.2 — Limitation of Liability',
    recommendation: 'Negotiate a mutual liability cap at 12 months of fees instead of unlimited exposure.',
  },
  {
    id: '2',
    contractName: 'Salesforce CRM Suite',
    contractId: 'ctr-002',
    riskType: 'auto-renewal',
    severity: 'high' as const,
    clause: 'Section 12.1 — Term and Renewal',
    recommendation: 'Add a 60-day notice period clause before auto-renewal activates.',
  },
  {
    id: '3',
    contractName: 'HubSpot Marketing Pro',
    contractId: 'ctr-003',
    riskType: 'termination',
    severity: 'medium' as const,
    clause: 'Section 9.3 — Termination for Convenience',
    recommendation: 'Request termination for convenience with 30-day notice instead of 90-day lock-in.',
  },
  {
    id: '4',
    contractName: 'Datadog Monitoring',
    contractId: 'ctr-004',
    riskType: 'penalty',
    severity: 'medium' as const,
    clause: 'Section 7.1 — Early Termination Fee',
    recommendation: 'Negotiate a pro-rated early termination fee instead of full remaining contract value.',
  },
  {
    id: '5',
    contractName: 'WeWork Office Lease',
    contractId: 'ctr-005',
    riskType: 'compliance',
    severity: 'medium' as const,
    clause: 'Section 15.4 — Regulatory Compliance',
    recommendation: 'Add a mutual compliance obligation clause covering both parties equally.',
  },
  {
    id: '6',
    contractName: 'Snowflake Data Platform',
    contractId: 'ctr-006',
    riskType: 'data-privacy',
    severity: 'high' as const,
    clause: 'Section 6.2 — Data Processing Agreement',
    recommendation: 'Ensure DPA includes explicit GDPR Article 28 processor obligations and breach notification timelines.',
  },
  {
    id: '7',
    contractName: 'Figma Enterprise',
    contractId: 'ctr-007',
    riskType: 'ip',
    severity: 'low' as const,
    clause: 'Section 5.1 — Intellectual Property Ownership',
    recommendation: 'Confirm that all designs created in the tool remain company IP with no vendor co-ownership claims.',
  },
  {
    id: '8',
    contractName: 'Slack Business+',
    contractId: 'ctr-008',
    riskType: 'indemnification',
    severity: 'low' as const,
    clause: 'Section 10.1 — Indemnification',
    recommendation: 'Request mutual indemnification instead of one-sided customer obligation.',
  },
  {
    id: '9',
    contractName: 'Google Workspace',
    contractId: 'ctr-009',
    riskType: 'data-privacy',
    severity: 'medium' as const,
    clause: 'Section 4.3 — Data Residency',
    recommendation: 'Specify data residency requirements to ensure data stays within compliant regions.',
  },
  {
    id: '10',
    contractName: 'Notion Team Plan',
    contractId: 'ctr-010',
    riskType: 'termination',
    severity: 'low' as const,
    clause: 'Section 11.2 — Data Export on Termination',
    recommendation: 'Negotiate a 90-day data export window post-termination instead of the current 30-day limit.',
  },
]

/* =================================================================
   CONFIGURAÇÃO DOS STAT CARDS
   Cada card mapeia para uma métrica-chave de risco.
   ================================================================= */

/** Definição dos 4 cards de métricas de risco */
const STAT_CARDS = [
  {
    labelKey: 'riskTotalRisks' as const,
    value: MOCK_RISK_SUMMARY.totalRisks.toString(),
    change: MOCK_RISK_SUMMARY.totalRisksChange,
    changePositive: false,
    icon: AlertTriangle,
    bgLight: 'bg-slate-100',
    textColor: 'text-slate-600',
  },
  {
    labelKey: 'riskHighRisk' as const,
    value: MOCK_RISK_SUMMARY.highRisk.toString(),
    change: MOCK_RISK_SUMMARY.highRiskChange,
    changePositive: false,
    icon: ShieldAlert,
    bgLight: 'bg-red-50',
    textColor: 'text-red-600',
  },
  {
    labelKey: 'riskMediumRisk' as const,
    value: MOCK_RISK_SUMMARY.mediumRisk.toString(),
    change: MOCK_RISK_SUMMARY.mediumRiskChange,
    changePositive: true,
    icon: AlertCircle,
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
  {
    labelKey: 'riskLowRisk' as const,
    value: MOCK_RISK_SUMMARY.lowRisk.toString(),
    change: MOCK_RISK_SUMMARY.lowRiskChange,
    changePositive: true,
    icon: CheckCircle,
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
]

/* =================================================================
   COMPONENTES AUXILIARES — TOOLTIPS
   Subcomponentes extraídos para manter o componente principal limpo.
   ================================================================= */

/**
 * Tooltip customizado para o donut chart de distribuição.
 * Segue o design system neobrutalism com borda e sombra.
 */
function DistributionTooltip({
  active,
  payload,
  riskSuffix,
  risksFoundLabel,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
  riskSuffix?: string
  risksFoundLabel?: string
}) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
      <p className="text-sm font-semibold text-slate-900">{payload[0].name} {riskSuffix ?? 'Risk'}</p>
      <p className="text-xs text-slate-500 mt-0.5">
        <span className="font-medium text-slate-700">{payload[0].value}</span> {risksFoundLabel ?? 'risks found'}
      </p>
    </div>
  )
}

/**
 * Tooltip customizado para o gráfico de tendência de riscos.
 * Exibe valores de cada nível de severidade no mês selecionado.
 */
function TrendTooltip({
  active,
  payload,
  label,
  highLabel,
  mediumLabel,
  lowLabel,
}: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; color: string }>
  label?: string
  highLabel?: string
  mediumLabel?: string
  lowLabel?: string
}) {
  if (!active || !payload || payload.length === 0) return null

  /** Mapa de labels traduzidos para cada dataKey do gráfico */
  const labelMap: Record<string, string> = {
    high: highLabel ?? 'High',
    medium: mediumLabel ?? 'Medium',
    low: lowLabel ?? 'Low',
  }

  return (
    <div className="rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
      <p className="text-sm font-semibold text-slate-900 mb-1.5">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-xs text-slate-500">
          {labelMap[entry.dataKey] || entry.dataKey}:{' '}
          <span className="font-medium text-slate-700">{entry.value}</span>
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

/** Variante para linhas da tabela — stagger sequencial */
const tableRowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
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
 * Dashboard de análise de riscos contratuais.
 *
 * Exibe visão consolidada dos riscos identificados em todos os
 * contratos do usuário, incluindo:
 * - Cabeçalho com título traduzido e badge de contagem total
 * - 4 stat cards animados (total, high, medium, low)
 * - Gráfico donut de distribuição por severidade
 * - Tabela detalhada dos riscos mais recentes
 * - Gráfico de tendência de riscos ao longo de 6 meses
 */
export function RiskDashboard() {
  /** Hook de traduções para chaves do dashboard */
  const t = useTranslations('dashboard')

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ============================================================
          CABEÇALHO — Título traduzido + badge com contagem total
          ============================================================ */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        variants={cardVariants}
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              {t('riskAnalysis')}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
              <AlertTriangle className="h-3 w-3" />
              {MOCK_RISK_SUMMARY.totalRisks} {t('riskFound')}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {t('riskSubtitle')}
          </p>
        </div>

        {/* Indicador de tendência geral */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-emerald-50 border-emerald-200">
          <TrendingDown className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700">
            {t('riskTrendImproving')}
          </span>
        </div>
      </motion.div>

      {/* ============================================================
          STAT CARDS — 4 KPIs de risco com animação stagger
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

              {/* Label descritivo traduzido */}
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-slate-500">{t(card.labelKey)}</p>
              </div>

              {/* Informação complementar de variação */}
              <div className="mt-2">
                <span
                  className={cn(
                    'text-xs font-medium px-1.5 py-0.5 rounded-md',
                    card.changePositive
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-red-50 text-red-600'
                  )}
                >
                  {card.change}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ============================================================
          GRÁFICOS — Distribuição (donut) + Tendência (linha)
          Layout 1/3 + 2/3
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ---------- Donut chart — distribuição de riscos ---------- */}
        <motion.div
          variants={sectionVariants}
          className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]"
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              {t('riskDistribution')}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {t('riskDistributionSubtitle')}
            </p>
          </div>

          {/* Gráfico de pizza (donut) responsivo */}
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={MOCK_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#fff"
                >
                  {MOCK_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<DistributionTooltip riskSuffix={t('riskSuffix')} risksFoundLabel={t('riskFound')} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legenda customizada abaixo do gráfico */}
          <div className="space-y-2.5 mt-4">
            {MOCK_DISTRIBUTION.map((entry) => {
              /** Percentual calculado sobre o total de riscos */
              const percentage = Math.round((entry.value / MOCK_RISK_SUMMARY.totalRisks) * 100)

              /** Mapa de tradução para os nomes de severidade do gráfico */
              const nameMap: Record<string, string> = {
                High: t('riskLabelHigh'),
                Medium: t('riskLabelMedium'),
                Low: t('riskLabelLow'),
              }

              return (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-slate-600">{nameMap[entry.name] ?? entry.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{entry.value}</span>
                    <span className="text-xs text-slate-400">({percentage}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* ---------- Gráfico de linha — tendência de riscos ---------- */}
        <motion.div
          variants={sectionVariants}
          className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]"
        >
          {/* Cabeçalho do gráfico com legenda */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {t('riskTrend')}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {t('riskTrendSubtitle')}
              </p>
            </div>

            {/* Legenda manual — 3 categorias com cor */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-xs text-slate-500">{t('riskLabelHigh')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-xs text-slate-500">{t('riskLabelMedium')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-500">{t('riskLabelLow')}</span>
              </div>
            </div>
          </div>

          {/* Container responsivo do gráfico Recharts */}
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart
                data={MOCK_TREND}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                {/* Grade de fundo pontilhada */}
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />

                {/* Eixo X — meses */}
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />

                {/* Eixo Y — quantidade de riscos */}
                <YAxis
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />

                {/* Tooltip personalizado */}
                <Tooltip content={<TrendTooltip highLabel={t('riskLabelHigh')} mediumLabel={t('riskLabelMedium')} lowLabel={t('riskLabelLow')} />} />

                {/* Legenda nativa desabilitada — usamos legenda customizada acima */}
                <Legend content={() => null} />

                {/* Linha — riscos de alta severidade */}
                <Line
                  type="monotone"
                  dataKey="high"
                  name="High"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={{
                    r: 4,
                    fill: '#ef4444',
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    fill: '#ef4444',
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                />

                {/* Linha — riscos de média severidade */}
                <Line
                  type="monotone"
                  dataKey="medium"
                  name="Medium"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{
                    r: 4,
                    fill: '#f59e0b',
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    fill: '#f59e0b',
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                />

                {/* Linha — riscos de baixa severidade */}
                <Line
                  type="monotone"
                  dataKey="low"
                  name="Low"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  strokeDasharray="6 3"
                  dot={{
                    r: 4,
                    fill: '#10b981',
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    fill: '#10b981',
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* ============================================================
          TABELA DE RISCOS — Lista detalhada dos riscos recentes
          ============================================================ */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] overflow-hidden"
      >
        {/* Cabeçalho da seção */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {t('riskRecentRisks')}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {t('riskRecentRisksSubtitle')}
              </p>
            </div>

            {/* Badge com total de riscos exibidos */}
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
              {MOCK_RISKS.length} {t('riskFound')}
            </span>
          </div>
        </div>

        {/* Tabela responsiva com scroll horizontal em telas pequenas */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Cabeçalho da tabela */}
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th scope="col" className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('riskContract')}
                </th>
                <th scope="col" className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('riskType')}
                </th>
                <th scope="col" className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('riskSeverity')}
                </th>
                <th scope="col" className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                  {t('riskClause')}
                </th>
                <th scope="col" className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">
                  {t('riskRecommendation')}
                </th>
                <th scope="col" className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('riskAction')}
                </th>
              </tr>
            </thead>

            {/* Corpo da tabela com animação stagger nas linhas */}
            <motion.tbody
              className="divide-y divide-slate-100"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {MOCK_RISKS.map((risk) => {
                /** Configuração visual do tipo de risco */
                const typeConfig = RISK_TYPE_CONFIG[risk.riskType] || {
                  label: risk.riskType,
                  bg: 'bg-slate-50',
                  text: 'text-slate-700',
                  border: 'border-slate-200',
                }

                /** Configuração visual da severidade */
                const severityConfig = SEVERITY_CONFIG[risk.severity]

                return (
                  <motion.tr
                    key={risk.id}
                    variants={tableRowVariants}
                    className="group hover:bg-slate-50/80 transition-colors duration-150"
                  >
                    {/* Coluna: Nome do contrato */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {risk.contractName}
                      </p>
                    </td>

                    {/* Coluna: Tipo de risco com badge colorido */}
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border',
                          typeConfig.bg,
                          typeConfig.text,
                          typeConfig.border
                        )}
                      >
                        {typeConfig.label}
                      </span>
                    </td>

                    {/* Coluna: Severidade com indicador de cor */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', severityConfig.dot)} />
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold',
                            severityConfig.bg,
                            severityConfig.text
                          )}
                        >
                          {severityConfig.label}
                        </span>
                      </div>
                    </td>

                    {/* Coluna: Cláusula afetada (oculta em telas menores) */}
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <p className="text-xs text-slate-600 max-w-[200px] truncate">
                        {risk.clause}
                      </p>
                    </td>

                    {/* Coluna: Recomendação resumida (oculta em telas menores) */}
                    <td className="px-6 py-4 hidden xl:table-cell">
                      <p className="text-xs text-slate-500 max-w-[280px] line-clamp-2">
                        {risk.recommendation}
                      </p>
                    </td>

                    {/* Coluna: Botão de ação para detalhes do contrato */}
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/contracts`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg h-8 px-3"
                        >
                          {t('riskViewDetails')}
                          <ExternalLink className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </motion.tr>
                )
              })}
            </motion.tbody>
          </table>
        </div>

        {/* Rodapé com totalizador por severidade */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-50/50 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              {t('riskSummaryFooter')}
            </p>
            <div className="flex items-center gap-3">
              {/* Badge de alto risco */}
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {MOCK_RISK_SUMMARY.highRisk} {t('riskLabelHigh')}
              </span>
              {/* Badge de médio risco */}
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {MOCK_RISK_SUMMARY.mediumRisk} {t('riskLabelMedium')}
              </span>
              {/* Badge de baixo risco */}
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {MOCK_RISK_SUMMARY.lowRisk} {t('riskLabelLow')}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
