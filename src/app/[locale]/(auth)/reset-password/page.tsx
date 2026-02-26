import type { Metadata } from 'next'
import { ResetPasswordContent } from '@/components/auth/reset-password-content'

/** Metadados da página de redefinição de senha */
export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your Clausent account.',
}

/**
 * Página de redefinição de senha.
 *
 * Server component que renderiza o formulário
 * de nova senha client-side (ResetPasswordContent).
 *
 * O token de reset é extraído dos query params (?token=...).
 * Se ausente ou inválido, exibe estado de erro.
 */
export default function ResetPasswordPage() {
  return <ResetPasswordContent />
}
