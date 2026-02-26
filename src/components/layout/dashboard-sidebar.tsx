'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Shield,
  LayoutDashboard,
  FileText,
  Bell,
  BarChart3,
  Settings,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

/**
 * Itens de navegação da sidebar do dashboard.
 * Cada item possui rota, label, e ícone correspondente.
 */
const NAVIGATION_ITEMS = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
  },
  {
    href: '/dashboard/contracts',
    label: 'Contracts',
    icon: FileText,
  },
  {
    href: '/dashboard/alerts',
    label: 'Alerts',
    icon: Bell,
  },
  {
    href: '/dashboard/benchmarks',
    label: 'Benchmarks',
    icon: BarChart3,
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
  },
] as const

/**
 * Componente de navegação da sidebar.
 * Renderiza a lista de links com estado ativo baseado na rota atual.
 * Utiliza usePathname() para detectar qual item está selecionado.
 */
function SidebarNavigation() {
  /** Rota atual para destacar o item ativo */
  const pathname = usePathname()

  /**
   * Verifica se um link está ativo.
   * Para o "/dashboard" exato, exige correspondência exata
   * para evitar que fique ativo em sub-rotas.
   * Para os demais, verifica se o pathname começa com o href.
   */
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAVIGATION_ITEMS.map((item) => {
        const active = isActive(item.href)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              /* Estilos base do item de navegação */
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              /* Estado ativo: fundo indigo sutil e texto indigo */
              active
                ? 'bg-indigo-50 text-indigo-700'
                : /* Estado inativo: texto secundário com hover sutil */
                  'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5 shrink-0 transition-colors duration-200',
                active ? 'text-indigo-600' : 'text-slate-400'
              )}
            />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

/**
 * Componente do rodapé da sidebar.
 * Exibe o plano atual do usuário e um botão de upgrade.
 */
function SidebarFooter() {
  return (
    <div className="px-3 pb-4">
      <Separator className="mb-4" />
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        {/* Indicador do plano atual */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Current Plan
          </span>
          <Badge
            variant="secondary"
            className="bg-slate-100 text-xs text-slate-600"
          >
            Free
          </Badge>
        </div>

        {/* Informação de uso */}
        <p className="mb-3 text-xs text-slate-400">
          0 / 5 contracts
        </p>

        {/* Botão de upgrade com destaque visual */}
        <Button
          className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
          size="sm"
        >
          <Zap className="mr-1 h-3.5 w-3.5" />
          Upgrade Plan
        </Button>
      </div>
    </div>
  )
}

/**
 * Sidebar principal do dashboard.
 * Contém o logotipo, navegação e rodapé com informações do plano.
 * Em desktop fica fixa na lateral esquerda (w-64).
 * Em mobile, este componente é reutilizado dentro de um Sheet (off-canvas).
 */
export function DashboardSidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-[#F8FAFC]">
      {/* Cabeçalho com logotipo */}
      <div className="flex h-16 items-center gap-2.5 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <Shield className="h-4.5 w-4.5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900">
          Clausent
        </span>
      </div>

      {/* Área de navegação — ocupa o espaço disponível */}
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNavigation />
      </div>

      {/* Rodapé com plano e upgrade */}
      <SidebarFooter />
    </aside>
  )
}
