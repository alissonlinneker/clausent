'use client'

import { useTranslations } from 'next-intl'
import { Bell, Search, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'

/**
 * Header do dashboard — barra superior com pesquisa e ações.
 *
 * Inclui:
 * - Campo de pesquisa global
 * - Botão de notificações
 * - Avatar/info do usuário
 * - Botão de logout
 */
export function DashboardHeader() {
  const t = useTranslations('common')
  const { user, signOut } = useAuth()

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between gap-4">
      {/* Espaço para breadcrumbs ou título (placeholder) */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder={`${t('search')}...`}
            className="pl-9 h-9 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2">
        {/* Botão de notificações */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-500 hover:text-slate-700"
        >
          <Bell className="h-5 w-5" />
          {/* Badge de notificação (placeholder) */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-teal-500" />
        </Button>

        {/* Info do usuário */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          {/* Avatar */}
          <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
            <span className="text-sm font-semibold text-teal-700">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>

          {/* Nome (desktop) */}
          <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
            {user?.name || user?.email || 'User'}
          </span>

          {/* Botão de logout */}
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-red-500"
            onClick={() => signOut()}
            title={t('signOut')}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
