'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
  FileText,
  Shield,
  DollarSign,
  Scale,
  Download,
  Plus,
  Calendar,
  CheckSquare,
  FileSpreadsheet,
  FileDown,
  Loader2,
  ChevronDown,
  Clock,
  HardDrive,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

/* =================================================================
   DADOS MOCK — RELATÓRIOS RÁPIDOS
   4 tipos de relatórios pré-configurados com geração automática.
   Serão substituídos por chamadas ao backend quando disponível.
   ================================================================= */

/** Relatórios pré-configurados disponíveis para download rápido */
const QUICK_REPORTS = [
  {
    title: 'Monthly Summary Report',
    description: 'Auto-generated overview of contract activity, savings and key metrics from the current month.',
    icon: FileText,
    type: 'Summary',
    format: 'PDF',
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-600',
    borderColor: 'border-teal-200',
  },
  {
    title: 'Risk Assessment Report',
    description: 'Comprehensive analysis of all high-risk contracts with mitigation recommendations.',
    icon: Shield,
    type: 'Risk',
    format: 'PDF',
    bgLight: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
  },
  {
    title: 'Savings Opportunity Report',
    description: 'Projected savings based on market benchmarks and renegotiation opportunities.',
    icon: DollarSign,
    type: 'Savings',
    format: 'PDF',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
  },
  {
    title: 'Compliance Audit Report',
    description: 'Regulatory compliance status across all active contracts with flagged issues.',
    icon: Scale,
    type: 'Compliance',
    format: 'PDF',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-600',
    borderColor: 'border-violet-200',
  },
]

/* =================================================================
   DADOS MOCK — SEÇÕES DO RELATÓRIO CUSTOMIZADO
   Opções de seções que podem ser incluídas no relatório.
   ================================================================= */

/** Seções selecionáveis para o relatório personalizado */
const REPORT_SECTIONS = [
  { id: 'executive-summary', label: 'Executive Summary', defaultChecked: true },
  { id: 'risk-analysis', label: 'Risk Analysis', defaultChecked: true },
  { id: 'cost-analysis', label: 'Cost Analysis', defaultChecked: true },
  { id: 'benchmarks', label: 'Benchmarks', defaultChecked: false },
  { id: 'recommendations', label: 'Recommendations', defaultChecked: true },
  { id: 'appendix', label: 'Appendix', defaultChecked: false },
]

/** Contratos disponíveis para seleção no relatório customizado */
const AVAILABLE_CONTRACTS = [
  { id: 'aws', name: 'AWS Enterprise License' },
  { id: 'salesforce', name: 'Salesforce CRM Suite' },
  { id: 'office', name: 'Office 365 Business' },
  { id: 'slack', name: 'Slack Enterprise Grid' },
  { id: 'zoom', name: 'Zoom Business Plus' },
  { id: 'hubspot', name: 'HubSpot Marketing Pro' },
  { id: 'datadog', name: 'Datadog Monitoring' },
  { id: 'github', name: 'GitHub Enterprise' },
]

/** Formatos de exportação disponíveis */
const EXPORT_FORMATS = [
  { value: 'pdf', label: 'PDF', icon: FileDown },
  { value: 'csv', label: 'CSV', icon: FileSpreadsheet },
  { value: 'excel', label: 'Excel', icon: FileSpreadsheet },
]

/* =================================================================
   DADOS MOCK — HISTÓRICO DE RELATÓRIOS
   Relatórios previamente gerados com status e dados de download.
   ================================================================= */

/** Histórico de 5 relatórios gerados com metadados */
const REPORT_HISTORY = [
  {
    name: 'Q4 2025 Risk Assessment',
    type: 'Risk Report',
    date: 'Feb 25, 2026',
    size: '2.4 MB',
    status: 'ready' as const,
  },
  {
    name: 'January 2026 Summary',
    type: 'Monthly Summary',
    date: 'Feb 1, 2026',
    size: '1.8 MB',
    status: 'ready' as const,
  },
  {
    name: 'Annual Savings Analysis 2025',
    type: 'Savings Report',
    date: 'Jan 15, 2026',
    size: '3.1 MB',
    status: 'ready' as const,
  },
  {
    name: 'Compliance Review H2 2025',
    type: 'Compliance Report',
    date: 'Jan 10, 2026',
    size: '4.2 MB',
    status: 'processing' as const,
  },
  {
    name: 'Cloud Infrastructure Benchmark',
    type: 'Benchmark Report',
    date: 'Dec 20, 2025',
    size: '1.5 MB',
    status: 'ready' as const,
  },
]

/** Opções de período para seleção no relatório customizado */
const DATE_RANGE_OPTIONS = [
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'last-3-months', label: 'Last 3 Months' },
  { value: 'last-6-months', label: 'Last 6 Months' },
  { value: 'this-year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
]

/* =================================================================
   VARIANTES DE ANIMAÇÃO (Framer Motion)
   Definem as transições de entrada dos elementos da página.
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

/** Variante dos cards — surgem de baixo com fade */
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
 * Página de relatórios e exportação.
 *
 * Permite ao usuário:
 * - Baixar relatórios pré-configurados (Summary, Risk, Savings, Compliance)
 * - Criar relatórios customizados com seleção de seções e contratos
 * - Visualizar histórico de relatórios gerados com status e download
 */
export function ReportsPage() {
  /** Hook de traduções para chaves do dashboard */
  const t = useTranslations('dashboard')

  /** Estado do nome do relatório customizado */
  const [reportName, setReportName] = useState('')

  /** Estado do período selecionado */
  const [selectedDateRange, setSelectedDateRange] = useState('last-3-months')

  /** Estado dos contratos selecionados (IDs) */
  const [selectedContracts, setSelectedContracts] = useState<string[]>([])

  /** Flag para selecionar todos os contratos */
  const [selectAllContracts, setSelectAllContracts] = useState(true)

  /** Estado das seções selecionadas para o relatório */
  const [selectedSections, setSelectedSections] = useState<string[]>(
    REPORT_SECTIONS.filter((s) => s.defaultChecked).map((s) => s.id)
  )

  /** Formato de exportação selecionado */
  const [exportFormat, setExportFormat] = useState('pdf')

  /** Indica se está gerando um relatório (loading state) */
  const [isGenerating, setIsGenerating] = useState(false)

  /**
   * Alterna a seleção de um contrato individual.
   * Se "todos" estava marcado, desmarca e seleciona só o clicado.
   */
  const toggleContract = (contractId: string) => {
    if (selectAllContracts) {
      setSelectAllContracts(false)
      setSelectedContracts([contractId])
      return
    }

    setSelectedContracts((prev) =>
      prev.includes(contractId)
        ? prev.filter((id) => id !== contractId)
        : [...prev, contractId]
    )
  }

  /**
   * Alterna a seleção de uma seção do relatório.
   */
  const toggleSection = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  /**
   * Alterna o estado de "selecionar todos os contratos".
   * Quando ativado, limpa as seleções individuais.
   */
  const toggleSelectAll = () => {
    setSelectAllContracts((prev) => !prev)
    if (!selectAllContracts) {
      setSelectedContracts([])
    }
  }

  /**
   * Simula a geração do relatório customizado.
   * Em produção, dispararia chamada ao backend.
   */
  const handleGenerateReport = () => {
    setIsGenerating(true)
    /* Simula processamento de 2 segundos */
    setTimeout(() => {
      setIsGenerating(false)
    }, 2000)
  }

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ============================================================
          CABEÇALHO — Título e subtítulo
          ============================================================ */}
      <motion.div variants={cardVariants}>
        <h1 className="text-2xl font-bold text-slate-900">
          Reports & Export
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Generate, download, and manage your contract analysis reports
        </p>
      </motion.div>

      {/* ============================================================
          QUICK REPORTS — 4 relatórios pré-configurados
          ============================================================ */}
      <div>
        <motion.div variants={cardVariants} className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Quick Reports</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Pre-configured reports ready for instant download
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_REPORTS.map((report) => {
            const Icon = report.icon
            return (
              <motion.div
                key={report.title}
                variants={cardVariants}
                className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.08)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
              >
                {/* Ícone do tipo de relatório */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      report.bgLight
                    )}
                  >
                    <Icon className={cn('h-5 w-5', report.textColor)} />
                  </div>
                  <Badge
                    className={cn(
                      'text-[10px] px-2 py-0.5 font-medium',
                      report.bgLight,
                      report.textColor,
                      `border ${report.borderColor}`,
                      `hover:${report.bgLight}`
                    )}
                  >
                    {report.format}
                  </Badge>
                </div>

                {/* Título e descrição */}
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                  {report.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1">
                  {report.description}
                </p>

                {/* Botão de download */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 gap-2 text-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download {report.format}
                </Button>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ============================================================
          CUSTOM REPORT BUILDER — Construtor de relatório personalizado
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <Plus className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Custom Report Builder
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Create a tailored report with specific sections and data
              </p>
            </div>
          </div>
        </div>

        {/* Formulário do relatório customizado */}
        <div className="p-6 space-y-6">
          {/* Linha 1: Nome do relatório + Período */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campo: Nome do relatório */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Report Name
              </label>
              <Input
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="e.g., Q1 2026 Contract Review"
                className="rounded-xl border-slate-200 focus-visible:border-teal-400 focus-visible:ring-teal-400/20"
              />
            </div>

            {/* Campo: Seleção de período */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date Range
              </label>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
                {DATE_RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedDateRange(option.value)}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap',
                      selectedDateRange === option.value
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-white'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Linha 2: Seleção de contratos */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contracts to Include
            </label>

            {/* Checkbox "All Contracts" */}
            <div className="mb-3">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150',
                    selectAllContracts
                      ? 'bg-teal-600 border-teal-600'
                      : 'border-slate-300 group-hover:border-slate-400'
                  )}
                  onClick={toggleSelectAll}
                >
                  {selectAllContracts && (
                    <CheckSquare className="h-3.5 w-3.5 text-white" />
                  )}
                </div>
                <span
                  className="text-sm text-slate-700 font-medium"
                  onClick={toggleSelectAll}
                >
                  All Contracts
                </span>
                <Badge className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] hover:bg-slate-100">
                  {AVAILABLE_CONTRACTS.length} total
                </Badge>
              </label>
            </div>

            {/* Grid de contratos individuais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {AVAILABLE_CONTRACTS.map((contract) => {
                const isSelected = selectAllContracts || selectedContracts.includes(contract.id)
                return (
                  <label
                    key={contract.id}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all duration-150',
                      isSelected
                        ? 'border-teal-200 bg-teal-50/50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    )}
                    onClick={(e) => {
                      e.preventDefault()
                      toggleContract(contract.id)
                    }}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-150',
                        isSelected
                          ? 'bg-teal-600 border-teal-600'
                          : 'border-slate-300'
                      )}
                    >
                      {isSelected && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-slate-700 truncate">
                      {contract.name}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Linha 3: Seções a incluir */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sections to Include
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {REPORT_SECTIONS.map((section) => {
                const isSelected = selectedSections.includes(section.id)
                return (
                  <button
                    key={section.id}
                    onClick={() => toggleSection(section.id)}
                    className={cn(
                      'px-3 py-2.5 rounded-xl border text-xs font-medium transition-all duration-150 text-center',
                      isSelected
                        ? 'border-teal-300 bg-teal-50 text-teal-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    {section.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Linha 4: Formato de exportação + botão de gerar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pt-2">
            {/* Seleção de formato */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Export Format
              </label>
              <div className="flex items-center gap-2">
                {EXPORT_FORMATS.map((format) => {
                  const FormatIcon = format.icon
                  return (
                    <button
                      key={format.value}
                      onClick={() => setExportFormat(format.value)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150',
                        exportFormat === format.value
                          ? 'border-teal-300 bg-teal-50 text-teal-700 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      <FormatIcon className="h-4 w-4" />
                      {format.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Botão de gerar relatório */}
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2 px-6 h-11"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ============================================================
          REPORT HISTORY — Tabela de relatórios gerados anteriormente
          ============================================================ */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] overflow-hidden"
      >
        {/* Cabeçalho da tabela */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Report History
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Previously generated reports available for download
                </p>
              </div>
            </div>
            <Badge className="bg-slate-100 text-slate-600 border border-slate-200 text-xs hover:bg-slate-100">
              {REPORT_HISTORY.length} reports
            </Badge>
          </div>
        </div>

        {/* Tabela responsiva com scroll horizontal em telas pequenas */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Cabeçalho da tabela */}
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Report Name
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Action
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
              {REPORT_HISTORY.map((report) => (
                <motion.tr
                  key={report.name}
                  variants={tableRowVariants}
                  className="group hover:bg-slate-50/80 transition-colors duration-150"
                >
                  {/* Coluna: Nome do relatório */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-slate-500" />
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        {report.name}
                      </p>
                    </div>
                  </td>

                  {/* Coluna: Tipo de relatório */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{report.type}</span>
                  </td>

                  {/* Coluna: Data de geração */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-sm text-slate-600">{report.date}</span>
                    </div>
                  </td>

                  {/* Coluna: Tamanho do arquivo */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <HardDrive className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-sm text-slate-600 tabular-nums">{report.size}</span>
                    </div>
                  </td>

                  {/* Coluna: Status do relatório */}
                  <td className="px-6 py-4">
                    {report.status === 'ready' ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium hover:bg-emerald-50">
                        Ready
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium hover:bg-amber-50">
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Processing
                      </Badge>
                    )}
                  </td>

                  {/* Coluna: Botão de ação (download) */}
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={report.status === 'processing'}
                      className={cn(
                        'rounded-lg h-8 px-3 gap-1.5 text-xs',
                        report.status === 'ready'
                          ? 'text-teal-600 hover:text-teal-700 hover:bg-teal-50'
                          : 'text-slate-400'
                      )}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>

        {/* Rodapé informativo da tabela */}
        <div className="px-6 py-3 bg-slate-50/60 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Reports are stored for 90 days. Download or archive important reports before expiry.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
