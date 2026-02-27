import { Metadata } from 'next'
import { ContactContent } from '@/components/marketing/contact-content'

/** Metadados SEO e Open Graph da página de Contato */
export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the Clausent team — sales inquiries, support, or general questions about our contract intelligence platform.',
  openGraph: {
    title: 'Contact Us — Clausent',
    description:
      'Get in touch with the Clausent team — sales inquiries, support, or general questions about our contract intelligence platform.',
    url: 'https://clausent.com/contact',
    siteName: 'Clausent',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Contact Clausent — sales, support, and general inquiries',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us — Clausent',
    description:
      'Get in touch with the Clausent team — sales inquiries, support, or general questions about our contract intelligence platform.',
    images: ['/og-image.png'],
  },
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
