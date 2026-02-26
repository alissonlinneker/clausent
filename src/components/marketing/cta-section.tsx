'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'

/**
 * CTASection — seção de chamada para ação final da landing page.
 *
 * Posicionada antes do footer, convida o usuário a criar uma conta
 * gratuitamente. Design com gradiente escuro, texto claro e botão
 * destacado com animação de entrada.
 *
 * A seção usa um visual diferente do resto da página para criar
 * contraste e chamar atenção como último ponto de conversão.
 */
export function CTASection() {
  /** Traduções dos namespaces hero e common */
  const tHero = useTranslations('hero')
  const tCommon = useTranslations('common')

  return (
    <section className="relative py-24 sm:py-32 bg-slate-900 overflow-hidden">
      {/* Decorações de fundo — gradientes coloridos com blur */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-emerald-600/15 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[100px]" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge decorativo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-500/20 px-4 py-1.5 text-sm font-medium text-teal-400 mb-6">
            <Sparkles className="h-4 w-4" />
            No credit card required
          </span>
        </motion.div>

        {/* Título principal */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight"
        >
          Ready to save on your{' '}
          <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
            contracts
          </span>
          ?
        </motion.h2>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto"
        >
          Join thousands of businesses saving an average of 9.2% on contract costs.
          Upload your first contract for free and see the difference AI makes.
        </motion.p>

        {/* Estatísticas em linha */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-8 mt-8 mb-10"
        >
          {/* Estatística 1 */}
          <div className="text-center">
            <p className="text-2xl font-bold text-teal-400">{tHero('stat1Value')}</p>
            <p className="text-xs text-slate-500 mt-0.5">{tHero('stat1Label')}</p>
          </div>
          {/* Separador */}
          <div className="hidden sm:block w-px h-8 bg-slate-700" />
          {/* Estatística 2 */}
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{tHero('stat2Value')}</p>
            <p className="text-xs text-slate-500 mt-0.5">{tHero('stat2Label')}</p>
          </div>
          {/* Separador */}
          <div className="hidden sm:block w-px h-8 bg-slate-700" />
          {/* Estatística 3 */}
          <div className="text-center">
            <p className="text-2xl font-bold text-teal-400">{tHero('stat3Value')}</p>
            <p className="text-xs text-slate-500 mt-0.5">{tHero('stat3Label')}</p>
          </div>
        </motion.div>

        {/* Botões de ação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* CTA principal */}
          <Button
            asChild
            size="lg"
            className="bg-teal-600 hover:bg-teal-500 text-white rounded-full px-8 h-12 text-base font-semibold shadow-[3px_3px_0px_rgba(13,148,136,0.2)] hover:shadow-[4px_4px_0px_rgba(13,148,136,0.25)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300"
          >
            <Link href="/sign-up" className="flex items-center gap-2">
              {tHero('cta')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          {/* CTA secundário */}
          <Button
            variant="outline"
            asChild
            size="lg"
            className="bg-transparent border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 hover:bg-slate-800 rounded-full px-8 h-12 text-base font-semibold transition-all duration-300"
          >
            <Link href="/sign-in">
              {tCommon('signIn')}
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
