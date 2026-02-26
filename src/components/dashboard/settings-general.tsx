'use client'

import { useTranslations } from 'next-intl'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { Link } from '@/lib/i18n/navigation'

/**
 * Página de configurações gerais do perfil.
 *
 * Permite editar nome, email e preferências do usuário.
 */
export function SettingsGeneral() {
  const t = useTranslations('settings')
  const { user } = useAuth()

  return (
    <div className="max-w-2xl space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('general')}</p>
      </div>

      {/* Navegação de configurações */}
      <nav className="flex gap-1 border-b border-slate-200 pb-px">
        <Link
          href="/dashboard/settings"
          className="px-4 py-2 text-sm font-medium text-teal-600 border-b-2 border-teal-600"
        >
          {t('general')}
        </Link>
        <Link
          href="/dashboard/settings/billing"
          className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          {t('billing')}
        </Link>
      </nav>

      {/* Formulário de perfil */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input
              id="name"
              defaultValue={user?.name || ''}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              defaultValue={user?.email || ''}
              disabled
              className="rounded-xl bg-slate-50"
            />
            <p className="text-xs text-slate-400">
              {t('emailDisabled')}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
            {t('saveChanges')}
          </Button>
        </div>
      </div>
    </div>
  )
}
