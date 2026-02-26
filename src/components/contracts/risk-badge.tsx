'use client'

import { Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Configuração dos níveis de risco com cores, labels e descrições.
 *
 * Cada faixa de risco possui:
 * - label: nome curto do nível de risco
 * - colors: classes Tailwind para fundo e texto
 * - description: descrição para tooltips e acessibilidade
 */
const RISK_LEVELS = {
  low: {
    label: 'Low Risk',
    colors: 'bg-emerald-100 text-emerald-700',
    iconColor: 'text-emerald-500',
    description: 'Este contrato apresenta baixo risco contratual.',
  },
  medium: {
    label: 'Medium Risk',
    colors: 'bg-amber-100 text-amber-700',
    iconColor: 'text-amber-500',
    description: 'Este contrato apresenta risco moderado — requer atenção.',
  },
  high: {
    label: 'High Risk',
    colors: 'bg-orange-100 text-orange-700',
    iconColor: 'text-orange-500',
    description: 'Este contrato apresenta alto risco — recomenda-se revisão.',
  },
  critical: {
    label: 'Critical Risk',
    colors: 'bg-red-100 text-red-700',
    iconColor: 'text-red-500',
    description: 'Este contrato apresenta risco crítico — ação urgente necessária.',
  },
} as const

/**
 * Determina o nível de risco com base no score numérico.
 *
 * Faixas:
 * - 0-25: low (baixo)
 * - 26-50: medium (moderado)
 * - 51-75: high (alto)
 * - 76-100: critical (crítico)
 */
function getRiskLevel(score: number): keyof typeof RISK_LEVELS {
  if (score <= 25) return 'low'
  if (score <= 50) return 'medium'
  if (score <= 75) return 'high'
  return 'critical'
}

/** Props do componente RiskBadge */
interface RiskBadgeProps {
  /** Score de risco de 0 a 100 */
  score: number | null | undefined
  /** Variante de exibição: default (compacta) ou large (com ícone Shield) */
  variant?: 'default' | 'large'
  /** Classes CSS adicionais */
  className?: string
}

/**
 * Badge visual de risk score com cores dinâmicas.
 *
 * - Variante "default": badge compacto exibindo score/100 e label
 * - Variante "large": versão destacada com ícone Shield e número grande
 * - Quando o score é null/undefined, exibe "N/A" em cinza
 *
 * Componente usado no detalhe do contrato e em listagens.
 */
export function RiskBadge({ score, variant = 'default', className }: RiskBadgeProps) {
  /** Caso score não esteja disponível (contrato ainda não processado) */
  if (score === null || score === undefined) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500',
          className,
        )}
      >
        N/A
      </span>
    )
  }

  /** Determinar o nível de risco a partir do score */
  const level = getRiskLevel(score)
  const config = RISK_LEVELS[level]

  /** Variante large — card destacado com ícone Shield e número grande */
  if (variant === 'large') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl px-4 py-3',
          config.colors,
          className,
        )}
        title={config.description}
      >
        {/* Ícone Shield grande */}
        <Shield className={cn('h-8 w-8', config.iconColor)} />

        <div className="flex flex-col">
          {/* Score numérico em destaque */}
          <span className="text-2xl font-bold leading-none">
            {score}
          </span>
          {/* Label do nível de risco */}
          <span className="mt-0.5 text-xs font-medium opacity-80">
            {config.label}
          </span>
        </div>
      </div>
    )
  }

  /** Variante default — badge compacto inline */
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.colors,
        className,
      )}
      title={config.description}
    >
      {score}/100 &middot; {config.label}
    </span>
  )
}
