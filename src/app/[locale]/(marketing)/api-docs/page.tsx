import { Metadata } from 'next'
import { ApiDocsContent } from '@/components/marketing/api-docs-content'

/** Metadados SEO e Open Graph da página de documentação da API */
export const metadata: Metadata = {
  title: 'API Documentation',
  description:
    'Integrate Clausent\'s contract intelligence into your applications. RESTful API with comprehensive documentation and code examples.',
  openGraph: {
    title: 'API Documentation — Clausent',
    description:
      'Integrate Clausent\'s contract intelligence into your applications. RESTful API with comprehensive documentation and code examples.',
    url: 'https://clausent.com/api-docs',
    siteName: 'Clausent',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Clausent API Documentation — RESTful contract intelligence API',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'API Documentation — Clausent',
    description:
      'Integrate Clausent\'s contract intelligence into your applications. RESTful API with comprehensive documentation and code examples.',
    images: ['/og-image.png'],
  },
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
