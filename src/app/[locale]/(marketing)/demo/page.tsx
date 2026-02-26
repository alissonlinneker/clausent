import { Metadata } from 'next'
import { DemoContent } from '@/components/marketing/demo-content'

/** Metadados SEO da página de demonstração */
export const metadata: Metadata = {
  title: 'Demo',
  description:
    'See Clausent in action — watch how AI analyzes a real SaaS contract in seconds, from upload to actionable insights.',
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
