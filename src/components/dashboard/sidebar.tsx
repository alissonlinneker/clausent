'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Bell,
  BarChart3,
  Settings,
  Upload,
  Menu,
  X,
  Users,
  ChevronLeft,
  TrendingUp,
  FileBarChart,
  ShieldAlert,
} from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import { BracketClauseLogo } from '@/components/shared/bracket-clause-logo'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

/**
 * Links da sidebar do dashboard.
 * Cada item contém ícone, chave de tradução e rota.
 */
const SIDEBAR_LINKS = [
  { icon: LayoutDashboard, labelKey: 'overview', href: '/dashboard' },
  { icon: FileText, labelKey: 'contracts', href: '/dashboard/contracts' },
  { icon: Bell, labelKey: 'alerts', href: '/dashboard/alerts' },
  { icon: ShieldAlert, labelKey: 'riskAnalysis', href: '/dashboard/risk' },
  { icon: BarChart3, labelKey: 'benchmarks', href: '/dashboard/benchmarks' },
  { icon: TrendingUp, labelKey: 'analytics', href: '/dashboard/analytics' },
  { icon: FileBarChart, labelKey: 'reports', href: '/dashboard/reports' },
  { icon: Users, labelKey: 'team', href: '/dashboard/team' },
  { icon: Settings, labelKey: 'settings', href: '/dashboard/settings' },
] as const

/**
 * Sidebar do dashboard — navegação principal.
 *
 * Design:
 * - Desktop: sidebar fixa à esquerda (w-64)
 * - Mobile: drawer com overlay (toggle via botão hambúrguer)
 * - Light Neobrutalism: bordas sutis, sombras sólidas
 * - Ícone + label para cada item de navegação
 * - Destaque visual no item ativo
 */
export function DashboardSidebar() {
  const t = useTranslations('dashboard')
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Botão mobile para abrir sidebar */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="dashboard-sidebar"
        aria-label={t('overview')}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay mobile — escondido de leitores de tela */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        id="dashboard-sidebar"
        role="navigation"
        aria-label="Dashboard navigation"
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header da sidebar — logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 rounded-lg">
            <BracketClauseLogo
              className="h-6 w-6 text-teal-600 group-hover:text-emerald-500 transition-colors"
              strokeWidth={2.2}
            />
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Clausent
            </span>
          </Link>

          {/* Fechar sidebar (mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
            onClick={() => setIsOpen(false)}
            aria-label={t('closeSidebar')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Botão de upload rápido */}
        <div className="p-4">
          <Link href="/dashboard/contracts/new">
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500">
              <Upload className="h-4 w-4" />
              {t('uploadContract')}
            </Button>
          </Link>
        </div>

        {/* Links de navegação */}
        <nav className="flex-1 px-3 space-y-1">
          {SIDEBAR_LINKS.map((link) => {
            const Icon = link.icon
            /** Verificar se o link está ativo (match exato ou prefixo) */
            const isActive =
              pathname === link.href ||
              (link.href !== '/dashboard' && pathname.startsWith(link.href))

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500',
                  isActive
                    ? 'bg-teal-50 text-teal-700 shadow-[2px_2px_0px_rgba(13,148,136,0.08)]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-teal-600' : 'text-slate-400'
                  )}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                {t(link.labelKey)}
              </Link>
            )
          })}
        </nav>

        {/* Footer da sidebar */}
        <div className="p-4 border-t border-slate-100">
          <Link
            href="/dashboard/settings/billing"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-teal-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 rounded-lg"
          >
            <ChevronLeft className="h-3 w-3" />
            {t('overview')}
          </Link>
        </div>
      </aside>
    </>
  )
}
