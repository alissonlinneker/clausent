import type { MetadataRoute } from 'next'

/** Locales suportados para gerar URLs i18n */
const LOCALES = ['en', 'pt', 'es', 'fr', 'it', 'de'] as const

/** Páginas públicas do marketing site */
const MARKETING_PAGES = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/features', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly' as const },
  { path: '/contact', priority: 0.5, changeFrequency: 'monthly' as const },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
]

/**
 * Gera o sitemap.xml dinâmico da aplicação.
 *
 * Inclui todas as páginas públicas de marketing
 * para cada locale suportado, otimizando para SEO
 * multilíngue com hreflang alternates.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clausent.com'

  const entries: MetadataRoute.Sitemap = []

  for (const page of MARKETING_PAGES) {
    for (const locale of LOCALES) {
      /** Inglês não tem prefixo (locale padrão com as-needed) */
      const localePath = locale === 'en' ? '' : `/${locale}`
      const url = `${baseUrl}${localePath}${page.path}`

      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      })
    }
  }

  return entries
}
