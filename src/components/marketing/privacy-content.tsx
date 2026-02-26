'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

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
 * Lista de chaves das 8 seções da Política de Privacidade.
 * Cada seção possui título (sectionXTitle) e conteúdo (sectionXContent)
 * mapeados no namespace 'privacy' do arquivo de traduções.
 */
const SECTIONS = Array.from({ length: 8 }, (_, i) => ({
  titleKey: `section${i + 1}Title` as const,
  contentKey: `section${i + 1}Content` as const,
}))

/**
 * PrivacyContent — conteúdo completo da página de Política de Privacidade.
 *
 * Estrutura:
 * - Cabeçalho com título e data da última atualização
 * - Parágrafo introdutório
 * - 8 seções sobre privacidade e tratamento de dados
 *
 * Design: Light Neobrutalism — card único centralizado com max-w-3xl,
 * fundo branco, borda slate-200, sombra 3px 3px, cantos 2xl.
 * Mesma estrutura visual da página de Termos de Serviço para
 * consistência entre as páginas legais.
 */
export function PrivacyContent() {
  /** Hook de traduções do namespace 'privacy' */
  const t = useTranslations('privacy')

  return (
    <div className="bg-[#FFFDF5] min-h-screen">
      {/* Decoração de fundo — gradientes sutis */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100/30 rounded-full blur-[120px] -translate-y-1/2" />

      <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32">
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Card principal com estilo Light Neobrutalism */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="rounded-2xl bg-white border border-[#e2e8f0] p-8 sm:p-12 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]"
          >
            {/* Cabeçalho — título e data de atualização */}
            <div className="mb-8 pb-8 border-b border-slate-100">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                {t('title')}
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                {t('lastUpdated')}
              </p>
            </div>

            {/* Parágrafo introdutório */}
            <p className="text-base text-slate-500 leading-relaxed mb-10">
              {t('intro')}
            </p>

            {/* Seções de privacidade */}
            <div className="space-y-8">
              {SECTIONS.map((section) => (
                <motion.div
                  key={section.titleKey}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  variants={fadeInUp}
                >
                  {/* Título da seção */}
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">
                    {t(section.titleKey)}
                  </h2>
                  {/* Conteúdo da seção */}
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                    {t(section.contentKey)}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
