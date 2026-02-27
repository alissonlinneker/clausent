import { Metadata } from 'next'
import { BlogList } from '@/components/marketing/blog-list'

/** Metadados SEO e Open Graph da página de listagem do blog */
export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Tips, guides, and insights on contract intelligence, SaaS cost optimization, and AI-powered business operations.',
  openGraph: {
    title: 'Blog — Clausent',
    description:
      'Tips, guides, and insights on contract intelligence, SaaS cost optimization, and AI-powered business operations.',
    url: 'https://clausent.com/blog',
    siteName: 'Clausent',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Clausent Blog — contract intelligence insights and guides',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog — Clausent',
    description:
      'Tips, guides, and insights on contract intelligence, SaaS cost optimization, and AI-powered business operations.',
    images: ['/og-image.png'],
  },
}

/**
 * Página de listagem do blog — rota /[locale]/blog.
 *
 * Server component que exporta metadata para SEO e renderiza
 * o componente client-side BlogList com filtros de categoria,
 * post featured em destaque, e grid de posts regulares.
 */
export default function BlogPage() {
  return <BlogList />
}
