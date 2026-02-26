'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileText,
  Shield,
  BarChart3,
  Bell,
  MessageSquare,
  ArrowRight,
  Check,
  Loader2,
  AlertTriangle,
  DollarSign,
  ChevronRight,
  Play,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'

/**
 * Etapas do walkthrough de demonstração.
 * Cada step representa uma fase da análise de contrato na plataforma.
 */
interface DemoStep {
  id: number
  title: string
  subtitle: string
  icon: React.ElementType
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: 1,
    title: 'Upload Contract',
    subtitle: 'Drag & drop your contract file',
    icon: Upload,
  },
  {
    id: 2,
    title: 'AI Processing',
    subtitle: 'Extracting and analyzing clauses',
    icon: Loader2,
  },
  {
    id: 3,
    title: 'View Results',
    subtitle: 'Actionable insights in seconds',
    icon: BarChart3,
  },
]

/**
 * Cláusulas extraídas pelo "motor de IA" durante o step 2.
 * Simulam os destaques de extração em tempo real.
 */
const EXTRACTED_CLAUSES = [
  { text: 'Auto-renewal clause (30-day notice)', risk: 'high' },
  { text: 'Liability cap: $50,000', risk: 'medium' },
  { text: 'Data processing agreement included', risk: 'low' },
  { text: 'Price escalation: 5% annually', risk: 'high' },
  { text: 'SLA: 99.5% uptime guarantee', risk: 'low' },
  { text: 'Termination: 90-day notice required', risk: 'medium' },
]

/**
 * Cards de destaque de funcionalidades exibidos abaixo do walkthrough.
 * Cada card representa um pilar principal da plataforma.
 */
const FEATURE_HIGHLIGHTS = [
  {
    icon: Shield,
    title: 'Risk Analysis',
    description:
      'AI-powered risk scoring identifies problematic clauses and rates overall contract risk on a 0-100 scale with contextual explanations.',
    color: 'teal',
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-600',
    borderColor: 'border-teal-100',
    gradient: 'from-teal-500 to-teal-600',
  },
  {
    icon: BarChart3,
    title: 'Market Benchmarks',
    description:
      'Compare your contract terms against thousands of anonymized industry benchmarks to ensure you\'re paying fair market rates.',
    color: 'violet',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-600',
    borderColor: 'border-violet-100',
    gradient: 'from-violet-500 to-violet-600',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description:
      'Never miss a renewal deadline again. Get intelligent notifications via email, Slack, or SMS with recommended actions.',
    color: 'amber',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-100',
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    icon: MessageSquare,
    title: 'Renegotiation',
    description:
      'Generate custom renegotiation playbooks with talking points, benchmark data, and suggested alternative clause language.',
    color: 'rose',
    bgLight: 'bg-rose-50',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-100',
    gradient: 'from-rose-500 to-rose-600',
  },
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

/**
 * Variantes de animação para o container com efeito stagger.
 * Usado nos cards de funcionalidades.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

/** Variante individual para cada card */
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      damping: 20,
      stiffness: 100,
    },
  },
}

/**
 * DemoContent — página de demonstração interativa.
 *
 * Estrutura:
 * 1. Hero — título e subtítulo chamativo
 * 2. Walkthrough — simulação passo a passo da análise de contrato
 *    - Step 1: Upload com drag & drop animado
 *    - Step 2: Processamento com extração de cláusulas em tempo real
 *    - Step 3: Dashboard de resultados com métricas
 * 3. Feature Highlights — 4 cards das funcionalidades principais
 * 4. CTA final — chamada para ação
 *
 * Design: Light Neobrutalism com fundo #FFFDF5, cards bg-white,
 * bordas slate-200, sombras 3px 3px, cantos arredondados 2xl.
 */
export function DemoContent() {
  /** Step atual do walkthrough (1-3) */
  const [activeStep, setActiveStep] = useState(1)
  /** Progresso da barra de processamento (0-100) no step 2 */
  const [progress, setProgress] = useState(0)
  /** Número de cláusulas já "extraídas" no step 2 */
  const [extractedCount, setExtractedCount] = useState(0)
  /** Controla se o walkthrough está em auto-play */
  const [isPlaying, setIsPlaying] = useState(false)

  /**
   * Efeito de auto-play do walkthrough.
   * Quando ativado, avança automaticamente pelos 3 steps.
   */
  useEffect(() => {
    if (!isPlaying) return

    if (activeStep === 1) {
      /** No step 1, aguarda 2s e avança para o processamento */
      const timer = setTimeout(() => {
        setActiveStep(2)
        setProgress(0)
        setExtractedCount(0)
      }, 2000)
      return () => clearTimeout(timer)
    }

    if (activeStep === 2) {
      /** No step 2, incrementa progresso e extrai cláusulas progressivamente */
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            setTimeout(() => setActiveStep(3), 500)
            return 100
          }
          return prev + 2
        })
      }, 60)

      const clauseInterval = setInterval(() => {
        setExtractedCount((prev) => {
          if (prev >= EXTRACTED_CLAUSES.length) {
            clearInterval(clauseInterval)
            return prev
          }
          return prev + 1
        })
      }, 500)

      return () => {
        clearInterval(progressInterval)
        clearInterval(clauseInterval)
      }
    }

    if (activeStep === 3) {
      /** No step 3, para o auto-play após 5s */
      const timer = setTimeout(() => setIsPlaying(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [isPlaying, activeStep])

  /** Inicia ou reinicia o walkthrough */
  const handleStartDemo = () => {
    setActiveStep(1)
    setProgress(0)
    setExtractedCount(0)
    setIsPlaying(true)
  }

  return (
    <div className="bg-[#FFFDF5] min-h-screen">
      {/* Decoração de fundo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100/40 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-100/20 rounded-full blur-[100px] translate-y-1/2" />

      {/* ===== HERO DA DEMO ===== */}
      <section className="relative pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <span className="inline-flex items-center rounded-full bg-teal-50 border border-teal-100 px-4 py-1.5 text-sm font-medium text-teal-600 mb-4">
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Interactive Demo
            </span>
          </motion.div>

          {/* Título */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight"
          >
            See Clausent{' '}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              in Action
            </span>
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            Watch how Clausent analyzes a real SaaS contract in seconds —
            from upload to actionable insights. No signup required.
          </motion.p>
        </div>
      </section>

      {/* ===== WALKTHROUGH INTERATIVO ===== */}
      <section className="relative pb-16 sm:pb-20">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {/* ---- Indicadores de step ---- */}
            <div className="flex items-center justify-center gap-4 sm:gap-8 mb-10">
              {DEMO_STEPS.map((step, index) => {
                const StepIcon = step.icon
                const isActive = activeStep === step.id
                const isCompleted = activeStep > step.id

                return (
                  <div key={step.id} className="flex items-center gap-4 sm:gap-8">
                    {/* Botão do step */}
                    <button
                      onClick={() => {
                        setActiveStep(step.id)
                        if (step.id === 2) {
                          setProgress(0)
                          setExtractedCount(0)
                        }
                        setIsPlaying(false)
                      }}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 border',
                        isActive
                          ? 'bg-teal-600 text-white border-teal-600 shadow-[3px_3px_0px_rgba(0,0,0,0.1)]'
                          : isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]'
                            : 'bg-white text-slate-400 border-slate-200 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <StepIcon
                          className={cn(
                            'h-4 w-4',
                            isActive && step.id === 2 && 'animate-spin'
                          )}
                        />
                      )}
                      <span className="hidden sm:inline text-sm font-medium">
                        {step.title}
                      </span>
                    </button>

                    {/* Conector entre steps */}
                    {index < DEMO_STEPS.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-slate-300 hidden sm:block" />
                    )}
                  </div>
                )
              })}
            </div>

            {/* ---- Área principal do walkthrough ---- */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-[5px_5px_0px_rgba(0,0,0,0.06)] overflow-hidden min-h-[400px]">
              {/* Barra de título estilo navegador */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-300" />
                  <div className="w-3 h-3 rounded-full bg-yellow-300" />
                  <div className="w-3 h-3 rounded-full bg-green-300" />
                </div>
                <div className="flex-1 mx-4 sm:mx-8">
                  <div className="h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 font-mono">
                      app.clausent.com/demo
                    </span>
                  </div>
                </div>
              </div>

              {/* Conteúdo do step ativo */}
              <div className="p-6 sm:p-10">
                <AnimatePresence mode="wait">
                  {/* ===== STEP 1: UPLOAD ===== */}
                  {activeStep === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                      className="flex flex-col items-center"
                    >
                      {/* Zona de drag & drop animada */}
                      <motion.div
                        animate={{
                          borderColor: isPlaying
                            ? ['#94a3b8', '#14b8a6', '#94a3b8']
                            : '#e2e8f0',
                        }}
                        transition={{
                          duration: 2,
                          repeat: isPlaying ? Infinity : 0,
                        }}
                        className="w-full max-w-lg border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center bg-slate-50/50"
                      >
                        {/* Ícone de upload animado */}
                        <motion.div
                          animate={
                            isPlaying
                              ? { y: [-5, 5, -5], scale: [1, 1.05, 1] }
                              : {}
                          }
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 mb-6"
                        >
                          <Upload className="h-8 w-8 text-teal-600" />
                        </motion.div>

                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          Drop your contract here
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                          Supports PDF, DOCX, and TXT files up to 25MB
                        </p>

                        {/* Arquivo simulado (aparece durante auto-play) */}
                        {isPlaying && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                          >
                            <FileText className="h-5 w-5 text-teal-600" />
                            <div className="text-left">
                              <p className="text-sm font-medium text-slate-700">
                                SaaS Agreement.pdf
                              </p>
                              <p className="text-xs text-slate-400">
                                2.4 MB — Acme Corp
                              </p>
                            </div>
                            <Check className="h-4 w-4 text-emerald-500" />
                          </motion.div>
                        )}
                      </motion.div>

                      {/* Botão de iniciar demo */}
                      {!isPlaying && (
                        <Button
                          onClick={handleStartDemo}
                          className="mt-8 bg-teal-600 hover:bg-teal-500 text-white rounded-xl px-8 h-12 text-base font-semibold shadow-[3px_3px_0px_rgba(0,0,0,0.1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.12)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Start Demo
                        </Button>
                      )}
                    </motion.div>
                  )}

                  {/* ===== STEP 2: PROCESSAMENTO ===== */}
                  {activeStep === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      {/* Cabeçalho do processamento */}
                      <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="h-5 w-5 text-teal-600 animate-pulse" />
                        <h3 className="text-lg font-semibold text-slate-900">
                          Analyzing SaaS Agreement.pdf
                        </h3>
                      </div>

                      {/* Barra de progresso */}
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-500">
                            Processing...
                          </span>
                          <span className="text-sm font-mono text-teal-600">
                            {progress}%
                          </span>
                        </div>
                        <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500"
                            initial={{ width: '0%' }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.1 }}
                          />
                        </div>
                      </div>

                      {/* Lista de cláusulas extraídas */}
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-600 mb-3">
                          Clauses extracted ({extractedCount}/
                          {EXTRACTED_CLAUSES.length}):
                        </p>
                        {EXTRACTED_CLAUSES.slice(0, extractedCount).map(
                          (clause, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                              className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-xl border',
                                clause.risk === 'high'
                                  ? 'bg-rose-50 border-rose-200'
                                  : clause.risk === 'medium'
                                    ? 'bg-amber-50 border-amber-200'
                                    : 'bg-emerald-50 border-emerald-200'
                              )}
                            >
                              {clause.risk === 'high' ? (
                                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                              ) : clause.risk === 'medium' ? (
                                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                              ) : (
                                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                              )}
                              <span className="text-sm text-slate-700">
                                {clause.text}
                              </span>
                              <span
                                className={cn(
                                  'ml-auto text-xs font-medium px-2 py-0.5 rounded-full shrink-0',
                                  clause.risk === 'high'
                                    ? 'bg-rose-100 text-rose-700'
                                    : clause.risk === 'medium'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-emerald-100 text-emerald-700'
                                )}
                              >
                                {clause.risk}
                              </span>
                            </motion.div>
                          )
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* ===== STEP 3: RESULTADOS ===== */}
                  {activeStep === 3 && (
                    <motion.div
                      key="step-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      {/* Cabeçalho dos resultados */}
                      <div className="flex items-center gap-3 mb-8">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200">
                          <Check className="h-4 w-4 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          Analysis Complete — SaaS Agreement.pdf
                        </h3>
                      </div>

                      {/* Cards de métricas principais */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        {/* Risk Score */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 }}
                          className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] text-center"
                        >
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 mx-auto mb-3">
                            <Shield className="h-6 w-6 text-amber-600" />
                          </div>
                          <p className="text-3xl font-bold text-amber-600">
                            67
                            <span className="text-base text-slate-400">
                              /100
                            </span>
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            Risk Score
                          </p>
                          <p className="text-xs text-amber-600 mt-1">
                            Medium Risk
                          </p>
                        </motion.div>

                        {/* Clauses Found */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] text-center"
                        >
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 mx-auto mb-3">
                            <FileText className="h-6 w-6 text-teal-600" />
                          </div>
                          <p className="text-3xl font-bold text-teal-600">12</p>
                          <p className="text-sm text-slate-500 mt-1">
                            Key Clauses Found
                          </p>
                          <p className="text-xs text-teal-600 mt-1">
                            2 require attention
                          </p>
                        </motion.div>

                        {/* Savings Potential */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 }}
                          className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] text-center"
                        >
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 mx-auto mb-3">
                            <DollarSign className="h-6 w-6 text-emerald-600" />
                          </div>
                          <p className="text-3xl font-bold text-emerald-600">
                            $4,200
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            Savings Potential
                          </p>
                          <p className="text-xs text-emerald-600 mt-1">
                            Per year
                          </p>
                        </motion.div>
                      </div>

                      {/* Mini gráfico de risco simulado */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="rounded-xl border border-slate-200 p-5 bg-slate-50/50"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm font-medium text-slate-700">
                            Risk Distribution
                          </p>
                          <span className="text-xs text-slate-400">
                            12 clauses analyzed
                          </span>
                        </div>
                        <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
                          <div className="bg-emerald-400 w-[42%] rounded-l-lg" />
                          <div className="bg-amber-400 w-[33%]" />
                          <div className="bg-rose-400 w-[25%] rounded-r-lg" />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            Low (5)
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            Medium (4)
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-rose-400" />
                            High (3)
                          </span>
                        </div>
                      </motion.div>

                      {/* Botão de reiniciar demo */}
                      <div className="mt-6 text-center">
                        <Button
                          onClick={handleStartDemo}
                          variant="outline"
                          className="rounded-xl border-slate-200 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Replay Demo
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURE HIGHLIGHTS ===== */}
      <section className="relative py-16 sm:py-20">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Cabeçalho da seção */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-flex items-center rounded-full bg-teal-50 border border-teal-100 px-4 py-1.5 text-sm font-medium text-teal-600 mb-4">
              Key Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Everything you need for{' '}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                smarter contracts
              </span>
            </h2>
          </motion.div>

          {/* Grade de cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {FEATURE_HIGHLIGHTS.map((feature) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  variants={cardVariants}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="group relative"
                >
                  <div className="relative h-full rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.08)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300">
                    {/* Gradiente de hover */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-50/50 to-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative">
                      {/* Ícone */}
                      <div
                        className={cn(
                          'inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5 group-hover:scale-110 transition-transform duration-300',
                          feature.bgLight,
                          feature.textColor
                        )}
                      >
                        <Icon className="h-6 w-6" strokeWidth={1.8} />
                      </div>

                      {/* Título */}
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {feature.title}
                      </h3>

                      {/* Descrição */}
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    {/* Linha de destaque no topo (hover) */}
                    <div
                      className={cn(
                        'absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                        feature.gradient,
                        'to-transparent'
                      )}
                    />
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="relative py-16 sm:py-20 pb-24 sm:pb-32">
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 p-8 sm:p-12 shadow-[5px_5px_0px_rgba(0,0,0,0.1)] text-center"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Try It Free — No Credit Card Required
            </h3>
            <p className="text-teal-100 mb-8 max-w-lg mx-auto">
              Start analyzing your contracts with AI in under 2 minutes. Free
              plan includes 5 contract analyses per month.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-teal-700 hover:bg-white/90 rounded-xl px-8 h-12 text-base font-semibold shadow-[3px_3px_0px_rgba(0,0,0,0.1)]"
              >
                <Link href="/sign-up">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-transparent border border-white/30 text-white hover:bg-white/10 hover:text-white hover:border-white/50 rounded-xl px-8 h-12 text-base font-medium"
              >
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
