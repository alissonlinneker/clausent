import { SignUp } from '@clerk/nextjs'

/**
 * Página de cadastro.
 * Utiliza o componente pré-construído do Clerk para sign-up,
 * que já inclui validação de email, social signup e verificação.
 */
export default function SignUpPage() {
  return <SignUp />
}
