import type { Metadata } from 'next'
import { SignUpForm } from '@/components/auth/sign-up-form'

/** Metadados da página de cadastro */
export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your Clausent account and start analyzing contracts',
}

/**
 * Página de cadastro.
 *
 * Server component que renderiza o formulário
 * de cadastro client-side (SignUpForm).
 */
export default function SignUpPage() {
  return <SignUpForm />
}
