'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
  Camera,
  User,
  Mail,
  Building2,
  Briefcase,
  Phone,
  Globe,
  Languages,
  Save,
  AlertTriangle,
  Trash2,
  Settings,
  CreditCard,
  Shield,
  Bell,
  Key,
  Puzzle,
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
import { cn } from '@/lib/utils'

/* =================================================================
   DADOS MOCK DO PERFIL
   Simulam os dados do usuário logado. Serão substituídos por dados
   reais do backend (Clerk + banco de dados) quando disponível.
   ================================================================= */

/** Valores iniciais do perfil do usuário */
const MOCK_PROFILE = {
  name: 'Alex Thompson',
  email: 'alex@company.com',
  company: 'Acme Corp',
  title: 'Contract Manager',
  phone: '+1 555-0123',
  timezone: 'America/New_York',
  language: 'en',
  avatar: null as string | null,
}

/** Lista de fusos horários mais comuns */
const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET) — New York' },
  { value: 'America/Chicago', label: 'Central Time (CT) — Chicago' },
  { value: 'America/Denver', label: 'Mountain Time (MT) — Denver' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT) — Los Angeles' },
  { value: 'America/Sao_Paulo', label: 'Brasília Time (BRT) — São Paulo' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT) — London' },
  { value: 'Europe/Paris', label: 'Central European Time (CET) — Paris' },
  { value: 'Europe/Berlin', label: 'Central European Time (CET) — Berlin' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST) — Tokyo' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST) — Shanghai' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST) — Mumbai' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET) — Sydney' },
  { value: 'Pacific/Auckland', label: 'New Zealand Time (NZT) — Auckland' },
]

/** Idiomas suportados pela plataforma */
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ja', label: '日本語' },
  { value: 'zh', label: '中文' },
]

/** Links da navegação de configurações */
const SETTINGS_NAV = [
  { href: '/dashboard/settings', label: 'general', icon: Settings },
  { href: '/dashboard/settings/billing', label: 'billing', icon: CreditCard },
  { href: '/dashboard/settings/profile', label: 'profile', icon: User },
  { href: '/dashboard/settings/security', label: 'security', icon: Shield },
  { href: '/dashboard/settings/notifications', label: 'notifications', icon: Bell },
  { href: '/dashboard/settings/api-keys', label: 'apiKeys', icon: Key },
  { href: '/dashboard/settings/integrations', label: 'integrations', icon: Puzzle },
]

/* =================================================================
   VARIANTES DE ANIMAÇÃO (Framer Motion)
   Definem as transições de entrada e interação dos elementos.
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
      type: 'spring' as const,
      stiffness: 260,
      damping: 24,
    },
  },
}

/** Variante para seções maiores — fade com deslocamento */
const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 240,
      damping: 22,
    },
  },
}

/* =================================================================
   COMPONENTE PRINCIPAL — Configurações de Perfil
   ================================================================= */

/**
 * Página completa de gerenciamento de perfil do usuário.
 *
 * Funcionalidades:
 * - Upload de avatar com overlay de câmera
 * - Edição de nome completo, empresa, cargo e telefone
 * - E-mail desabilitado (gerenciado pelo provedor de auth)
 * - Seletor de fuso horário com timezones comuns
 * - Seletor de idioma preferido
 * - Seção de exclusão de conta com aviso vermelho
 * - Navegação entre abas de configurações
 * - Animações de entrada com stagger e spring
 */
export function ProfileSettings() {
  const t = useTranslations('settings')

  /* ---------------------------------------------------------------
     ESTADO LOCAL
     Controla os valores dos campos do formulário.
     --------------------------------------------------------------- */

  /** Nome completo do usuário */
  const [name, setName] = useState(MOCK_PROFILE.name)

  /** Nome da empresa */
  const [company, setCompany] = useState(MOCK_PROFILE.company)

  /** Cargo/título profissional */
  const [jobTitle, setJobTitle] = useState(MOCK_PROFILE.title)

  /** Número de telefone */
  const [phone, setPhone] = useState(MOCK_PROFILE.phone)

  /** Fuso horário selecionado */
  const [timezone, setTimezone] = useState(MOCK_PROFILE.timezone)

  /** Idioma preferido */
  const [language, setLanguage] = useState(MOCK_PROFILE.language)

  /** URL do avatar (null = sem avatar personalizado) */
  const [avatarUrl, setAvatarUrl] = useState<string | null>(MOCK_PROFILE.avatar)

  /** Controla a exibição do diálogo de confirmação de exclusão */
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  /** Texto de confirmação digitado pelo usuário para excluir conta */
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  /** Indicador de salvamento em progresso */
  const [isSaving, setIsSaving] = useState(false)

  /* ---------------------------------------------------------------
     HANDLERS
     Funções para ações do formulário de perfil.
     --------------------------------------------------------------- */

  /**
   * Simula o upload de avatar.
   * Em produção, abriria o file picker e enviaria para o storage.
   * TODO: Integrar com API de upload de imagens.
   */
  function handleAvatarUpload() {
    /** Simula uma URL de avatar após "upload" */
    setAvatarUrl('https://placeholder.com/avatar.jpg')
  }

  /**
   * Salva as alterações do perfil.
   * Em produção, enviaria os dados para a API.
   * TODO: Integrar com endpoint de atualização de perfil.
   */
  async function handleSaveChanges() {
    setIsSaving(true)
    try {
      /** Simula latência de rede */
      await new Promise((resolve) => setTimeout(resolve, 1000))
      /** TODO: Chamada real à API de atualização */
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Solicita a exclusão da conta do usuário.
   * Requer a digitação de "DELETE" para confirmar.
   * TODO: Integrar com endpoint de exclusão de conta.
   */
  function handleDeleteAccount() {
    if (deleteConfirmText !== 'DELETE') return
    /** TODO: Chamar API de exclusão e redirecionar para logout */
  }

  /* ---------------------------------------------------------------
     RENDERIZAÇÃO
     --------------------------------------------------------------- */

  return (
    <motion.div
      className="max-w-3xl space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ============================================================
          CABEÇALHO — Título e descrição da página
          ============================================================ */}
      <motion.div variants={cardVariants}>
        <h1 className="text-2xl font-bold text-slate-900">
          {t('title')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t('profileDescription')}
        </p>
      </motion.div>

      {/* ============================================================
          NAVEGAÇÃO DE CONFIGURAÇÕES — Abas horizontais
          ============================================================ */}
      <motion.nav
        variants={cardVariants}
        className="flex gap-1 border-b border-slate-200 pb-px overflow-x-auto scrollbar-hide"
      >
        {SETTINGS_NAV.map((item) => {
          /** Identifica a aba ativa pelo href */
          const isActive = item.href === '/dashboard/settings/profile'
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-4 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors',
                isActive
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t(item.label)}
            </Link>
          )
        })}
      </motion.nav>

      {/* ============================================================
          SEÇÃO DE AVATAR — Upload com overlay de câmera
          ============================================================ */}
      <motion.div
        variants={cardVariants}
        className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]"
      >
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {t('profilePhoto')}
        </h2>

        <div className="flex items-center gap-6">
          {/* Avatar circular com overlay de câmera */}
          <button
            onClick={handleAvatarUpload}
            className="relative group cursor-pointer"
            type="button"
          >
            {/* Círculo do avatar */}
            <div
              className={cn(
                'w-24 h-24 rounded-full flex items-center justify-center',
                'border-2 border-slate-200 overflow-hidden',
                'bg-gradient-to-br from-teal-100 to-emerald-100'
              )}
            >
              {avatarUrl ? (
                /** Imagem do avatar quando disponível */
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                /** Iniciais quando não há avatar */
                <span className="text-2xl font-bold text-teal-700">
                  {name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              )}
            </div>

            {/* Overlay de câmera — aparece ao passar o mouse */}
            <div
              className={cn(
                'absolute inset-0 rounded-full flex items-center justify-center',
                'bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200'
              )}
            >
              <Camera className="h-6 w-6 text-white" />
            </div>
          </button>

          {/* Instruções de upload */}
          <div>
            <p className="text-sm font-medium text-slate-700">
              {t('uploadPhoto')}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {t('photoRequirements')}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAvatarUpload}
              className="mt-3 rounded-xl text-xs gap-1.5"
            >
              <Camera className="h-3.5 w-3.5" />
              {t('changePhoto')}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ============================================================
          FORMULÁRIO DE INFORMAÇÕES PESSOAIS
          ============================================================ */}
      <motion.div
        variants={sectionVariants}
        className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] space-y-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          {t('personalInformation')}
        </h2>

        {/* Grid de campos — 2 colunas em desktop, 1 em mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Campo: Nome completo */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              {t('fullName')}
            </Label>
            <Input
              id="fullName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="rounded-xl"
            />
          </div>

          {/* Campo: E-mail (desabilitado) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              {t('email')}
            </Label>
            <Input
              id="email"
              type="email"
              value={MOCK_PROFILE.email}
              disabled
              className="rounded-xl bg-slate-50 cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-400">
              {t('emailManagedByProvider')}
            </p>
          </div>

          {/* Campo: Nome da empresa */}
          <div className="space-y-2">
            <Label htmlFor="company" className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              {t('companyName')}
            </Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Corp"
              className="rounded-xl"
            />
          </div>

          {/* Campo: Cargo */}
          <div className="space-y-2">
            <Label htmlFor="jobTitle" className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
              {t('jobTitle')}
            </Label>
            <Input
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Contract Manager"
              className="rounded-xl"
            />
          </div>

          {/* Campo: Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              {t('phoneNumber')}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555-0123"
              className="rounded-xl"
            />
          </div>
        </div>
      </motion.div>

      {/* ============================================================
          PREFERÊNCIAS — Fuso horário e idioma
          ============================================================ */}
      <motion.div
        variants={sectionVariants}
        className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] space-y-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          {t('preferences')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Seletor de fuso horário */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              {t('timezone')}
            </Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder={t('selectTimezone')} />
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-60">
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-slate-400">
              {t('timezoneDescription')}
            </p>
          </div>

          {/* Seletor de idioma */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Languages className="h-3.5 w-3.5 text-slate-400" />
              {t('language')}
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder={t('selectLanguage')} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-slate-400">
              {t('languageDescription')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ============================================================
          BOTÃO DE SALVAR ALTERAÇÕES
          ============================================================ */}
      <motion.div variants={cardVariants} className="flex justify-end">
        <Button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2 px-6"
        >
          <Save className="h-4 w-4" />
          {isSaving ? t('saving') : t('saveChanges')}
        </Button>
      </motion.div>

      {/* ============================================================
          SEÇÃO DE EXCLUSÃO DE CONTA — Zona de perigo
          ============================================================ */}
      <motion.div
        variants={sectionVariants}
        className="rounded-2xl bg-white border border-red-200 p-6 shadow-[3px_3px_0px_rgba(239,68,68,0.08)]"
      >
        {/* Cabeçalho com ícone de alerta */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-red-700">
              {t('dangerZone')}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {t('deleteAccountWarning')}
            </p>

            {/* Detalhes sobre o que acontece ao excluir */}
            <div className="mt-4 p-4 rounded-xl bg-red-50/50 border border-red-100">
              <p className="text-xs text-red-600 font-medium mb-2">
                {t('deleteAccountConsequences')}
              </p>
              <ul className="space-y-1.5">
                <li className="text-xs text-red-500 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {t('deleteConsequence1')}
                </li>
                <li className="text-xs text-red-500 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {t('deleteConsequence2')}
                </li>
                <li className="text-xs text-red-500 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {t('deleteConsequence3')}
                </li>
                <li className="text-xs text-red-500 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {t('deleteConsequence4')}
                </li>
              </ul>
            </div>

            {/* Botão para mostrar/esconder a confirmação */}
            {!showDeleteConfirm ? (
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="mt-4 rounded-xl text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t('deleteAccount')}
              </Button>
            ) : (
              /** Campo de confirmação — exige digitar "DELETE" */
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 space-y-3"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="deleteConfirm"
                    className="text-sm text-red-600 font-medium"
                  >
                    {t('typeDeleteToConfirm')}
                  </Label>
                  <Input
                    id="deleteConfirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="rounded-xl border-red-200 focus:ring-red-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteConfirmText('')
                    }}
                    className="rounded-xl"
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'DELETE'}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('permanentlyDeleteAccount')}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
