import { createAuthClient } from 'better-auth/react'

/**
 * Cliente Better Auth para uso no frontend (React/Next.js).
 *
 * Cria uma instância do cliente de autenticação que se comunica
 * com as API Routes do Better Auth no servidor. Exporta hooks
 * e funções utilitárias para gerenciar autenticação no lado do cliente.
 *
 * O baseURL aponta para a URL pública da aplicação para garantir
 * que as requisições de autenticação alcancem o endpoint correto
 * tanto em desenvolvimento quanto em produção.
 *
 * Variáveis de ambiente necessárias:
 * - NEXT_PUBLIC_APP_URL — URL pública da aplicação (ex: http://localhost:3000)
 */
export const authClient = createAuthClient({
  /** URL base para as requisições de autenticação */
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
})

/**
 * Hook reativo de sessão — retorna dados da sessão atual
 * e atualiza automaticamente quando o estado muda.
 *
 * Uso:
 * ```tsx
 * const { data: session, isPending } = useSession()
 * ```
 */
export const useSession = authClient.useSession

/**
 * Função de login com email e senha.
 *
 * Uso:
 * ```ts
 * await signIn.email({ email, password })
 * ```
 */
export const signIn = authClient.signIn

/**
 * Função de cadastro com email e senha.
 *
 * Uso:
 * ```ts
 * await signUp.email({ email, password, name })
 * ```
 */
export const signUp = authClient.signUp

/**
 * Função de logout — encerra a sessão atual.
 *
 * Uso:
 * ```ts
 * await signOut()
 * ```
 */
export const signOut = authClient.signOut

/**
 * Função para solicitar redefinição de senha.
 * Envia um email com link de reset para o endereço informado.
 *
 * Uso:
 * ```ts
 * await requestPasswordReset({ email, redirectTo: '/reset-password' })
 * ```
 */
export const requestPasswordReset = authClient.requestPasswordReset

/**
 * Função para redefinir a senha com token recebido por email.
 *
 * Uso:
 * ```ts
 * await resetPassword({ newPassword, token })
 * ```
 */
export const resetPassword = authClient.resetPassword
