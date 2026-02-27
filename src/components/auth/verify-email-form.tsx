'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@/lib/i18n/navigation'
import { Mail } from 'lucide-react'

/**
 * Formulário de verificação de email.
 *
 * Exibe um campo para inserir o código de 6 dígitos
 * enviado por email durante o cadastro.
 */
export function VerifyEmailForm() {
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
  const searchParams = useSearchParams()

  /** Email do usuário (passado via query param) */
  const email = searchParams.get('email') || ''

  /** Estados do formulário */
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)

  /** Handler do submit — verificar código */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      /**
       * TODO: Implementar verificação de código via Better Auth.
       * O Better Auth verifica automaticamente via link no email.
       * Para verificação por código, será necessário implementar
       * um plugin customizado ou usar o link padrão.
       */
      console.log('Verifying code:', code, 'for email:', email)

      /** Redirecionar para dashboard após verificação */
      window.location.href = '/dashboard'
    } catch {
      setError(t('errorInvalidCode'))
    } finally {
      setIsLoading(false)
    }
  }

  /** Handler de reenvio de código */
  async function handleResend() {
    setResending(true)
    setError(null)

    try {
      /** TODO: Reenviar código de verificação */
      console.log('Resending verification code to:', email)
    } catch {
      setError(t('errorResendCode'))
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
      {/* Ícone */}
      <div className="mx-auto w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-4">
        <Mail className="h-6 w-6 text-teal-600" />
      </div>

      {/* Cabeçalho */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {t('verificationTitle')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t('verificationSubtitle', { email })}
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">{t('verificationCode')}</Label>
          <Input
            id="code"
            type="text"
            placeholder={t('verificationCodePlaceholder')}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            maxLength={6}
            pattern="[0-9]{6}"
            className="text-center text-2xl tracking-[0.5em] font-mono"
            disabled={isLoading}
            autoFocus
          />
        </div>

        {/* Mensagem de erro */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Botão de submit */}
        <Button
          type="submit"
          disabled={isLoading || code.length !== 6}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
        >
          {isLoading ? tCommon('loading') : tCommon('confirm')}
        </Button>
      </form>

      {/* Reenviar código */}
      <p className="mt-6 text-center text-sm text-slate-500">
        <button
          onClick={handleResend}
          disabled={resending}
          className="font-semibold text-teal-600 hover:text-teal-700 disabled:opacity-50"
        >
          {resending ? tCommon('loading') : t('resendCode')}
        </button>
      </p>

      {/* Link para voltar ao login */}
      <p className="mt-4 text-center">
        <Link
          href="/sign-in"
          className="text-sm font-medium text-slate-400 hover:text-slate-600"
        >
          {t('backToSignIn')}
        </Link>
      </p>
    </div>
  )
}
