'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
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
  BarChart3,
  TrendingDown,
  TrendingUp,
  Target,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Gauge,
} from 'lucide-react'

/* =================================================================
   DADOS MOCK
   Simulam benchmarks de mercado com dados realistas.
   Serão substituídos por chamadas ao backend quando disponível.
   ================================================================= */

/** Categorias de contratos com comparação de mercado */
const MOCK_CATEGORIES = [
  { name: 'Cloud Infrastructure', contracts: 3, avgSaving: 12, marketAvg: 14500, yourAvg: 13000, status: 'below' as const },
  { name: 'CRM & Sales', contracts: 2, avgSaving: 8, marketAvg: 7500, yourAvg: 7000, status: 'below' as const },
  { name: 'Productivity', contracts: 2, avgSaving: 15, marketAvg: 3200, yourAvg: 3000, status: 'below' as const },
  { name: 'Communication', contracts: 3, avgSaving: -5, marketAvg: 1600, yourAvg: 1750, status: 'above' as const },
  { name: 'Developer Tools', contracts: 2, avgSaving: 3, marketAvg: 1800, yourAvg: 1750, status: 'below' as const },
  { name: 'Marketing', contracts: 1, avgSaving: -8, marketAvg: 3700, yourAvg: 4000, status: 'above' as const },
  { name: 'Monitoring', contracts: 1, avgSaving: -12, marketAvg: 5300, yourAvg: 6000, status: 'above' as const },
  { name: 'Data Platform', contracts: 1, avgSaving: 5, marketAvg: 8400, yourAvg: 8000, status: 'below' as const },
]

/** Evolução mensal do índice de preço — mercado vs. empresa */
const MOCK_TRENDS = [
  { month: 'Sep', marketIndex: 100, yourIndex: 98 },
  { month: 'Oct', marketIndex: 102, yourIndex: 97 },
  { month: 'Nov', marketIndex: 105, yourIndex: 95 },
  { month: 'Dec', marketIndex: 103, yourIndex: 93 },
  { month: 'Jan', marketIndex: 108, yourIndex: 92 },
  { month: 'Feb', marketIndex: 110, yourIndex: 90 },
]

/** Resumo consolidado dos benchmarks do portfólio */
const MOCK_SUMMARY = {
  totalContracts: 15,
  belowMarket: 10,
  aboveMarket: 5,
  avgSavings: 9.2,
  potentialSavings: 47250,
  percentile: 32,
}

/* =================================================================
   CONFIGURAÇÃO DOS STAT CARDS
   Cada card mapeia para uma métrica-chave do benchmark.
   ================================================================= */

/** Definição dos 4 cards de métricas principais — usa chaves i18n */
const STAT_CARDS = [
  {
    labelKey: 'benchmarkTotalContracts' as const,
    value: MOCK_SUMMARY.totalContracts.toString(),
    changeKey: 'benchmarkThisMonth' as const,
    changePositive: true,
    icon: BarChart3,
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-600',
  },
  {
    labelKey: 'benchmarkBelowMarketAvg' as const,
    value: MOCK_SUMMARY.belowMarket.toString(),
    changeKey: 'benchmarkOfTotal' as const,
    changePositive: true,
    icon: TrendingDown,
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    labelKey: 'benchmarkAvgSavings' as const,
    value: `${MOCK_SUMMARY.avgSavings}%`,
    changeKey: 'benchmarkVsLastQuarter' as const,
    changePositive: true,
    icon: Target,
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-600',
  },
  {
    labelKey: 'benchmarkPotentialSavings' as const,
    value: `$${MOCK_SUMMARY.potentialSavings.toLocaleString('en-US')}`,
    changeKey: 'benchmarkBasedOnMarket' as const,
    changePositive: true,
    icon: DollarSign,
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
]

/* =================================================================
   UTILITÁRIOS
   Funções auxiliares para formatação e cálculos.
   ================================================================= */

/**
 * Formata valor monetário no padrão USD.
 * Ex: 14500 -> "$14,500"
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Calcula a largura proporcional da barra de comparação.
 * Normaliza o valor em relação ao máximo entre preço de mercado e preço próprio.
 */
function getBarWidth(value: number, max: number): number {
  if (max === 0) return 0
  return Math.round((value / max) * 100)
}

/* =================================================================
   COMPONENTES AUXILIARES
   Subcomponentes extraídos para manter o componente principal limpo.
   ================================================================= */

/**
 * Tooltip customizado para o gráfico de linhas.
 * Segue o design system neobrutalism com borda e sombra.
 * Recebe labels traduzidos para exibição correta em todos os idiomas.
 */
function BenchmarkTooltip({
  active,
  payload,
  label,
  marketLabel,
  yourLabel,
}: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; color: string }>
  label?: string
  marketLabel?: string
  yourLabel?: string
}) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
      <p className="text-sm font-semibold text-slate-900 mb-1.5">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-xs text-slate-500">
          {entry.dataKey === 'marketIndex' ? (marketLabel ?? 'Market Index') : (yourLabel ?? 'Your Index')}:{' '}
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
 * Dashboard de benchmarks de mercado.
 *
 * Exibe comparações entre os custos de contratos da empresa e
 * médias de mercado, incluindo:
 * - 4 stat cards animados com KPIs de benchmark
 * - Gráfico de linhas com evolução de índices (mercado vs. empresa)
 * - Tabela detalhada de categorias com barras de comparação
 * - Card de percentil com barra visual de posicionamento
 */
export function BenchmarksDashboard() {
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
          CABEÇALHO — Título e subtítulo da página
          ============================================================ */}
      <motion.div variants={cardVariants}>
        <h1 className="text-2xl font-bold text-slate-900">
          {t('benchmarks')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t('benchmarkSubtitle')}
        </p>
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

              {/* Label descritivo traduzido e indicador de contexto */}
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-slate-500">{t(card.labelKey)}</p>
              </div>

              {/* Informação complementar com indicador visual */}
              <div className="mt-2">
                <span
                  className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${
                    card.changePositive
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {t(card.changeKey)}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ============================================================
          GRÁFICO DE LINHA — Tendência de preços vs. mercado
          ============================================================ */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]"
      >
        {/* Cabeçalho do gráfico com legenda */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t('benchmarkPricingTrend')}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {t('benchmarkTrendSubtitle')}
            </p>
          </div>

          {/* Legenda manual do gráfico */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="text-xs text-slate-500">{t('benchmarkMarketIndex')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <span className="text-xs text-slate-500">{t('benchmarkYourIndex')}</span>
            </div>
          </div>
        </div>

        {/* Container responsivo do gráfico Recharts */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={MOCK_TRENDS}
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

              {/* Eixo Y — valores de índice */}
              <YAxis
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                domain={[85, 115]}
              />

              {/* Tooltip personalizado */}
              <Tooltip content={<BenchmarkTooltip marketLabel={t('benchmarkMarketIndex')} yourLabel={t('benchmarkYourIndex')} />} />

              {/* Legenda nativa desabilitada — usamos legenda customizada acima */}
              <Legend content={() => null} />

              {/* Linha do índice de mercado */}
              <Line
                type="monotone"
                dataKey="marketIndex"
                name={t('benchmarkMarketIndex')}
                stroke="#94a3b8"
                strokeWidth={2.5}
                strokeDasharray="6 3"
                dot={{
                  r: 4,
                  fill: '#94a3b8',
                  stroke: '#fff',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: '#94a3b8',
                  stroke: '#fff',
                  strokeWidth: 2,
                }}
              />

              {/* Linha do índice da empresa */}
              <Line
                type="monotone"
                dataKey="yourIndex"
                name={t('benchmarkYourIndex')}
                stroke="#0d9488"
                strokeWidth={2.5}
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
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ============================================================
          TABELA DE CATEGORIAS — Comparação detalhada por segmento
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
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t('benchmarkCategoryBreakdown')}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {t('benchmarkCategorySubtitle')}
            </p>
          </div>
        </div>

        {/* Tabela responsiva com scroll horizontal em telas pequenas */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Cabeçalho da tabela */}
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('benchmarkColCategory')}
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('benchmarkColContracts')}
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('benchmarkColYourAvg')}
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('benchmarkColMarketAvg')}
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('benchmarkColComparison')}
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('benchmarkColDifference')}
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('benchmarkColStatus')}
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
              {MOCK_CATEGORIES.map((category) => {
                /** Valor máximo entre seu preço e o de mercado — referência para a barra */
                const maxValue = Math.max(category.marketAvg, category.yourAvg)

                /** Larguras proporcionais das barras de comparação */
                const yourBarWidth = getBarWidth(category.yourAvg, maxValue)
                const marketBarWidth = getBarWidth(category.marketAvg, maxValue)

                /** Indica se o gasto está abaixo do mercado (economia) */
                const isBelowMarket = category.status === 'below'

                return (
                  <motion.tr
                    key={category.name}
                    variants={tableRowVariants}
                    className="group hover:bg-slate-50/80 transition-colors duration-150"
                  >
                    {/* Coluna: Nome da categoria */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {category.name}
                      </p>
                    </td>

                    {/* Coluna: Quantidade de contratos */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700 tabular-nums">
                        {category.contracts}
                      </span>
                    </td>

                    {/* Coluna: Preço médio da empresa */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900 tabular-nums">
                        {formatCurrency(category.yourAvg)}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">{t('perMonth')}</span>
                    </td>

                    {/* Coluna: Preço médio de mercado */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-600 tabular-nums">
                        {formatCurrency(category.marketAvg)}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">{t('perMonth')}</span>
                    </td>

                    {/* Coluna: Barra visual de comparação (seu preço vs. mercado) */}
                    <td className="px-6 py-4">
                      <div className="min-w-[160px] space-y-1.5">
                        {/* Barra do seu preço */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 w-8 text-right shrink-0">{t('benchmarkYou')}</span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${isBelowMarket ? 'bg-teal-500' : 'bg-red-400'}`}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${yourBarWidth}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                            />
                          </div>
                        </div>
                        {/* Barra do preço de mercado */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 w-8 text-right shrink-0">{t('benchmarkMkt')}</span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-slate-300"
                              initial={{ width: 0 }}
                              whileInView={{ width: `${marketBarWidth}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Coluna: Percentual de diferença */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {isBelowMarket ? (
                          <ArrowDownRight className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <span
                          className={`text-sm font-bold tabular-nums ${
                            isBelowMarket ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {Math.abs(category.avgSaving)}%
                        </span>
                      </div>
                    </td>

                    {/* Coluna: Badge de status (Below / Above Market) */}
                    <td className="px-6 py-4 text-right">
                      {isBelowMarket ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          {t('benchmarkBelowMarket')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          <AlertTriangle className="h-3 w-3" />
                          {t('benchmarkAboveMarket')}
                        </span>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </motion.tbody>
          </table>
        </div>
      </motion.div>

      {/* ============================================================
          CARD DE PERCENTIL — Posicionamento da empresa no mercado
          ============================================================ */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.08)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
      >
        {/* Ícone e título do card */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <Gauge className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t('benchmarkMarketPercentile')}
            </h2>
            <p className="text-sm text-slate-500">
              {t('benchmarkPercentileSubtitle')}
            </p>
          </div>
        </div>

        {/* Mensagem principal de posicionamento */}
        <div className="rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 p-5 mb-5">
          <p className="text-base text-slate-700">
            {t.rich('benchmarkPercentileMessage', {
              percentage: 100 - MOCK_SUMMARY.percentile,
              bold: (chunks) => <span className="text-2xl font-bold text-teal-600">{chunks}</span>,
            })}
          </p>
          <p className="text-sm text-slate-500 mt-1.5">
            {t.rich('benchmarkPercentileDetail', {
              percentile: MOCK_SUMMARY.percentile,
              bold: (chunks) => <span className="font-semibold text-slate-700">{chunks}</span>,
            })}
          </p>
        </div>

        {/* Barra visual de percentil com indicador de posição */}
        <div className="space-y-3">
          {/* Rótulos de referência */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t('benchmarkMostExpensive')}</span>
            <span>{t('benchmarkLeastExpensive')}</span>
          </div>

          {/* Barra de fundo com gradiente e marcador animado */}
          <div className="relative h-4 rounded-full bg-gradient-to-r from-red-200 via-amber-200 via-50% to-emerald-200 overflow-visible">
            {/* Indicador da posição do percentil */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2"
              initial={{ left: '0%' }}
              whileInView={{ left: `${100 - MOCK_SUMMARY.percentile}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            >
              {/* Marcador principal — círculo com borda */}
              <div className="relative -ml-2.5">
                <div className="w-5 h-5 rounded-full bg-white border-2 border-teal-600 shadow-md" />
                {/* Tooltip fixo acima do marcador */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-xs font-bold text-teal-600 bg-white px-2 py-0.5 rounded-md border border-teal-200 shadow-sm">
                    {MOCK_SUMMARY.percentile}th
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Marcações de referência na barra */}
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Resumo textual abaixo da barra */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Contratos abaixo do mercado */}
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{MOCK_SUMMARY.belowMarket}</p>
            <p className="text-xs text-emerald-700 mt-0.5">{t('benchmarkBelowMarket')}</p>
          </div>

          {/* Contratos acima do mercado */}
          <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{MOCK_SUMMARY.aboveMarket}</p>
            <p className="text-xs text-red-700 mt-0.5">{t('benchmarkAboveMarket')}</p>
          </div>

          {/* Economia potencial anual */}
          <div className="rounded-xl bg-teal-50 border border-teal-100 p-4 text-center">
            <p className="text-2xl font-bold text-teal-600">
              {formatCurrency(MOCK_SUMMARY.potentialSavings)}
            </p>
            <p className="text-xs text-teal-700 mt-0.5">{t('benchmarkAnnualSavings')}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
