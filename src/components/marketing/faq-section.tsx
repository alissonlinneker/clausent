'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

/**
 * Chaves das perguntas frequentes do namespace 'faq'.
 * Cada item tem uma chave de pergunta (qN) e resposta (aN).
 */
const FAQ_ITEMS = [
  { questionKey: 'q1', answerKey: 'a1' },
  { questionKey: 'q2', answerKey: 'a2' },
  { questionKey: 'q3', answerKey: 'a3' },
  { questionKey: 'q4', answerKey: 'a4' },
  { questionKey: 'q5', answerKey: 'a5' },
  { questionKey: 'q6', answerKey: 'a6' },
] as const

/**
 * Variante de animação para cada item do acordeão.
 * Fade in + slide up com stagger sequencial.
 */
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 25,
      stiffness: 120,
    },
  },
}

/**
 * Variante do container com stagger entre os itens.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
}

/**
 * FAQSection — seção de perguntas frequentes com acordeão animado.
 *
 * Design:
 * - Layout em 2 colunas (título + FAQ items)
 * - Acordeão com transição suave de altura
 * - Ícone de seta rotativa ao expandir
 * - Light Neobrutalism: bordas, sombras sólidas, cantos arredondados
 * - Animações de entrada via Framer Motion
 *
 * Posicionada na landing page entre Pricing e o Footer.
 */
export function FAQSection() {
  /** Hook de traduções do namespace FAQ */
  const t = useTranslations('faq')

  /** Índice do item atualmente expandido (-1 = nenhum) */
  const [openIndex, setOpenIndex] = useState<number>(-1)

  /**
   * Alterna a visibilidade de um item do acordeão.
   * Se o item clicado já está aberto, fecha-o.
   */
  const toggleItem = (index: number) => {
    setOpenIndex((prev) => (prev === index ? -1 : index))
  }

  return (
    <section id="faq" className="relative py-24 sm:py-32 bg-white overflow-hidden">
      {/* Decorações de fundo */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-teal-50/50 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-50/30 rounded-full blur-[100px]" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da seção */}
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
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Lista de perguntas — acordeão */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="space-y-3"
        >
          {FAQ_ITEMS.map((item, index) => {
            /** Determina se este item está expandido */
            const isOpen = openIndex === index

            return (
              <motion.div
                key={item.questionKey}
                variants={itemVariants}
                className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-[4px_4px_0px_rgba(0,0,0,0.08)] transition-shadow duration-200"
              >
                {/* Botão da pergunta — header do acordeão */}
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-sm sm:text-base font-semibold text-slate-900 pr-4">
                    {t(item.questionKey)}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 text-slate-400 flex-shrink-0 transition-transform duration-300',
                      isOpen && 'rotate-180 text-teal-600'
                    )}
                  />
                </button>

                {/* Corpo da resposta — animação de expansão */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-5 border-t border-slate-100">
                        <p className="text-sm text-slate-500 leading-relaxed pt-4">
                          {t(item.answerKey)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
