'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
  Search,
  Upload,
  FileText,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Calendar,
  DollarSign,
  Shield,
  ShieldAlert,
  ShieldX,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────────────────────────────────
 * Tipos
 * ───────────────────────────────────────────────────────────────────────────── */

/** Status possíveis de um contrato */
type ContractStatus = 'active' | 'expired' | 'analyzing'

/** Estrutura de um contrato na listagem */
interface Contract {
  id: string
  name: string
  vendor: string
  category: string
  riskScore: number
  status: ContractStatus
  value: number
  startDate: string
  endDate: string
  monthlyValue: number
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Dados mock realistas
 * ───────────────────────────────────────────────────────────────────────────── */

const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'c1',
    name: 'AWS Enterprise License',
    vendor: 'Amazon Web Services',
    category: 'Cloud Infrastructure',
    riskScore: 28,
    status: 'active',
    value: 156000,
    startDate: '2025-06-01',
    endDate: '2026-06-01',
    monthlyValue: 13000,
  },
  {
    id: 'c2',
    name: 'Salesforce CRM Suite',
    vendor: 'Salesforce',
    category: 'CRM',
    riskScore: 65,
    status: 'active',
    value: 84000,
    startDate: '2025-03-15',
    endDate: '2026-03-15',
    monthlyValue: 7000,
  },
  {
    id: 'c3',
    name: 'Office 365 Business',
    vendor: 'Microsoft',
    category: 'Productivity',
    riskScore: 15,
    status: 'active',
    value: 36000,
    startDate: '2025-01-01',
    endDate: '2026-01-01',
    monthlyValue: 3000,
  },
  {
    id: 'c4',
    name: 'Slack Enterprise Grid',
    vendor: 'Slack Technologies',
    category: 'Communication',
    riskScore: 42,
    status: 'analyzing',
    value: 24000,
    startDate: '2025-09-01',
    endDate: '2026-09-01',
    monthlyValue: 2000,
  },
  {
    id: 'c5',
    name: 'Zoom Business Plus',
    vendor: 'Zoom Video',
    category: 'Communication',
    riskScore: 71,
    status: 'active',
    value: 18000,
    startDate: '2025-04-01',
    endDate: '2026-04-01',
    monthlyValue: 1500,
  },
  {
    id: 'c6',
    name: 'HubSpot Marketing Hub',
    vendor: 'HubSpot',
    category: 'Marketing',
    riskScore: 33,
    status: 'active',
    value: 48000,
    startDate: '2025-07-01',
    endDate: '2026-07-01',
    monthlyValue: 4000,
  },
  {
    id: 'c7',
    name: 'Jira Cloud Premium',
    vendor: 'Atlassian',
    category: 'Project Management',
    riskScore: 22,
    status: 'active',
    value: 12000,
    startDate: '2025-02-01',
    endDate: '2026-02-01',
    monthlyValue: 1000,
  },
  {
    id: 'c8',
    name: 'Datadog Enterprise',
    vendor: 'Datadog',
    category: 'Monitoring',
    riskScore: 55,
    status: 'expired',
    value: 72000,
    startDate: '2024-08-01',
    endDate: '2025-08-01',
    monthlyValue: 6000,
  },
  {
    id: 'c9',
    name: 'GitHub Enterprise',
    vendor: 'GitHub',
    category: 'Developer Tools',
    riskScore: 18,
    status: 'active',
    value: 21000,
    startDate: '2025-05-01',
    endDate: '2026-05-01',
    monthlyValue: 1750,
  },
  {
    id: 'c10',
    name: 'Snowflake Data Cloud',
    vendor: 'Snowflake',
    category: 'Data Platform',
    riskScore: 48,
    status: 'active',
    value: 96000,
    startDate: '2025-10-01',
    endDate: '2026-10-01',
    monthlyValue: 8000,
  },
]

/** Quantidade de contratos exibidos por página */
const ITEMS_PER_PAGE = 5

/* ─────────────────────────────────────────────────────────────────────────────
 * Funções utilitárias
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Classifica o nível de risco com base na pontuação numérica.
 * - 0–25: baixo
 * - 26–50: médio
 * - 51–75: alto
 * - 76–100: crítico
 */
function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score <= 25) return 'low'
  if (score <= 50) return 'medium'
  if (score <= 75) return 'high'
  return 'critical'
}

/**
 * Retorna as classes CSS para a barra de progresso e texto do risco,
 * baseado no nível calculado.
 */
function getRiskStyles(score: number) {
  const level = getRiskLevel(score)
  const map = {
    low: {
      bar: 'bg-emerald-500',
      text: 'text-emerald-700',
      bg: 'bg-emerald-50',
    },
    medium: {
      bar: 'bg-amber-500',
      text: 'text-amber-700',
      bg: 'bg-amber-50',
    },
    high: {
      bar: 'bg-orange-500',
      text: 'text-orange-700',
      bg: 'bg-orange-50',
    },
    critical: {
      bar: 'bg-red-500',
      text: 'text-red-700',
      bg: 'bg-red-50',
    },
  }
  return map[level]
}

/**
 * Retorna as classes CSS e o ícone correspondente ao status do contrato.
 */
function getStatusConfig(status: ContractStatus) {
  const map = {
    active: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
    },
    analyzing: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    },
    expired: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      dot: 'bg-red-500',
    },
  }
  return map[status]
}

/**
 * Formata um valor numérico como moeda USD.
 * Ex: 156000 => "$156,000"
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
 * Formata uma data ISO para exibição curta.
 * Ex: "2026-06-01" => "Jun 1, 2026"
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

/**
 * Calcula a diferença em dias entre a data informada e hoje.
 * Retorna negativo se a data já passou.
 */
function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffMs = target.getTime() - today.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Retorna a cor de fundo do badge de categoria.
 * Cada categoria recebe uma combinação única.
 */
function getCategoryStyles(category: string) {
  const categoryMap: Record<string, { bg: string; text: string }> = {
    'Cloud Infrastructure': { bg: 'bg-sky-50', text: 'text-sky-700' },
    CRM: { bg: 'bg-violet-50', text: 'text-violet-700' },
    Productivity: { bg: 'bg-blue-50', text: 'text-blue-700' },
    Communication: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
    Marketing: { bg: 'bg-pink-50', text: 'text-pink-700' },
    'Project Management': { bg: 'bg-teal-50', text: 'text-teal-700' },
    Monitoring: { bg: 'bg-orange-50', text: 'text-orange-700' },
    'Developer Tools': { bg: 'bg-slate-100', text: 'text-slate-700' },
    'Data Platform': { bg: 'bg-cyan-50', text: 'text-cyan-700' },
  }
  return categoryMap[category] ?? { bg: 'bg-slate-50', text: 'text-slate-700' }
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Animações Framer Motion
 * ───────────────────────────────────────────────────────────────────────────── */

/** Container com stagger para animar linhas da tabela */
const tableContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

/** Variante de cada linha da tabela */
const tableRowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Componente principal
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Lista de contratos do dashboard.
 *
 * Funcionalidades:
 * - Busca por nome ou fornecedor (client-side)
 * - Filtros por status e nível de risco (pills interativas)
 * - Tabela responsiva com dados mock
 * - Animações de entrada stagger com Framer Motion
 * - Paginação com 5 itens por página
 * - Estado vazio quando não há resultados
 */
export function ContractsList() {
  const t = useTranslations('contracts')
  const tDash = useTranslations('dashboard')

  /* ── Estado local ──────────────────────────────────────────────────────── */

  /** Texto de busca digitado pelo usuário */
  const [searchQuery, setSearchQuery] = useState('')

  /** Filtro de status selecionado */
  const [statusFilter, setStatusFilter] = useState<string>('all')

  /** Filtro de nível de risco selecionado */
  const [riskFilter, setRiskFilter] = useState<string>('all')

  /** Página atual da paginação */
  const [currentPage, setCurrentPage] = useState(1)

  /* ── Opções de filtro ──────────────────────────────────────────────────── */

  /** Opções de filtro por status com chaves de tradução */
  const statusOptions = [
    { value: 'all', labelKey: 'all' as const },
    { value: 'active', labelKey: 'active' as const },
    { value: 'expired', labelKey: 'expired' as const },
    { value: 'analyzing', labelKey: 'analyzing' as const },
  ]

  /** Opções de filtro por risco com chaves de tradução */
  const riskOptions = [
    { value: 'all', labelKey: 'all' as const },
    { value: 'low', labelKey: 'lowRisk' as const },
    { value: 'medium', labelKey: 'mediumRisk' as const },
    { value: 'high', labelKey: 'highRisk' as const },
    { value: 'critical', labelKey: 'criticalRisk' as const },
  ]

  /* ── Ícones de risco para os filtros ───────────────────────────────────── */

  /** Mapa de ícones por nível de risco */
  const riskIcons: Record<string, typeof Shield> = {
    all: Shield,
    low: ShieldCheck,
    medium: ShieldAlert,
    high: ShieldAlert,
    critical: ShieldX,
  }

  /* ── Filtragem e paginação ─────────────────────────────────────────────── */

  /**
   * Lista de contratos filtrada por busca, status e risco.
   * Recalculada automaticamente quando qualquer filtro muda.
   */
  const filteredContracts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()

    return MOCK_CONTRACTS.filter((contract) => {
      /* Filtro de busca — por nome ou fornecedor */
      if (query) {
        const matchesName = contract.name.toLowerCase().includes(query)
        const matchesVendor = contract.vendor.toLowerCase().includes(query)
        if (!matchesName && !matchesVendor) return false
      }

      /* Filtro de status */
      if (statusFilter !== 'all' && contract.status !== statusFilter) {
        return false
      }

      /* Filtro de risco */
      if (riskFilter !== 'all') {
        const level = getRiskLevel(contract.riskScore)
        if (level !== riskFilter) return false
      }

      return true
    })
  }, [searchQuery, statusFilter, riskFilter])

  /** Total de páginas com base nos contratos filtrados */
  const totalPages = Math.max(1, Math.ceil(filteredContracts.length / ITEMS_PER_PAGE))

  /**
   * Quando os filtros mudam e a página atual extrapola, volta à primeira.
   * Usamos o cálculo diretamente ao fatiar para evitar efeitos colaterais.
   */
  const safePage = Math.min(currentPage, totalPages)

  /** Contratos da página atual */
  const paginatedContracts = filteredContracts.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  )

  /** Contagem de contratos ativos para o resumo */
  const activeCount = filteredContracts.filter((c) => c.status === 'active').length

  /** Contagem de contratos em risco (score > 50) para o resumo */
  const atRiskCount = filteredContracts.filter((c) => c.riskScore > 50).length

  /** Indica se há contratos para exibir após filtragem */
  const hasResults = filteredContracts.length > 0

  /* ── Handlers ──────────────────────────────────────────────────────────── */

  /** Atualiza a busca e reseta para a primeira página */
  function handleSearchChange(value: string) {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  /** Atualiza o filtro de status e reseta para a primeira página */
  function handleStatusFilter(value: string) {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  /** Atualiza o filtro de risco e reseta para a primeira página */
  function handleRiskFilter(value: string) {
    setRiskFilter(value)
    setCurrentPage(1)
  }

  /** Navega para a página anterior */
  function goToPreviousPage() {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  /** Navega para a próxima página */
  function goToNextPage() {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  /* ── Renderização ──────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* ── Cabeçalho com título e botão de upload ──────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
        <Link href="/dashboard/contracts/new">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2">
            <Upload className="h-4 w-4" />
            {t('upload')}
          </Button>
        </Link>
      </div>

      {/* ── Barra de busca ─────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="search"
          placeholder={t('search')}
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 rounded-xl border-slate-200 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
        />
      </div>

      {/* ── Filtros por status (pills) ─────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mr-1">
            {t('filterStatus')}
          </span>
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusFilter(option.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border',
                statusFilter === option.value
                  ? 'bg-teal-600 text-white border-teal-600 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              {t(option.labelKey)}
            </button>
          ))}
        </div>

        {/* ── Filtros por risco (pills) ────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mr-1">
            {t('filterRisk')}
          </span>
          {riskOptions.map((option) => {
            const RiskIcon = riskIcons[option.value]
            return (
              <button
                key={option.value}
                onClick={() => handleRiskFilter(option.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border inline-flex items-center gap-1.5',
                  riskFilter === option.value
                    ? 'bg-teal-600 text-white border-teal-600 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                <RiskIcon className="h-3 w-3" />
                {t(option.labelKey)}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Resumo dos resultados ──────────────────────────────────────── */}
      {hasResults && (
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <FileText className="h-4 w-4" />
          <span>
            Showing{' '}
            <span className="font-semibold text-slate-700">
              {filteredContracts.length}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-700">
              {MOCK_CONTRACTS.length}
            </span>{' '}
            contracts
          </span>
          <span className="text-slate-300 mx-1">&#8226;</span>
          <span>
            <span className="font-semibold text-emerald-600">{activeCount}</span>{' '}
            active
          </span>
          <span className="text-slate-300 mx-1">&#8226;</span>
          <span>
            <span className="font-semibold text-orange-600">{atRiskCount}</span>{' '}
            at risk
          </span>
        </div>
      )}

      {/* ── Conteúdo principal ─────────────────────────────────────────── */}
      {hasResults ? (
        <>
          {/* Tabela de contratos */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] overflow-hidden">
            <table className="w-full">
              {/* Cabeçalho da tabela */}
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('title')}
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                    {t('category')}
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('riskScore')}
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                    {t('value')}
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                    {t('endDate')}
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>

              {/* Corpo da tabela com animação stagger */}
              <motion.tbody
                className="divide-y divide-slate-100"
                variants={tableContainerVariants}
                initial="hidden"
                animate="visible"
                key={`${statusFilter}-${riskFilter}-${searchQuery}-${safePage}`}
              >
                {paginatedContracts.map((contract) => {
                  const riskStyles = getRiskStyles(contract.riskScore)
                  const statusConfig = getStatusConfig(contract.status)
                  const categoryStyles = getCategoryStyles(contract.category)
                  const remainingDays = daysUntil(contract.endDate)
                  const isExpiringSoon =
                    remainingDays > 0 && remainingDays <= 30 && contract.status !== 'expired'

                  return (
                    <motion.tr
                      key={contract.id}
                      variants={tableRowVariants}
                      className="group hover:bg-slate-50/80 transition-colors duration-150 cursor-pointer"
                    >
                      {/* Coluna: Nome do contrato + fornecedor */}
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/contracts/${contract.id}`}
                          className="block"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-50 transition-colors duration-150">
                              <FileText className="h-4 w-4 text-slate-500 group-hover:text-teal-600 transition-colors duration-150" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-teal-700 transition-colors duration-150">
                                {contract.name}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {contract.vendor}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </td>

                      {/* Coluna: Categoria (badge colorido) */}
                      <td className="px-6 py-4 hidden md:table-cell">
                        <Link
                          href={`/dashboard/contracts/${contract.id}`}
                          className="block"
                        >
                          <span
                            className={cn(
                              'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium',
                              categoryStyles.bg,
                              categoryStyles.text
                            )}
                          >
                            {contract.category}
                          </span>
                        </Link>
                      </td>

                      {/* Coluna: Pontuação de risco + barra de progresso */}
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/contracts/${contract.id}`}
                          className="block"
                        >
                          <div className="flex items-center gap-3 min-w-[120px]">
                            <span
                              className={cn(
                                'text-sm font-bold tabular-nums',
                                riskStyles.text
                              )}
                            >
                              {contract.riskScore}
                            </span>
                            {/* Barra de progresso visual */}
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
                              <motion.div
                                className={cn('h-full rounded-full', riskStyles.bar)}
                                initial={{ width: 0 }}
                                animate={{ width: `${contract.riskScore}%` }}
                                transition={{
                                  duration: 0.8,
                                  ease: 'easeOut',
                                  delay: 0.2,
                                }}
                              />
                            </div>
                          </div>
                        </Link>
                      </td>

                      {/* Coluna: Valor em USD */}
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <Link
                          href={`/dashboard/contracts/${contract.id}`}
                          className="block"
                        >
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-sm font-semibold text-slate-900 tabular-nums">
                              {formatCurrency(contract.value)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatCurrency(contract.monthlyValue)}/mo
                          </p>
                        </Link>
                      </td>

                      {/* Coluna: Data de expiração + dias restantes */}
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <Link
                          href={`/dashboard/contracts/${contract.id}`}
                          className="block"
                        >
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-sm text-slate-700">
                              {formatDate(contract.endDate)}
                            </span>
                          </div>
                          {/* Alerta de expiração próxima */}
                          {isExpiringSoon && (
                            <div className="flex items-center gap-1 mt-1">
                              <AlertCircle className="h-3 w-3 text-amber-500" />
                              <span className="text-xs font-medium text-amber-600">
                                {remainingDays} days left
                              </span>
                            </div>
                          )}
                          {/* Contrato já expirado */}
                          {remainingDays <= 0 && contract.status === 'expired' && (
                            <div className="flex items-center gap-1 mt-1">
                              <AlertCircle className="h-3 w-3 text-red-500" />
                              <span className="text-xs font-medium text-red-600">
                                Expired
                              </span>
                            </div>
                          )}
                        </Link>
                      </td>

                      {/* Coluna: Status (badge) */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/contracts/${contract.id}`}
                          className="block"
                        >
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border',
                              statusConfig.bg,
                              statusConfig.text,
                              statusConfig.border
                            )}
                          >
                            {/* Indicador de status: ícone animado ou ponto estático */}
                            {contract.status === 'analyzing' ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <span
                                className={cn(
                                  'w-1.5 h-1.5 rounded-full',
                                  statusConfig.dot
                                )}
                              />
                            )}
                            {t(contract.status)}
                          </span>
                        </Link>
                      </td>
                    </motion.tr>
                  )
                })}
              </motion.tbody>
            </table>
          </div>

          {/* ── Paginação ──────────────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={safePage <= 1}
              className="rounded-xl border-slate-200 gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <span className="text-sm text-slate-500">
              Page{' '}
              <span className="font-semibold text-slate-700">{safePage}</span>{' '}
              of{' '}
              <span className="font-semibold text-slate-700">{totalPages}</span>
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={safePage >= totalPages}
              className="rounded-xl border-slate-200 gap-1.5"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        /* ── Estado vazio — sem resultados após filtragem ────────────── */
        <div className="rounded-2xl bg-white border border-slate-200 p-12 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-6">
            <FileText className="h-8 w-8 text-teal-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {tDash('noContracts')}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            {tDash('noContractsDescription')}
          </p>
          <Link href="/dashboard/contracts/new">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2">
              <Upload className="h-4 w-4" />
              {tDash('uploadFirst')}
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
