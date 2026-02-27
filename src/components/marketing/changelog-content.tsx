'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Zap,
  Bug,
  Filter,
  Calendar,
  GitBranch,
  Globe,
  FileSearch,
  Users,
  Gauge,
  BarChart3,
  FileText,
  BellRing,
  Layout,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Tipos de entrada do changelog.
 * Cada tipo tem cor, ícone e rótulo específicos para fácil identificação visual.
 */
type ChangelogType = 'Feature' | 'Improvement' | 'Fix'

/**
 * Interface para cada entrada do changelog.
 * Contém versão, data, tipo, título, descrição e ícone contextual.
 */
interface ChangelogEntry {
  version: string
  date: string
  type: ChangelogType
  title: string
  description: string
  icon: React.ElementType
  hasImage?: boolean
}

/**
 * Mapeamento de cores e ícones para cada tipo de changelog.
 * Verde para features, azul para melhorias, vermelho para correções.
 */
const TYPE_CONFIG: Record<
  ChangelogType,
  {
    bgBadge: string
    textBadge: string
    borderBadge: string
    icon: React.ElementType
    dotColor: string
    lineColor: string
  }
> = {
  Feature: {
    bgBadge: 'bg-emerald-50',
    textBadge: 'text-emerald-700',
    borderBadge: 'border-emerald-200',
    icon: Sparkles,
    dotColor: 'bg-emerald-500',
    lineColor: 'from-emerald-500',
  },
  Improvement: {
    bgBadge: 'bg-sky-50',
    textBadge: 'text-sky-700',
    borderBadge: 'border-sky-200',
    icon: Zap,
    dotColor: 'bg-sky-500',
    lineColor: 'from-sky-500',
  },
  Fix: {
    bgBadge: 'bg-rose-50',
    textBadge: 'text-rose-700',
    borderBadge: 'border-rose-200',
    icon: Bug,
    dotColor: 'bg-rose-500',
    lineColor: 'from-rose-500',
  },
}

/**
 * Entradas do changelog ordenadas cronologicamente (mais recente primeiro).
 * Em produção, esses dados viriam de um CMS ou arquivo de releases.
 */
const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: 'v2.4.0',
    date: 'Feb 25, 2026',
    type: 'Feature',
    title: 'Multi-language contract analysis',
    description:
      'Clausent now supports contract analysis in 12 languages, including Spanish, French, German, Portuguese, Japanese, and Mandarin. Our NLP engine has been trained on multilingual legal corpora to ensure accurate clause extraction and risk scoring regardless of the contract language.',
    icon: Globe,
    hasImage: true,
  },
  {
    version: 'v2.3.2',
    date: 'Feb 18, 2026',
    type: 'Fix',
    title: 'Improved PDF parsing accuracy for scanned documents',
    description:
      'Fixed an issue where scanned PDF contracts with low resolution or handwritten annotations were not being parsed correctly. Our OCR pipeline now uses enhanced image preprocessing and a new recognition model, improving accuracy from 89% to 97% on scanned documents.',
    icon: FileSearch,
  },
  {
    version: 'v2.3.0',
    date: 'Feb 10, 2026',
    type: 'Feature',
    title: 'Team collaboration with role-based access',
    description:
      'Invite your entire team to Clausent with granular role-based access control. Admins can manage all contracts, Analysts can view and annotate, and Viewers get read-only access. Includes activity logs, @mentions in comments, and shared dashboards for seamless collaboration.',
    icon: Users,
    hasImage: true,
  },
  {
    version: 'v2.2.1',
    date: 'Feb 3, 2026',
    type: 'Improvement',
    title: 'Faster analysis engine (2x speed improvement)',
    description:
      'We\'ve completely overhauled our analysis pipeline to deliver results 2x faster. Contract processing that previously took 45 seconds now completes in under 20 seconds. This improvement applies to all analysis types — standard, comprehensive, and compliance checks.',
    icon: Gauge,
  },
  {
    version: 'v2.2.0',
    date: 'Jan 25, 2026',
    type: 'Feature',
    title: 'Market benchmarks dashboard',
    description:
      'Compare your contract terms against industry benchmarks with our new interactive dashboard. See how your pricing, SLA terms, and liability clauses stack up against anonymized data from thousands of similar contracts. Includes percentile rankings and savings recommendations.',
    icon: BarChart3,
    hasImage: true,
  },
  {
    version: 'v2.1.0',
    date: 'Jan 15, 2026',
    type: 'Feature',
    title: 'Renegotiation playbook generator',
    description:
      'Automatically generate customized renegotiation playbooks based on your contract analysis. Each playbook includes talking points, benchmark data, risk areas to address, and suggested alternative clause language. Export as PDF or share directly with your legal team.',
    icon: FileText,
  },
  {
    version: 'v2.0.1',
    date: 'Jan 8, 2026',
    type: 'Fix',
    title: 'Fixed notification delivery for renewal alerts',
    description:
      'Resolved an issue where email and Slack notifications for upcoming contract renewals were being delivered late or not at all. The notification scheduler has been rebuilt with a more reliable queue system that ensures alerts are delivered within the configured lead time.',
    icon: BellRing,
  },
  {
    version: 'v2.0.0',
    date: 'Jan 1, 2026',
    type: 'Feature',
    title: 'Complete platform redesign with new dashboard',
    description:
      'We\'ve rebuilt the entire Clausent platform from the ground up with a brand new design language. The new dashboard features a streamlined layout, improved navigation, real-time contract status widgets, and a unified search experience. Performance is 3x faster with 50% less page load time.',
    icon: Layout,
    hasImage: true,
  },
]

/** Opções de filtro — "All" mais os 3 tipos */
const FILTER_OPTIONS: Array<'All' | ChangelogType> = [
  'All',
  'Feature',
  'Improvement',
  'Fix',
]

/** Variante genérica de fade-in com slide para cima */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
}

/** Variantes para animação de cada entrada do changelog */
const entryVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      damping: 22,
      stiffness: 100,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 },
  },
}

/**
 * ChangelogContent — página de changelog do produto.
 *
 * Funcionalidades:
 * - Filtro por tipo (All, Feature, Improvement, Fix) via pills
 * - Timeline vertical com dots coloridos por tipo
 * - Badge de versão, data, e tipo em cada entrada
 * - Imagem placeholder opcional para algumas entradas
 * - Animações de entrada stagger via Framer Motion
 *
 * Design: Light Neobrutalism com fundo #FFFDF5, cards bg-white,
 * bordas slate-200, sombras 3px 3px, cantos arredondados 2xl.
 */
export function ChangelogContent() {
  /** Filtro ativo — controla quais tipos de entrada são exibidos */
  const [activeFilter, setActiveFilter] = useState<'All' | ChangelogType>(
    'All'
  )

  /** Entradas filtradas pelo tipo selecionado */
  const filteredEntries =
    activeFilter === 'All'
      ? CHANGELOG_ENTRIES
      : CHANGELOG_ENTRIES.filter((entry) => entry.type === activeFilter)

  return (
    <div className="bg-[#FFFDF5] min-h-screen">
      {/* Decoração de fundo — gradientes sutis */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100/40 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-100/20 rounded-full blur-[100px] translate-y-1/2" />

      {/* ===== HERO DO CHANGELOG ===== */}
      <section className="relative pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge da seção */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <span className="inline-flex items-center rounded-full bg-teal-50 border border-teal-100 px-4 py-1.5 text-sm font-medium text-teal-600 mb-4">
              <GitBranch className="h-3.5 w-3.5 mr-1.5" />
              Product Updates
            </span>
          </motion.div>

          {/* Título */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight"
          >
            Change
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              log
            </span>
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            Track every improvement, new feature, and bug fix we ship. We
            believe in building in public and keeping you informed.
          </motion.p>
        </div>
      </section>

      {/* ===== FILTROS DE TIPO ===== */}
      <section className="relative pb-8">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-2 justify-center"
          >
            <Filter className="h-4 w-4 text-slate-400 mr-1" />
            {FILTER_OPTIONS.map((option) => {
              /** Configuração de cores para o pill de filtro */
              const config =
                option === 'All'
                  ? null
                  : TYPE_CONFIG[option as ChangelogType]

              return (
                <button
                  key={option}
                  onClick={() => setActiveFilter(option)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
                    activeFilter === option
                      ? option === 'All'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]'
                        : cn(
                            config?.bgBadge,
                            config?.textBadge,
                            config?.borderBadge,
                            'shadow-[2px_2px_0px_rgba(0,0,0,0.06)]'
                          )
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]'
                  )}
                >
                  {option === 'All' ? (
                    'All Updates'
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      {config && <config.icon className="h-3.5 w-3.5" />}
                      {option}
                    </span>
                  )}
                </button>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ===== TIMELINE DO CHANGELOG ===== */}
      <section className="relative pb-24 sm:pb-32">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="relative"
            >
              {/* Linha vertical da timeline (desktop) */}
              <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-slate-200 via-slate-200 to-transparent hidden sm:block" />

              {/* Entradas do changelog */}
              <div className="space-y-8">
                {filteredEntries.map((entry, index) => {
                  const config = TYPE_CONFIG[entry.type]
                  const Icon = entry.icon

                  return (
                    <motion.div
                      key={`${entry.version}-${activeFilter}`}
                      variants={entryVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ delay: index * 0.08 }}
                      className="relative sm:pl-20"
                    >
                      {/* Dot na timeline (desktop) */}
                      <div
                        className={cn(
                          'absolute left-[26px] top-8 w-5 h-5 rounded-full border-4 border-[#FFFDF5] hidden sm:block z-10',
                          config.dotColor
                        )}
                      />

                      {/* Card da entrada */}
                      <div className="group rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.08)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300">
                        {/* Gradiente de hover sutil */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-50/30 to-emerald-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="relative">
                          {/* Cabeçalho: versão, data e tipo */}
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            {/* Badge de versão */}
                            <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-3 py-0.5 text-xs font-mono font-semibold text-slate-700">
                              {entry.version}
                            </span>

                            {/* Data */}
                            <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
                              <Calendar className="h-3.5 w-3.5" />
                              {entry.date}
                            </span>

                            {/* Badge de tipo (colorido) */}
                            <span
                              className={cn(
                                'inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-medium',
                                config.bgBadge,
                                config.textBadge,
                                config.borderBadge
                              )}
                            >
                              <config.icon className="h-3 w-3" />
                              {entry.type}
                            </span>
                          </div>

                          {/* Título com ícone contextual */}
                          <div className="flex items-start gap-3 mb-3">
                            <div
                              className={cn(
                                'shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl group-hover:scale-110 transition-transform duration-300',
                                config.bgBadge,
                                config.textBadge
                              )}
                            >
                              <Icon className="h-5 w-5" strokeWidth={1.8} />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 pt-1.5">
                              {entry.title}
                            </h3>
                          </div>

                          {/* Descrição detalhada */}
                          <p className="text-sm text-slate-500 leading-relaxed ml-13 sm:ml-[52px]">
                            {entry.description}
                          </p>

                          {/* Ilustração visual da feature/atualização */}
                          {entry.hasImage && (
                            <div className="mt-6 ml-13 sm:ml-[52px] relative h-40 sm:h-52 rounded-xl overflow-hidden border border-slate-200 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]">
                              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-teal-50/60">
                                {/* Elementos decorativos de fundo */}
                                <div className="absolute top-3 right-3 w-16 h-16 rounded-full bg-teal-100/30" />
                                <div className="absolute bottom-3 left-3 w-14 h-14 rounded-full bg-amber-100/30" />
                                <div className="absolute top-1/2 left-1/4 w-10 h-10 rounded-lg bg-slate-100/50 rotate-12" />

                                {/* Conteúdo central */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="flex items-end gap-3">
                                    {/* Card esquemático principal com ícone da feature */}
                                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white border border-slate-200 shadow-[2px_2px_0px_rgba(0,0,0,0.04)] p-3 flex flex-col items-center justify-center gap-2">
                                      <div
                                        className={cn(
                                          'w-10 h-10 rounded-xl border flex items-center justify-center',
                                          config.bgBadge,
                                          config.borderBadge
                                        )}
                                      >
                                        <Icon
                                          className={cn(
                                            'h-5 w-5',
                                            config.textBadge
                                          )}
                                        />
                                      </div>
                                      <div className="w-full space-y-1">
                                        <div className="h-1 w-full rounded-full bg-slate-200" />
                                        <div className="h-1 w-3/4 rounded-full bg-slate-100" />
                                      </div>
                                    </div>
                                    {/* Card lateral menor com badge de versão */}
                                    <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl bg-white border border-slate-200 shadow-[2px_2px_0px_rgba(0,0,0,0.04)] p-2 flex flex-col items-center justify-center gap-1.5">
                                      <span className="text-[10px] font-mono font-semibold text-slate-500">
                                        {entry.version}
                                      </span>
                                      <div className="flex gap-0.5">
                                        <div className={cn('w-1.5 h-3 rounded-sm', config.dotColor, 'opacity-60')} />
                                        <div className={cn('w-1.5 h-5 rounded-sm', config.dotColor, 'opacity-80')} />
                                        <div className={cn('w-1.5 h-4 rounded-sm', config.dotColor, 'opacity-70')} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Linha de destaque no topo do card (hover) */}
                        <div
                          className={cn(
                            'absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                            config.lineColor,
                            'to-transparent'
                          )}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Mensagem quando nenhuma entrada encontrada */}
              {filteredEntries.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <p className="text-slate-400 text-lg">
                    No entries found for this filter.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
