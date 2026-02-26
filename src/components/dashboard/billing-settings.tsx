'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { CreditCard, ArrowUpRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/lib/i18n/navigation'

/**
 * Configurações de billing e assinatura.
 *
 * Exibe o plano atual, uso de contratos e opções
 * para gerenciar a assinatura via Stripe Customer Portal.
 */
export function BillingSettings() {
  const t = useTranslations('settings')
  const [isLoadingPortal, setIsLoadingPortal] = useState(false)

  /** TODO: Buscar dados do plano atual do backend */
  const currentPlan = 'Free'
  const contractsUsed = 0
  const contractsLimit = 1

  /** Abrir Stripe Customer Portal */
  async function handleManageBilling() {
    setIsLoadingPortal(true)
    try {
      const response = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error)
    } finally {
      setIsLoadingPortal(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('billing')}</p>
      </div>

      {/* Navegação de configurações */}
      <nav className="flex gap-1 border-b border-slate-200 pb-px">
        <Link
          href="/dashboard/settings"
          className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          {t('general')}
        </Link>
        <Link
          href="/dashboard/settings/billing"
          className="px-4 py-2 text-sm font-medium text-teal-600 border-b-2 border-teal-600"
        >
          {t('billing')}
        </Link>
      </nav>

      {/* Card do plano atual */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{t('currentPlan')}</h3>
              <p className="text-sm text-slate-500">{currentPlan}</p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleManageBilling}
            disabled={isLoadingPortal}
            className="rounded-xl gap-2"
          >
            {t('manageBilling')}
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Barra de uso */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-500">
              {t('contractsUsed')}
            </span>
            <span className="font-medium text-slate-700">
              {contractsUsed} / {contractsLimit === Infinity ? t('unlimited') : contractsLimit}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 rounded-full transition-all"
              style={{
                width: `${Math.min(100, (contractsUsed / contractsLimit) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      {currentPlan === 'Free' && (
        <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 p-6 shadow-[3px_3px_0px_rgba(13,148,136,0.08)]">
          <h3 className="font-semibold text-slate-900 mb-2">
            {t('upgradePlan')}
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            {t('upgradeDescription')}
          </p>
          <Link href="/pricing">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2">
              {t('viewPlans')}
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
