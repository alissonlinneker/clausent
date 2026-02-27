import { Metadata } from 'next'
import { DemoContent } from '@/components/marketing/demo-content'

/** Metadados SEO e Open Graph da página de demonstração */
export const metadata: Metadata = {
  title: 'Demo',
  description:
    'See Clausent in action — watch how AI analyzes a real SaaS contract in seconds, from upload to actionable insights.',
  openGraph: {
    title: 'Demo — Clausent',
    description:
      'See Clausent in action — watch how AI analyzes a real SaaS contract in seconds, from upload to actionable insights.',
    url: 'https://clausent.com/demo',
    siteName: 'Clausent',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Clausent Demo — live contract analysis walkthrough',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Demo — Clausent',
    description:
      'See Clausent in action — watch how AI analyzes a real SaaS contract in seconds, from upload to actionable insights.',
    images: ['/og-image.png'],
  },
}

/**
 * Página de demonstração interativa — rota /[locale]/demo.
 *
 * Server component que exporta metadata para SEO e renderiza
 * o componente client-side DemoContent com walkthrough animado
 * de análise de contrato (upload, processamento e resultados),
 * cards de funcionalidades e CTA final.
 */
export default function DemoPage() {
  return <DemoContent />
}
