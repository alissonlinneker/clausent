'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Upload, Zap, TrendingDown } from 'lucide-react'
import { useTranslations } from 'next-intl'

/**
 * Passos do fluxo "How it Works".
 * Cada passo utiliza uma chave de tradução em vez de strings fixas.
 */
const STEPS = [
  {
    number: '01',
    icon: Upload,
    key: 'step1',
    color: 'teal',
    gradient: 'from-teal-500 to-teal-600',
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-600',
    borderColor: 'border-teal-200',
  },
  {
    number: '02',
    icon: Zap,
    key: 'step2',
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
  },
  {
    number: '03',
    icon: TrendingDown,
    key: 'step3',
    color: 'violet',
    gradient: 'from-violet-500 to-violet-600',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-600',
    borderColor: 'border-violet-200',
  },
] as const

/**
 * Variantes de animação para a linha vertical da timeline.
 * A linha cresce de cima para baixo conforme o scroll.
 */
const lineVariants = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 1.2, ease: 'easeOut' as const },
  },
}

/**
 * Variantes de animação para cada passo individual.
 * Cada passo entra com fade + slide da esquerda (ou direita em telas grandes).
 */
const stepVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: (delay: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      damping: 20,
      stiffness: 100,
      delay,
    },
  }),
}

/**
 * HowItWorksSection — seção de 3 passos com timeline vertical.
 *
 * Design:
 * - Timeline vertical conectando os 3 passos com linha animada
 * - Número grande animado + ícone + título + descrição
 * - Animação reveal on scroll (useInView do Framer Motion)
 * - Layout alternado em telas grandes (passo esquerda/direita)
 */
export function HowItWorksSection() {
  /** Ref para detectar quando a seção entra na viewport */
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  /** Hook de traduções para o namespace howItWorks */
  const t = useTranslations('howItWorks')

  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da seção */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-600 mb-4">
            {t('badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            {t('title')}{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {t('titleHighlight')}
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Container da timeline e passos */}
        <div ref={sectionRef} className="relative max-w-3xl mx-auto">
          {/* Linha vertical da timeline (animada) */}
          <motion.div
            variants={lineVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-teal-300 via-emerald-300 to-violet-300"
            style={{ originY: 0 }}
          />

          {/* Passos da timeline */}
          <div className="space-y-16 lg:space-y-24">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  custom={index * 0.2}
                  variants={stepVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  className="relative flex gap-8 lg:gap-16 items-start"
                >
                  {/* Indicador numérico na timeline */}
                  <div className="relative z-10 flex-shrink-0">
                    <motion.div
                      whileInView={{
                        scale: [0, 1.2, 1],
                      }}
                      viewport={{ once: true }}
                      transition={{
                        delay: index * 0.2 + 0.3,
                        duration: 0.5,
                        ease: 'easeOut',
                      }}
                      className={`w-16 h-16 rounded-2xl ${step.bgLight} border border-slate-200 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,0.06)]`}
                    >
                      <span
                        className={`text-xl font-bold bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent`}
                      >
                        {step.number}
                      </span>
                    </motion.div>
                  </div>

                  {/* Conteúdo do passo — ícone, título e descrição */}
                  <div className="flex-1 pt-2">
                    {/* Ícone pequeno acompanhando o título */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${step.bgLight} ${step.textColor}`}
                      >
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                        {t(`${step.key}.title`)}
                      </h3>
                    </div>

                    <p className="text-base text-slate-500 leading-relaxed max-w-md">
                      {t(`${step.key}.description`)}
                    </p>

                    {/* Barra de progresso decorativa */}
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{
                        delay: index * 0.2 + 0.5,
                        duration: 0.8,
                        ease: 'easeOut',
                      }}
                      className={`mt-4 h-1 rounded-full bg-gradient-to-r ${step.gradient} max-w-[120px] opacity-40`}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
