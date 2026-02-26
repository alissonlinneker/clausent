'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  FileSearch,
  CreditCard,
  Mail,
  Activity,
  Menu,
  X,
  Shield,
  ChevronLeft,
  LogOut,
  Settings,
} from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import { BracketClauseLogo } from '@/components/shared/bracket-clause-logo'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

/**
 * Links de navegação do painel administrativo.
 * Cada item contém ícone, label e rota correspondente.
 * A ordem define a hierarquia visual na sidebar.
 */
const ADMIN_SIDEBAR_LINKS = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/admin',
    description: 'Visão geral do sistema',
  },
  {
    icon: Users,
    label: 'Usuários',
    href: '/admin/users',
    description: 'Gestão de usuários',
  },
  {
    icon: FileSearch,
    label: 'Análises',
    href: '/admin/analyses',
    description: 'Fila de análises',
  },
  {
    icon: CreditCard,
    label: 'Pagamentos',
    href: '/admin/payments',
    description: 'Transações e receita',
  },
  {
    icon: Mail,
    label: 'E-mails',
    href: '/admin/emails',
    description: 'Logs de e-mail',
  },
  {
    icon: Activity,
    label: 'Sistema',
    href: '/admin/system',
    description: 'Saúde do sistema',
  },
] as const

/**
 * Sidebar do painel administrativo — navegação principal.
 *
 * Design:
 * - Desktop: sidebar fixa à esquerda (w-64) com fundo branco
 * - Mobile: drawer com overlay semitransparente
 * - Light Neobrutalism: bordas sutis, sombras sólidas
 * - Cor de destaque: indigo-600 (diferenciação do dashboard teal)
 * - Badge "Admin" no header para identificação clara
 * - Ícone + label + descrição ao hover para cada item
 *
 * Animações:
 * - Framer Motion para transições suaves no mobile
 * - Hover effects nos itens de navegação
 */
export function AdminSidebar() {
  const pathname = usePathname()
  /** Estado do drawer mobile */
  const [isOpen, setIsOpen] = useState(false)

  /**
   * Verifica se um link está ativo comparando com o pathname atual.
   * Para o link raiz (/admin), exige match exato.
   * Para os demais, usa startsWith para incluir sub-rotas.
   */
  const isLinkActive = (href: string) => {
    /** Remove o prefixo de locale do pathname para comparação */
    const cleanPath = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '')
    if (href === '/admin') {
      return cleanPath === '/admin' || cleanPath === '/admin/'
    }
    return cleanPath.startsWith(href)
  }

  return (
    <>
      {/* Botão mobile para abrir sidebar — posicionado fixo no canto superior esquerdo */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menu administrativo"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay mobile — fundo escurecido ao abrir a sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar principal */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200',
          'flex flex-col transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header da sidebar — logo + badge "Admin Panel" */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
          <Link href="/admin" className="flex items-center gap-2 group">
            {/* Logo com cor indigo para admin */}
            <BracketClauseLogo
              className="h-6 w-6 text-indigo-600 group-hover:text-violet-500 transition-colors"
              strokeWidth={2.2}
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
                Clausent
              </span>
            </div>
          </Link>

          {/* Badge indicador de painel admin */}
          <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-indigo-200">
            <Shield className="h-3 w-3" />
            Admin
          </span>

          {/* Botão para fechar sidebar (mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Links de navegação — lista vertical com ícones */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {ADMIN_SIDEBAR_LINKS.map((link) => {
            const Icon = link.icon
            const isActive = isLinkActive(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                  'transition-all duration-200 relative',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-[2px_2px_0px_rgba(79,70,229,0.08)]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                {/* Indicador ativo — barra lateral esquerda */}
                {isActive && (
                  <motion.div
                    layoutId="admin-sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                {/* Ícone do link */}
                <Icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                  )}
                  strokeWidth={isActive ? 2 : 1.5}
                />

                {/* Label + descrição */}
                <div className="flex flex-col">
                  <span>{link.label}</span>
                  <span
                    className={cn(
                      'text-[10px] font-normal leading-tight',
                      isActive ? 'text-indigo-500' : 'text-slate-400'
                    )}
                  >
                    {link.description}
                  </span>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Seção inferior da sidebar — ações rápidas */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          {/* Link para configurações do sistema */}
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-indigo-600 transition-colors rounded-lg hover:bg-slate-50"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Configurações</span>
          </Link>

          {/* Voltar ao dashboard principal */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-50"
          >
            <ChevronLeft className="h-3 w-3" />
            <span>Voltar ao Dashboard</span>
          </Link>

          {/* Botão de logout */}
          <button
            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 w-full"
            onClick={() => {
              /** Lógica de logout — a ser implementada com Better Auth */
            }}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  )
}
