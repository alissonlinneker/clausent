'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/lib/auth/client'
import { Link } from '@/lib/i18n/navigation'

/**
 * Formulário de login com email e senha.
 *
 * Usa Better Auth para autenticação.
 * Após login bem-sucedido, redireciona para o dashboard.
 */
export function SignInForm() {
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
  const router = useRouter()

  /** Estados do formulário */
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** Handler do submit do formulário */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      /** Tentar login via Better Auth */
      const result = await signIn.email({
        email,
        password,
      })

      if (result.error) {
        setError(result.error.message || t('errorInvalidCredentials'))
        return
      }

      /** Redirecionar para o dashboard após login */
      router.push('/dashboard')
    } catch {
      setError(t('errorGeneric'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
      {/* Cabeçalho */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {t('signInTitle')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t('signInSubtitle')}
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo de email */}
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

        {/* Campo de senha */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t('password')}</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-teal-600 hover:text-teal-700 font-medium"
            >
              {t('forgotPassword')}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder={t('passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
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
          {isLoading ? tCommon('loading') : tCommon('signIn')}
        </Button>
      </form>

      {/* Link para cadastro */}
      <p className="mt-6 text-center text-sm text-slate-500">
        {t('noAccount')}{' '}
        <Link
          href="/sign-up"
          className="font-semibold text-teal-600 hover:text-teal-700"
        >
          {tCommon('signUp')}
        </Link>
      </p>
    </div>
  )
}
