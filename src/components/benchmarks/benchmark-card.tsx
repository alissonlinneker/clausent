'use client'

import {
  DollarSign,
  Clock,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { generateBenchmarkInsight } from '@/lib/ai/benchmark-engine'

/**
 * Props do componente BenchmarkCard.
 * Representa um benchmark individual de uma métrica contratual.
 */
interface BenchmarkCardProps {
  /** Nome da métrica (ex: monthly_cost, contract_duration, notice_period) */
  metric: string
  /** Valor do contrato do usuário */
  yourValue: number
  /** Média de mercado para essa métrica */
  marketAvg: number
  /** Percentil calculado (0-100) */
  percentile: number
}

/**
 * Configuração visual por tipo de métrica.
 * Define ícone, label amigável e se "menor é melhor" (para custos).
 */
const METRIC_CONFIG: Record<string, {
  icon: typeof DollarSign
  label: string
  /** Se true, valor abaixo da média é positivo (ex: custos) */
  lowerIsBetter: boolean
  /** Formato de exibição do valor */
  format: (value: number) => string
}> = {
  monthly_cost: {
    icon: DollarSign,
    label: 'Monthly Cost',
    lowerIsBetter: true,
    format: (v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
  },
  contract_duration: {
    icon: CalendarDays,
    label: 'Contract Duration',
    lowerIsBetter: false,
    format: (v) => `${v} months`,
  },
  notice_period: {
    icon: Clock,
    label: 'Notice Period',
    lowerIsBetter: false,
    format: (v) => `${v} days`,
  },
  total_value: {
    icon: DollarSign,
    label: 'Total Value',
    lowerIsBetter: true,
    format: (v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
  },
  annual_cost: {
    icon: DollarSign,
    label: 'Annual Cost',
    lowerIsBetter: true,
    format: (v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
  },
}

/** Configuração padrão para métricas não mapeadas */
const DEFAULT_METRIC_CONFIG = {
  icon: TrendingUp,
  label: 'Metric',
  lowerIsBetter: false,
  format: (v: number) => v.toLocaleString('en-US'),
}

/**
 * Determina a cor do benchmark baseado na posição e se "menor é melhor".
 *
 * Para custos (lowerIsBetter = true):
 * - Abaixo da média → verde (bom, está pagando menos)
 * - Acima da média → vermelho (ruim, está pagando mais)
 *
 * Para duração/notice (lowerIsBetter = false):
 * - Acima da média → verde
 * - Abaixo da média → vermelho
 */
function getBenchmarkColor(percentile: number, lowerIsBetter: boolean): {
  barColor: string
  bgColor: string
  textColor: string
  borderColor: string
  trend: 'positive' | 'negative' | 'neutral'
} {
  /** Exatamente na média */
  if (percentile === 50) {
    return {
      barColor: 'bg-slate-400',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-700',
      borderColor: 'border-slate-200',
      trend: 'neutral',
    }
  }

  /** Acima da média (percentil > 50) */
  const isAbove = percentile > 50
  /** Determina se a posição é "boa" ou "ruim" */
  const isPositive = lowerIsBetter ? !isAbove : isAbove

  if (isPositive) {
    return {
      barColor: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      trend: 'positive',
    }
  }

  return {
    barColor: 'bg-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    trend: 'negative',
  }
}

/**
 * Card individual de benchmark.
 *
 * Exibe uma métrica contratual comparada com a média do mercado:
 * - Ícone e nome da métrica
 * - Valor do usuário vs. média do mercado
 * - Barra visual de percentil (0-100)
 * - Insight textual gerado automaticamente
 * - Cor contextual: verde (favorável) ou vermelho (desfavorável)
 */
export function BenchmarkCard({ metric, yourValue, marketAvg, percentile }: BenchmarkCardProps) {
  /** Resolve a configuração da métrica */
  const config = METRIC_CONFIG[metric] || {
    ...DEFAULT_METRIC_CONFIG,
    label: metric.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  }
  const Icon = config.icon

  /** Determina a cor baseada no percentil e tipo da métrica */
  const colors = getBenchmarkColor(percentile, config.lowerIsBetter)

  /** Ícone de tendência — seta para cima, baixo ou neutro */
  const TrendIcon = colors.trend === 'positive'
    ? TrendingUp
    : colors.trend === 'negative'
      ? TrendingDown
      : Minus

  /** Gera o texto de insight descritivo */
  const insight = generateBenchmarkInsight({ metric, yourValue, marketAvg, percentile })

  return (
    <Card className={cn('border transition-all duration-200 hover:shadow-md', colors.borderColor)}>
      <CardContent className="pt-6">
        {/* Cabeçalho: ícone + nome da métrica + badge de percentil */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Ícone da métrica */}
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', colors.bgColor)}>
              <Icon className={cn('h-5 w-5', colors.textColor)} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{config.label}</h3>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <TrendIcon className={cn('h-3 w-3', colors.textColor)} />
                <span>Percentile {percentile}</span>
              </div>
            </div>
          </div>

          {/* Badge de posição */}
          <Badge
            variant="outline"
            className={cn('text-xs font-medium', colors.bgColor, colors.textColor, colors.borderColor)}
          >
            {percentile > 50 ? 'Above avg' : percentile < 50 ? 'Below avg' : 'At avg'}
          </Badge>
        </div>

        {/* Valores comparativos */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          {/* Valor do usuário */}
          <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
            <p className="text-xs font-medium text-slate-500">Your Value</p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {config.format(yourValue)}
            </p>
          </div>
          {/* Média do mercado */}
          <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
            <p className="text-xs font-medium text-slate-500">Market Avg</p>
            <p className="mt-1 text-lg font-bold text-slate-500">
              {config.format(marketAvg)}
            </p>
          </div>
        </div>

        {/* Barra de percentil */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
          {/* Track da barra */}
          <div className="relative mt-1 h-2 w-full rounded-full bg-slate-100">
            {/* Marcador de 50% (média do mercado) */}
            <div className="absolute left-1/2 top-0 h-2 w-px bg-slate-300" />
            {/* Barra de preenchimento até o percentil */}
            <div
              className={cn('absolute left-0 top-0 h-2 rounded-full transition-all duration-500', colors.barColor)}
              style={{ width: `${percentile}%` }}
            />
            {/* Indicador pontual no percentil */}
            <div
              className={cn(
                'absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm',
                colors.barColor,
              )}
              style={{ left: `${percentile}%` }}
            />
          </div>
        </div>

        {/* Texto de insight */}
        <p className="text-xs leading-relaxed text-slate-500">
          {insight}
        </p>
      </CardContent>
    </Card>
  )
}
