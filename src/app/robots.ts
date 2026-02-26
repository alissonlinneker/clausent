import type { MetadataRoute } from 'next'

/**
 * Configuração do robots.txt.
 *
 * Permite indexação por motores de busca e bots de IA
 * (Googlebot, GPTBot, Claude, etc.) para melhor SEO e GEO.
 * Bloqueia apenas áreas privadas (dashboard, admin, API).
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clausent.com'

  return {
    rules: [
      {
        /** Regras para todos os bots */
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/admin/', '/api/', '/sign-in', '/sign-up'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
