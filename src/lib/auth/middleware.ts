import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Helpers de autenticação para uso server-side.
 *
 * Estas funções são projetadas para uso em:
 * - Server Components (layouts, pages)
 * - Server Actions
 * - Route Handlers
 *
 * Utilizam auth.api.getSession() do Better Auth, que valida
 * a sessão no banco de dados (não apenas o cookie), garantindo
 * segurança real na verificação de autenticação.
 */

/**
 * Tipo da sessão retornada pelo Better Auth.
 * Inclui dados do usuário e metadados da sessão.
 */
export type SessionData = Awaited<ReturnType<typeof auth.api.getSession>>

/**
 * Obtém a sessão atual do usuário.
 *
 * Valida o cookie de sessão contra o banco de dados e retorna
 * os dados completos da sessão (usuário + token) ou null se
 * não houver sessão válida.
 *
 * Uso em Server Components:
 * ```tsx
 * const session = await getSession()
 * if (session) {
 *   // usuário autenticado — session.user disponível
 * }
 * ```
 *
 * @returns dados da sessão ou null se não autenticado
 */
export async function getSession(): Promise<SessionData> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return session
}

/**
 * Exige autenticação — redireciona para /sign-in se não autenticado.
 *
 * Valida a sessão e, caso inválida ou inexistente, redireciona
 * o usuário para a página de login. Se a sessão for válida,
 * retorna os dados da sessão para uso no componente.
 *
 * Uso em layouts ou páginas protegidas:
 * ```tsx
 * export default async function DashboardLayout({ children }) {
 *   const session = await requireAuth()
 *   // a partir daqui, session está garantidamente autenticada
 *   return <div>{children}</div>
 * }
 * ```
 *
 * @param redirectTo — URL para redirecionar após login (padrão: /sign-in)
 * @returns dados da sessão (garantidamente não-null)
 */
export async function requireAuth(
  redirectTo: string = '/sign-in'
): Promise<NonNullable<SessionData>> {
  const session = await getSession()

  if (!session) {
    redirect(redirectTo)
  }

  return session
}
