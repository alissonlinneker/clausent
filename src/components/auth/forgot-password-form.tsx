'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { requestPasswordReset } from '@/lib/auth/client'
import { Link } from '@/lib/i18n/navigation'
import { ArrowLeft, Mail } from 'lucide-react'

/**
 * Formulário de recuperação de senha.
 *
 * Envia um email com link de reset para o endereço informado.
 * Após envio, exibe mensagem de sucesso.
 */
export function ForgotPasswordForm() {
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')

  /** Estados do formulário */
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  /** Handler do submit */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await requestPasswordReset({
        email,
        redirectTo: '/reset-password',
      })

      /** Exibir estado de sucesso independente do resultado (segurança) */
      setSent(true)
    } catch {
      setError(t('errorGeneric'))
    } finally {
      setIsLoading(false)
    }
  }

  /** Estado de sucesso — email enviado */
  if (sent) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 text-teal-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          {t('checkYourEmail')}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {t('resetLinkSent', { email })}
        </p>
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToSignIn')}
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
      {/* Cabeçalho */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {t('resetPasswordTitle')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t('resetPasswordSubtitle')}
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={isLoading}
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
          disabled={isLoading}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
        >
          {isLoading ? tCommon('loading') : t('resetPasswordButton')}
        </Button>
      </form>

      {/* Link para voltar ao login */}
      <p className="mt-6 text-center">
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToSignIn')}
        </Link>
      </p>
    </div>
  )
}
