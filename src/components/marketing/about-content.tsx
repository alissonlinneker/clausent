'use client'

import { motion } from 'framer-motion'
import { Eye, Shield, Trophy } from 'lucide-react'
import { useTranslations } from 'next-intl'

/**
 * Ícones e configurações visuais para os 3 cards de valores.
 * Cada valor usa um ícone diferente e esquema de cores próprio
 * para diferenciar visualmente os pilares da empresa.
 */
const VALUES = [
  {
    titleKey: 'value1Title' as const,
    descriptionKey: 'value1Description' as const,
    icon: Eye,
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-600',
    gradient: 'from-teal-500 to-teal-600',
  },
  {
    titleKey: 'value2Title' as const,
    descriptionKey: 'value2Description' as const,
    icon: Shield,
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    titleKey: 'value3Title' as const,
    descriptionKey: 'value3Description' as const,
    icon: Trophy,
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    gradient: 'from-amber-500 to-amber-600',
  },
] as const

/**
 * Variantes de animação para o container com efeito stagger.
 * Cada filho aparece com um atraso incremental para criar
 * o efeito cascata nos cards de valores.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

/** Variante de animação para cada card individual (fade in + slide up) */
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      damping: 20,
      stiffness: 100,
    },
  },
}

/** Variante genérica de fade-in com slide para cima */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
}

/**
 * AboutContent — conteúdo completo da página "Sobre".
 *
 * Estrutura de seções:
 * 1. Hero — título e subtítulo introdutórios
 * 2. Missão — descrição da missão da Clausent
 * 3. Valores — 3 cards com os pilares (transparência, segurança, sucesso do cliente)
 * 4. Equipe — descrição da equipe por trás da plataforma
 *
 * Design: Light Neobrutalism com fundo #FFFDF5, cards bg-white,
 * bordas slate-200, sombras 3px 3px, cantos arredondados 2xl.
 * Animações sutis de fade-in via Framer Motion.
 */
export function AboutContent() {
  /** Hook de traduções do namespace 'about' */
  const t = useTranslations('about')

  return (
    <div className="bg-[#FFFDF5] min-h-screen">
      {/* Decoração de fundo — gradientes sutis */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100/40 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-100/20 rounded-full blur-[100px] translate-y-1/2" />

      {/* ===== SEÇÃO HERO ===== */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight"
          >
            {t('title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' as const, delay: 0.15 }}
            className="mt-6 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            {t('subtitle')}
          </motion.p>
        </div>
      </section>

      {/* ===== SEÇÃO MISSÃO ===== */}
      <section className="relative py-16 sm:py-20">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="rounded-2xl bg-white border border-[#e2e8f0] p-8 sm:p-12 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
              {t('missionTitle')}
            </h2>
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed">
              {t('missionDescription')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== SEÇÃO VALORES ===== */}
      <section className="relative py-16 sm:py-20">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Título da seção de valores */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-flex items-center rounded-full bg-teal-50 border border-teal-100 px-4 py-1.5 text-sm font-medium text-teal-600 mb-4">
              {t('valuesTitle')}
            </span>
          </motion.div>

          {/* Grade de cards de valores */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {VALUES.map((value) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={value.titleKey}
                  variants={cardVariants}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="group relative"
                >
                  {/* Card com estilo Light Neobrutalism */}
                  <div className="relative h-full rounded-2xl bg-white border border-[#e2e8f0] p-8 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.08)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300">
                    {/* Gradiente de hover sutil */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-50/50 to-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative">
                      {/* Ícone do valor */}
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${value.bgLight} ${value.textColor} mb-5 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="h-6 w-6" strokeWidth={1.8} />
                      </div>

                      {/* Título do valor */}
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {t(value.titleKey)}
                      </h3>

                      {/* Descrição do valor */}
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {t(value.descriptionKey)}
                      </p>
                    </div>

                    {/* Linha de destaque no topo (aparece no hover) */}
                    <div
                      className={`absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r ${value.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    />
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ===== SEÇÃO EQUIPE ===== */}
      <section className="relative py-16 sm:py-20 pb-24 sm:pb-32">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="rounded-2xl bg-white border border-[#e2e8f0] p-8 sm:p-12 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
              {t('teamTitle')}
            </h2>
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
              {t('teamDescription')}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
