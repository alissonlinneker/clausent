import { Metadata } from 'next'
import { PrivacyContent } from '@/components/marketing/privacy-content'

/** Metadados SEO da página de Política de Privacidade */
export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Clausent Privacy Policy — how we collect, use, and protect your data on our contract intelligence platform.',
}

/**
 * Página de Política de Privacidade — rota /[locale]/privacy.
 *
 * Server component que exporta metadata para SEO e renderiza
 * o conteúdo client-side (PrivacyContent) com as 8 seções sobre
 * tratamento de dados e privacidade.
 */
export default function PrivacyPage() {
  return <PrivacyContent />
}
