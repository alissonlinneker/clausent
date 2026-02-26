'use client'

import { motion } from 'framer-motion'
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { ContractClause } from '@/lib/db/schema/contract-clauses'

/**
 * Ordem de prioridade dos níveis de risco.
 * Usado para ordenar cláusulas — críticas primeiro, baixas por último.
 */
const RISK_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

/**
 * Configuração visual de cada nível de risco de cláusula.
 *
 * - icon: ícone Lucide correspondente
 * - iconColor: cor do ícone
 * - borderColor: cor da borda lateral esquerda (destaque visual)
 * - badgeColors: classes para o badge de nível
 * - tooltip: descrição explicativa do nível
 */
const RISK_CONFIG = {
  critical: {
    icon: ShieldAlert,
    iconColor: 'text-red-500',
    borderColor: 'border-l-red-500',
    badgeColors: 'bg-red-100 text-red-700',
    tooltip: 'Cláusula com risco crítico — requer ação imediata e revisão jurídica.',
  },
  high: {
    icon: AlertTriangle,
    iconColor: 'text-orange-500',
    borderColor: 'border-l-orange-500',
    badgeColors: 'bg-orange-100 text-orange-700',
    tooltip: 'Cláusula com alto risco — pode causar impacto financeiro significativo.',
  },
  medium: {
    icon: AlertCircle,
    iconColor: 'text-amber-500',
    borderColor: 'border-l-amber-500',
    badgeColors: 'bg-amber-100 text-amber-700',
    tooltip: 'Cláusula com risco moderado — atenção recomendada.',
  },
  low: {
    icon: ShieldCheck,
    iconColor: 'text-emerald-500',
    borderColor: 'border-l-emerald-200',
    badgeColors: 'bg-emerald-100 text-emerald-700',
    tooltip: 'Cláusula com baixo risco — dentro dos padrões aceitáveis.',
  },
} as const

/**
 * Variantes de animação para o container da lista.
 * Usado pelo framer-motion para efeito stagger (entrada escalonada).
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

/**
 * Variantes de animação para cada item de cláusula.
 * Cada item faz fade-in com slide suave de baixo para cima.
 */
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
}

/** Props do componente ClauseList */
interface ClauseListProps {
  /** Lista de cláusulas extraídas do contrato */
  clauses: ContractClause[]
  /** Classes CSS adicionais */
  className?: string
}

/**
 * Lista de cláusulas extraídas de um contrato com destaque visual por nível de risco.
 *
 * Funcionalidades:
 * - Ordena cláusulas por nível de risco (critical > high > medium > low)
 * - Borda lateral colorida para cláusulas de alto risco e críticas
 * - Ícone colorido por nível de risco com tooltip explicativo
 * - Badge do tipo de cláusula (penalty, termination, liability, etc.)
 * - Animação de fade-in com stagger via framer-motion
 * - Estado vazio quando não há cláusulas
 */
export function ClauseList({ clauses, className }: ClauseListProps) {
  /** Se não há cláusulas, exibir estado vazio */
  if (!clauses || clauses.length === 0) {
    return (
      <div className={cn('py-8 text-center text-sm text-slate-500', className)}>
        No clauses extracted yet.
      </div>
    )
  }

  /**
   * Ordenar cláusulas por nível de risco (críticas primeiro).
   * Cria uma cópia para não mutar o array original.
   */
  const sortedClauses = [...clauses].sort(
    (a, b) => (RISK_ORDER[a.riskLevel] ?? 3) - (RISK_ORDER[b.riskLevel] ?? 3),
  )

  return (
    <TooltipProvider>
      <motion.div
        className={cn('space-y-3', className)}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {sortedClauses.map((clause) => {
          /** Buscar configuração visual para o nível de risco */
          const config = RISK_CONFIG[clause.riskLevel as keyof typeof RISK_CONFIG] || RISK_CONFIG.low
          const Icon = config.icon

          /** Destacar visualmente cláusulas de risco alto ou crítico */
          const isHighRisk = clause.riskLevel === 'critical' || clause.riskLevel === 'high'

          return (
            <motion.div
              key={clause.id}
              variants={itemVariants}
              className={cn(
                'flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50/50',
                /** Borda lateral colorida para cláusulas de alto risco */
                isHighRisk && `border-l-4 ${config.borderColor}`,
              )}
            >
              {/* Ícone de risco com tooltip explicativo */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="mt-0.5 shrink-0">
                    <Icon className={cn('h-5 w-5', config.iconColor)} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{config.tooltip}</p>
                </TooltipContent>
              </Tooltip>

              {/* Conteúdo da cláusula */}
              <div className="min-w-0 flex-1">
                {/* Badges: tipo e nível de risco */}
                <div className="mb-1.5 flex items-center gap-2">
                  {/* Badge do tipo de cláusula (penalty, termination, etc.) */}
                  <Badge
                    variant="outline"
                    className="border-slate-200 text-xs capitalize text-slate-600"
                  >
                    {clause.clauseType.replace(/_/g, ' ')}
                  </Badge>

                  {/* Badge do nível de risco */}
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      config.badgeColors,
                    )}
                  >
                    {clause.riskLevel}
                  </span>
                </div>

                {/* Texto da cláusula */}
                <p className="text-sm leading-relaxed text-slate-700">
                  {clause.text}
                </p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </TooltipProvider>
  )
}
