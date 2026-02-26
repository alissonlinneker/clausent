'use client'

import { useTranslations } from 'next-intl'
import { Search, Upload, FileText, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link } from '@/lib/i18n/navigation'

/**
 * Lista de contratos do dashboard.
 *
 * Inclui:
 * - Barra de pesquisa e filtros
 * - Tabela responsiva de contratos
 * - Estado vazio quando sem contratos
 * - Paginação
 */
export function ContractsList() {
  const t = useTranslations('contracts')
  const tDash = useTranslations('dashboard')

  /** TODO: Buscar contratos do backend */
  const contracts: unknown[] = []
  const hasContracts = contracts.length > 0

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
        <Link href="/dashboard/contracts/new">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2">
            <Upload className="h-4 w-4" />
            {t('upload')}
          </Button>
        </Link>
      </div>

      {/* Barra de filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder={t('search')}
            className="pl-9 rounded-xl border-slate-200"
          />
        </div>
        <Button
          variant="outline"
          className="rounded-xl border-slate-200 gap-2"
        >
          <Filter className="h-4 w-4" />
          {t('filterStatus')}
        </Button>
      </div>

      {/* Conteúdo */}
      {hasContracts ? (
        /** Tabela de contratos — placeholder para dados reais */
        <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t('title')}
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t('vendor')}
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t('riskScore')}
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t('endDate')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* TODO: Renderizar contratos reais */}
            </tbody>
          </table>
        </div>
      ) : (
        /** Estado vazio */
        <div className="rounded-2xl bg-white border border-slate-200 p-12 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-6">
            <FileText className="h-8 w-8 text-teal-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {tDash('noContracts')}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            {tDash('noContractsDescription')}
          </p>
          <Link href="/dashboard/contracts/new">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2">
              <Upload className="h-4 w-4" />
              {tDash('uploadFirst')}
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
