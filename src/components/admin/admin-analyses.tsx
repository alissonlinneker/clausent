'use client'

import { motion } from 'framer-motion'
import {
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  RotateCcw,
  Download,
  Upload,
  ScanText,
  Brain,
  ClipboardCheck,
  ArrowRight,
  AlertTriangle,
  FileText,
  Pause,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

/**
 * Dados mockados da fila de análises.
 * 10 itens representando diferentes estágios do pipeline.
 */
const ANALYSIS_QUEUE = [
  {
    id: 'ANL-1247',
    contractName: 'Acordo de Serviços Cloud AWS',
    user: 'Ana Carolina Silva',
    status: 'completed' as const,
    progress: 100,
    started: '10:32',
    duration: '2m 45s',
  },
  {
    id: 'ANL-1246',
    contractName: 'Contrato de Locação Comercial',
    user: 'Ricardo Mendes',
    status: 'processing' as const,
    progress: 67,
    started: '10:45',
    duration: '1m 12s',
  },
  {
    id: 'ANL-1245',
    contractName: 'NDA Bilateral — TechCorp',
    user: 'Mariana Costa',
    status: 'processing' as const,
    progress: 34,
    started: '10:48',
    duration: '0m 48s',
  },
  {
    id: 'ANL-1244',
    contractName: 'Termo de Prestação de Serviços',
    user: 'Pedro Almeida',
    status: 'pending' as const,
    progress: 0,
    started: '—',
    duration: '—',
  },
  {
    id: 'ANL-1243',
    contractName: 'Contrato de Distribuição Internacional',
    user: 'Fernando Souza',
    status: 'pending' as const,
    progress: 0,
    started: '—',
    duration: '—',
  },
  {
    id: 'ANL-1242',
    contractName: 'Acordo de Acionistas',
    user: 'Juliana Ferreira',
    status: 'completed' as const,
    progress: 100,
    started: '09:55',
    duration: '3m 18s',
  },
  {
    id: 'ANL-1241',
    contractName: 'Contrato de Franquia',
    user: 'Camila Rodrigues',
    status: 'failed' as const,
    progress: 45,
    started: '09:30',
    duration: '1m 05s',
  },
  {
    id: 'ANL-1240',
    contractName: 'Memorando de Entendimento',
    user: 'Lucas Martins',
    status: 'completed' as const,
    progress: 100,
    started: '09:15',
    duration: '2m 03s',
  },
  {
    id: 'ANL-1239',
    contractName: 'Contrato de Trabalho CLT',
    user: 'Ana Carolina Silva',
    status: 'pending' as const,
    progress: 0,
    started: '—',
    duration: '—',
  },
  {
    id: 'ANL-1238',
    contractName: 'Aditivo Contratual #3',
    user: 'Ricardo Mendes',
    status: 'completed' as const,
    progress: 100,
    started: '08:50',
    duration: '1m 55s',
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
 * AdminAnalyses — Página de gestão de análises do painel admin.
 *
 * Funcionalidades:
 * - Cards de status da fila (pendentes, processando, concluídas, falhas)
 * - Tabela da fila de análises com 10 itens (ID, contrato, usuário, status, progresso, duração)
 * - Seção de análises com falha e botões de retry
 * - Visualização do pipeline de processamento (Upload → OCR → Análise → Revisão → Concluído)
 * - Barra de progresso visual para análises em andamento
 *
 * Design: Light Neobrutalism com acentos indigo/violet.
 */
export function AdminAnalyses() {
  /** Hook de tradução usando namespace admin */
  const t = useTranslations('admin')

  /** Filtra apenas as análises com falha para a seção dedicada */
  const failedAnalyses = ANALYSIS_QUEUE.filter((a) => a.status === 'failed')

  /**
   * Cards de status da fila de análises.
   * Exibem as métricas de cada estágio do pipeline.
   */
  const QUEUE_STATUS_CARDS = [
    {
      titleKey: 'analysesStatPending' as const,
      value: '3',
      icon: Clock,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-200',
      descKey: 'analysesStatPendingDesc' as const,
    },
    {
      titleKey: 'analysesStatProcessing' as const,
      value: '2',
      icon: Loader2,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      descKey: 'analysesStatProcessingDesc' as const,
    },
    {
      titleKey: 'analysesStatCompletedToday' as const,
      value: '47',
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
      descKey: 'analysesStatCompletedTodayDesc' as const,
    },
    {
      titleKey: 'analysesStatFailed' as const,
      value: '1',
      icon: XCircle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200',
      descKey: 'analysesStatFailedDesc' as const,
    },
  ]

  /**
   * Configuração visual para cada status de análise.
   * Define cores, ícones e chaves de tradução para renderização na tabela.
   */
  const STATUS_CONFIG = {
    pending: {
      labelKey: 'analysesStatusPending' as const,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      icon: Clock,
      barColor: 'bg-amber-400',
    },
    processing: {
      labelKey: 'analysesStatusProcessing' as const,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      icon: Loader2,
      barColor: 'bg-blue-500',
    },
    completed: {
      labelKey: 'analysesStatusCompleted' as const,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      icon: CheckCircle2,
      barColor: 'bg-emerald-500',
    },
    failed: {
      labelKey: 'analysesStatusFailed' as const,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      icon: XCircle,
      barColor: 'bg-red-500',
    },
  }

  /**
   * Etapas do pipeline de processamento de análise.
   * Visualização sequencial do fluxo de trabalho.
   */
  const PIPELINE_STEPS = [
    { icon: Upload, labelKey: 'analysesPipelineUpload' as const, descKey: 'analysesPipelineUploadDesc' as const },
    { icon: ScanText, labelKey: 'analysesPipelineOcr' as const, descKey: 'analysesPipelineOcrDesc' as const },
    { icon: Brain, labelKey: 'analysesPipelineAi' as const, descKey: 'analysesPipelineAiDesc' as const },
    { icon: ClipboardCheck, labelKey: 'analysesPipelineReview' as const, descKey: 'analysesPipelineReviewDesc' as const },
    { icon: CheckCircle2, labelKey: 'analysesPipelineCompleted' as const, descKey: 'analysesPipelineCompletedDesc' as const },
  ]

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
            {t('analysesTitle')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('analysesSubtitle')}
          </p>
        </div>

        {/* Ações rápidas */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 text-slate-600 gap-2"
          >
            <Pause className="h-4 w-4" />
            {t('analysesPauseQueue')}
          </Button>
          <Button
            size="sm"
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
          >
            <RotateCcw className="h-4 w-4" />
            {t('analysesReprocessFailed')}
          </Button>
        </div>
      </motion.div>

      {/* Cards de status da fila — 4 métricas */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {QUEUE_STATUS_CARDS.map((card) => {
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
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      card.iconColor,
                      card.titleKey === 'analysesStatProcessing' && 'animate-spin'
                    )}
                  />
                </div>
                <span className="text-2xl font-bold text-slate-900">{card.value}</span>
              </div>
              <p className="text-sm font-medium text-slate-700 mt-3">{t(card.titleKey)}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t(card.descKey)}</p>
            </div>
          )
        })}
      </motion.div>

      {/* Visualização do pipeline de processamento */}
      <motion.div
        variants={itemVariants}
        className={cn(
          'bg-white rounded-2xl border border-slate-200 p-6',
          'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]'
        )}
      >
        <h3 className="text-sm font-semibold text-slate-900 mb-6">{t('analysesPipeline')}</h3>

        {/* Fluxo sequencial com setas entre etapas */}
        <div className="flex items-center justify-between overflow-x-auto gap-2">
          {PIPELINE_STEPS.map((step, index) => {
            const StepIcon = step.icon

            return (
              <div key={step.labelKey} className="flex items-center gap-2 flex-shrink-0">
                {/* Card da etapa */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border min-w-[100px]',
                    index <= 2
                      ? 'border-indigo-200 bg-indigo-50'
                      : 'border-slate-200 bg-slate-50'
                  )}
                >
                  <StepIcon
                    className={cn(
                      'h-6 w-6',
                      index <= 2 ? 'text-indigo-600' : 'text-slate-400'
                    )}
                  />
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      index <= 2 ? 'text-indigo-700' : 'text-slate-500'
                    )}
                  >
                    {t(step.labelKey)}
                  </span>
                  <span className="text-[10px] text-slate-400">{t(step.descKey)}</span>
                </motion.div>

                {/* Seta entre etapas (exceto a última) */}
                {index < PIPELINE_STEPS.length - 1 && (
                  <ArrowRight
                    className={cn(
                      'h-5 w-5 flex-shrink-0',
                      index < 2 ? 'text-indigo-400' : 'text-slate-300'
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Tabela da fila de análises */}
      <motion.div
        variants={itemVariants}
        className={cn(
          'bg-white rounded-2xl border border-slate-200 overflow-hidden',
          'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]'
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">{t('analysesQueueTitle')}</h3>
          <span className="text-xs text-slate-400">
            {t('analysesQueueItems', { count: ANALYSIS_QUEUE.length })}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Cabeçalho da tabela */}
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('analysesTableId')}
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('analysesTableContract')}
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('analysesTableUser')}
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('analysesTableStatus')}
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('analysesTableStarted')}
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('analysesTableDuration')}
                </th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('analysesTableActions')}
                </th>
              </tr>
            </thead>

            {/* Corpo da tabela */}
            <tbody className="divide-y divide-slate-100">
              {ANALYSIS_QUEUE.map((analysis, index) => {
                const statusConfig = STATUS_CONFIG[analysis.status]
                const StatusIcon = statusConfig.icon

                return (
                  <motion.tr
                    key={analysis.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.03 * index }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* ID da análise */}
                    <td className="px-5 py-4">
                      <span className="text-sm font-mono font-medium text-slate-600">
                        {analysis.id}
                      </span>
                    </td>

                    {/* Nome do contrato */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-700 truncate max-w-[200px]">
                          {analysis.contractName}
                        </span>
                      </div>
                    </td>

                    {/* Usuário */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600">{analysis.user}</span>
                    </td>

                    {/* Status com barra de progresso */}
                    <td className="px-5 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <StatusIcon
                            className={cn(
                              'h-3.5 w-3.5',
                              statusConfig.textColor,
                              analysis.status === 'processing' && 'animate-spin'
                            )}
                          />
                          <span
                            className={cn(
                              'text-xs font-medium',
                              statusConfig.textColor
                            )}
                          >
                            {t(statusConfig.labelKey)}
                          </span>
                        </div>
                        {/* Barra de progresso para análises não pendentes */}
                        {analysis.status !== 'pending' && (
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${analysis.progress}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className={cn('h-full rounded-full', statusConfig.barColor)}
                            />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Horário de início */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-500">{analysis.started}</span>
                    </td>

                    {/* Duração */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-500 font-mono">
                        {analysis.duration}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {analysis.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg"
                            title={t('analysesViewResult')}
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-400" />
                          </Button>
                        )}
                        {analysis.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg"
                            title={t('analysesDownloadReport')}
                          >
                            <Download className="h-3.5 w-3.5 text-slate-400" />
                          </Button>
                        )}
                        {analysis.status === 'failed' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            title={t('analysesReprocess')}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5 text-slate-400" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Seção de análises com falha — botões de retry */}
      {failedAnalyses.length > 0 && (
        <motion.div
          variants={itemVariants}
          className={cn(
            'bg-white rounded-2xl border border-red-200 p-6',
            'shadow-[3px_3px_0px_rgba(239,68,68,0.06)]'
          )}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-900">{t('analysesFailedTitle')}</h3>
              <p className="text-xs text-red-600 mt-0.5">
                {t('analysesFailedCount', { count: failedAnalyses.length })}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {failedAnalyses.map((analysis) => (
              <div
                key={analysis.id}
                className="flex items-center justify-between p-4 rounded-xl bg-red-50/50 border border-red-100"
              >
                <div className="flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {analysis.contractName}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {analysis.id} — {analysis.user} — {t('analysesStoppedAt', { percent: analysis.progress })}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      {t('analysesErrorOcrTimeout')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-slate-200 text-slate-600 gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {t('analysesDetails')}
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {t('analysesReprocess')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
