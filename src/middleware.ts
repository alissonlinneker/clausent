import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

/**
 * Rotas que exigem autenticação.
 * Qualquer rota dentro de /dashboard ou chamadas tRPC
 * serão protegidas automaticamente pelo Clerk.
 */
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/trpc(.*)',
])

/**
 * Middleware principal da aplicação.
 * Intercepta todas as requisições e aplica proteção
 * nas rotas definidas acima.
 */
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

/**
 * Configuração do matcher do middleware.
 * Exclui arquivos estáticos e assets do Next.js,
 * mas inclui todas as rotas de API e tRPC.
 */
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
