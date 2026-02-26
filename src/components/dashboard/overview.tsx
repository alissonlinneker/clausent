'use client'

import { useTranslations } from 'next-intl'
import {
  FileText,
  Bell,
  TrendingDown,
  Shield,
  Upload,
  ArrowUpRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/lib/i18n/navigation'

/**
 * Cards de métricas do dashboard.
 * Cada card exibe um KPI com ícone, valor e variação.
 */
const METRIC_CARDS = [
  {
    labelKey: 'totalContracts',
    value: '0',
    icon: FileText,
    color: 'teal',
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-600',
  },
  {
    labelKey: 'activeContracts',
    value: '0',
    icon: Shield,
    color: 'emerald',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    labelKey: 'expiringContracts',
    value: '0',
    icon: Bell,
    color: 'amber',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
  {
    labelKey: 'totalSavings',
    value: '$0',
    icon: TrendingDown,
    color: 'sky',
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-600',
  },
] as const

/**
 * Componente de overview do dashboard.
 *
 * Exibe o estado geral do portfólio de contratos com:
 * - 4 cards de métricas-chave
 * - Estado vazio quando não há contratos
 * - CTA para primeiro upload
 */
export function DashboardOverview() {
  const t = useTranslations('dashboard')

  /** TODO: Buscar dados reais do backend */
  const hasContracts = false

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('welcome', { name: '' })}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t('overview')}</p>
        </div>
        <Link href="/dashboard/contracts/new">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2">
            <Upload className="h-4 w-4" />
            {t('uploadContract')}
          </Button>
        </Link>
      </div>

      {/* Grid de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRIC_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.labelKey}
              className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.08)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-xl ${card.bgLight} flex items-center justify-center`}
                >
                  <Icon className={`h-5 w-5 ${card.textColor}`} />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-300" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="text-sm text-slate-500 mt-1">
                {t(card.labelKey)}
              </p>
            </div>
          )
        })}
      </div>

      {/* Estado vazio — quando não há contratos */}
      {!hasContracts && (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-6">
            <FileText className="h-8 w-8 text-teal-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {t('noContracts')}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            {t('noContractsDescription')}
          </p>
          <Link href="/dashboard/contracts/new">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2">
              <Upload className="h-4 w-4" />
              {t('uploadFirst')}
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
