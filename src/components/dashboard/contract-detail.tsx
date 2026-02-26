'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'

/** Abas disponíveis na página de detalhe do contrato */
type Tab = 'overview' | 'riskAnalysis' | 'clauses' | 'timeline'

/** Props do componente de detalhe de contrato */
interface ContractDetailProps {
  contractId: string
}

/**
 * Dados mock do contrato para desenvolvimento.
 * TODO: Substituir por dados reais do backend via tRPC
 */
const MOCK_CONTRACT = {
  name: 'SaaS Platform License Agreement',
  vendor: 'Acme Corp',
  category: 'Software',
  startDate: '2025-03-01',
  endDate: '2026-03-01',
  totalValue: 24000,
  monthlyValue: 2000,
  autoRenew: true,
  noticePeriod: 30,
  status: 'completed' as 'analyzing' | 'completed' | 'failed',
  riskScore: 42,
  aiSummary:
    'This contract has moderate risk due to an automatic renewal clause with a short notice period. The pricing is slightly above market average for similar SaaS licenses. Consider renegotiating the monthly rate and extending the notice period before renewal.',
  clauses: [] as { title: string; content: string; risk: string }[],
}

/**
 * Retorna a cor correspondente ao nível de risco com base na pontuação.
 *
 * Faixas:
 * - 0-25: Verde (baixo risco)
 * - 26-50: Amarelo (risco médio)
 * - 51-75: Laranja (risco alto)
 * - 76-100: Vermelho (risco crítico)
 */
function getRiskColor(score: number) {
  if (score <= 25) return { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' }
  if (score <= 50) return { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-50' }
  if (score <= 75) return { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50' }
  return { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50' }
}

/**
 * Retorna a chave de tradução do nível de risco correspondente à pontuação.
 */
function getRiskLevelKey(score: number): string {
  if (score <= 25) return 'riskLow'
  if (score <= 50) return 'riskMedium'
  if (score <= 75) return 'riskHigh'
  return 'riskCritical'
}

/**
 * Componente de detalhe de contrato.
 *
 * Exibe informações completas de um contrato específico, incluindo:
 * - Navegação por abas (Overview, Análise de Risco, Cláusulas, Timeline)
 * - Ações (download, renegociar, excluir)
 * - Breadcrumb para navegação
 * - Status de processamento
 */
export function ContractDetail({ contractId }: ContractDetailProps) {
  const t = useTranslations('contractDetail')
  const tContracts = useTranslations('contracts')
  /** Aba ativa selecionada pelo usuário */
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  /** TODO: Buscar dados reais do contrato pelo contractId */
  const contract = MOCK_CONTRACT
  const riskColor = getRiskColor(contract.riskScore)

  /** Definição das abas de navegação */
  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: t('overview') },
    { key: 'riskAnalysis', label: t('riskAnalysis') },
    { key: 'clauses', label: t('clauses') },
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

      {/* Cabeçalho — título, status e ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center">
            <FileText className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{contract.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {/* Badge de status de processamento */}
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
                {contract.status === 'analyzing' && (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                )}
                {t(contract.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
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

      {/* Navegação por abas */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'pb-3 text-sm font-medium transition-colors border-b-2',
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

      {/* Conteúdo da aba ativa */}
      {activeTab === 'overview' && (
        <OverviewTab contract={contract} t={t} />
      )}
      {activeTab === 'riskAnalysis' && (
        <RiskAnalysisTab contract={contract} riskColor={riskColor} t={t} />
      )}
      {activeTab === 'clauses' && (
        <ClausesTab contract={contract} t={t} />
      )}
      {activeTab === 'timeline' && (
        <TimelineTab contract={contract} t={t} />
      )}
    </div>
  )
}

/* ============================================================
 * Componentes internos — Abas
 * ============================================================ */

/**
 * Aba de Overview — exibe informações gerais do contrato.
 *
 * Mostra vendor, categoria, datas, valores, auto-renovação
 * e período de aviso em um grid organizado.
 */
function OverviewTab({
  contract,
  t,
}: {
  contract: typeof MOCK_CONTRACT
  t: ReturnType<typeof useTranslations<'contractDetail'>>
}) {
  /** Campos de informação do contrato para exibição no grid */
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
      value: contract.autoRenew ? 'Yes' : 'No',
      icon: RefreshCw,
    },
    {
      label: t('noticePeriod'),
      value: `${contract.noticePeriod} ${t('days')}`,
      icon: AlertTriangle,
    },
  ]

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-6">
        {t('overview')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {infoFields.map((field) => {
          const Icon = field.icon
          return (
            <div key={field.label} className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                <Icon className="h-3.5 w-3.5" />
                {field.label}
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {field.value}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Aba de Análise de Risco — exibe pontuação de risco e resumo da IA.
 *
 * Inclui:
 * - Gauge visual de risco (0-100) com código de cores
 * - Badge de nível de risco
 * - Resumo gerado pela IA
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
  /** Chave de tradução do nível de risco */
  const riskLevelKey = getRiskLevelKey(contract.riskScore)

  /** Ângulo de rotação do ponteiro do gauge (0-180 graus) */
  const gaugeRotation = (contract.riskScore / 100) * 180

  return (
    <div className="space-y-6">
      {/* Card do score de risco */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">
          {t('riskScore')}
        </h2>

        <div className="flex flex-col items-center gap-6">
          {/* Gauge visual de risco */}
          <div className="relative w-48 h-24 overflow-hidden">
            {/* Fundo do semicírculo */}
            <div className="absolute inset-0 rounded-t-full border-[12px] border-slate-100" />
            {/* Arco preenchido conforme a pontuação */}
            <div
              className="absolute inset-0 rounded-t-full border-[12px] border-transparent"
              style={{
                borderTopColor: contract.riskScore <= 25
                  ? '#10b981'
                  : contract.riskScore <= 50
                    ? '#eab308'
                    : contract.riskScore <= 75
                      ? '#f97316'
                      : '#ef4444',
                borderLeftColor: contract.riskScore > 50
                  ? contract.riskScore <= 75
                    ? '#f97316'
                    : '#ef4444'
                  : 'transparent',
                borderRightColor: contract.riskScore > 25
                  ? contract.riskScore <= 50
                    ? '#eab308'
                    : contract.riskScore <= 75
                      ? '#f97316'
                      : '#ef4444'
                  : 'transparent',
                transform: `rotate(${gaugeRotation}deg)`,
                transformOrigin: 'bottom center',
              }}
            />
            {/* Valor numérico centralizado */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
              <span className={cn('text-3xl font-bold', riskColor.text)}>
                {contract.riskScore}
              </span>
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

      {/* Card do resumo da IA */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {t('aiSummary')}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          {contract.aiSummary}
        </p>
      </div>
    </div>
  )
}

/**
 * Aba de Cláusulas — lista as cláusulas extraídas do contrato.
 *
 * Exibe estado vazio quando o processamento ainda está em andamento
 * ou quando nenhuma cláusula foi identificada.
 */
function ClausesTab({
  contract,
  t,
}: {
  contract: typeof MOCK_CONTRACT
  t: ReturnType<typeof useTranslations<'contractDetail'>>
}) {
  const hasClauses = contract.clauses.length > 0

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] p-6">
      {hasClauses ? (
        /** Lista de cláusulas extraídas */
        <div className="space-y-4">
          {contract.clauses.map((clause, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
            >
              <h3 className="text-sm font-semibold text-slate-900">
                {clause.title}
              </h3>
              <p className="text-sm text-slate-600 mt-1">{clause.content}</p>
            </div>
          ))}
        </div>
      ) : (
        /** Estado vazio — sem cláusulas extraídas */
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
 * Aba de Timeline — histórico de eventos do contrato.
 *
 * TODO: Implementar timeline com eventos reais (upload, análise, alertas, etc.)
 */
function TimelineTab({
  contract,
  t,
}: {
  contract: typeof MOCK_CONTRACT
  t: ReturnType<typeof useTranslations<'contractDetail'>>
}) {
  /** TODO: Buscar eventos do contrato via tRPC */
  const events = [
    {
      date: contract.startDate,
      label: 'Contract uploaded and analysis started',
      icon: FileText,
    },
    {
      date: contract.startDate,
      label: 'Risk analysis completed — score: ' + contract.riskScore,
      icon: Shield,
    },
  ]

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-6">
        {t('timeline')}
      </h2>
      <div className="space-y-6">
        {events.map((event, index) => {
          const Icon = event.icon
          return (
            <div key={index} className="flex gap-4">
              {/* Indicador visual da timeline */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-teal-600" />
                </div>
                {index < events.length - 1 && (
                  <div className="w-px h-full bg-slate-200 mt-2" />
                )}
              </div>
              {/* Conteúdo do evento */}
              <div className="pb-6">
                <p className="text-sm font-medium text-slate-900">
                  {event.label}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
