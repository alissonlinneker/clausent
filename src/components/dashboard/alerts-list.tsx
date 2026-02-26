'use client'

import { useTranslations } from 'next-intl'
import { Bell, Calendar, AlertTriangle } from 'lucide-react'

/**
 * Lista de alertas do dashboard.
 *
 * Exibe alertas de renovação, expiração e
 * outros eventos importantes dos contratos.
 */
export function AlertsList() {
  const t = useTranslations('dashboard')

  /** TODO: Buscar alertas do backend */
  const alerts: unknown[] = []

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('alerts')}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {t('alertsSubtitle')}
        </p>
      </div>

      {/* Estado vazio */}
      {alerts.length === 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
            <Bell className="h-8 w-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {t('noAlerts')}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {t('noAlertsDescription')}
          </p>
        </div>
      )}
    </div>
  )
}
