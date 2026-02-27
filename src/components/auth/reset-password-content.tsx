'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  Loader2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@/lib/i18n/navigation'
import { BracketClauseLogo } from '@/components/shared/bracket-clause-logo'
import { cn } from '@/lib/utils'

/* =================================================================
   CONSTANTES DE VALIDAÇÃO
   Regras mínimas para a nova senha.
   ================================================================= */

/** Tamanho mínimo exigido para a senha */
const MIN_PASSWORD_LENGTH = 8

/** Regex para validar presença de letra maiúscula */
const HAS_UPPERCASE = /[A-Z]/

/** Regex para validar presença de número */
const HAS_NUMBER = /[0-9]/

/** Regex para validar presença de caractere especial */
const HAS_SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/

/* =================================================================
   TIPAGEM
   ================================================================= */

/** Possíveis estados do fluxo de reset */
type ResetState = 'form' | 'success' | 'error'

/** Requisito individual de senha com estado de validação */
interface PasswordRequirement {
  label: string
  met: boolean
}

/* =================================================================
   VARIANTES DE ANIMAÇÃO (Framer Motion)
   ================================================================= */

/** Container com stagger para filhos */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

/** Item filho — fade com deslocamento vertical */
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
}

/** Animação de escala para o checkmark de sucesso */
const successCheckVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
      delay: 0.15,
    },
  },
}

/** Fade para transição entre estados */
const fadeVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.25, ease: 'easeIn' as const },
  },
}

/* =================================================================
   COMPONENTE PRINCIPAL
   ================================================================= */

/**
 * Conteúdo da página de redefinição de senha.
 *
 * Fluxo completo:
 * 1. Validação do token de reset (obtido via query params)
 * 2. Formulário de nova senha com indicador de requisitos
 * 3. Confirmação de senha com indicador de correspondência
 * 4. Estado de sucesso com redirecionamento
 * 5. Estado de erro para tokens inválidos/expirados
 *
 * Design: Light Neobrutalism consistente com o resto da aplicação.
 */
export function ResetPasswordContent() {
  /** Hook de tradução para o namespace de autenticação */
  const t = useTranslations('auth')

  /** Parâmetros de URL — contém o token de reset */
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  /** Estado atual do fluxo */
  const [resetState, setResetState] = useState<ResetState>(
    token ? 'form' : 'error'
  )

  /** Campos do formulário */
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  /** Visibilidade das senhas */
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  /** Estado de carregamento durante a submissão */
  const [isLoading, setIsLoading] = useState(false)

  /** Mensagem de erro da API */
  const [apiError, setApiError] = useState<string | null>(null)

  /** Contador de redirecionamento pós-sucesso */
  const [redirectCount, setRedirectCount] = useState(3)

  /* ---------------------------------------------------------------
     VALIDAÇÃO DA SENHA
     Lista de requisitos com estado computado em tempo real.
     --------------------------------------------------------------- */

  /** Requisitos da senha calculados com base no valor atual */
  const passwordRequirements: PasswordRequirement[] = useMemo(
    () => [
      {
        label: t('reqMinCharacters', { count: MIN_PASSWORD_LENGTH }),
        met: password.length >= MIN_PASSWORD_LENGTH,
      },
      {
        label: t('reqUppercase'),
        met: HAS_UPPERCASE.test(password),
      },
      {
        label: t('reqNumber'),
        met: HAS_NUMBER.test(password),
      },
      {
        label: t('reqSpecialChar'),
        met: HAS_SPECIAL.test(password),
      },
    ],
    [password, t]
  )

  /** Verificar se todos os requisitos foram cumpridos */
  const allRequirementsMet = passwordRequirements.every((req) => req.met)

  /** Verificar se as senhas coincidem */
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword

  /** Formulário é válido quando todos os critérios estão atendidos */
  const isFormValid = allRequirementsMet && passwordsMatch

  /* ---------------------------------------------------------------
     COUNTDOWN DE REDIRECIONAMENTO
     Após sucesso, conta regressiva de 3 segundos.
     --------------------------------------------------------------- */

  useEffect(() => {
    if (resetState !== 'success') return

    /** Timer que decrementa a cada segundo */
    const interval = setInterval(() => {
      setRedirectCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [resetState])

  /* ---------------------------------------------------------------
     HANDLER DE SUBMISSÃO
     --------------------------------------------------------------- */

  /** Submeter nova senha para a API */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isFormValid || !token) return

    setIsLoading(true)
    setApiError(null)

    try {
      /**
       * Mock da chamada à API de reset.
       * Será substituído pela integração real com Better Auth.
       */
      await new Promise((resolve) => setTimeout(resolve, 1500))

      /** Transição para o estado de sucesso */
      setResetState('success')
    } catch {
      setApiError(t('errorGeneric'))
    } finally {
      setIsLoading(false)
    }
  }

  /* ---------------------------------------------------------------
     RENDERIZAÇÃO: ESTADO DE ERRO (token inválido/expirado)
     --------------------------------------------------------------- */

  const renderErrorState = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="rounded-2xl bg-white border border-slate-200 p-8 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] text-center"
    >
      {/* Ícone de alerta */}
      <motion.div
        variants={itemVariants}
        className="mx-auto w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5"
      >
        <AlertTriangle className="h-7 w-7 text-red-500" />
      </motion.div>

      {/* Título e descrição */}
      <motion.h2
        variants={itemVariants}
        className="text-xl font-bold text-slate-900 mb-2"
      >
        {t('invalidOrExpiredLink')}
      </motion.h2>
      <motion.p
        variants={itemVariants}
        className="text-sm text-slate-500 mb-6 max-w-sm mx-auto"
      >
        {t('invalidOrExpiredLinkDescription')}
      </motion.p>

      {/* Botão para solicitar novo link */}
      <motion.div variants={itemVariants}>
        <Link href="/forgot-password">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
            {t('requestNewLink')}
          </Button>
        </Link>
      </motion.div>

      {/* Link para voltar ao login */}
      <motion.p variants={itemVariants} className="mt-5">
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToSignIn')}
        </Link>
      </motion.p>
    </motion.div>
  )

  /* ---------------------------------------------------------------
     RENDERIZAÇÃO: ESTADO DE SUCESSO
     --------------------------------------------------------------- */

  const renderSuccessState = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="rounded-2xl bg-white border border-slate-200 p-8 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] text-center"
    >
      {/* Checkmark animado */}
      <motion.div
        variants={successCheckVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-5"
      >
        <ShieldCheck className="h-8 w-8 text-emerald-500" />
      </motion.div>

      {/* Mensagem de sucesso */}
      <motion.h2
        variants={itemVariants}
        className="text-xl font-bold text-slate-900 mb-2"
      >
        {t('passwordResetSuccess')}
      </motion.h2>
      <motion.p
        variants={itemVariants}
        className="text-sm text-slate-500 mb-6"
      >
        {t('passwordResetSuccessDescription')}
      </motion.p>

      {/* Barra de progresso do redirecionamento */}
      <motion.div
        variants={itemVariants}
        className="w-full max-w-xs mx-auto mb-6"
      >
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 3, ease: 'linear' }}
          />
        </div>
      </motion.div>

      {/* Link manual caso o redirect não funcione */}
      <motion.div variants={itemVariants}>
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('goToSignIn')}
        </Link>
      </motion.div>
    </motion.div>
  )

  /* ---------------------------------------------------------------
     RENDERIZAÇÃO: FORMULÁRIO DE RESET
     --------------------------------------------------------------- */

  const renderFormState = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="rounded-2xl bg-white border border-slate-200 p-8 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]"
    >
      {/* Cabeçalho do formulário */}
      <motion.div variants={itemVariants} className="text-center mb-6">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-teal-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          {t('setNewPasswordTitle')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t('setNewPasswordSubtitle')}
        </p>
      </motion.div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Campo de nova senha */}
        <motion.div variants={itemVariants} className="space-y-2">
          <Label htmlFor="new-password">{t('newPassword')}</Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('newPasswordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={isLoading}
              className="rounded-xl border-slate-200 pr-10 focus-visible:border-teal-400 focus-visible:ring-teal-400/20"
            />
            {/* Toggle de visibilidade */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Indicador de requisitos da senha */}
        <motion.div variants={itemVariants} className="space-y-2">
          {passwordRequirements.map((req) => (
            <div
              key={req.label}
              className="flex items-center gap-2"
            >
              {password.length === 0 ? (
                /** Estado neutro — nenhum caractere digitado */
                <div className="w-4 h-4 rounded-full border border-slate-200" />
              ) : req.met ? (
                /** Requisito cumprido — check verde */
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                </motion.div>
              ) : (
                /** Requisito não cumprido — X vermelho */
                <XCircle className="h-4 w-4 text-red-400" />
              )}
              <span
                className={cn(
                  'text-xs transition-colors',
                  password.length === 0
                    ? 'text-slate-400'
                    : req.met
                      ? 'text-emerald-600 font-medium'
                      : 'text-red-500'
                )}
              >
                {req.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Campo de confirmação de senha */}
        <motion.div variants={itemVariants} className="space-y-2">
          <Label htmlFor="confirm-password">{t('confirmPassword')}</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={t('confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={isLoading}
              className={cn(
                'rounded-xl border-slate-200 pr-10 focus-visible:border-teal-400 focus-visible:ring-teal-400/20',
                confirmPassword.length > 0 && !passwordsMatch && 'border-red-300 focus-visible:border-red-400 focus-visible:ring-red-400/20'
              )}
            />
            {/* Toggle de visibilidade */}
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Indicador de correspondência das senhas */}
          <AnimatePresence>
            {confirmPassword.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-1.5"
              >
                {passwordsMatch ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-xs text-emerald-600 font-medium">
                      {t('passwordsMatch')}
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5 text-red-400" />
                    <span className="text-xs text-red-500">
                      {t('errorPasswordsDoNotMatch')}
                    </span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Mensagem de erro da API */}
        <AnimatePresence>
          {apiError && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
            >
              {apiError}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Botão de submit */}
        <motion.div variants={itemVariants}>
          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-[2px_2px_0px_rgba(0,0,0,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t('resetting')}
              </>
            ) : (
              t('resetPasswordButton')
            )}
          </Button>
        </motion.div>
      </form>

      {/* Link para voltar ao login */}
      <motion.p variants={itemVariants} className="mt-6 text-center">
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToSignIn')}
        </Link>
      </motion.p>
    </motion.div>
  )

  /* ---------------------------------------------------------------
     RENDERIZAÇÃO PRINCIPAL
     --------------------------------------------------------------- */

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo no topo */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <BracketClauseLogo
          className="h-8 w-8 text-teal-600"
          strokeWidth={2.2}
        />
        <span className="text-2xl font-bold tracking-tight text-slate-900">
          Clausent
        </span>
      </div>

      {/* Conteúdo dinâmico baseado no estado */}
      <AnimatePresence mode="wait">
        <motion.div
          key={resetState}
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {resetState === 'error' && renderErrorState()}
          {resetState === 'success' && renderSuccessState()}
          {resetState === 'form' && renderFormState()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
