import { Metadata } from 'next'
import { TermsContent } from '@/components/marketing/terms-content'

/** Metadados SEO da página de Termos de Serviço */
export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Read the Clausent Terms of Service — the rules and guidelines for using our contract intelligence platform.',
}

/**
 * Página de Termos de Serviço — rota /[locale]/terms.
 *
 * Server component que exporta metadata para SEO e renderiza
 * o conteúdo client-side (TermsContent) com as 8 seções legais.
 */
export default function TermsPage() {
  return <TermsContent />
}
