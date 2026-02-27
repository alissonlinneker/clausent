'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Link } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'

/**
 * Configuração dos 4 planos de preço exibidos na landing page.
 * Cada plano utiliza chaves de tradução para nome, descrição e features.
 * Professional é o plano destacado como MOST POPULAR.
 */
const PRICING_PLANS = [
  {
    key: 'starter',
    monthlyPrice: 9,
    yearlyPrice: 7,
    popular: false,
    featureKeys: ['upTo5', 'aiAnalysis', 'riskScoring', 'renewalAlerts', 'pdfDocx', 'emailSupport'],
    ctaKey: 'getStarted',
    href: '/sign-up',
  },
  {
    key: 'professional',
    monthlyPrice: 29,
    yearlyPrice: 23,
    popular: true,
    featureKeys: [
      'upTo25',
      'advancedAiAnalysis',
      'fullRiskScoring',
      'smartAlerts',
      'marketBenchmarks',
      'renegotiationPlaybooks',
      'teamSeats3',
      'exportPdfCsv',
      'priorityEmail',
    ],
    ctaKey: 'getStarted',
    href: '/sign-up',
  },
  {
    key: 'business',
    monthlyPrice: 79,
    yearlyPrice: 63,
    popular: false,
    featureKeys: [
      'upTo100',
      'fullAiSuite',
      'benchmarksTrends',
      'advancedRenegotiation',
      'teamSeats10',
      'customTemplates',
      'apiAccess',
      'priorityChatEmail',
      'auditLog',
      'whiteLabelReports',
    ],
    ctaKey: 'getStarted',
    href: '/sign-up',
  },
  {
    key: 'enterprise',
    monthlyPrice: null,
    yearlyPrice: null,
    popular: false,
    featureKeys: [
      'unlimitedContracts',
      'unlimitedSeats',
      'dedicatedManager',
      'customSla',
      'ssoSaml',
      'onPremise',
      'customAiTraining',
      'trainingOnboarding',
      'phoneSupport',
    ],
    ctaKey: 'contactSales',
    href: '#',
  },
] as const

/**
 * Variantes de animação para o container de cards.
 * Usa stagger para revelar cada card sequencialmente.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

/** Variante de animação para cada card individual */
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 20,
      stiffness: 100,
    },
  },
}

/**
 * PricingSection — seção de preços com switch mensal/anual.
 *
 * Design:
 * - 4 cards em grid responsivo (1 col mobile → 2 tablet → 4 desktop)
 * - Card "Professional" destacado como MOST POPULAR
 * - Switch mensal/anual com desconto de ~20%
 * - Hover lift effect (translateY -8px) em cada card
 * - Checkmarks verdes na lista de features
 * - Animação stagger de entrada via Framer Motion
 */
export function PricingSection() {
  /** Controla se está exibindo preço anual (true) ou mensal (false) — padrão: anual */
  const [isAnnual, setIsAnnual] = useState(true)

  /** Hooks de traduções para os namespaces pricing e common */
  const t = useTranslations('pricing')
  const tCommon = useTranslations('common')

  return (
    <section id="pricing" className="relative py-24 sm:py-32 bg-[#FFFDF5] overflow-hidden">
      {/* Decorações de fundo */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-100/40 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-emerald-100/30 rounded-full blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da seção */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center rounded-full bg-teal-50 border border-teal-100 px-4 py-1.5 text-sm font-medium text-teal-600 mb-4">
            {t('badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            {t('title')}{' '}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              {t('titleHighlight')}
            </span>{' '}
            {t('titleEnd')}
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Toggle mensal/anual */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center justify-center gap-3 mb-12"
        >
          <span
            className={`text-sm font-medium transition-colors ${
              !isAnnual ? 'text-slate-900' : 'text-slate-400'
            }`}
          >
            {tCommon('monthly')}
          </span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} aria-label={tCommon('toggleBillingPeriod')} />
          <span
            className={`text-sm font-medium transition-colors ${
              isAnnual ? 'text-slate-900' : 'text-slate-400'
            }`}
          >
            {tCommon('annual')}
          </span>
          {/* Badge de desconto */}
          <AnimatePresence>
            {isAnnual && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -10 }}
                className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-600"
              >
                {tCommon('save20')}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Grade de cards de preço */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"
        >
          {PRICING_PLANS.map((plan) => (
            <motion.div
              key={plan.key}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={`relative group ${plan.popular ? 'lg:-mt-4 lg:mb-4' : ''}`}
            >
              {/* Tag POPULAR com gradiente (apenas no card destacado) */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center rounded-full bg-teal-600 px-4 py-1 text-xs font-bold text-white shadow-[2px_2px_0px_rgba(13,148,136,0.2)]">
                    {tCommon('mostPopular')}
                  </span>
                </div>
              )}

              {/* Card */}
              <div
                className={`relative h-full rounded-2xl p-8 flex flex-col transition-all duration-300 ${
                  plan.popular
                    ? 'bg-white border-2 border-teal-200 shadow-[4px_4px_0px_rgba(13,148,136,0.1)] ring-0'
                    : 'bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.08)] hover:-translate-x-0.5 hover:-translate-y-0.5'
                }`}
              >
                {/* Nome do plano */}
                <h3 className="text-lg font-semibold text-slate-900">
                  {t(`${plan.key}.name`)}
                </h3>
                <p className="text-sm text-slate-500 mt-1">{t(`${plan.key}.description`)}</p>

                {/* Preço */}
                <div className="mt-6 mb-6">
                  {plan.monthlyPrice !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-slate-900">
                        ${isAnnual ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-sm text-slate-400">{tCommon('perMonth')}</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-4xl font-bold text-slate-900">
                        {tCommon('custom')}
                      </span>
                    </div>
                  )}
                  {/* Indicação de cobrança anual */}
                  {isAnnual && plan.monthlyPrice !== null && (
                    <p className="text-xs text-slate-400 mt-1">
                      {tCommon('billedAnnually')}
                    </p>
                  )}
                </div>

                {/* Lista de features com checkmarks */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.featureKeys.map((featureKey) => (
                    <li key={featureKey} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-600">{t(`features.${featureKey}`)}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  asChild
                  className={`w-full rounded-full font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-[2px_2px_0px_rgba(13,148,136,0.15)] hover:shadow-[3px_3px_0px_rgba(13,148,136,0.2)] hover:-translate-x-0.5 hover:-translate-y-0.5'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-[2px_2px_0px_rgba(0,0,0,0.1)] hover:shadow-[3px_3px_0px_rgba(0,0,0,0.12)] hover:-translate-x-0.5 hover:-translate-y-0.5'
                  }`}
                >
                  <Link href={plan.href}>{tCommon(plan.ctaKey)}</Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
