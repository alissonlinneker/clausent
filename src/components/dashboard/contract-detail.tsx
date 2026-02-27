'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Download,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  Shield,
  Calendar,
  DollarSign,
  RefreshCw,
  Brain,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Upload,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'

/* ============================================================
 * Tipos e constantes
 * ============================================================ */

/** Abas disponíveis na página de detalhe do contrato */
type Tab = 'overview' | 'clauses' | 'riskAnalysis' | 'benchmarks' | 'timeline'

/** Props do componente de detalhe de contrato */
interface ContractDetailProps {
  contractId: string
}

/** Tipo de nível de risco de uma cláusula */
type ClauseRisk = 'low' | 'medium' | 'high'

/** Tipo dos eventos da timeline */
type TimelineEventType = 'info' | 'success' | 'warning' | 'upcoming'

/** Tipo de ícone para eventos da timeline */
type TimelineIcon = 'upload' | 'brain' | 'check' | 'file' | 'chart' | 'alert' | 'refresh' | 'calendar'

/** Interface de cláusula contratual */
interface ContractClause {
  id: string
  title: string
  content: string
  risk: ClauseRisk
  section: string
  suggestion: string
}

/** Interface de evento da timeline */
interface TimelineEvent {
  date: string
  label: string
  icon: TimelineIcon
  type: TimelineEventType
}

/** Interface de benchmarks de mercado */
interface MarketBenchmarks {
  marketAvgPrice: number
  yourPrice: number
  percentile: number
  avgDiscount: number
  yourDiscount: number
  avgNoticePeriod: number
  yourNoticePeriod: number
  avgSlaUptime: number
  yourSlaUptime: number
}

/* ============================================================
 * Dados mock — simulação de contrato real
 * TODO: Substituir por dados do backend via tRPC
 * ============================================================ */

/**
 * Contrato mock completo representando um acordo empresarial
 * com AWS para infraestrutura em nuvem.
 */
const MOCK_CONTRACT = {
  name: 'AWS Enterprise License Agreement',
  vendor: 'Amazon Web Services',
  category: 'Cloud Infrastructure',
  startDate: '2025-06-01',
  endDate: '2026-06-01',
  totalValue: 156000,
  monthlyValue: 13000,
  autoRenew: true,
  noticePeriod: 60,
  status: 'completed' as 'analyzing' | 'completed' | 'failed',
  riskScore: 28,
  aiSummary:
    'This contract presents low-to-moderate risk. The pricing is competitive compared to market benchmarks for enterprise cloud services. Key attention areas include the auto-renewal clause with a 60-day notice period and the data residency provisions. The volume commitment discount of 15% is slightly below the market average of 18% for comparable usage levels. We recommend negotiating the notice period to 90 days and requesting an additional 3-5% volume discount.',
}

/**
 * Cláusulas extraídas e analisadas pela IA.
 * Cada cláusula possui título, conteúdo, nível de risco,
 * seção de referência e sugestão de melhoria.
 */
const MOCK_CLAUSES: ContractClause[] = [
  {
    id: 'cl1',
    title: 'Auto-Renewal Clause',
    content:
      'This agreement shall automatically renew for successive 12-month periods unless either party provides written notice of non-renewal at least 60 days prior to the end of the then-current term.',
    risk: 'medium',
    section: '§4.2',
    suggestion: 'Extend notice period to 90 days for more flexibility.',
  },
  {
    id: 'cl2',
    title: 'Price Escalation',
    content:
      'Provider reserves the right to increase pricing by up to 7% annually upon renewal. Customer will be notified 30 days prior to any price change.',
    risk: 'high',
    section: '§5.1',
    suggestion: 'Cap annual increases at 3-5% and require 60 days notice.',
  },
  {
    id: 'cl3',
    title: 'Data Residency',
    content:
      'Customer data will be stored in the region specified at time of provisioning. Provider may temporarily process data in other regions for disaster recovery purposes.',
    risk: 'medium',
    section: '§8.3',
    suggestion: 'Add clause requiring notification before cross-region data transfer.',
  },
  {
    id: 'cl4',
    title: 'Termination for Convenience',
    content:
      'Either party may terminate this agreement for convenience upon 90 days written notice. Early termination fees apply based on remaining commitment.',
    risk: 'low',
    section: '§12.1',
    suggestion: 'Standard clause, no changes needed.',
  },
  {
    id: 'cl5',
    title: 'Liability Cap',
    content:
      'Total aggregate liability shall not exceed the amounts paid under this agreement in the preceding 12-month period.',
    risk: 'low',
    section: '§14.2',
    suggestion: 'Favorable terms, liability is properly capped.',
  },
  {
    id: 'cl6',
    title: 'SLA & Credits',
    content:
      'Provider guarantees 99.99% monthly uptime. Service credits of 10% for each 0.1% below SLA target, capped at 30% of monthly charges.',
    risk: 'low',
    section: '§6.4',
    suggestion: 'Good SLA terms. Consider negotiating uncapped credits.',
  },
  {
    id: 'cl7',
    title: 'Volume Commitment',
    content:
      'Customer commits to minimum monthly spend of $10,000. Usage exceeding committed amount billed at standard rates minus 15% discount.',
    risk: 'medium',
    section: '§5.3',
    suggestion: 'Market average discount for this tier is 18%. Negotiate for better rate.',
  },
]

/**
 * Benchmarks de mercado para comparação com o contrato.
 * Dados simulados representando médias do setor de cloud.
 */
const MOCK_BENCHMARKS: MarketBenchmarks = {
  marketAvgPrice: 14200,
  yourPrice: 13000,
  percentile: 35,
  avgDiscount: 18,
  yourDiscount: 15,
  avgNoticePeriod: 90,
  yourNoticePeriod: 60,
  avgSlaUptime: 99.95,
  yourSlaUptime: 99.99,
}

/**
 * Eventos do ciclo de vida do contrato.
 * Inclui upload, análise, alertas e datas futuras.
 */
const MOCK_TIMELINE: TimelineEvent[] = [
  { date: '2025-06-01', label: 'Contract uploaded', icon: 'upload', type: 'info' },
  { date: '2025-06-01', label: 'AI analysis started', icon: 'brain', type: 'info' },
  { date: '2025-06-01', label: 'Analysis completed — Risk Score: 28/100', icon: 'check', type: 'success' },
  { date: '2025-06-02', label: '7 key clauses identified and categorized', icon: 'file', type: 'info' },
  { date: '2025-06-02', label: 'Market benchmark comparison generated', icon: 'chart', type: 'info' },
  { date: '2025-06-03', label: 'Price escalation clause flagged as high risk', icon: 'alert', type: 'warning' },
  { date: '2025-07-15', label: 'Renegotiation playbook generated', icon: 'refresh', type: 'success' },
  { date: '2026-04-01', label: 'Renewal notice deadline (60 days before expiry)', icon: 'calendar', type: 'upcoming' },
]

/* ============================================================
 * Funções utilitárias
 * ============================================================ */

/**
 * Retorna as classes de cor baseadas na pontuação de risco (0-100).
 *
 * Faixas definidas:
 * - 0-25: Verde (baixo risco)
 * - 26-50: Amarelo (risco médio)
 * - 51-75: Laranja (risco alto)
 * - 76-100: Vermelho (risco crítico)
 */
function getRiskColor(score: number) {
  if (score <= 25) return { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50', hex: '#10b981' }
  if (score <= 50) return { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-50', hex: '#eab308' }
  if (score <= 75) return { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50', hex: '#f97316' }
  return { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50', hex: '#ef4444' }
}

/**
 * Retorna a chave de tradução para o nível de risco
 * baseado na pontuação numérica.
 */
function getRiskLevelKey(score: number): string {
  if (score <= 25) return 'riskLow'
  if (score <= 50) return 'riskMedium'
  if (score <= 75) return 'riskHigh'
  return 'riskCritical'
}

/**
 * Retorna as classes de cor para o badge de risco de uma cláusula.
 * Utiliza cores visuais distintas para cada nível.
 */
function getClauseRiskStyles(risk: ClauseRisk) {
  switch (risk) {
    case 'low':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' }
    case 'medium':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }
    case 'high':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
  }
}

/**
 * Mapeia o ícone de texto da timeline para o componente Lucide correspondente.
 */
function getTimelineIcon(icon: TimelineIcon) {
  const iconMap = {
    upload: Upload,
    brain: Brain,
    check: CheckCircle2,
    file: FileText,
    chart: BarChart3,
    alert: AlertTriangle,
    refresh: RefreshCw,
    calendar: Calendar,
  }
  return iconMap[icon]
}

/**
 * Retorna as classes de cor para cada tipo de evento da timeline.
 * Eventos futuros (upcoming) possuem estilo visual diferenciado.
 */
function getTimelineTypeStyles(type: TimelineEventType) {
  switch (type) {
    case 'info':
      return { bg: 'bg-teal-50', text: 'text-teal-600', line: 'bg-teal-200' }
    case 'success':
      return { bg: 'bg-emerald-50', text: 'text-emerald-600', line: 'bg-emerald-200' }
    case 'warning':
      return { bg: 'bg-amber-50', text: 'text-amber-600', line: 'bg-amber-200' }
    case 'upcoming':
      return { bg: 'bg-sky-50', text: 'text-sky-600', line: 'bg-sky-200' }
  }
}

/* ============================================================
 * Animações — variantes Framer Motion reutilizáveis
 * ============================================================ */

/** Animação de fade-in com deslocamento vertical */
const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

/** Animação de stagger para listas de itens */
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

/** Item individual do stagger (usado em listas) */
const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

/* ============================================================
 * Componente principal — ContractDetail
 * ============================================================ */

/**
 * Componente de detalhe de contrato.
 *
 * Exibe informações completas de um contrato específico com:
 * - Navegação por 5 abas (Overview, Cláusulas, Análise de Risco, Benchmarks, Timeline)
 * - Ações rápidas (download, renegociar, excluir)
 * - Breadcrumb hierárquico para navegação
 * - Status de processamento com indicador visual
 * - Dados mock ricos simulando um contrato empresarial real
 */
export function ContractDetail({ contractId }: ContractDetailProps) {
  const t = useTranslations('contractDetail')
  const tContracts = useTranslations('contracts')

  /** Aba ativa selecionada pelo usuário */
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  /** TODO: Buscar dados reais do contrato pelo contractId */
  const contract = MOCK_CONTRACT
  const riskColor = getRiskColor(contract.riskScore)

  /** Definição das 5 abas de navegação */
  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: t('overview') },
    { key: 'clauses', label: t('clauses') },
    { key: 'riskAnalysis', label: t('riskAnalysis') },
    { key: 'benchmarks', label: t('benchmarks') },
    { key: 'timeline', label: t('timeline') },
  ]

  return (
    <div className="space-y-6">
      {/* Breadcrumb — navegação hierárquica */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link
          href="/dashboard/contracts"
          className="hover:text-teal-600 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          {tContracts('title')}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{contract.name}</span>
      </div>

      {/* Cabeçalho — título do contrato, badge de status e ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Ícone do contrato */}
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center">
            <FileText className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{contract.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {/* Badge de status de processamento do contrato */}
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full',
                  contract.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700'
                    : contract.status === 'analyzing'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-red-50 text-red-700'
                )}
              >
                {/* Spinner animado durante análise */}
                {contract.status === 'analyzing' && (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                )}
                {t(contract.status)}
              </span>
              {/* Mini indicador de risco inline no cabeçalho */}
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
                  riskColor.light,
                  riskColor.text
                )}
              >
                <Shield className="h-3 w-3" />
                {contract.riskScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* Botões de ação do contrato */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl border-slate-200 gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">{t('download')}</span>
          </Button>
          <Link href={`/dashboard/contracts/${contractId}/renegotiate`}>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2">
              <RefreshCw className="h-4 w-4" />
              {t('renegotiate')}
            </Button>
          </Link>
          <Button
            variant="outline"
            className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 gap-2"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('delete')}</span>
          </Button>
        </div>
      </div>

      {/* Navegação por abas — barra horizontal com indicador */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap',
                activeTab === tab.key
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo da aba ativa — renderizado com AnimatePresence para transições */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" {...fadeInUp} transition={{ duration: 0.25 }}>
            <OverviewTab contract={contract} riskColor={riskColor} t={t} />
          </motion.div>
        )}
        {activeTab === 'clauses' && (
          <motion.div key="clauses" {...fadeInUp} transition={{ duration: 0.25 }}>
            <ClausesTab t={t} />
          </motion.div>
        )}
        {activeTab === 'riskAnalysis' && (
          <motion.div key="riskAnalysis" {...fadeInUp} transition={{ duration: 0.25 }}>
            <RiskAnalysisTab contract={contract} riskColor={riskColor} t={t} />
          </motion.div>
        )}
        {activeTab === 'benchmarks' && (
          <motion.div key="benchmarks" {...fadeInUp} transition={{ duration: 0.25 }}>
            <BenchmarksTab />
          </motion.div>
        )}
        {activeTab === 'timeline' && (
          <motion.div key="timeline" {...fadeInUp} transition={{ duration: 0.25 }}>
            <TimelineTab t={t} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ============================================================
 * Componentes internos — Abas
 * ============================================================ */

/**
 * Aba de Overview — visão geral completa do contrato.
 *
 * Inclui:
 * - Grid 2x4 com informações essenciais (vendor, datas, valores, etc.)
 * - Card separado com resumo gerado pela IA
 * - Indicador visual de risco inline
 */
function OverviewTab({
  contract,
  riskColor,
  t,
}: {
  contract: typeof MOCK_CONTRACT
  riskColor: ReturnType<typeof getRiskColor>
  t: ReturnType<typeof useTranslations<'contractDetail'>>
}) {
  /** Campos de informação organizados para o grid de overview */
  const infoFields = [
    {
      label: t('vendor'),
      value: contract.vendor,
      icon: FileText,
    },
    {
      label: t('category'),
      value: contract.category,
      icon: Shield,
    },
    {
      label: t('startDate'),
      value: new Date(contract.startDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      icon: Calendar,
    },
    {
      label: t('endDate'),
      value: new Date(contract.endDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      icon: Calendar,
    },
    {
      label: t('totalValue'),
      value: `$${contract.totalValue.toLocaleString()}`,
      icon: DollarSign,
    },
    {
      label: t('monthlyValue'),
      value: `$${contract.monthlyValue.toLocaleString()}`,
      icon: DollarSign,
    },
    {
      label: t('autoRenew'),
      value: contract.autoRenew ? t('yes') : t('no'),
      icon: RefreshCw,
    },
    {
      label: t('noticePeriod'),
      value: `${contract.noticePeriod} ${t('days')}`,
      icon: AlertTriangle,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Card principal — informações do contrato em grid */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">
          {t('overview')}
        </h2>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {infoFields.map((field) => {
            const Icon = field.icon
            return (
              <motion.div
                key={field.label}
                variants={staggerItem}
                transition={{ duration: 0.3 }}
                className="space-y-1.5 p-3 rounded-xl bg-slate-50/50 border border-slate-100"
              >
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <Icon className="h-3.5 w-3.5" />
                  {field.label}
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {field.value}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Card de resumo da IA com indicador de risco */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
              <Brain className="h-4 w-4 text-teal-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t('aiSummary')}
            </h2>
          </div>
          {/* Mini gauge de risco inline */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full',
                riskColor.light,
                riskColor.text
              )}
            >
              <Shield className="h-3.5 w-3.5" />
              {t('riskScore')}: {contract.riskScore}/100
            </span>
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          {contract.aiSummary}
        </p>
      </div>
    </div>
  )
}

/**
 * Aba de Cláusulas — lista completa de cláusulas analisadas.
 *
 * Cada cláusula exibe:
 * - Número da seção contratual (ex: §4.2)
 * - Título com badge de nível de risco colorido
 * - Conteúdo expansível/colapsável
 * - Sugestão de melhoria gerada pela IA
 * - Animação de entrada stagger para experiência fluida
 */
function ClausesTab({
  t,
}: {
  t: ReturnType<typeof useTranslations<'contractDetail'>>
}) {
  /** Estado de expansão individual de cada cláusula */
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(new Set())

  /** Alterna a expansão/colapso de uma cláusula específica */
  const toggleClause = (id: string) => {
    setExpandedClauses((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  /** Verifica se há cláusulas para exibir */
  const hasClauses = MOCK_CLAUSES.length > 0

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] p-6">
      {hasClauses ? (
        <>
          {/* Cabeçalho da seção de cláusulas com contagem */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              {t('clauses')}
            </h2>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {MOCK_CLAUSES.length} {t('clausesFound')}
            </span>
          </div>

          {/* Lista de cláusulas com animação stagger */}
          <motion.div
            className="space-y-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {MOCK_CLAUSES.map((clause) => {
              const riskStyles = getClauseRiskStyles(clause.risk)
              const isExpanded = expandedClauses.has(clause.id)

              return (
                <motion.div
                  key={clause.id}
                  variants={staggerItem}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    'rounded-xl border transition-all duration-200',
                    isExpanded
                      ? 'border-slate-200 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]'
                      : 'border-slate-100 hover:border-slate-200'
                  )}
                >
                  {/* Cabeçalho da cláusula — sempre visível */}
                  <button
                    onClick={() => toggleClause(clause.id)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Número da seção contratual */}
                      <span className="text-xs font-mono font-medium text-slate-400 shrink-0">
                        {clause.section}
                      </span>
                      {/* Título da cláusula */}
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {clause.title}
                      </span>
                      {/* Badge de nível de risco */}
                      <span
                        className={cn(
                          'inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0',
                          riskStyles.bg,
                          riskStyles.text,
                          riskStyles.border
                        )}
                      >
                        {t(`clauseRisk_${clause.risk}`)}
                      </span>
                    </div>
                    {/* Ícone de expandir/colapsar */}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                    )}
                  </button>

                  {/* Conteúdo expandido da cláusula */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3">
                          {/* Texto completo da cláusula */}
                          <p className="text-sm text-slate-600 leading-relaxed pl-[calc(theme(spacing.3)+theme(spacing.6))]">
                            {clause.content}
                          </p>

                          {/* Sugestão da IA com destaque visual */}
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50/60 border border-amber-100 ml-[calc(theme(spacing.3)+theme(spacing.6))]">
                            <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 leading-relaxed">
                              {clause.suggestion}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </motion.div>
        </>
      ) : (
        /* Estado vazio — nenhuma cláusula extraída */
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6">
            <FileText className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {t('noClauses')}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {t('noClausesDescription')}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Aba de Análise de Risco — exibe pontuação e detalhamento do risco.
 *
 * Inclui:
 * - Gauge SVG semicircular animado (0-100)
 * - Badge de nível de risco
 * - Breakdown de risco por categoria (Pricing, Terms, Compliance, Data)
 * - Resumo da IA com termos-chave destacados
 */
function RiskAnalysisTab({
  contract,
  riskColor,
  t,
}: {
  contract: typeof MOCK_CONTRACT
  riskColor: ReturnType<typeof getRiskColor>
  t: ReturnType<typeof useTranslations<'contractDetail'>>
}) {
  /** Chave de tradução do nível de risco atual */
  const riskLevelKey = getRiskLevelKey(contract.riskScore)

  /**
   * Categorias de risco com pontuações individuais.
   * Cada categoria tem peso diferente na composição do score total.
   */
  const riskBreakdown = [
    { labelKey: 'pricingRisk' as const, score: 35, maxScore: 100, color: 'bg-amber-500' },
    { labelKey: 'termsRisk' as const, score: 22, maxScore: 100, color: 'bg-teal-500' },
    { labelKey: 'complianceRisk' as const, score: 15, maxScore: 100, color: 'bg-emerald-500' },
    { labelKey: 'dataRisk' as const, score: 30, maxScore: 100, color: 'bg-orange-500' },
  ]

  /**
   * Cálculo do arco SVG para o gauge semicircular.
   * O gauge vai de 0 a 180 graus, mapeado para scores de 0 a 100.
   */
  const radius = 80
  const circumference = Math.PI * radius
  const progress = (contract.riskScore / 100) * circumference

  return (
    <div className="space-y-6">
      {/* Card do score de risco com gauge SVG */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">
          {t('riskScore')}
        </h2>

        <div className="flex flex-col items-center gap-4">
          {/* Gauge semicircular renderizado com SVG */}
          <div className="relative w-52 h-28">
            <svg
              viewBox="0 0 200 110"
              className="w-full h-full"
            >
              {/* Arco de fundo (cinza claro) */}
              <path
                d="M 10 100 A 80 80 0 0 1 190 100"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Arco preenchido conforme a pontuação */}
              <motion.path
                d="M 10 100 A 80 80 0 0 1 190 100"
                fill="none"
                stroke={riskColor.hex}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - progress }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            {/* Valor numérico centralizado sobre o gauge */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
              <motion.span
                className={cn('text-3xl font-bold', riskColor.text)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {contract.riskScore}
              </motion.span>
              <span className="text-sm text-slate-400">/100</span>
            </div>
          </div>

          {/* Badge de nível de risco */}
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full',
              riskColor.light,
              riskColor.text
            )}
          >
            <Shield className="h-4 w-4" />
            {t(riskLevelKey)}
          </span>
        </div>
      </div>

      {/* Card de breakdown de risco por categoria */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">
          {t('riskBreakdown')}
        </h2>
        <div className="space-y-5">
          {riskBreakdown.map((category) => (
            <div key={category.labelKey} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  {t(category.labelKey)}
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {category.score}/{category.maxScore}
                </span>
              </div>
              {/* Barra de progresso da categoria */}
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  className={cn('h-full rounded-full', category.color)}
                  initial={{ width: 0 }}
                  animate={{ width: `${(category.score / category.maxScore) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card do resumo da IA com termos-chave em destaque */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
            <Brain className="h-4 w-4 text-teal-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            {t('aiSummary')}
          </h2>
        </div>
        {/* Resumo com termos-chave destacados usando marcação visual */}
        <p className="text-sm text-slate-600 leading-relaxed">
          {t.rich('riskAiSummaryDetailed', {
            green: (chunks) => <span className="font-semibold text-emerald-600">{chunks}</span>,
            amber: (chunks) => <span className="font-semibold text-amber-600">{chunks}</span>,
            red: (chunks) => <span className="font-semibold text-red-600">{chunks}</span>,
            teal: (chunks) => <span className="font-semibold text-teal-600">{chunks}</span>,
          })}
        </p>
      </div>
    </div>
  )
}

/**
 * Aba de Benchmarks — comparação com médias de mercado.
 *
 * Exibe 4 métricas lado a lado:
 * - Monthly Price (preço mensal)
 * - Volume Discount (desconto por volume)
 * - Notice Period (período de aviso)
 * - SLA Uptime (disponibilidade garantida)
 *
 * Cada métrica mostra o valor do contrato vs média de mercado
 * com barras visuais de comparação e badges indicando posição.
 */
function BenchmarksTab() {
  const t = useTranslations('contractDetail')
  const benchmarks = MOCK_BENCHMARKS

  /**
   * Definição das 4 métricas de benchmark.
   * Cada métrica possui lógica própria para determinar se o valor
   * do contrato é favorável, neutro ou desfavorável em relação ao mercado.
   */
  const metrics = [
    {
      label: t('benchmarkMonthlyPrice'),
      yours: `$${benchmarks.yourPrice.toLocaleString()}`,
      market: `$${benchmarks.marketAvgPrice.toLocaleString()}`,
      /* Para preço, menor é melhor */
      yoursPercent: (benchmarks.yourPrice / benchmarks.marketAvgPrice) * 100,
      marketPercent: 100,
      status: benchmarks.yourPrice < benchmarks.marketAvgPrice
        ? 'below'
        : benchmarks.yourPrice > benchmarks.marketAvgPrice
          ? 'above'
          : 'at',
      /* Invertido: abaixo do mercado é bom para preço */
      favorable: benchmarks.yourPrice <= benchmarks.marketAvgPrice,
    },
    {
      label: t('benchmarkVolumeDiscount'),
      yours: `${benchmarks.yourDiscount}%`,
      market: `${benchmarks.avgDiscount}%`,
      /* Para desconto, maior é melhor */
      yoursPercent: (benchmarks.yourDiscount / benchmarks.avgDiscount) * 100,
      marketPercent: 100,
      status: benchmarks.yourDiscount > benchmarks.avgDiscount
        ? 'above'
        : benchmarks.yourDiscount < benchmarks.avgDiscount
          ? 'below'
          : 'at',
      /* Para desconto, acima do mercado é bom */
      favorable: benchmarks.yourDiscount >= benchmarks.avgDiscount,
    },
    {
      label: t('benchmarkNoticePeriod'),
      yours: `${benchmarks.yourNoticePeriod} ${t('days')}`,
      market: `${benchmarks.avgNoticePeriod} ${t('days')}`,
      /* Para período de aviso, maior é melhor (mais tempo de preparação) */
      yoursPercent: (benchmarks.yourNoticePeriod / benchmarks.avgNoticePeriod) * 100,
      marketPercent: 100,
      status: benchmarks.yourNoticePeriod > benchmarks.avgNoticePeriod
        ? 'above'
        : benchmarks.yourNoticePeriod < benchmarks.avgNoticePeriod
          ? 'below'
          : 'at',
      /* Para notice period, acima do mercado é bom (mais tempo) */
      favorable: benchmarks.yourNoticePeriod >= benchmarks.avgNoticePeriod,
    },
    {
      label: t('benchmarkSlaUptime'),
      yours: `${benchmarks.yourSlaUptime}%`,
      market: `${benchmarks.avgSlaUptime}%`,
      /* Para SLA, maior é melhor — escala ajustada para 99-100% */
      yoursPercent: ((benchmarks.yourSlaUptime - 99) / 1) * 100,
      marketPercent: ((benchmarks.avgSlaUptime - 99) / 1) * 100,
      status: benchmarks.yourSlaUptime > benchmarks.avgSlaUptime
        ? 'above'
        : benchmarks.yourSlaUptime < benchmarks.avgSlaUptime
          ? 'below'
          : 'at',
      /* Para SLA, acima é bom */
      favorable: benchmarks.yourSlaUptime >= benchmarks.avgSlaUptime,
    },
  ]

  /**
   * Retorna o estilo e label do badge de status do benchmark.
   * Verde = favorável, vermelho = desfavorável, cinza = neutro.
   */
  const getStatusBadge = (status: string, favorable: boolean) => {
    if (status === 'at') {
      return { label: t('benchmarkAtMarket'), bg: 'bg-slate-100', text: 'text-slate-600', icon: Minus }
    }
    if (favorable) {
      return { label: t('benchmarkBelowMarket'), bg: 'bg-emerald-50', text: 'text-emerald-700', icon: TrendingDown }
    }
    return { label: t('benchmarkAboveMarket'), bg: 'bg-red-50', text: 'text-red-700', icon: TrendingUp }
  }

  return (
    <div className="space-y-6">
      {/* Card de ranking percentil */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
            <Zap className="h-4 w-4 text-teal-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            {t('benchmarkPercentileRanking')}
          </h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          {t.rich('benchmarkPercentileDescription', {
            percentile: benchmarks.percentile,
            bold: (chunks) => <span className="font-semibold text-teal-600">{chunks}</span>,
          })}
        </p>
        {/* Barra visual de percentil com marcador de posição */}
        <div className="relative h-3 rounded-full bg-gradient-to-r from-red-200 via-amber-200 to-emerald-200 overflow-visible">
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-teal-600 shadow-md"
            initial={{ left: '0%' }}
            animate={{ left: `${benchmarks.percentile}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ marginLeft: '-10px' }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
          <span>{t('benchmarkExpensive')}</span>
          <span>{t('benchmarkAverage')}</span>
          <span>{t('benchmarkCostEffective')}</span>
        </div>
      </div>

      {/* Grid de métricas de benchmark — comparação direta */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {metrics.map((metric) => {
          const badge = getStatusBadge(metric.status, metric.favorable)
          const BadgeIcon = badge.icon

          return (
            <motion.div
              key={metric.label}
              variants={staggerItem}
              transition={{ duration: 0.3 }}
              className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] p-5"
            >
              {/* Título da métrica com badge de posição */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900">{metric.label}</h3>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full',
                    badge.bg,
                    badge.text
                  )}
                >
                  <BadgeIcon className="h-3 w-3" />
                  {badge.label}
                </span>
              </div>

              {/* Comparação visual com barras de progresso */}
              <div className="space-y-3">
                {/* Barra do contrato atual */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{t('benchmarkYourContract')}</span>
                    <span className="text-xs font-semibold text-slate-900">{metric.yours}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-teal-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(metric.yoursPercent, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Barra da média de mercado */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{t('benchmarkMarketAverage')}</span>
                    <span className="text-xs font-semibold text-slate-500">{metric.market}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-slate-300"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(metric.marketPercent, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

/**
 * Aba de Timeline — histórico completo de eventos do contrato.
 *
 * Exibe 8 eventos em timeline vertical, cada um com:
 * - Ícone específico por tipo de evento
 * - Cores diferenciadas por status (info, success, warning, upcoming)
 * - Data formatada em inglês
 * - Eventos futuros com estilo visual pontilhado/translúcido
 */
function TimelineTab({
  t,
}: {
  t: ReturnType<typeof useTranslations<'contractDetail'>>
}) {
  /** Data atual para determinar quais eventos são futuros */
  const now = new Date()

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-6">
        {t('timeline')}
      </h2>

      {/* Timeline vertical com animação stagger */}
      <motion.div
        className="relative"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {MOCK_TIMELINE.map((event, index) => {
          const Icon = getTimelineIcon(event.icon)
          const typeStyles = getTimelineTypeStyles(event.type)
          /** Verifica se o evento é futuro para aplicar estilo diferenciado */
          const isFuture = new Date(event.date) > now
          /** Último item não precisa de linha conectora */
          const isLast = index === MOCK_TIMELINE.length - 1

          return (
            <motion.div
              key={`${event.date}-${index}`}
              variants={staggerItem}
              transition={{ duration: 0.3 }}
              className={cn(
                'flex gap-4',
                isFuture && 'opacity-60'
              )}
            >
              {/* Coluna do indicador visual (ícone + linha conectora) */}
              <div className="flex flex-col items-center">
                {/* Círculo com ícone do evento */}
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
                    isFuture ? 'border-2 border-dashed border-sky-300 bg-white' : typeStyles.bg
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4',
                      isFuture ? 'text-sky-400' : typeStyles.text
                    )}
                  />
                </div>
                {/* Linha conectora entre eventos */}
                {!isLast && (
                  <div
                    className={cn(
                      'w-px flex-1 min-h-[24px] mt-2',
                      isFuture ? 'border-l-2 border-dashed border-sky-200' : typeStyles.line
                    )}
                  />
                )}
              </div>

              {/* Conteúdo textual do evento */}
              <div className="pb-6 pt-1.5 min-w-0">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isFuture ? 'text-slate-500 italic' : 'text-slate-900'
                  )}
                >
                  {event.label}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <p className="text-xs text-slate-400">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  {/* Indicador visual para eventos futuros */}
                  {isFuture && (
                    <span className="text-[10px] font-medium text-sky-500 bg-sky-50 px-1.5 py-0.5 rounded-full">
                      {t('upcoming')}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
