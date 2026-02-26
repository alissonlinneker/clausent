'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

/**
 * Estrutura de colunas do footer.
 * Cada coluna contém um título e uma lista de links.
 */
const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'How it Works', href: '#how-it-works' },
      { label: 'API Docs', href: '#' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press Kit', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'GDPR', href: '#' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'Twitter', href: '#' },
      { label: 'LinkedIn', href: '#' },
      { label: 'GitHub', href: '#' },
      { label: 'Discord', href: '#' },
    ],
  },
] as const

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
 * - Logo + tagline
 * - 4 colunas de links (Product, Company, Legal, Connect)
 * - Campo de newsletter signup
 * - Copyright
 * - Animação de entrada com stagger via Framer Motion
 */
export function MarketingFooter() {
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
              <Shield
                className="h-7 w-7 text-indigo-400 group-hover:text-emerald-400 transition-colors"
                strokeWidth={2.2}
              />
              <span className="text-xl font-bold tracking-tight text-white">
                Clausent
              </span>
            </Link>

            {/* Tagline */}
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              Contract intelligence that saves SMBs money. Never miss a renewal
              or overpay again.
            </p>

            {/* Newsletter signup */}
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 h-10 rounded-full bg-slate-800 border border-slate-700 px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-5 text-sm shadow-lg shadow-indigo-500/20">
                Subscribe
              </Button>
            </div>
          </motion.div>

          {/* Colunas de links */}
          {FOOTER_COLUMNS.map((column) => (
            <motion.div key={column.title} variants={columnVariants}>
              <h3 className="text-sm font-semibold text-white mb-4">
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-indigo-400 transition-colors duration-200"
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
            &copy; {new Date().getFullYear()} Clausent. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Cookies
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  )
}
