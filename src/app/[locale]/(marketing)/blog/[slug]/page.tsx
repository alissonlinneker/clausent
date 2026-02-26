import { Metadata } from 'next'
import { BlogPost } from '@/components/marketing/blog-post'

/** Metadados SEO da página de post individual do blog */
export const metadata: Metadata = {
  title: 'How AI is Transforming Contract Management | Clausent Blog',
  description:
    'Discover how artificial intelligence is revolutionizing contract management, from automated extraction to predictive risk analysis.',
}

/**
 * Página de post individual do blog — rota /[locale]/blog/[slug].
 *
 * Server component que exporta metadata para SEO e renderiza
 * o componente client-side BlogPost com conteúdo do artigo,
 * sidebar com Table of Contents, posts relacionados e newsletter CTA.
 *
 * Em produção, os metadados seriam dinâmicos baseados no slug.
 */
export default function BlogPostPage() {
  return <BlogPost />
}
