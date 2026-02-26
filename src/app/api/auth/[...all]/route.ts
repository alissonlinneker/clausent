import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

/**
 * API Route catch-all para o Better Auth.
 *
 * Captura todas as requisições em /api/auth/* e delega
 * ao handler do Better Auth. Isso inclui:
 * - POST /api/auth/sign-in — login
 * - POST /api/auth/sign-up — cadastro
 * - POST /api/auth/sign-out — logout
 * - GET  /api/auth/session — obter sessão atual
 * - POST /api/auth/forget-password — solicitar reset de senha
 * - POST /api/auth/reset-password — redefinir senha com token
 * - GET  /api/auth/verify-email — verificar email com token
 * - E demais endpoints internos do Better Auth
 *
 * Usa toNextJsHandler() para converter o handler do Better Auth
 * no formato esperado pelo Next.js App Router (GET e POST).
 */
export const { GET, POST } = toNextJsHandler(auth)
