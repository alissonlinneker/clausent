'use client'

import { useState } from 'react'
import {
  Settings,
  ScrollText,
  Loader2,
  ChevronDown,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OrganizationForm } from '@/components/settings/organization-form'
import { trpc } from '@/lib/trpc/react'

/** Quantidade de entradas do audit log carregadas por página */
const AUDIT_PAGE_SIZE = 20

/**
 * Mapeia ações do audit log para labels e cores legíveis.
 * Cada ação recebe um badge colorido para facilitar a leitura.
 */
const ACTION_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  'organization.update': { label: 'Org Updated', variant: 'default' },
  'contract.create': { label: 'Contract Created', variant: 'secondary' },
  'contract.update': { label: 'Contract Updated', variant: 'secondary' },
  'contract.delete': { label: 'Contract Deleted', variant: 'destructive' },
  'alert.dismiss': { label: 'Alert Dismissed', variant: 'outline' },
}

/**
 * Formata uma data para exibição na tabela do audit log.
 * Formato: "Feb 26, 2026, 3:45 PM"
 */
function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Formata os detalhes do audit log em texto legível.
 * Exibe pares chave-valor de forma compacta.
 */
function formatDetails(details: unknown): string {
  if (!details || typeof details !== 'object') return '—'

  const entries = Object.entries(details as Record<string, unknown>)
  if (entries.length === 0) return '—'

  return entries
    .map(([key, value]) => `${key}: ${String(value ?? '—')}`)
    .join(', ')
}

/**
 * Página de configurações do dashboard.
 *
 * Estrutura:
 * - Tab "General": formulário de edição da organização
 * - Tab "Audit Log": tabela com histórico de ações
 *
 * O audit log suporta:
 * - Paginação via "Load more"
 * - Exibição de usuário, ação, detalhes e data
 */
export default function SettingsPage() {
  /** Offset para paginação do audit log */
  const [auditOffset, setAuditOffset] = useState(0)

  /**
   * Query do audit log com paginação.
   * keepPreviousData mantém os dados anteriores visíveis
   * enquanto novos dados estão carregando.
   */
  const {
    data: auditData,
    isLoading: isLoadingAudit,
    isFetching: isFetchingAudit,
  } = trpc.audit.list.useQuery(
    {
      limit: AUDIT_PAGE_SIZE,
      offset: auditOffset,
    },
    {
      placeholderData: (prev) => prev,
    }
  )

  /** Entradas do audit log (com fallback para lista vazia) */
  const auditEntries = auditData?.entries ?? []

  /** Total de registros (para controlar o botão "Load more") */
  const auditTotal = auditData?.total ?? 0

  /** Verifica se há mais registros para carregar */
  const hasMoreAudit = auditOffset + AUDIT_PAGE_SIZE < auditTotal

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Manage your organization settings and review the audit log.
        </p>
      </div>

      {/* Tabs de configurações */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="gap-1.5">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5">
            <ScrollText className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        {/* Tab: Configurações Gerais */}
        <TabsContent value="general">
          <OrganizationForm />
        </TabsContent>

        {/* Tab: Audit Log */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Activity Log
              </CardTitle>
            </CardHeader>

            <CardContent>
              {/* Estado de carregamento inicial */}
              {isLoadingAudit ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : auditEntries.length === 0 ? (
                /* Estado vazio — nenhuma entrada no audit log */
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50">
                    <ScrollText className="h-7 w-7 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-900">
                    No activity yet
                  </h3>
                  <p className="mt-1 max-w-xs text-xs text-slate-500">
                    Actions performed in your organization will appear here
                    for tracking and compliance.
                  </p>
                </div>
              ) : (
                /* Tabela de entradas do audit log */
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditEntries.map((entry) => {
                        /** Busca o label e variante do badge para a ação */
                        const actionInfo = ACTION_LABELS[entry.action] ?? {
                          label: entry.action,
                          variant: 'outline' as const,
                        }

                        return (
                          <TableRow key={entry.id}>
                            {/* Data da ação */}
                            <TableCell className="text-sm text-slate-600">
                              {formatDate(entry.createdAt)}
                            </TableCell>

                            {/* Usuário que executou a ação */}
                            <TableCell className="text-sm text-slate-900">
                              {entry.user?.name || entry.user?.email || 'System'}
                            </TableCell>

                            {/* Tipo de ação com badge colorido */}
                            <TableCell>
                              <Badge variant={actionInfo.variant}>
                                {actionInfo.label}
                              </Badge>
                            </TableCell>

                            {/* Detalhes adicionais da ação */}
                            <TableCell className="max-w-xs truncate text-sm text-slate-500">
                              {formatDetails(entry.details)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>

                  {/* Botão "Load more" para paginação */}
                  {hasMoreAudit && (
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAuditOffset((prev) => prev + AUDIT_PAGE_SIZE)}
                        disabled={isFetchingAudit}
                      >
                        {isFetchingAudit ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ChevronDown className="mr-2 h-4 w-4" />
                        )}
                        Load more
                      </Button>
                    </div>
                  )}

                  {/* Indicador de total de registros */}
                  <p className="text-center text-xs text-slate-400">
                    Showing {Math.min(auditOffset + AUDIT_PAGE_SIZE, auditTotal)} of{' '}
                    {auditTotal} entries
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
