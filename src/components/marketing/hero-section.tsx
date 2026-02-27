'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Link } from '@/lib/i18n/navigation'

/**
 * Partículas flutuantes decorativas do hero.
 * Cada partícula é um círculo translúcido de teal que flutua
 * com animação de loop infinito via Framer Motion.
 */
const PARTICLES = [
  { size: 6, x: '10%', y: '20%', delay: 0, duration: 8 },
  { size: 4, x: '25%', y: '60%', delay: 1.5, duration: 10 },
  { size: 8, x: '70%', y: '15%', delay: 0.8, duration: 9 },
  { size: 5, x: '85%', y: '50%', delay: 2, duration: 11 },
  { size: 3, x: '50%', y: '80%', delay: 0.5, duration: 7 },
  { size: 7, x: '15%', y: '75%', delay: 3, duration: 12 },
  { size: 4, x: '60%', y: '35%', delay: 1, duration: 8.5 },
  { size: 6, x: '90%', y: '70%', delay: 2.5, duration: 10 },
  { size: 3, x: '40%', y: '10%', delay: 0.3, duration: 9.5 },
  { size: 5, x: '75%', y: '85%', delay: 1.8, duration: 7.5 },
]

/**
 * Chaves de tradução para as estatísticas exibidas no rodapé do hero.
 * Cada stat mapeia para chaves de valor e rótulo no namespace 'hero'.
 */
const HERO_STATS_KEYS = [
  { valueKey: 'stat1Value', labelKey: 'stat1Label' },
  { valueKey: 'stat2Value', labelKey: 'stat2Label' },
  { valueKey: 'stat3Value', labelKey: 'stat3Label' },
] as const

/**
 * Variante de animação para elementos que entram de baixo.
 * Usada no título, subtítulo, botões e stats.
 */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
}

/**
 * HeroSection — seção principal da landing page.
 *
 * Design:
 * - Fundo gradiente teal escuro (#042F2E → #134E4A) com grid sutil
 * - Partículas flutuantes animadas (círculos translúcidos)
 * - Badge de beta no topo com borda gradiente
 * - Headline impactante + subtítulo
 * - Dois CTAs (primário + outline)
 * - Mockup do dashboard com glass morphism
 * - Estatísticas de impacto no rodapé
 * - Efeito parallax sutil no mockup ao rolar
 */
export function HeroSection() {
  /** Hook de traduções do namespace 'hero' */
  const t = useTranslations('hero')

  /** Ref para controlar o parallax do mockup ao rolar */
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  /** Transforma o progresso de scroll em movimento vertical do mockup */
  const mockupY = useTransform(scrollYProgress, [0, 1], [0, 80])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #042F2E 0%, #134E4A 50%, #042F2E 100%)',
      }}
    >
      {/* Padrão de grid sutil no fundo */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Gradiente radial central para profundidade */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-teal-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Partículas flutuantes decorativas */}
      {PARTICLES.map((particle, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full bg-teal-400/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.x,
            top: particle.y,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Conteúdo principal do hero */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-center">
        {/* Badge animado — indicador de beta */}
        <motion.div
          custom={0}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="inline-flex mb-8"
        >
          <div className="relative group cursor-default">
            {/* Borda gradiente via pseudo-elemento */}
            <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 opacity-70 group-hover:opacity-100 transition-opacity blur-[1px]" />
            <div className="relative flex items-center gap-2 rounded-full bg-[#042F2E]/90 backdrop-blur-sm px-4 py-1.5 text-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/90 font-medium">
                {t('badge')}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Título principal — headline impactante */}
        <motion.h1
          custom={0.15}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] max-w-4xl mx-auto"
        >
          {t('title')}{' '}
          <span className="relative">
            {/* Texto com gradiente via background-clip */}
            <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
              {t('titleHighlight')}
            </span>
            {/* Underline decorativo animado */}
            <motion.span
              className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
              style={{ originX: 0 }}
            />
          </span>
        </motion.h1>

        {/* Subtítulo — proposta de valor detalhada */}
        <motion.p
          custom={0.3}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mt-6 text-lg sm:text-xl text-teal-200/80 max-w-2xl mx-auto leading-relaxed"
        >
          {t('subtitle')}
        </motion.p>

        {/* CTAs — dois botões de ação */}
        <motion.div
          custom={0.45}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* CTA primário */}
          <Button
            asChild
            size="lg"
            className="bg-teal-600 hover:bg-teal-500 text-white rounded-full px-8 h-12 text-base font-semibold shadow-[2px_2px_0px_rgba(0,0,0,0.1)] hover:shadow-[3px_3px_0px_rgba(0,0,0,0.12)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <Link href="/sign-up">
              {t('cta')}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>

          {/* CTA secundário — watch demo */}
          <Button
            variant="outline"
            size="lg"
            className="bg-transparent border border-white/30 text-white hover:bg-white/10 hover:text-white hover:border-white/50 rounded-full px-8 h-12 text-base font-medium backdrop-blur-sm shadow-[2px_2px_0px_rgba(255,255,255,0.1)] hover:shadow-[3px_3px_0px_rgba(255,255,255,0.15)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <Play className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
            {t('ctaSecondary')}
          </Button>
        </motion.div>

        {/* Mockup do dashboard — glass morphism com parallax */}
        <motion.div
          custom={0.6}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          style={{ y: mockupY }}
          className="mt-16 mx-auto max-w-4xl"
        >
          <div className="relative">
            {/* Brilho atrás do mockup */}
            <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 via-emerald-500/10 to-teal-500/20 rounded-2xl blur-2xl" />

            {/* Card do mockup com glass morphism */}
            <div className="relative rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-1 shadow-2xl">
              {/* Barra de título do "navegador" */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <div className="w-3 h-3 rounded-full bg-green-400/60" />
                </div>
                <div className="flex-1 mx-8">
                  <div className="h-6 rounded-md bg-white/5 border border-white/5 flex items-center justify-center">
                    <span className="text-[10px] text-white/30 font-mono">
                      app.clausent.com/dashboard
                    </span>
                  </div>
                </div>
              </div>

              {/* Conteúdo simulado do dashboard */}
              <div className="p-6 space-y-4">
                {/* Linha de métricas — responsivo para viewports estreitas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      labelKey: 'mockupActiveContracts' as const,
                      value: '47',
                      change: '+3',
                      color: 'teal',
                    },
                    {
                      labelKey: 'mockupRiskScore' as const,
                      value: '73',
                      change: '-5',
                      color: 'emerald',
                    },
                    {
                      labelKey: 'mockupPotentialSavings' as const,
                      value: '$12.4K',
                      change: '+$2.1K',
                      color: 'teal',
                    },
                  ].map((metric) => (
                    <div
                      key={metric.labelKey}
                      className="rounded-lg bg-white/5 border border-white/5 p-4"
                    >
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">
                        {t(metric.labelKey)}
                      </p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {metric.value}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          metric.color === 'emerald'
                            ? 'text-emerald-400'
                            : 'text-teal-400'
                        }`}
                      >
                        {metric.change} {t('mockupThisMonth')}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Lista simulada de contratos */}
                <div className="rounded-lg bg-white/5 border border-white/5 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-white/60">
                      {t('mockupRecentContracts')}
                    </p>
                    <div className="h-5 w-16 rounded bg-teal-500/20 animate-pulse" />
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-t border-white/5 first:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-white/5" />
                        <div>
                          <div className="h-3 w-28 rounded bg-white/10" />
                          <div className="h-2 w-20 rounded bg-white/5 mt-1.5" />
                        </div>
                      </div>
                      <div
                        className={`h-5 w-14 rounded-full ${
                          i === 1
                            ? 'bg-emerald-500/20'
                            : i === 2
                              ? 'bg-yellow-500/20'
                              : 'bg-red-500/20'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Estatísticas de impacto no rodapé do hero */}
        <motion.div
          custom={0.75}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-16"
        >
          {HERO_STATS_KEYS.map((stat, index) => (
            <div key={stat.valueKey} className="flex items-center gap-3">
              {/* Separador entre stats (exceto o primeiro) */}
              {index > 0 && (
                <div className="hidden sm:block w-px h-8 bg-white/10 -ml-8 sm:-ml-12 mr-5 sm:mr-4" />
              )}
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  {t(stat.valueKey)}
                </p>
                <p className="text-sm text-teal-300/60 mt-0.5">
                  {t(stat.labelKey)}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Gradiente de transição para a próxima seção */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FFFDF5] to-transparent" />
    </section>
  )
}
