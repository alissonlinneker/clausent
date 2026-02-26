'use client'

import { useState, useCallback } from 'react'
import {
  ArrowUpCircle,
  CheckCircle2,
  ClipboardCopy,
  DollarSign,
  Loader2,
  RefreshCw,
  TrendingDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { RenegotiationPackage as RenegotiationPackageType } from '@/lib/db/schema/renegotiation-packages'

/**
 * Tipo de um ponto de renegociação individual.
 * O campo `points` do banco é jsonb — definimos o tipo aqui para segurança.
 */
interface RenegotiationPoint {
  /** Prioridade do ponto (1 = mais prioritário) */
  priority: number
  /** Título descritivo do ponto */
  title: string
  /** Argumentação fundamentada */
  argument: string
  /** Economia potencial estimada em USD */
  potentialSavings: number
}

/** Props do componente RenegotiationPackage */
interface RenegotiationPackageProps {
  /** Dados do pacote retornado do banco */
  pkg: RenegotiationPackageType
  /** Callback para regenerar o pacote */
  onRegenerate: () => void
  /** Callback para salvar edições no rascunho de email */
  onSaveDraft: (draftEmail: string) => void
  /** Indica se está gerando/regenerando o pacote */
  isRegenerating?: boolean
  /** Indica se está salvando o rascunho */
  isSavingDraft?: boolean
}

/**
 * Formata valor monetário em USD.
 * Exemplo: formatCurrency(1500) → "$1,500.00"
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Mapa de cores por prioridade para os pontos de renegociação.
 * Prioridade 1 (mais importante) = emerald, prioridade 5 = slate.
 */
const PRIORITY_COLORS: Record<number, string> = {
  1: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  2: 'bg-blue-100 text-blue-800 border-blue-200',
  3: 'bg-amber-100 text-amber-800 border-amber-200',
  4: 'bg-orange-100 text-orange-800 border-orange-200',
  5: 'bg-slate-100 text-slate-700 border-slate-200',
}

/**
 * Componente que exibe o pacote de renegociação completo.
 *
 * Seções:
 * 1. Card destaque com economia estimada total (verde emerald)
 * 2. Lista numerada de pontos de renegociação priorizados
 * 3. Rascunho de email editável com ação de copiar
 * 4. Botão de regeneração
 */
export function RenegotiationPackage({
  pkg,
  onRegenerate,
  onSaveDraft,
  isRegenerating = false,
  isSavingDraft = false,
}: RenegotiationPackageProps) {
  /** Estado local do rascunho de email para edição */
  const [draftEmail, setDraftEmail] = useState(pkg.draftEmail ?? '')
  /** Flag de "copiado" para feedback visual no botão */
  const [copied, setCopied] = useState(false)
  /** Flag para controlar se o draft foi modificado */
  const [isDraftDirty, setIsDraftDirty] = useState(false)

  /** Cast seguro do campo jsonb para tipagem dos pontos */
  const points = (pkg.points as unknown as RenegotiationPoint[]) ?? []

  /** Economia total estimada — vem do banco como string numeric */
  const totalSavings = pkg.estimatedSavings
    ? parseFloat(pkg.estimatedSavings)
    : 0

  /**
   * Copia o rascunho de email para a área de transferência.
   * Exibe feedback visual "Copied!" por 2 segundos.
   */
  const handleCopyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(draftEmail)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /** Fallback silencioso — clipboard pode não estar disponível */
    }
  }, [draftEmail])

  /**
   * Handler de mudança no textarea do email.
   * Atualiza o estado local e marca como modificado.
   */
  const handleDraftChange = useCallback((value: string) => {
    setDraftEmail(value)
    setIsDraftDirty(true)
  }, [])

  /**
   * Salva as edições do rascunho de email via callback do pai.
   * Após salvar, reseta o flag de "dirty".
   */
  const handleSaveDraft = useCallback(() => {
    onSaveDraft(draftEmail)
    setIsDraftDirty(false)
  }, [draftEmail, onSaveDraft])

  return (
    <div className="space-y-6">
      {/* =========================================== */}
      {/* CARD DESTAQUE — Economia Estimada Total     */}
      {/* =========================================== */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 shadow-sm">
        <CardContent className="flex items-center gap-4 p-6">
          {/* Ícone decorativo grande */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10">
            <TrendingDown className="h-7 w-7 text-emerald-600" />
          </div>

          <div>
            {/* Label */}
            <p className="text-sm font-medium text-emerald-700">
              Estimated Total Savings
            </p>
            {/* Valor em destaque */}
            <p className="text-3xl font-bold tracking-tight text-emerald-900">
              {formatCurrency(totalSavings)}
            </p>
            <p className="mt-0.5 text-xs text-emerald-600/80">
              Based on {points.length} renegotiation {points.length === 1 ? 'point' : 'points'} identified
            </p>
          </div>
        </CardContent>
      </Card>

      {/* =========================================== */}
      {/* PONTOS DE RENEGOCIAÇÃO — Lista priorizada   */}
      {/* =========================================== */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-slate-900">
            <ArrowUpCircle className="h-4 w-4 text-indigo-500" />
            Renegotiation Points
          </CardTitle>
          <CardDescription>
            {points.length} {points.length === 1 ? 'point' : 'points'} identified, ordered by priority
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {points
              .sort((a, b) => a.priority - b.priority)
              .map((point, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50/50"
                >
                  {/* Header do ponto — prioridade + título + economia */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      {/* Badge de prioridade numerada */}
                      <Badge
                        variant="outline"
                        className={cn(
                          'shrink-0 font-mono text-xs',
                          PRIORITY_COLORS[point.priority] ?? PRIORITY_COLORS[5],
                        )}
                      >
                        #{point.priority}
                      </Badge>
                      {/* Título do ponto */}
                      <h4 className="text-sm font-semibold text-slate-900">
                        {point.title}
                      </h4>
                    </div>

                    {/* Badge de economia potencial */}
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(point.potentialSavings)} savings
                    </div>
                  </div>

                  {/* Argumentação do ponto */}
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {point.argument}
                  </p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* =========================================== */}
      {/* RASCUNHO DE EMAIL — Editável com Copy       */}
      {/* =========================================== */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                <ClipboardCopy className="h-4 w-4 text-indigo-500" />
                Draft Email
              </CardTitle>
              <CardDescription>
                Edit and copy the email below to send to the counterparty
              </CardDescription>
            </div>

            {/* Botões de ação do email */}
            <div className="flex gap-2">
              {/* Botão Salvar — aparece quando o draft foi editado */}
              {isDraftDirty && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft}
                >
                  {isSavingDraft ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Save
                </Button>
              )}

              {/* Botão Copiar */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyEmail}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <ClipboardCopy className="mr-1.5 h-3.5 w-3.5" />
                    Copy Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Textarea editável com o rascunho de email */}
          <Textarea
            value={draftEmail}
            onChange={(e) => handleDraftChange(e.target.value)}
            className="min-h-[300px] resize-y font-mono text-sm leading-relaxed text-slate-700"
            placeholder="No email draft available..."
          />
        </CardContent>
      </Card>

      <Separator />

      {/* =========================================== */}
      {/* AÇÕES — Regenerar pacote                    */}
      {/* =========================================== */}
      <div className="flex justify-end">
        <Button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="bg-indigo-600 text-white hover:bg-indigo-700"
        >
          {isRegenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {isRegenerating ? 'Generating...' : 'Regenerate Package'}
        </Button>
      </div>
    </div>
  )
}

/**
 * Skeleton de carregamento para o pacote de renegociação.
 * Exibe placeholders animados simulando o layout final
 * enquanto o pacote está sendo gerado.
 */
export function RenegotiationPackageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Skeleton do card de economia */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 shadow-sm">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="h-14 w-14 animate-pulse rounded-2xl bg-emerald-200/50" />
          <div className="space-y-2">
            <div className="h-4 w-36 animate-pulse rounded bg-emerald-200/50" />
            <div className="h-8 w-48 animate-pulse rounded bg-emerald-200/50" />
            <div className="h-3 w-52 animate-pulse rounded bg-emerald-200/50" />
          </div>
        </CardContent>
      </Card>

      {/* Skeleton dos pontos de renegociação */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <div className="h-5 w-44 animate-pulse rounded bg-slate-200" />
          <div className="mt-1 h-4 w-64 animate-pulse rounded bg-slate-200" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-8 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
                  </div>
                  <div className="h-6 w-28 animate-pulse rounded-full bg-emerald-100" />
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skeleton do email */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />
          <div className="mt-1 h-4 w-72 animate-pulse rounded bg-slate-200" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full animate-pulse rounded-md bg-slate-100" />
        </CardContent>
      </Card>
    </div>
  )
}
