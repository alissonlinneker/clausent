import { MetadataRoute } from 'next'

/** Robots.txt — permite crawling de páginas públicas, bloqueia dashboard e API */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clausent.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing'],
        disallow: ['/dashboard/', '/api/', '/sign-in', '/sign-up'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
