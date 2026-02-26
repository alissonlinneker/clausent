import type { Metadata } from 'next'
import { SignInForm } from '@/components/auth/sign-in-form'

/** Metadados da página de login */
export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Clausent account',
}

/**
 * Página de login.
 *
 * Server component que renderiza o formulário
 * de login client-side (SignInForm).
 */
export default function SignInPage() {
  return <SignInForm />
}
