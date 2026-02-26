'use client'

import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/**
 * Mapeamento de status de contrato para configuração visual.
 *
 * Cada status possui:
 * - label: texto exibido no badge
 * - colors: classes Tailwind de fundo, texto e borda
 */
const STATUS_CONFIG: Record<string, { label: string; colors: string }> = {
  active: {
    label: 'Active',
    colors: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  expiring: {
    label: 'Expiring',
    colors: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  expired: {
    label: 'Expired',
    colors: 'bg-red-100 text-red-700 border-red-200',
  },
  renewed: {
    label: 'Renewed',
    colors: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  cancelled: {
    label: 'Cancelled',
    colors: 'bg-slate-100 text-slate-600 border-slate-200',
  },
}

/** Props do componente ContractStatusBadge */
interface ContractStatusBadgeProps {
  /** Status do contrato (active, expiring, expired, renewed, cancelled) */
  status: string
  /** Status de processamento — quando não é 'completed', exibe spinner */
  processingStatus?: string | null
  /** Classes CSS adicionais */
  className?: string
}

/**
 * Badge de status do contrato com cores contextuais.
 *
 * Funcionalidades:
 * - Exibe badge colorido conforme o status do contrato
 * - Quando o contrato está em processamento (processingStatus !== 'completed'),
 *   exibe badge indigo com spinner animado
 * - Usa o componente Badge do shadcn/ui como base
 *
 * Componente reutilizável para listagens e detalhes de contratos.
 */
export function ContractStatusBadge({
  status,
  processingStatus,
  className,
}: ContractStatusBadgeProps) {
  /**
   * Se o contrato ainda está sendo processado, exibir badge especial
   * com ícone de loading (spinner) e cor indigo.
   */
  if (processingStatus && processingStatus !== 'completed') {
    return (
      <Badge
        variant="outline"
        className={cn(
          'bg-indigo-100 text-indigo-700 border-indigo-200',
          className,
        )}
      >
        {/* Spinner animado indicando processamento em andamento */}
        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        Processing...
      </Badge>
    )
  }

  /** Buscar configuração visual para o status — fallback para cancelled */
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.cancelled

  return (
    <Badge
      variant="outline"
      className={cn(config.colors, className)}
    >
      {config.label}
    </Badge>
  )
}
