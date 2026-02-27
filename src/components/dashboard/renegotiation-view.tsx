'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  ArrowLeft,
  Sparkles,
  Download,
  TrendingDown,
  FileText,
  BarChart3,
  MessageSquare,
  Building2,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'

/** Props do componente de renegociação */
interface RenegotiationViewProps {
  contractId: string
}

/**
 * Dados mock do playbook de renegociação.
 * TODO: Substituir por dados gerados pela IA via tRPC
 */
const MOCK_PLAYBOOK = {
  currentTerms: [
    { labelKey: 'termMonthlyCost' as const, value: '$2,000/mo' },
    { labelKey: 'termContractLength' as const, value: '12 months' },
    { labelKey: 'termNoticePeriod' as const, value: '30 days' },
    { labelKey: 'termAutoRenewal' as const, value: 'Yes' },
    { labelKey: 'termSlaUptime' as const, value: '99.5%' },
  ],
  suggestedTerms: [
    { labelKey: 'termMonthlyCost' as const, value: '$1,650/mo', improved: true },
    { labelKey: 'termContractLength' as const, value: '24 months', improved: false },
    { labelKey: 'termNoticePeriod' as const, value: '60 days', improved: true },
    { labelKey: 'termAutoRenewal' as const, value: 'No', improved: true },
    { labelKey: 'termSlaUptime' as const, value: '99.9%', improved: true },
  ],
  estimatedSavings: {
    monthly: 350,
    annual: 4200,
    percentage: 17.5,
  },
  negotiationScript: `Opening: "We've been a loyal customer for the past year and we'd like to discuss our renewal terms. We've done some market research and found that comparable services are priced 15-20% lower."

Key Points:
1. Highlight your track record as a reliable, paying customer
2. Reference competitor pricing (market average is $1,500-$1,700/mo)
3. Propose a longer commitment in exchange for better pricing
4. Request removal of auto-renewal clause
5. Push for higher SLA guarantees

Closing: "We'd prefer to continue our relationship, but we need terms that reflect current market conditions. Can we find a middle ground that works for both sides?"`,
  alternativeProviders: [
    { name: 'TechCorp Solutions', price: '$1,500/mo', rating: '4.5/5' },
    { name: 'CloudBase Pro', price: '$1,700/mo', rating: '4.7/5' },
    { name: 'DataFlow Enterprise', price: '$1,450/mo', rating: '4.3/5' },
  ],
  marketBenchmark: {
    averagePrice: 1650,
    yourPrice: 2000,
    percentileRank: 78,
  },
}

/**
 * Componente de visualização do playbook de renegociação.
 *
 * Permite ao usuário gerar um playbook completo de renegociação
 * com termos sugeridos, script de negociação, provedores alternativos
 * e benchmarks de mercado.
 *
 * Fluxo:
 * 1. Estado vazio com CTA para gerar playbook
 * 2. Estado de carregamento (simulado)
 * 3. Playbook completo com todas as seções
 */
export function RenegotiationView({ contractId }: RenegotiationViewProps) {
  const t = useTranslations('renegotiation')
  /** Controla se o playbook já foi gerado */
  const [isGenerated, setIsGenerated] = useState(false)
  /** Controla o estado de carregamento durante a geração */
  const [isGenerating, setIsGenerating] = useState(false)

  /**
   * Simula a geração do playbook de renegociação.
   * TODO: Substituir por chamada real à API de IA via tRPC
   */
  const handleGenerate = async () => {
    setIsGenerating(true)
    /** Simular tempo de processamento da IA */
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsGenerating(false)
    setIsGenerated(true)
  }

  return (
    <div className="space-y-6">
      {/* Link de retorno ao contrato */}
      <Link
        href={`/dashboard/contracts/${contractId}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('backToContract')}
      </Link>

      {/* Cabeçalho da página */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('subtitle')}</p>
      </div>

      {isGenerated ? (
        /** Playbook gerado — exibir todas as seções */
        <div className="space-y-6">
          {/* Destaque de economia estimada */}
          <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-teal-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                {t('estimatedSavings')}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t('savingsMonthly')}
                </p>
                <p className="text-2xl font-bold text-teal-700">
                  ${MOCK_PLAYBOOK.estimatedSavings.monthly}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t('savingsAnnual')}
                </p>
                <p className="text-2xl font-bold text-teal-700">
                  ${MOCK_PLAYBOOK.estimatedSavings.annual.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t('savingsRate')}
                </p>
                <p className="text-2xl font-bold text-teal-700">
                  {MOCK_PLAYBOOK.estimatedSavings.percentage}%
                </p>
              </div>
            </div>
          </div>

          {/* Comparação de termos: Atuais vs Sugeridos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Termos atuais */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-slate-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {t('currentTerms')}
                </h2>
              </div>
              <div className="space-y-3">
                {MOCK_PLAYBOOK.currentTerms.map((term) => (
                  <div
                    key={term.labelKey}
                    className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0"
                  >
                    <span className="text-sm text-slate-500">{t(term.labelKey)}</span>
                    <span className="text-sm font-medium text-slate-900">
                      {term.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Termos sugeridos */}
            <div className="rounded-2xl bg-white border border-teal-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-teal-600" />
                </div>
                <h2 className="text-lg font-semibold text-teal-700">
                  {t('suggestedTerms')}
                </h2>
              </div>
              <div className="space-y-3">
                {MOCK_PLAYBOOK.suggestedTerms.map((term) => (
                  <div
                    key={term.labelKey}
                    className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0"
                  >
                    <span className="text-sm text-slate-500">{t(term.labelKey)}</span>
                    <span
                      className={cn(
                        'text-sm font-medium',
                        term.improved ? 'text-teal-700' : 'text-slate-900'
                      )}
                    >
                      {term.value}
                      {term.improved && (
                        <span className="ml-1.5 text-xs text-teal-500">
                          ✓
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Script de negociação */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                {t('negotiationScript')}
              </h2>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                {MOCK_PLAYBOOK.negotiationScript}
              </pre>
            </div>
          </div>

          {/* Benchmark de mercado */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-sky-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                {t('marketBenchmark')}
              </h2>
            </div>
            <div className="space-y-4">
              {/* Barra de comparação visual */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t('benchmarkMarketAverage')}</span>
                  <span className="font-medium text-slate-900">
                    ${MOCK_PLAYBOOK.marketBenchmark.averagePrice.toLocaleString()}/mo
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${(MOCK_PLAYBOOK.marketBenchmark.averagePrice / MOCK_PLAYBOOK.marketBenchmark.yourPrice) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{t('benchmarkYourPrice')}</span>
                  <span className="font-medium text-red-600">
                    ${MOCK_PLAYBOOK.marketBenchmark.yourPrice.toLocaleString()}/mo
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full w-full" />
                </div>
              </div>
              <p className="text-xs text-slate-500">
                {t('benchmarkPercentileMessage', { percentage: MOCK_PLAYBOOK.marketBenchmark.percentileRank })}
              </p>
            </div>
          </div>

          {/* Provedores alternativos */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                {t('alternativeProviders')}
              </h2>
            </div>
            <div className="space-y-3">
              {MOCK_PLAYBOOK.alternativeProviders.map((provider) => (
                <div
                  key={provider.name}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {provider.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {t('providerRating', { rating: provider.rating })}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-teal-700">
                    {provider.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Botão de download em PDF */}
          <div className="flex justify-end">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2">
              <Download className="h-4 w-4" />
              {t('downloadPdf')}
            </Button>
          </div>
        </div>
      ) : (
        /** Estado vazio — playbook ainda não gerado */
        <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-teal-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {t('title')}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            {t('subtitle')}
          </p>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('generating')}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t('generate')}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
