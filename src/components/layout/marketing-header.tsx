'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'

/**
 * Links de navegação do header de marketing.
 * Cada item mapeia para uma seção (âncora) da landing page.
 */
const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
] as const

/**
 * MarketingHeader — cabeçalho fixo com efeito glass morphism.
 *
 * Comportamento:
 * - Transparente no topo da página
 * - Ao rolar, ganha fundo blur (backdrop-filter) e sombra sutil
 * - No mobile, abre um Sheet lateral com navegação
 * - Animações suaves de transição via Framer Motion
 */
export function MarketingHeader() {
  /** Controla se o usuário já rolou a página (ativa o efeito glass) */
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    /** Listener de scroll — ativa glass effect após 20px de rolagem */
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] border-b border-slate-200/50'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo — ícone de escudo + nome da marca */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Shield
              className={`h-7 w-7 transition-colors duration-300 ${
                scrolled ? 'text-indigo-600' : 'text-white'
              } group-hover:text-emerald-500`}
              strokeWidth={2.2}
            />
            {/* Brilho sutil atrás do ícone */}
            <div className="absolute inset-0 blur-lg bg-indigo-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span
            className={`text-xl font-bold tracking-tight transition-colors duration-300 ${
              scrolled ? 'text-slate-900' : 'text-white'
            }`}
          >
            Clausent
          </span>
        </Link>

        {/* Navegação desktop — links centrais */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                scrolled
                  ? 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Botões de ação — desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            asChild
            className={`transition-colors duration-200 ${
              scrolled
                ? 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
                : 'text-white/90 hover:text-white hover:bg-white/10'
            }`}
          >
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button
            asChild
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-5 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200"
          >
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>

        {/* Menu hambúrguer — mobile (Sheet lateral do shadcn) */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`${
                  scrolled
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
              {/* Cabeçalho do menu mobile */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <Link href="/" className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-indigo-600" strokeWidth={2.2} />
                  <span className="text-lg font-bold tracking-tight text-slate-900">
                    Clausent
                  </span>
                </Link>
              </div>

              {/* Links de navegação mobile */}
              <div className="flex flex-col p-4 gap-1">
                {NAV_LINKS.map((link) => (
                  <SheetClose key={link.href} asChild>
                    <Link
                      href={link.href}
                      className="flex items-center px-4 py-3 text-sm font-medium text-slate-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>

              {/* Botões de ação mobile */}
              <div className="flex flex-col gap-3 p-4 mt-auto border-t border-slate-100">
                <Button
                  variant="outline"
                  asChild
                  className="w-full justify-center rounded-full"
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-500/25"
                >
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  )
}
