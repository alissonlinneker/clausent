import { Metadata } from 'next'
import { ApiDocsContent } from '@/components/marketing/api-docs-content'

/** Metadados SEO da página de documentação da API */
export const metadata: Metadata = {
  title: 'API Documentation',
  description:
    'Integrate Clausent\'s contract intelligence into your applications. RESTful API with comprehensive documentation and code examples.',
}

/**
 * Página de documentação da API — rota /[locale]/api-docs.
 *
 * Server component que exporta metadata para SEO e renderiza
 * o componente client-side ApiDocsContent com seções de autenticação,
 * endpoints com exemplos de request/response, exemplos de código
 * em curl/JavaScript/Python e rate limits.
 */
export default function ApiDocsPage() {
  return <ApiDocsContent />
}
