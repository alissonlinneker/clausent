'use client'

import { motion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'

/**
 * Props do componente EmptyState.
 *
 * @param icon - Ícone principal do lucide-react exibido no centro
 * @param title - Título principal do estado vazio
 * @param description - Descrição explicativa abaixo do título
 * @param actionLabel - Texto do botão de ação (opcional)
 * @param actionHref - Link de destino do botão de ação (opcional)
 * @param actionIcon - Ícone do botão de ação (opcional)
 * @param secondaryLabel - Texto do botão secundário (opcional)
 * @param secondaryHref - Link do botão secundário (opcional)
 * @param compact - Se verdadeiro, usa padding reduzido
 */
interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  actionIcon?: LucideIcon
  secondaryLabel?: string
  secondaryHref?: string
  compact?: boolean
}

/**
 * EmptyState — componente reutilizável para estados vazios.
 *
 * Exibido quando uma lista, tabela ou seção não tem dados para mostrar.
 * Inclui ícone animado, texto explicativo e CTA opcional.
 *
 * Design: Light Neobrutalism com card bg-white, bordas sutis,
 * sombra sólida e animação de entrada suave.
 *
 * Uso típico:
 * ```tsx
 * <EmptyState
 *   icon={FileText}
 *   title="No contracts yet"
 *   description="Upload your first contract to get started."
 *   actionLabel="Upload Contract"
 *   actionHref="/dashboard/contracts/new"
 *   actionIcon={Upload}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionIcon: ActionIcon,
  secondaryLabel,
  secondaryHref,
  compact = false,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] text-center',
        compact ? 'p-8' : 'p-12'
      )}
    >
      {/* Ilustração — ícone com fundo decorativo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative mx-auto mb-6"
      >
        {/* Círculo de fundo decorativo */}
        <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-teal-100/40 blur-xl" />

        {/* Container do ícone */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 flex items-center justify-center">
          <Icon className="h-8 w-8 text-teal-600" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Título */}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>

      {/* Descrição */}
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
        {description}
      </p>

      {/* Botões de ação */}
      {(actionLabel || secondaryLabel) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Botão principal */}
          {actionLabel && actionHref && (
            <Button
              asChild
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] hover:shadow-[3px_3px_0px_rgba(0,0,0,0.12)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 gap-2"
            >
              <Link href={actionHref}>
                {ActionIcon && <ActionIcon className="h-4 w-4" />}
                {actionLabel}
              </Link>
            </Button>
          )}

          {/* Botão secundário */}
          {secondaryLabel && secondaryHref && (
            <Button
              variant="outline"
              asChild
              className="rounded-xl border-slate-200"
            >
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )
}
