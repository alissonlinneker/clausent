import type { Metadata } from 'next'
import { VerifyEmailForm } from '@/components/auth/verify-email-form'

/** Metadados da página de verificação de email */
export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Verify your email address to complete registration',
}

/**
 * Página de verificação de email.
 *
 * Exibe o formulário para inserir o código de verificação
 * enviado por email durante o cadastro.
 */
export default function VerifyEmailPage() {
  return <VerifyEmailForm />
}
