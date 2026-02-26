import type { Metadata } from 'next'
import { BenchmarksDashboard } from '@/components/dashboard/benchmarks-dashboard'

/** Metadados da página de benchmarks de mercado */
export const metadata: Metadata = {
  title: 'Market Benchmarks',
}

/**
 * Página de benchmarks — compara contratos com dados de mercado.
 */
export default function BenchmarksPage() {
  return <BenchmarksDashboard />
}
