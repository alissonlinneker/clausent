'use client'

/**
 * Hook de autenticação client-side.
 *
 * Encapsula o Better Auth client para fornecer
 * uma API limpa de autenticação nos componentes React.
 *
 * Uso:
 * ```tsx
 * const { session, user, isLoading, signOut } = useAuth()
 * ```
 */
import {
  useSession,
  signIn,
  signUp,
  signOut,
} from '@/lib/auth/client'

/**
 * Hook principal de autenticação.
 *
 * Retorna o estado da sessão e funções de autenticação
 * prontas para uso em componentes React.
 */
export function useAuth() {
  /** Sessão reativa — atualiza automaticamente quando o estado muda */
  const { data: session, isPending: isLoading } = useSession()

  return {
    /** Dados da sessão (null se não autenticado) */
    session,
    /** Dados do usuário (atalho para session.user) */
    user: session?.user ?? null,
    /** Se a sessão está sendo carregada */
    isLoading,
    /** Fazer login com email/senha */
    signIn,
    /** Criar nova conta */
    signUp,
    /** Fazer logout */
    signOut,
  }
}
