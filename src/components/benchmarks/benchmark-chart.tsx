'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

/**
 * Tipo de dado para cada barra do gráfico.
 * Representa uma métrica com o valor do usuário e a média do mercado.
 */
interface BenchmarkChartDataItem {
  /** Nome da métrica formatado para exibição */
  name: string
  /** Valor do contrato do usuário */
  yourValue: number
  /** Média de mercado para a métrica */
  marketAvg: number
  /** Se a métrica é monetária (para formatação de labels) */
  isCurrency?: boolean
}

interface BenchmarkChartProps {
  /** Dados do gráfico — cada item é uma barra lado a lado */
  data: BenchmarkChartDataItem[]
}

/**
 * Formata o label da métrica para exibição legível.
 * Converte underscores em espaços e capitaliza cada palavra.
 *
 * @param metric - Nome bruto da métrica (ex: "monthly_cost")
 * @returns String formatada (ex: "Monthly Cost")
 */
function formatMetricLabel(metric: string): string {
  return metric
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Tooltip customizado para o gráfico de barras.
 * Exibe os valores comparativos com formatação adequada.
 */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
      {/* Nome da métrica */}
      <p className="mb-2 text-sm font-semibold text-slate-900">{label}</p>
      {/* Valores */}
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <div
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-500">{entry.name}:</span>
          <span className="font-medium text-slate-900">
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString('en-US')
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * Gráfico de barras comparativo de benchmarks.
 *
 * Exibe barras lado a lado comparando "Your Value" (indigo) com
 * "Market Avg" (slate) para cada métrica contratual.
 *
 * Características:
 * - Responsivo — se adapta ao container pai
 * - Tooltip customizado com valores formatados
 * - Grid sutil para legibilidade
 * - Labels no eixo X com nomes das métricas
 * - Cores consistentes com o design system (indigo + slate)
 */
export function BenchmarkChart({ data }: BenchmarkChartProps) {
  /** Se não há dados, não renderiza o gráfico */
  if (!data || data.length === 0) return null

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          Market Comparison
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Side-by-side comparison of your contract metrics with market averages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Container responsivo do Recharts */}
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          >
            {/* Grid de fundo */}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E2E8F0"
              vertical={false}
            />

            {/* Eixo X — nomes das métricas */}
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#64748B' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />

            {/* Eixo Y — valores */}
            <YAxis
              tick={{ fontSize: 12, fill: '#64748B' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => value.toLocaleString('en-US')}
            />

            {/* Tooltip customizado */}
            <Tooltip content={<CustomTooltip />} />

            {/* Legenda */}
            <Legend
              wrapperStyle={{ fontSize: '12px', color: '#64748B' }}
            />

            {/* Barra do valor do usuário — indigo */}
            <Bar
              dataKey="yourValue"
              name="Your Value"
              fill="#6366F1"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />

            {/* Barra da média do mercado — slate */}
            <Bar
              dataKey="marketAvg"
              name="Market Avg"
              fill="#94A3B8"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
