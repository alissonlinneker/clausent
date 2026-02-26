'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  QrCode,
  Monitor,
  Globe,
  Cpu,
  Key,
  LogOut,
  Download,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Settings,
  CreditCard,
  User,
  Shield,
  Bell,
  Puzzle,
  Copy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'

/* =================================================================
   TIPOS E INTERFACES
   Definem a estrutura dos dados de sessão e atividade de login.
   ================================================================= */

/** Tipo de dispositivo de uma sessão ativa */
type DeviceType = 'desktop' | 'mobile' | 'api'

/** Estrutura de uma sessão ativa do usuário */
interface ActiveSession {
  /** Identificador único da sessão */
  id: string
  /** Tipo de dispositivo da sessão */
  deviceType: DeviceType
  /** Nome descritivo do dispositivo/navegador */
  deviceName: string
  /** Endereço IP da sessão */
  ip: string
  /** Localização aproximada da sessão */
  location: string
  /** Tempo relativo desde a última atividade */
  lastActive: string
  /** Se esta é a sessão atual do usuário */
  isCurrent: boolean
}

/** Estrutura de um registro de atividade de login */
interface LoginActivity {
  /** Identificador único do registro */
  id: string
  /** Endereço IP de origem do login */
  ip: string
  /** Navegador/cliente usado */
  browser: string
  /** Localização de origem do login */
  location: string
  /** Data e hora do login (ISO string) */
  timestamp: string
  /** Se o login foi bem-sucedido ou falhou */
  success: boolean
}

/* =================================================================
   DADOS MOCK
   Simulam sessões e atividades reais. Serão substituídos por dados
   do backend quando a integração estiver pronta.
   ================================================================= */

/** Sessões ativas do usuário */
const MOCK_SESSIONS: ActiveSession[] = [
  {
    id: 's1',
    deviceType: 'desktop',
    deviceName: 'Chrome on macOS',
    ip: '192.168.1.1',
    location: 'San Francisco, CA',
    lastActive: 'Active now',
    isCurrent: true,
  },
  {
    id: 's2',
    deviceType: 'mobile',
    deviceName: 'Safari on iPhone',
    ip: '10.0.0.5',
    location: 'New York, NY',
    lastActive: '2 hours ago',
    isCurrent: false,
  },
  {
    id: 's3',
    deviceType: 'api',
    deviceName: 'API Key',
    ip: '54.23.1.100',
    location: 'AWS us-east-1',
    lastActive: '5 hours ago',
    isCurrent: false,
  },
]

/** Histórico recente de logins */
const MOCK_LOGIN_ACTIVITY: LoginActivity[] = [
  {
    id: 'l1',
    ip: '192.168.1.1',
    browser: 'Chrome 121',
    location: 'San Francisco, CA',
    timestamp: '2026-02-26T14:30:00Z',
    success: true,
  },
  {
    id: 'l2',
    ip: '10.0.0.5',
    browser: 'Safari 17',
    location: 'New York, NY',
    timestamp: '2026-02-26T12:15:00Z',
    success: true,
  },
  {
    id: 'l3',
    ip: '203.45.67.89',
    browser: 'Firefox 122',
    location: 'London, UK',
    timestamp: '2026-02-25T22:45:00Z',
    success: false,
  },
  {
    id: 'l4',
    ip: '54.23.1.100',
    browser: 'API Client',
    location: 'AWS us-east-1',
    timestamp: '2026-02-25T09:20:00Z',
    success: true,
  },
  {
    id: 'l5',
    ip: '192.168.1.1',
    browser: 'Chrome 121',
    location: 'San Francisco, CA',
    timestamp: '2026-02-24T16:00:00Z',
    success: true,
  },
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

/** Variante dos cards — surgem com spring de baixo */
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

/** Variante para seções maiores */
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

/** Variante para itens de lista — stagger individual */
const listItemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 280,
      damping: 26,
    },
  },
}

/* =================================================================
   UTILITÁRIOS
   ================================================================= */

/**
 * Retorna o ícone correto para cada tipo de dispositivo.
 * Facilita a identificação visual rápida do tipo de sessão.
 */
function getDeviceIcon(type: DeviceType) {
  switch (type) {
    case 'desktop':
      return Monitor
    case 'mobile':
      return Smartphone
    case 'api':
      return Cpu
  }
}

/**
 * Retorna as classes de cor para o badge do tipo de dispositivo.
 * Cada tipo tem cores distintas para diferenciação visual.
 */
function getDeviceBadgeStyles(type: DeviceType): string {
  switch (type) {
    case 'desktop':
      return 'bg-teal-50 text-teal-700 border-teal-200'
    case 'mobile':
      return 'bg-sky-50 text-sky-700 border-sky-200'
    case 'api':
      return 'bg-amber-50 text-amber-700 border-amber-200'
  }
}

/**
 * Formata uma data ISO para exibição amigável.
 * Retorna data e hora no formato local do usuário.
 */
function formatLoginDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/* =================================================================
   COMPONENTE PRINCIPAL — Configurações de Segurança
   ================================================================= */

/**
 * Página completa de gerenciamento de segurança da conta.
 *
 * Funcionalidades:
 * - Alteração de senha com validação de força
 * - Ativação/desativação de 2FA com QR code placeholder
 * - Lista de sessões ativas com opção de revogar
 * - Histórico de atividade de login com IPs e localizações
 * - Exportação de dados (GDPR compliance)
 * - Navegação entre abas de configurações
 * - Animações de entrada com stagger e spring
 */
export function SecuritySettings() {
  const t = useTranslations('settings')

  /* ---------------------------------------------------------------
     ESTADO LOCAL
     --------------------------------------------------------------- */

  /** Senha atual para validação */
  const [currentPassword, setCurrentPassword] = useState('')

  /** Nova senha desejada */
  const [newPassword, setNewPassword] = useState('')

  /** Confirmação da nova senha */
  const [confirmPassword, setConfirmPassword] = useState('')

  /** Controla a visibilidade da senha atual */
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)

  /** Controla a visibilidade da nova senha */
  const [showNewPassword, setShowNewPassword] = useState(false)

  /** Controla a visibilidade da confirmação de senha */
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  /** Estado do 2FA — ativo ou inativo */
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)

  /** Indica se a configuração de 2FA está em andamento */
  const [is2FASetupVisible, setIs2FASetupVisible] = useState(false)

  /** Lista de sessões (mutável para permitir revogação local) */
  const [sessions, setSessions] = useState<ActiveSession[]>(MOCK_SESSIONS)

  /** Indica se a alteração de senha está em progresso */
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  /** Indica se a exportação de dados está em progresso */
  const [isExporting, setIsExporting] = useState(false)

  /** Código de backup do 2FA (exibido após configuração) */
  const [backupCodes] = useState([
    'A1B2-C3D4',
    'E5F6-G7H8',
    'I9J0-K1L2',
    'M3N4-O5P6',
    'Q7R8-S9T0',
    'U1V2-W3X4',
  ])

  /* ---------------------------------------------------------------
     HANDLERS
     --------------------------------------------------------------- */

  /**
   * Altera a senha do usuário.
   * Valida se a nova senha e confirmação coincidem.
   * TODO: Integrar com API de alteração de senha.
   */
  async function handleChangePassword() {
    /** Validação: senhas devem coincidir */
    if (newPassword !== confirmPassword) return
    /** Validação: todos os campos obrigatórios */
    if (!currentPassword || !newPassword) return

    setIsChangingPassword(true)
    try {
      /** Simula latência de rede */
      await new Promise((resolve) => setTimeout(resolve, 1200))
      /** Limpa os campos após sucesso */
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } finally {
      setIsChangingPassword(false)
    }
  }

  /**
   * Alterna o estado do 2FA.
   * Quando ativado, exibe o QR code e instruções de configuração.
   * TODO: Integrar com API de 2FA.
   */
  function handleToggle2FA(enabled: boolean) {
    if (enabled) {
      /** Mostra o setup quando ativado */
      setIs2FASetupVisible(true)
      setIs2FAEnabled(true)
    } else {
      /** Esconde o setup quando desativado */
      setIs2FASetupVisible(false)
      setIs2FAEnabled(false)
    }
  }

  /**
   * Revoga uma sessão ativa específica.
   * Remove a sessão da lista local.
   * TODO: Integrar com API de revogação de sessão.
   */
  function handleRevokeSession(sessionId: string) {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
  }

  /**
   * Solicita a exportação dos dados do usuário (GDPR).
   * Em produção, enfileiraria um job no backend.
   * TODO: Integrar com API de exportação de dados.
   */
  async function handleExportData() {
    setIsExporting(true)
    try {
      /** Simula processamento de exportação */
      await new Promise((resolve) => setTimeout(resolve, 2000))
      /** TODO: Disparar download ou enviar link por e-mail */
    } finally {
      setIsExporting(false)
    }
  }

  /**
   * Calcula a força da senha baseada em critérios comuns.
   * Retorna um score de 0 a 4 e o label descritivo.
   */
  function getPasswordStrength(password: string): {
    score: number
    label: string
    color: string
  } {
    if (!password) return { score: 0, label: '', color: '' }

    let score = 0
    /** Verifica comprimento mínimo */
    if (password.length >= 8) score++
    /** Verifica presença de letras maiúsculas */
    if (/[A-Z]/.test(password)) score++
    /** Verifica presença de números */
    if (/[0-9]/.test(password)) score++
    /** Verifica presença de caracteres especiais */
    if (/[^A-Za-z0-9]/.test(password)) score++

    const labels: Record<number, { label: string; color: string }> = {
      1: { label: 'Weak', color: 'bg-red-500' },
      2: { label: 'Fair', color: 'bg-amber-500' },
      3: { label: 'Good', color: 'bg-teal-500' },
      4: { label: 'Strong', color: 'bg-emerald-500' },
    }

    return {
      score,
      label: labels[score]?.label || '',
      color: labels[score]?.color || '',
    }
  }

  /** Força calculada da nova senha */
  const passwordStrength = getPasswordStrength(newPassword)

  /** Verifica se as senhas coincidem (para feedback visual) */
  const passwordsMatch =
    newPassword && confirmPassword && newPassword === confirmPassword

  /** Verifica se as senhas não coincidem (para feedback de erro) */
  const passwordsMismatch =
    newPassword && confirmPassword && newPassword !== confirmPassword

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
          CABEÇALHO — Título e descrição
          ============================================================ */}
      <motion.div variants={cardVariants}>
        <h1 className="text-2xl font-bold text-slate-900">
          {t('title')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t('securityDescription')}
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
          const isActive = item.href === '/dashboard/settings/security'
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
          SEÇÃO DE ALTERAÇÃO DE SENHA
          ============================================================ */}
      <motion.div
        variants={sectionVariants}
        className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] space-y-6"
      >
        {/* Cabeçalho da seção */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <Lock className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t('changePassword')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('changePasswordDescription')}
            </p>
          </div>
        </div>

        {/* Campos de senha */}
        <div className="space-y-4">
          {/* Campo: Senha atual */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl pr-10"
              />
              {/* Toggle de visibilidade */}
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Campo: Nova senha com indicador de força */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t('newPassword')}</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Indicador de força da senha */}
            {newPassword && (
              <div className="space-y-1.5">
                {/* Barras de progresso */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        'h-1.5 flex-1 rounded-full transition-all duration-300',
                        level <= passwordStrength.score
                          ? passwordStrength.color
                          : 'bg-slate-100'
                      )}
                    />
                  ))}
                </div>
                {/* Label da força */}
                <p className="text-[11px] text-slate-500">
                  {t('passwordStrength')}: {passwordStrength.label}
                </p>
              </div>
            )}
          </div>

          {/* Campo: Confirmação da nova senha */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  'rounded-xl pr-10',
                  passwordsMatch && 'border-emerald-300 ring-1 ring-emerald-200',
                  passwordsMismatch && 'border-red-300 ring-1 ring-red-200'
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Feedback de correspondência */}
            {passwordsMatch && (
              <p className="text-[11px] text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {t('passwordsMatch')}
              </p>
            )}
            {passwordsMismatch && (
              <p className="text-[11px] text-red-500 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                {t('passwordsDoNotMatch')}
              </p>
            )}
          </div>
        </div>

        {/* Botão de alterar senha */}
        <div className="flex justify-end">
          <Button
            onClick={handleChangePassword}
            disabled={
              isChangingPassword ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword
            }
            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2"
          >
            <Lock className="h-4 w-4" />
            {isChangingPassword ? t('updating') : t('updatePassword')}
          </Button>
        </div>
      </motion.div>

      {/* ============================================================
          SEÇÃO DE AUTENTICAÇÃO DE DOIS FATORES (2FA)
          ============================================================ */}
      <motion.div
        variants={sectionVariants}
        className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] space-y-6"
      >
        {/* Cabeçalho com toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {t('twoFactorAuth')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('twoFactorDescription')}
              </p>
            </div>
          </div>

          {/* Toggle de 2FA */}
          <div className="flex items-center gap-3">
            <Badge
              className={cn(
                'text-[10px] font-medium border',
                is2FAEnabled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              )}
            >
              {is2FAEnabled ? t('enabled') : t('disabled')}
            </Badge>
            <Switch
              checked={is2FAEnabled}
              onCheckedChange={handleToggle2FA}
            />
          </div>
        </div>

        {/* Instruções e QR code (visíveis quando 2FA está sendo configurado) */}
        {is2FASetupVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-5"
          >
            {/* Passos de configuração */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <p className="text-sm font-medium text-slate-700">
                {t('setupInstructions')}
              </p>
              <ol className="space-y-2">
                <li className="text-xs text-slate-600 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  {t('step1Download')}
                </li>
                <li className="text-xs text-slate-600 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  {t('step2Scan')}
                </li>
                <li className="text-xs text-slate-600 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  {t('step3Enter')}
                </li>
              </ol>
            </div>

            {/* QR Code placeholder */}
            <div className="flex items-center gap-6">
              <div className="w-40 h-40 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 shrink-0">
                <QrCode className="h-12 w-12 text-slate-300" />
                <span className="text-[10px] text-slate-400">
                  {t('qrCodePlaceholder')}
                </span>
              </div>

              {/* Código manual de setup */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    {t('manualEntryCode')}
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="px-3 py-1.5 rounded-lg bg-slate-100 text-sm font-mono text-slate-700 tracking-wider">
                      JBSWY3DPEHPK3PXP
                    </code>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Campo para código de verificação */}
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('verificationCode')}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="000000"
                      maxLength={6}
                      className="rounded-xl w-32 text-center font-mono tracking-widest"
                    />
                    <Button
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
                    >
                      {t('verify')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Códigos de backup */}
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-medium text-amber-700">
                  {t('backupCodes')}
                </p>
              </div>
              <p className="text-xs text-amber-600">
                {t('backupCodesDescription')}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {backupCodes.map((code) => (
                  <code
                    key={code}
                    className="px-3 py-2 rounded-lg bg-white border border-amber-200 text-xs font-mono text-slate-700 text-center"
                  >
                    {code}
                  </code>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                <Download className="h-3.5 w-3.5" />
                {t('downloadBackupCodes')}
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ============================================================
          SEÇÃO DE SESSÕES ATIVAS
          ============================================================ */}
      <motion.div
        variants={sectionVariants}
        className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] space-y-5"
      >
        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
            <Monitor className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t('activeSessions')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('activeSessionsDescription')}
            </p>
          </div>
        </div>

        {/* Lista de sessões */}
        <div className="space-y-3">
          {sessions.map((session) => {
            /** Ícone do dispositivo */
            const DeviceIcon = getDeviceIcon(session.deviceType)
            /** Estilo do badge do dispositivo */
            const badgeStyle = getDeviceBadgeStyles(session.deviceType)

            return (
              <motion.div
                key={session.id}
                variants={listItemVariants}
                className={cn(
                  'rounded-xl border p-4',
                  'hover:shadow-[3px_3px_0px_rgba(0,0,0,0.04)] transition-all duration-200',
                  session.isCurrent
                    ? 'border-teal-200 bg-teal-50/30'
                    : 'border-slate-200 bg-white'
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Ícone do dispositivo */}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                      session.isCurrent ? 'bg-teal-100' : 'bg-slate-100'
                    )}
                  >
                    <DeviceIcon
                      className={cn(
                        'h-5 w-5',
                        session.isCurrent ? 'text-teal-600' : 'text-slate-500'
                      )}
                    />
                  </div>

                  {/* Informações da sessão */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {session.deviceName}
                      </h3>
                      <Badge className={cn('text-[10px] font-medium border', badgeStyle)}>
                        {session.deviceType.charAt(0).toUpperCase() +
                          session.deviceType.slice(1)}
                      </Badge>
                      {session.isCurrent && (
                        <Badge className="text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {t('currentSession')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {session.ip}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {session.location}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {session.lastActive}
                      </span>
                    </div>
                  </div>

                  {/* Botão de revogar (não disponível para sessão atual) */}
                  {!session.isCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                      className="rounded-xl text-xs gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 shrink-0"
                    >
                      <LogOut className="h-3 w-3" />
                      {t('revoke')}
                    </Button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* ============================================================
          SEÇÃO DE ATIVIDADE DE LOGIN
          ============================================================ */}
      <motion.div
        variants={sectionVariants}
        className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] space-y-5"
      >
        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
            <Key className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t('loginActivity')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('loginActivityDescription')}
            </p>
          </div>
        </div>

        {/* Tabela de atividades de login */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-[11px] font-medium text-slate-400 pb-3 pr-4">
                  {t('status')}
                </th>
                <th className="text-left text-[11px] font-medium text-slate-400 pb-3 pr-4">
                  {t('ipAddress')}
                </th>
                <th className="text-left text-[11px] font-medium text-slate-400 pb-3 pr-4">
                  {t('browser')}
                </th>
                <th className="text-left text-[11px] font-medium text-slate-400 pb-3 pr-4">
                  {t('location')}
                </th>
                <th className="text-left text-[11px] font-medium text-slate-400 pb-3">
                  {t('dateTime')}
                </th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LOGIN_ACTIVITY.map((activity) => (
                <tr
                  key={activity.id}
                  className="border-b border-slate-50 last:border-0"
                >
                  {/* Ícone de status (sucesso/falha) */}
                  <td className="py-3 pr-4">
                    {activity.success ? (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-xs text-emerald-600">
                          {t('success')}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-xs text-red-600">
                          {t('failed')}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* IP */}
                  <td className="py-3 pr-4">
                    <code className="text-xs font-mono text-slate-600">
                      {activity.ip}
                    </code>
                  </td>

                  {/* Navegador */}
                  <td className="py-3 pr-4">
                    <span className="text-xs text-slate-600">
                      {activity.browser}
                    </span>
                  </td>

                  {/* Localização */}
                  <td className="py-3 pr-4">
                    <span className="text-xs text-slate-500">
                      {activity.location}
                    </span>
                  </td>

                  {/* Data/hora */}
                  <td className="py-3">
                    <span className="text-xs text-slate-400">
                      {formatLoginDate(activity.timestamp)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ============================================================
          SEÇÃO DE EXPORTAÇÃO DE DADOS (GDPR)
          ============================================================ */}
      <motion.div
        variants={sectionVariants}
        className="rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/30 border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
            <Download className="h-5 w-5 text-teal-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900">
              {t('downloadYourData')}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {t('gdprDescription')}
            </p>

            {/* Detalhes do que está incluído na exportação */}
            <div className="mt-4 p-4 rounded-xl bg-white/70 border border-slate-200 space-y-2">
              <p className="text-xs text-slate-500 font-medium">
                {t('exportIncludes')}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <li className="text-xs text-slate-500 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                  {t('exportItem1')}
                </li>
                <li className="text-xs text-slate-500 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                  {t('exportItem2')}
                </li>
                <li className="text-xs text-slate-500 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                  {t('exportItem3')}
                </li>
                <li className="text-xs text-slate-500 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                  {t('exportItem4')}
                </li>
              </ul>
            </div>

            <Button
              onClick={handleExportData}
              disabled={isExporting}
              variant="outline"
              className="mt-4 rounded-xl gap-2 border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <Download className="h-4 w-4" />
              {isExporting ? t('preparingExport') : t('requestDataExport')}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
