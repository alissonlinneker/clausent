import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

/** Metadados da página de recuperação de senha */
export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your Clausent account password',
}

/**
 * Página de recuperação de senha.
 *
 * Server component que renderiza o formulário
 * de recuperação client-side (ForgotPasswordForm).
 */
export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
