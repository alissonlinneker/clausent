import { Metadata } from 'next'
import { ContactContent } from '@/components/marketing/contact-content'

/** Metadados SEO da página de Contato */
export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the Clausent team — sales inquiries, support, or general questions about our contract intelligence platform.',
}

/**
 * Página de Contato — rota /[locale]/contact.
 *
 * Server component que exporta metadata para SEO e renderiza
 * o conteúdo client-side (ContactContent) com formulário de contato
 * e cards de vendas/suporte.
 */
export default function ContactPage() {
  return <ContactContent />
}
