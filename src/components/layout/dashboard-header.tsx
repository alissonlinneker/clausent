'use client'

import { usePathname } from 'next/navigation'
import { Menu, Search } from 'lucide-react'
import { OrganizationSwitcher, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'

/**
 * Mapeamento de rotas para breadcrumbs legíveis.
 * Cada chave é um segmento da URL e o valor é o label exibido.
 */
const BREADCRUMB_MAP: Record<string, string> = {
  dashboard: 'Overview',
  contracts: 'Contracts',
  alerts: 'Alerts',
  benchmarks: 'Benchmarks',
  settings: 'Settings',
}

/**
 * Componente de breadcrumb simples.
 * Extrai os segmentos do pathname e exibe navegação contextual.
 */
function Breadcrumb() {
  const pathname = usePathname()

  /**
   * Divide o pathname em segmentos e filtra strings vazias.
   * Ex: "/dashboard/contracts" → ["dashboard", "contracts"]
   */
  const segments = pathname.split('/').filter(Boolean)

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      {segments.map((segment, index) => {
        /** Label legível do segmento, ou o segmento capitalizado como fallback */
        const label =
          BREADCRUMB_MAP[segment] ||
          segment.charAt(0).toUpperCase() + segment.slice(1)

        /** Último segmento não recebe separador */
        const isLast = index === segments.length - 1

        return (
          <span key={segment} className="flex items-center gap-1.5">
            {/* Separador entre segmentos (exceto antes do primeiro) */}
            {index > 0 && (
              <span className="text-slate-300">/</span>
            )}
            <span
              className={
                isLast
                  ? /* Segmento atual: texto escuro e bold */
                    'font-medium text-slate-900'
                  : /* Segmentos anteriores: texto mais claro */
                    'text-slate-500'
              }
            >
              {label}
            </span>
          </span>
        )
      })}
    </nav>
  )
}

/**
 * Header principal do dashboard.
 * Contém:
 * - Botão hamburguer para abrir sidebar em mobile (via Sheet)
 * - Breadcrumb de navegação
 * - Barra de busca (placeholder, ainda não funcional)
 * - OrganizationSwitcher do Clerk
 * - UserButton do Clerk
 */
export function DashboardHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      {/* Lado esquerdo: hamburguer (mobile) + breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Botão hamburguer — visível apenas em mobile/tablet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5 text-slate-600" />
            </Button>
          </SheetTrigger>

          {/* Sidebar off-canvas para mobile */}
          <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
            {/* Título acessível para leitores de tela (visualmente oculto) */}
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <DashboardSidebar />
          </SheetContent>
        </Sheet>

        {/* Breadcrumb contextual */}
        <Breadcrumb />
      </div>

      {/* Lado direito: busca + organização + usuário */}
      <div className="flex items-center gap-3">
        {/* Barra de busca — oculta em mobile para economizar espaço */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search contracts..."
            className="h-9 w-64 border-slate-200 bg-slate-50 pl-9 text-sm placeholder:text-slate-400 focus-visible:ring-indigo-500/20"
            disabled
          />
        </div>

        {/* Seletor de organização do Clerk */}
        <OrganizationSwitcher
          appearance={{
            elements: {
              rootBox: 'flex items-center',
              organizationSwitcherTrigger:
                'rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50',
            },
          }}
        />

        {/* Botão do perfil do usuário do Clerk */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'h-8 w-8',
            },
          }}
        />
      </div>
    </header>
  )
}
