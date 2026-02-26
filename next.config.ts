import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

/**
 * Plugin do next-intl — habilita internacionalização
 * com detecção automática de idioma e roteamento /[locale]/
 */
const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts')

const nextConfig: NextConfig = {
  /** Imagens de domínios externos permitidos */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
