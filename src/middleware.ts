import createMiddleware from 'next-intl/middleware'
import { routing } from '@/lib/i18n/routing'

/**
 * Middleware principal da aplicação.
 *
 * Responsável por:
 * 1. Detectar o idioma do usuário via Accept-Language header
 * 2. Redirecionar para o locale correto (/en, /pt, /es, etc.)
 * 3. Definir o locale padrão como 'en' quando não detectado
 *
 * A proteção de rotas autenticadas é feita via Better Auth
 * diretamente nos layouts/pages, não no middleware.
 */
const intlMiddleware = createMiddleware(routing)

export default intlMiddleware

/**
 * Configuração do matcher do middleware.
 * Exclui arquivos estáticos, assets do Next.js e rotas de API.
 * As rotas de API não precisam de i18n.
 */
export const config = {
  matcher: [
    '/((?!api|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}
