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

/**
 * Lista de features do produto.
 * Cada feature contém ícone, título, descrição e cor de destaque.
 */
const FEATURES = [
  {
    icon: Upload,
    title: 'Smart Upload',
    description: 'Drop PDF or DOCX. We extract everything.',
    color: 'indigo',
    gradient: 'from-indigo-500 to-indigo-600',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-600',
  },
  {
    icon: Shield,
    title: 'Risk Scoring',
    description: '0-100 risk score for every contract.',
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    icon: Bell,
    title: 'Auto-Alerts',
    description: 'Never miss a renewal or deadline again.',
    color: 'amber',
    gradient: 'from-amber-500 to-amber-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
  {
    icon: BarChart3,
    title: 'Market Benchmarks',
    description: 'Compare your terms with market data.',
    color: 'violet',
    gradient: 'from-violet-500 to-violet-600',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-600',
  },
  {
    icon: FileText,
    title: 'Renegotiation Kit',
    description: 'Generated playbook to save money.',
    color: 'rose',
    gradient: 'from-rose-500 to-rose-600',
    bgLight: 'bg-rose-50',
    textColor: 'text-rose-600',
  },
  {
    icon: LayoutDashboard,
    title: 'Full Dashboard',
    description: 'Your entire portfolio at a glance.',
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
  return (
    <section id="features" className="relative py-24 sm:py-32 bg-[#F8FAFC]">
      {/* Decoração de fundo — círculos sutis */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-[120px] -translate-y-1/2" />
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
          <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-600 mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
              control contracts
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            From upload to renegotiation, we handle every step of your contract
            lifecycle.
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
                key={feature.title}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative"
              >
                {/* Card com glass morphism */}
                <div className="relative h-full rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
                  {/* Gradiente de hover no card (aparece suavemente) */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative">
                    {/* Container do ícone com efeito hover */}
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.bgLight} ${feature.textColor} mb-5 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="h-6 w-6" strokeWidth={1.8} />
                    </div>

                    {/* Título da feature */}
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {feature.title}
                    </h3>

                    {/* Descrição breve */}
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {feature.description}
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
