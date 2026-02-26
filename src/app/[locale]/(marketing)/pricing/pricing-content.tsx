'use client'

import { motion } from 'framer-motion'
import { PricingSection } from '@/components/marketing/pricing-section'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

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
        aria-expanded={isOpen}
      >
        <span className="text-base font-medium text-slate-900 group-hover:text-teal-600 transition-colors pr-4">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" aria-hidden="true" />
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
 * Conteúdo client-side da página de Pricing com i18n.
 *
 * Inclui:
 * - PricingSection completo (reutiliza o componente)
 * - Seção de FAQ com accordion animado
 *
 * Todas as strings são carregadas via useTranslations() do next-intl,
 * garantindo que o conteúdo seja exibido no idioma correto.
 */
export function PricingContent() {
  /** Hook de tradução — namespace 'faq' para a seção de perguntas frequentes */
  const t = useTranslations('faq')

  /** Monta os itens de FAQ a partir das traduções */
  const faqItems = [
    { question: t('q1'), answer: t('a1') },
    { question: t('q2'), answer: t('a2') },
    { question: t('q3'), answer: t('a3') },
    { question: t('q4'), answer: t('a4') },
    { question: t('q5'), answer: t('a5') },
    { question: t('q6'), answer: t('a6') },
  ]

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
              {t('title')}
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              {t('subtitle')}
            </p>
          </motion.div>

          {/* Lista de perguntas */}
          <div className="divide-y divide-slate-200 rounded-2xl bg-white border border-slate-200 px-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
            {faqItems.map((item) => (
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
