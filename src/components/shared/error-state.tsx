'use client'

import { motion } from 'framer-motion'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

/**
 * Props do componente ErrorState.
 *
 * @param title - Título do erro (opcional, usa tradução padrão)
 * @param message - Mensagem detalhada do erro (opcional)
 * @param onRetry - Callback executado ao clicar em "Tentar novamente"
 */
interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

/**
 * ErrorState — componente reutilizável para exibir erros.
 *
 * Mostra uma mensagem de erro com ícone, texto explicativo e
 * botão de retry opcional. Usado quando uma requisição falha
 * ou ocorre um erro inesperado.
 *
 * Design: Light Neobrutalism com borda vermelha sutil e
 * ícone de alerta animado.
 */
export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  /** Traduções do namespace common */
  const t = useTranslations('common')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="rounded-2xl bg-white border border-red-200 shadow-[3px_3px_0px_rgba(239,68,68,0.08)] p-12 text-center"
    >
      {/* Ícone de erro animado */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6"
      >
        <AlertCircle className="h-8 w-8 text-red-500" />
      </motion.div>

      {/* Título do erro */}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        {title || t('error')}
      </h3>

      {/* Mensagem detalhada */}
      {message && (
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
          {message}
        </p>
      )}

      {/* Botão de retry */}
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {t('retry')}
        </Button>
      )}
    </motion.div>
  )
}
