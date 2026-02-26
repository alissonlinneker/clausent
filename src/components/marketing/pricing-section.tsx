'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import Link from 'next/link'

/**
 * Configuração dos planos de preço.
 * Cada plano possui nome, preço mensal/anual, features e destaque.
 */
const PRICING_PLANS = [
  {
    name: 'Starter',
    description: 'Perfect for small businesses getting started.',
    monthlyPrice: 29,
    yearlyPrice: 23,
    popular: false,
    features: [
      'Up to 10 contracts',
      'Basic risk analysis',
      'Renewal alerts',
      'Email support',
      'PDF & DOCX upload',
    ],
    cta: 'Get Started',
    href: '/sign-up',
  },
  {
    name: 'Professional',
    description: 'Full analysis and benchmarks for growing teams.',
    monthlyPrice: 59,
    yearlyPrice: 47,
    popular: true,
    features: [
      'Up to 50 contracts',
      'Full risk analysis',
      'Market benchmarks',
      'Renewal alerts',
      'Priority email support',
      'Team collaboration',
      'Export reports',
    ],
    cta: 'Get Started',
    href: '/sign-up',
  },
  {
    name: 'Business',
    description: 'Advanced tools for established organizations.',
    monthlyPrice: 99,
    yearlyPrice: 79,
    popular: false,
    features: [
      'Up to 200 contracts',
      'Full risk analysis',
      'Market benchmarks',
      'Renegotiation kit',
      'Priority support',
      'Team collaboration',
      'Custom templates',
      'API access',
    ],
    cta: 'Get Started',
    href: '/sign-up',
  },
  {
    name: 'Enterprise',
    description: 'Custom solutions for large organizations.',
    monthlyPrice: null,
    yearlyPrice: null,
    popular: false,
    features: [
      'Unlimited contracts',
      'Custom integrations',
      'Dedicated support',
      'SSO & SAML',
      'Custom SLA',
      'On-premise option',
      'Training & onboarding',
      'Audit log',
    ],
    cta: 'Contact Sales',
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
 * - Card "Professional" destacado como POPULAR
 * - Switch mensal/anual com desconto de 20%
 * - Hover lift effect (translateY -8px) em cada card
 * - Checkmarks verdes na lista de features
 * - Animação stagger de entrada via Framer Motion
 */
export function PricingSection() {
  /** Controla se está exibindo preço anual (true) ou mensal (false) */
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <section id="pricing" className="relative py-24 sm:py-32 bg-[#F8FAFC]">
      {/* Decorações de fundo */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-100/40 rounded-full blur-[120px]" />
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
          <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-600 mb-4">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Simple,{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
              transparent
            </span>{' '}
            pricing
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees.
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
            Monthly
          </span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
          <span
            className={`text-sm font-medium transition-colors ${
              isAnnual ? 'text-slate-900' : 'text-slate-400'
            }`}
          >
            Annual
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
                Save 20%
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
              key={plan.name}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={`relative group ${plan.popular ? 'lg:-mt-4 lg:mb-4' : ''}`}
            >
              {/* Tag POPULAR com gradiente (apenas no card destacado) */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-600 to-emerald-500 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-indigo-500/25">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {/* Card */}
              <div
                className={`relative h-full rounded-2xl border p-8 flex flex-col transition-all duration-300 ${
                  plan.popular
                    ? 'bg-white border-indigo-200 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-100'
                    : 'bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-indigo-500/5'
                }`}
              >
                {/* Nome do plano */}
                <h3 className="text-lg font-semibold text-slate-900">
                  {plan.name}
                </h3>
                <p className="text-sm text-slate-500 mt-1">{plan.description}</p>

                {/* Preço */}
                <div className="mt-6 mb-6">
                  {plan.monthlyPrice !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-slate-900">
                        ${isAnnual ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-sm text-slate-400">/mo</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-4xl font-bold text-slate-900">
                        Custom
                      </span>
                    </div>
                  )}
                  {/* Indicação de cobrança anual */}
                  {isAnnual && plan.monthlyPrice !== null && (
                    <p className="text-xs text-slate-400 mt-1">
                      Billed annually
                    </p>
                  )}
                </div>

                {/* Lista de features com checkmarks */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  asChild
                  className={`w-full rounded-full font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
