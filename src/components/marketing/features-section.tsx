'use client'

import { motion } from 'framer-motion'
import {
  Upload,
  Shield,
  Bell,
  BarChart3,
  FileText,
  LayoutDashboard,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

/**
 * Lista de features do produto.
 * Cada feature contém ícone, chave de tradução e cor de destaque.
 * Os textos (título e descrição) são obtidos via next-intl.
 */
const FEATURES = [
  {
    icon: Upload,
    key: 'smartUpload',
    color: 'teal',
    gradient: 'from-teal-500 to-teal-600',
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-600',
  },
  {
    icon: Shield,
    key: 'riskScoring',
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    icon: Bell,
    key: 'autoAlerts',
    color: 'amber',
    gradient: 'from-amber-500 to-amber-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
  {
    icon: BarChart3,
    key: 'marketBenchmarks',
    color: 'cyan',
    gradient: 'from-cyan-500 to-cyan-600',
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-600',
  },
  {
    icon: FileText,
    key: 'renegotiationKit',
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-600',
  },
  {
    icon: LayoutDashboard,
    key: 'fullDashboard',
    color: 'sky',
    gradient: 'from-sky-500 to-sky-600',
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-600',
  },
] as const

/**
 * Variantes de animação para o container de cards.
 * Stagger cria um efeito cascata ao revelar cada card.
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

/**
 * FeaturesSection — grade de funcionalidades do produto.
 *
 * Layout: 1 coluna (mobile) → 2 colunas (tablet) → 3 colunas (desktop)
 *
 * Cada card possui:
 * - Ícone com efeito de hover (scale + mudança de cor)
 * - Glass morphism com borda sutil e sombra
 * - Animação stagger de entrada (reveal on scroll)
 */
export function FeaturesSection() {
  /** Hook de traduções do namespace 'features' */
  const t = useTranslations('features')

  return (
    <section id="features" className="relative py-24 sm:py-32 bg-[#FFFDF5] overflow-hidden">
      {/* Decoração de fundo — círculos sutis */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100/50 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-100/30 rounded-full blur-[100px] translate-y-1/2" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da seção */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          {/* Badge da seção */}
          <span className="inline-flex items-center rounded-full bg-teal-50 border border-teal-100 px-4 py-1.5 text-sm font-medium text-teal-600 mb-4">
            {t('badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            {t('title')}{' '}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              {t('titleHighlight')}
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Grade de features — layout responsivo */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.key}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative"
              >
                {/* Card com glass morphism */}
                <div className="relative h-full rounded-2xl bg-white border border-slate-200 p-8 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.08)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300">
                  {/* Gradiente de hover no card (aparece suavemente) */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-50/50 to-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative">
                    {/* Container do ícone com efeito hover */}
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.bgLight} ${feature.textColor} mb-5 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="h-6 w-6" strokeWidth={1.8} />
                    </div>

                    {/* Título da feature */}
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {t(`${feature.key}.title`)}
                    </h3>

                    {/* Descrição breve */}
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {t(`${feature.key}.description`)}
                    </p>
                  </div>

                  {/* Linha de destaque no topo do card (aparece no hover) */}
                  <div
                    className={`absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r ${feature.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
