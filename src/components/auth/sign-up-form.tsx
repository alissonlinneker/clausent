'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/lib/auth/client'
import { Link } from '@/lib/i18n/navigation'

/**
 * Formulário de cadastro com email, senha e nome.
 *
 * Usa Better Auth para criação de conta.
 * Após cadastro, redireciona para verificação de email.
 */
export function SignUpForm() {
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
  const router = useRouter()

  /** Estados do formulário */
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** Handler do submit do formulário */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    /** Validar se as senhas coincidem */
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    /** Validar força da senha */
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setIsLoading(false)
      return
    }

    try {
      /** Criar conta via Better Auth */
      const result = await signUp.email({
        email,
        password,
        name,
      })

      if (result.error) {
        setError(result.error.message || 'Failed to create account')
        return
      }

      /** Redirecionar para verificação de email */
      router.push(`/verify-email?email=${encodeURIComponent(email)}`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
      {/* Cabeçalho */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {t('signUpTitle')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t('signUpSubtitle')}
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo de nome */}
        <div className="space-y-2">
          <Label htmlFor="name">{t('name')}</Label>
          <Input
            id="name"
            type="text"
            placeholder={t('namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            disabled={isLoading}
          />
        </div>

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
          <Label htmlFor="password">{t('password')}</Label>
          <Input
            id="password"
            type="password"
            placeholder={t('passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            disabled={isLoading}
          />
        </div>

        {/* Campo de confirmação de senha */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder={t('confirmPasswordPlaceholder')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
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
          {isLoading ? tCommon('loading') : tCommon('getStarted')}
        </Button>
      </form>

      {/* Termos de serviço */}
      <p className="mt-4 text-center text-xs text-slate-400">
        {t('termsAgreement')}{' '}
        <Link href="/terms" className="text-teal-600 hover:underline">
          {t('termsOfService')}
        </Link>{' '}
        {tCommon('and')}{' '}
        <Link href="/privacy" className="text-teal-600 hover:underline">
          {t('privacyPolicy')}
        </Link>
      </p>

      {/* Link para login */}
      <p className="mt-4 text-center text-sm text-slate-500">
        {t('hasAccount')}{' '}
        <Link
          href="/sign-in"
          className="font-semibold text-teal-600 hover:text-teal-700"
        >
          {tCommon('signIn')}
        </Link>
      </p>
    </div>
  )
}
