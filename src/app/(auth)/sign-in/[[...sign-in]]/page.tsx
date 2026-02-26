import { SignIn } from '@clerk/nextjs'

/**
 * Página de login.
 * Utiliza o componente pré-construído do Clerk para sign-in,
 * que já inclui fluxos de email/password, social login e MFA.
 */
export default function SignInPage() {
  return <SignIn />
}
