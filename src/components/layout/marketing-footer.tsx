'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { motion } from 'framer-motion'
import { BracketClauseLogo } from '@/components/shared/bracket-clause-logo'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

/**
 * Variantes de animação para o container do footer.
 * Usa stagger para animar cada coluna sequencialmente.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

/** Variante de animação para cada coluna individual */
const columnVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
}

/**
 * MarketingFooter — rodapé profissional com múltiplas colunas.
 *
 * Inclui:
 * - Logo + tagline traduzida
 * - 4 colunas de links (Product, Company, Legal, Connect)
 * - Campo de newsletter signup
 * - Copyright
 * - Animação de entrada com stagger via Framer Motion
 * - Textos traduzidos via next-intl (namespaces: footer, nav)
 */
export function MarketingFooter() {
  /** Traduções do namespace do footer */
  const t = useTranslations('footer')
  /** Traduções do namespace de navegação (reutilizadas nos links de produto) */
  const tNav = useTranslations('nav')

  /**
   * Estrutura de colunas do footer.
   * Cada coluna contém um título traduzido e uma lista de links.
   * Definido dentro do componente para acessar as funções de tradução.
   */
  const footerColumns = [
    {
      title: t('product'),
      links: [
        { label: tNav('features'), href: '#features' },
        { label: tNav('pricing'), href: '/pricing' },
        { label: tNav('howItWorks'), href: '#how-it-works' },
        { label: t('apiDocs'), href: '/api-docs' },
        { label: t('changelog'), href: '/changelog' },
      ],
    },
    {
      title: t('company'),
      links: [
        { label: t('about'), href: '/about' },
        { label: t('blog'), href: '/blog' },
        { label: t('careers'), href: '/about#careers' },
        { label: t('pressKit'), href: '/about#press' },
        { label: t('contact'), href: '/contact' },
      ],
    },
    {
      title: t('legal'),
      links: [
        { label: t('privacy'), href: '/privacy' },
        { label: t('terms'), href: '/terms' },
        { label: t('cookies'), href: '/privacy#cookies' },
        { label: t('gdpr'), href: '/privacy#gdpr' },
      ],
    },
    {
      title: t('connect'),
      links: [
        { label: 'Twitter', href: 'https://x.com/clausent' },
        { label: 'LinkedIn', href: 'https://linkedin.com/company/clausent' },
        { label: 'GitHub', href: 'https://github.com/clausent' },
        { label: 'Discord', href: 'https://discord.gg/clausent' },
      ],
    },
  ]

  return (
    <footer className="bg-slate-900 text-white">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8">
          {/* Coluna principal — logo, tagline e newsletter */}
          <motion.div variants={columnVariants} className="lg:col-span-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <BracketClauseLogo
                className="h-7 w-7 text-teal-400 group-hover:text-emerald-400 transition-colors"
                strokeWidth={2.2}
              />
              <span className="text-xl font-bold tracking-tight text-white">
                Clausent
              </span>
            </Link>

            {/* Tagline traduzida */}
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              {t('description')}
            </p>

            {/* Newsletter signup */}
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={t('emailPlaceholder')}
                className="flex-1 h-10 rounded-full bg-slate-800 border border-slate-700 px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
              />
              <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-5 text-sm border-2 border-white/30 shadow-[3px_3px_0px_rgba(255,255,255,0.1)]">
                {t('subscribe')}
              </Button>
            </div>
          </motion.div>

          {/* Colunas de links */}
          {footerColumns.map((column) => (
            <motion.div key={column.title} variants={columnVariants}>
              <h3 className="text-sm font-semibold text-white mb-4">
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-teal-400 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Separador visual */}
        <Separator className="my-10 bg-slate-800" />

        {/* Copyright e links legais inline */}
        <motion.div
          variants={columnVariants}
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Clausent. {t('copyright')}
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {t('privacy')}
            </Link>
            <Link
              href="/terms"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {t('terms')}
            </Link>
            <Link
              href="#"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {t('cookies')}
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  )
}
