'use client'

import { motion } from 'framer-motion'
import { PricingSection } from '@/components/marketing/pricing-section'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

/**
 * FAQ — perguntas frequentes sobre preços e planos.
 * Cada item contém pergunta e resposta que expande/colapsa com animação.
 */
const FAQ_ITEMS = [
  {
    question: 'Can I try Clausent for free?',
    answer:
      'Yes! You can analyze your first contract completely free, no credit card required. After that, choose a plan that fits your needs.',
  },
  {
    question: 'What happens if I exceed my contract limit?',
    answer:
      "You'll receive a notification when you're near your limit. You can upgrade your plan at any time to add more contracts. Existing contracts remain accessible.",
  },
  {
    question: 'Can I switch plans at any time?',
    answer:
      "Absolutely. You can upgrade or downgrade at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the change takes effect at the next billing cycle.",
  },
  {
    question: 'Is there a discount for annual billing?',
    answer:
      'Yes, you save 20% when you choose annual billing. The discount is applied automatically when you toggle to annual pricing.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, Amex) and ACH bank transfers for annual plans. Enterprise customers can also pay via invoice.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      "We offer a 14-day money-back guarantee on all plans. If you're not satisfied, contact our support team for a full refund.",
  },
] as const

/**
 * Componente de item de FAQ individual.
 * Expande/colapsa ao clicar, com animação suave via Framer Motion.
 */
function FaqItem({
  question,
  answer,
}: {
  question: string
  answer: string
}) {
  /** Controla o estado aberto/fechado do item */
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border-b border-slate-200 last:border-0"
    >
      {/* Botão de toggle do FAQ */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-5 text-left group"
      >
        <span className="text-base font-medium text-slate-900 group-hover:text-indigo-600 transition-colors pr-4">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />
        </motion.div>
      </button>

      {/* Conteúdo da resposta — anima abertura e fechamento */}
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-sm text-slate-500 leading-relaxed">
          {answer}
        </p>
      </motion.div>
    </motion.div>
  )
}

/**
 * Página standalone de Pricing (/pricing).
 *
 * Inclui:
 * - PricingSection completo (reutiliza o componente)
 * - Seção de FAQ com accordion animado
 *
 * A PricingSection é o mesmo componente usado na landing page,
 * garantindo consistência visual entre as páginas.
 */
export default function PricingPage() {
  return (
    <>
      {/* Espaçamento para compensar o header fixo */}
      <div className="pt-16" />

      {/* Seção de preços — reutiliza o mesmo componente da landing */}
      <PricingSection />

      {/* Seção de FAQ */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Cabeçalho do FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Everything you need to know about our pricing.
            </p>
          </motion.div>

          {/* Lista de perguntas */}
          <div className="divide-y divide-slate-200 rounded-2xl bg-white border border-slate-200 px-6">
            {FAQ_ITEMS.map((item) => (
              <FaqItem
                key={item.question}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
