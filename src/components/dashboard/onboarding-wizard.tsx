'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  DollarSign,
  ShieldCheck,
  Bell,
  Building2,
  Users,
  FileText,
  Upload,
  X,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  PartyPopper,
  LayoutDashboard,
  UserPlus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Link } from '@/lib/i18n/navigation'
import { BracketClauseLogo } from '@/components/shared/bracket-clause-logo'
import { cn } from '@/lib/utils'

/* =================================================================
   CONSTANTES
   Opções de seleção para o formulário de perfil da empresa.
   ================================================================= */

/** Setores de indústria disponíveis no dropdown */
const INDUSTRIES = [
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'legal', label: 'Legal' },
  { value: 'other', label: 'Other' },
] as const

/** Faixas de tamanho de empresa */
const COMPANY_SIZES = [
  { value: '1-10', label: '1–10 employees' },
  { value: '11-50', label: '11–50 employees' },
  { value: '51-200', label: '51–200 employees' },
  { value: '201-500', label: '201–500 employees' },
  { value: '500+', label: '500+ employees' },
] as const

/** Faixas de quantidade de contratos ativos */
const CONTRACT_RANGES = [
  { value: '1-5', label: '1–5 contracts' },
  { value: '6-25', label: '6–25 contracts' },
  { value: '26-100', label: '26–100 contracts' },
  { value: '100+', label: '100+ contracts' },
] as const

/** Casos de uso primários — radio buttons */
const USE_CASES = [
  { value: 'cost-optimization', label: 'Cost Optimization' },
  { value: 'risk-management', label: 'Risk Management' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'all', label: 'All of the above' },
] as const

/** Tipos MIME aceitos para upload de contratos */
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

/** Número total de passos do wizard */
const TOTAL_STEPS = 4

/** Proposta de valor — 3 pontos destacados na tela de boas-vindas */
const VALUE_PROPOSITIONS = [
  {
    icon: DollarSign,
    title: 'Save Money',
    description: 'Identify cost-saving opportunities across all your contracts.',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    icon: ShieldCheck,
    title: 'Reduce Risk',
    description: 'AI-powered risk scoring to catch unfavorable terms early.',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-600',
  },
  {
    icon: Bell,
    title: 'Never Miss Renewals',
    description: 'Smart alerts ensure you always renegotiate on time.',
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-600',
  },
] as const

/** Cards de ação rápida exibidos no step final */
const QUICK_ACTIONS = [
  {
    icon: Upload,
    title: 'Upload a Contract',
    description: 'Start analyzing your first contract now.',
    href: '/dashboard/contracts/new',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-600',
  },
  {
    icon: LayoutDashboard,
    title: 'Explore Dashboard',
    description: 'See your portfolio overview and insights.',
    href: '/dashboard',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    icon: UserPlus,
    title: 'Invite Team Members',
    description: 'Collaborate with your team on contracts.',
    href: '/dashboard/team',
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-600',
  },
] as const

/* =================================================================
   TIPAGEM
   Interface dos dados coletados ao longo do wizard.
   ================================================================= */

/** Estrutura dos dados do formulário do onboarding */
interface OnboardingFormData {
  companyName: string
  industry: string
  companySize: string
  contractCount: string
  primaryUseCase: string
  uploadedFile: File | null
}

/** Estado inicial do formulário — tudo vazio */
const INITIAL_FORM_DATA: OnboardingFormData = {
  companyName: '',
  industry: '',
  companySize: '',
  contractCount: '',
  primaryUseCase: '',
  uploadedFile: null,
}

/* =================================================================
   VARIANTES DE ANIMAÇÃO (Framer Motion)
   Transições para entrada/saída dos steps e elementos internos.
   ================================================================= */

/** Direção da animação — 1 para avanço, -1 para retrocesso */
type Direction = 1 | -1

/**
 * Gera variantes de slide baseado na direção.
 * Avançar: slide da direita. Voltar: slide da esquerda.
 */
const slideVariants = {
  enter: (direction: Direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: Direction) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
}

/** Transição suave para os slides */
const slideTransition = {
  x: { type: 'spring' as const, stiffness: 300, damping: 30 },
  opacity: { duration: 0.25 },
}

/** Container pai para stagger dos filhos */
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
}

/** Item filho com fade + deslocamento vertical */
const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
}

/** Animação de escala para o checkmark de sucesso */
const checkmarkVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 250,
      damping: 20,
      delay: 0.2,
    },
  },
}

/** Variante para os confetti particles */
const confettiVariants = {
  hidden: { opacity: 0, scale: 0, y: 0 },
  visible: (i: number) => ({
    opacity: [0, 1, 1, 0],
    scale: [0, 1.2, 1, 0.8],
    y: [0, -60 - Math.random() * 40, -80 - Math.random() * 60, 20],
    x: [0, (i % 2 === 0 ? 1 : -1) * (20 + Math.random() * 50)],
    rotate: [0, Math.random() * 360],
    transition: {
      duration: 1.8,
      delay: i * 0.08,
      ease: 'easeOut' as const,
    },
  }),
}

/** Cores dos confetti particles */
const CONFETTI_COLORS = [
  'bg-teal-400',
  'bg-emerald-400',
  'bg-sky-400',
  'bg-amber-400',
  'bg-rose-400',
  'bg-violet-400',
  'bg-teal-500',
  'bg-emerald-500',
]

/* =================================================================
   COMPONENTE PRINCIPAL
   ================================================================= */

/**
 * Wizard de onboarding multi-step para novos usuários.
 *
 * Fluxo de 4 passos:
 * 1. Boas-vindas — apresentação da proposta de valor
 * 2. Perfil da empresa — coleta de dados do negócio
 * 3. Primeiro contrato — upload simplificado (opcional)
 * 4. Conclusão — celebração e ações rápidas
 *
 * Usa AnimatePresence para transições suaves entre steps.
 * Estado gerenciado localmente via useState.
 */
export function OnboardingWizard() {
  /** Passo atual do wizard (1–4) */
  const [currentStep, setCurrentStep] = useState(1)
  /** Direção da animação para slide correto */
  const [direction, setDirection] = useState<Direction>(1)
  /** Dados coletados no formulário */
  const [formData, setFormData] = useState<OnboardingFormData>(INITIAL_FORM_DATA)
  /** Estado de drag & drop ativo */
  const [isDragging, setIsDragging] = useState(false)
  /** Referência ao input de arquivo oculto */
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ---------------------------------------------------------------
     HANDLERS DE NAVEGAÇÃO
     --------------------------------------------------------------- */

  /** Avançar para o próximo passo */
  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      setDirection(1)
      setCurrentStep((prev) => prev + 1)
    }
  }, [currentStep])

  /** Voltar para o passo anterior */
  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setDirection(-1)
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  /* ---------------------------------------------------------------
     HANDLERS DO FORMULÁRIO
     --------------------------------------------------------------- */

  /** Atualizar campo do formulário de forma genérica */
  const updateField = useCallback(
    <K extends keyof OnboardingFormData>(field: K, value: OnboardingFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  /* ---------------------------------------------------------------
     HANDLERS DE UPLOAD
     --------------------------------------------------------------- */

  /** Processar arquivo selecionado (drag ou input) */
  const handleFile = useCallback((file: File) => {
    /** Validar tipo MIME */
    if (!ACCEPTED_TYPES.includes(file.type)) return
    updateField('uploadedFile', file)
  }, [updateField])

  /** Drag over — ativar indicador visual */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  /** Drag leave — desativar indicador visual */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  /** Drop — processar arquivo solto na área */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  /** Seleção via input de arquivo nativo */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  /** Remover arquivo selecionado */
  const handleRemoveFile = useCallback(() => {
    updateField('uploadedFile', null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [updateField])

  /** Formatar tamanho de arquivo para exibição legível */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  /* ---------------------------------------------------------------
     CÁLCULO DA BARRA DE PROGRESSO
     --------------------------------------------------------------- */

  /** Percentual de progresso baseado no step atual */
  const progressPercent = (currentStep / TOTAL_STEPS) * 100

  /* ---------------------------------------------------------------
     RENDERIZAÇÃO DOS STEPS
     --------------------------------------------------------------- */

  /**
   * Step 1 — Boas-vindas.
   * Apresenta o logo, headline e 3 pontos de valor.
   */
  const renderWelcomeStep = () => (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center text-center"
    >
      {/* Logo animado */}
      <motion.div variants={staggerItem} className="mb-6">
        <div className="w-20 h-20 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
          <BracketClauseLogo className="h-10 w-10 text-teal-600" strokeWidth={2.5} />
        </div>
      </motion.div>

      {/* Headline de boas-vindas */}
      <motion.h2
        variants={staggerItem}
        className="text-3xl font-bold text-slate-900 mb-2"
      >
        Welcome to Clausent!
      </motion.h2>

      <motion.p
        variants={staggerItem}
        className="text-slate-500 mb-10 max-w-md"
      >
        Your AI-powered contract intelligence platform. Let&apos;s set things up
        so you can start saving time and money.
      </motion.p>

      {/* 3 cards de proposta de valor */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl mb-10">
        {VALUE_PROPOSITIONS.map((prop) => {
          const Icon = prop.icon
          return (
            <motion.div
              key={prop.title}
              variants={staggerItem}
              className="rounded-2xl bg-white border border-slate-200 p-5 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.08)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center mb-3 mx-auto',
                  prop.bgColor
                )}
              >
                <Icon className={cn('h-5 w-5', prop.textColor)} />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">
                {prop.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {prop.description}
              </p>
            </motion.div>
          )
        })}
      </div>

      {/* Botão de início */}
      <motion.div variants={staggerItem}>
        <Button
          onClick={handleNext}
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-8 py-2.5 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2 text-sm font-medium"
        >
          <Sparkles className="h-4 w-4" />
          Let&apos;s get started
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  )

  /**
   * Step 2 — Perfil da empresa.
   * Formulário com campos de dados corporativos.
   */
  const renderCompanyStep = () => (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-lg mx-auto w-full"
    >
      {/* Cabeçalho do step */}
      <motion.div variants={staggerItem} className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
          <Building2 className="h-7 w-7 text-teal-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          Tell us about your company
        </h2>
        <p className="text-sm text-slate-500">
          This helps us tailor Clausent to your needs.
        </p>
      </motion.div>

      {/* Formulário */}
      <div className="space-y-5">
        {/* Nome da empresa */}
        <motion.div variants={staggerItem} className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            placeholder="e.g. Acme Corp"
            value={formData.companyName}
            onChange={(e) => updateField('companyName', e.target.value)}
            className="rounded-xl border-slate-200 focus-visible:border-teal-400 focus-visible:ring-teal-400/20"
          />
        </motion.div>

        {/* Setor de indústria */}
        <motion.div variants={staggerItem} className="space-y-2">
          <Label>Industry</Label>
          <Select
            value={formData.industry}
            onValueChange={(val) => updateField('industry', val)}
          >
            <SelectTrigger className="w-full rounded-xl border-slate-200">
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind.value} value={ind.value}>
                  {ind.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Tamanho da empresa */}
        <motion.div variants={staggerItem} className="space-y-2">
          <Label>Company Size</Label>
          <Select
            value={formData.companySize}
            onValueChange={(val) => updateField('companySize', val)}
          >
            <SelectTrigger className="w-full rounded-xl border-slate-200">
              <SelectValue placeholder="How many employees?" />
            </SelectTrigger>
            <SelectContent>
              {COMPANY_SIZES.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Número aproximado de contratos */}
        <motion.div variants={staggerItem} className="space-y-2">
          <Label>Active Contracts</Label>
          <Select
            value={formData.contractCount}
            onValueChange={(val) => updateField('contractCount', val)}
          >
            <SelectTrigger className="w-full rounded-xl border-slate-200">
              <SelectValue placeholder="Approximate number" />
            </SelectTrigger>
            <SelectContent>
              {CONTRACT_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Caso de uso primário — radio buttons estilizados */}
        <motion.div variants={staggerItem} className="space-y-3">
          <Label>Primary Use Case</Label>
          <div className="grid grid-cols-2 gap-3">
            {USE_CASES.map((uc) => (
              <button
                key={uc.value}
                type="button"
                onClick={() => updateField('primaryUseCase', uc.value)}
                className={cn(
                  'rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200',
                  formData.primaryUseCase === uc.value
                    ? 'border-teal-400 bg-teal-50 text-teal-700 shadow-[2px_2px_0px_rgba(0,0,0,0.06)]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                {uc.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )

  /**
   * Step 3 — Upload do primeiro contrato.
   * Área de drag & drop simplificada com opção de skip.
   */
  const renderUploadStep = () => (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-lg mx-auto w-full"
    >
      {/* Cabeçalho do step */}
      <motion.div variants={staggerItem} className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
          <FileText className="h-7 w-7 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          Upload your first contract
        </h2>
        <p className="text-sm text-slate-500">
          Upload your first contract to see Clausent in action.
        </p>
      </motion.div>

      {/* Área de drag & drop */}
      <motion.div variants={staggerItem}>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !formData.uploadedFile && fileInputRef.current?.click()}
          className={cn(
            'rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200',
            isDragging
              ? 'border-teal-400 bg-teal-50'
              : formData.uploadedFile
                ? 'border-emerald-300 bg-emerald-50/50 cursor-default'
                : 'border-slate-300 bg-white hover:border-teal-400 hover:bg-teal-50/30 cursor-pointer',
            'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]'
          )}
        >
          {/* Input de arquivo oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleInputChange}
            className="hidden"
          />

          {formData.uploadedFile ? (
            /** Arquivo selecionado — exibir detalhes */
            <div className="space-y-3">
              <div className="flex items-center gap-3 justify-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-900 text-sm">
                    {formData.uploadedFile.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatFileSize(formData.uploadedFile.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveFile()
                  }}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4 text-slate-400 hover:text-red-500" />
                </button>
              </div>
              <p className="text-xs text-emerald-600 font-medium">
                Ready to be analyzed
              </p>
            </div>
          ) : (
            /** Estado vazio — instruções de drag & drop */
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                <Upload className="h-7 w-7 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Drag & drop your contract here
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  or{' '}
                  <span className="text-teal-600 font-medium">browse files</span>
                </p>
              </div>
              <p className="text-xs text-slate-400">
                Supported: PDF, DOCX (max 25MB)
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Opção de skip */}
      <motion.div variants={staggerItem} className="text-center mt-6">
        <button
          type="button"
          onClick={handleNext}
          className="text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
        >
          Or skip for now
        </button>
      </motion.div>
    </motion.div>
  )

  /**
   * Step 4 — Conclusão com celebração.
   * Animação de confetti, resumo e ações rápidas.
   */
  const renderCompleteStep = () => (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center text-center"
    >
      {/* Efeito confetti — partículas coloridas decorativas */}
      <div className="relative mb-6">
        {CONFETTI_COLORS.map((color, i) => (
          <motion.div
            key={`confetti-${i}`}
            custom={i}
            variants={confettiVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              'absolute w-2 h-2 rounded-full',
              color
            )}
            style={{
              left: '50%',
              top: '50%',
            }}
          />
        ))}

        {/* Ícone de celebração com animação de escala */}
        <motion.div
          variants={checkmarkVariants}
          initial="hidden"
          animate="visible"
          className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,0.06)] relative z-10"
        >
          <PartyPopper className="h-10 w-10 text-emerald-500" />
        </motion.div>
      </div>

      {/* Headline de conclusão */}
      <motion.h2
        variants={staggerItem}
        className="text-3xl font-bold text-slate-900 mb-2"
      >
        You&apos;re all set!
      </motion.h2>

      <motion.p
        variants={staggerItem}
        className="text-slate-500 mb-3 max-w-md"
      >
        Your account is ready. Here&apos;s what you can do with Clausent:
      </motion.p>

      {/* Resumo de capacidades */}
      <motion.div
        variants={staggerItem}
        className="flex flex-wrap items-center justify-center gap-2 mb-10"
      >
        {[
          { icon: FileText, label: 'Analyze contracts' },
          { icon: Bell, label: 'Set up alerts' },
          { icon: DollarSign, label: 'View benchmarks' },
        ].map((item) => {
          const Icon = item.icon
          return (
            <span
              key={item.label}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-3 py-1.5"
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </span>
          )
        })}
      </motion.div>

      {/* Cards de ação rápida */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <motion.div key={action.title} variants={staggerItem}>
              <Link href={action.href} className="block group">
                <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.08)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 h-full">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
                      action.bgColor
                    )}
                  >
                    <Icon className={cn('h-5 w-5', action.textColor)} />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1 group-hover:text-teal-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Botão principal — ir ao dashboard */}
      <motion.div variants={staggerItem}>
        <Link href="/dashboard">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-8 py-2.5 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2 text-sm font-medium">
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  )

  /** Mapa de renderização por step */
  const stepRenderers: Record<number, () => React.ReactNode> = {
    1: renderWelcomeStep,
    2: renderCompanyStep,
    3: renderUploadStep,
    4: renderCompleteStep,
  }

  /* ---------------------------------------------------------------
     RENDERIZAÇÃO PRINCIPAL
     --------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex flex-col">
      {/* ============================================================
          BARRA DE PROGRESSO — fixa no topo
          ============================================================ */}
      <div className="sticky top-0 z-50 bg-[#FFFDF5]/90 backdrop-blur-sm border-b border-slate-100 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          {/* Indicador textual do passo */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
            <span className="text-xs font-medium text-teal-600">
              {Math.round(progressPercent)}% complete
            </span>
          </div>

          {/* Barra visual de progresso */}
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>

          {/* Indicadores de step — bolinhas */}
          <div className="flex items-center justify-between mt-3">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
              <div key={step} className="flex items-center gap-1.5">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300',
                    step < currentStep
                      ? 'bg-teal-600 text-white'
                      : step === currentStep
                        ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-400/30'
                        : 'bg-slate-100 text-slate-400'
                  )}
                >
                  {step < currentStep ? (
                    <CheckCircle className="h-3.5 w-3.5" />
                  ) : (
                    step
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium hidden sm:inline',
                    step === currentStep ? 'text-slate-700' : 'text-slate-400'
                  )}
                >
                  {step === 1 && 'Welcome'}
                  {step === 2 && 'Company'}
                  {step === 3 && 'Upload'}
                  {step === 4 && 'Done'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================
          CONTEÚDO DO STEP — com transição animada
          ============================================================ */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
            >
              {stepRenderers[currentStep]?.()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ============================================================
          NAVEGAÇÃO INFERIOR — botões de voltar/avançar
          ============================================================ */}
      {currentStep > 1 && currentStep < TOTAL_STEPS && (
        <div className="sticky bottom-0 bg-[#FFFDF5]/90 backdrop-blur-sm border-t border-slate-100 px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            {/* Botão voltar */}
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-slate-500 hover:text-slate-700 rounded-full gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {/* Botão avançar */}
            <Button
              onClick={handleNext}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-1.5"
            >
              {currentStep === 3 ? 'Continue' : 'Next'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
