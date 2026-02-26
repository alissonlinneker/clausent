/**
 * Motor de benchmarks de mercado — compara métricas contratuais
 * com dados agregados do mercado para gerar insights comparativos.
 *
 * Funções principais:
 * - calculatePercentile: posiciona um valor dentro de uma distribuição
 * - generateBenchmarkInsight: gera texto descritivo com base no percentil
 */

/** Dados de entrada para geração de insight */
export interface BenchmarkInsightInput {
  /** Nome da métrica (ex: monthly_cost, contract_duration) */
  metric: string
  /** Valor do contrato do usuário */
  yourValue: number
  /** Média de mercado para essa métrica */
  marketAvg: number
  /** Percentil calculado (0-100) */
  percentile: number
}

/**
 * Calcula em qual percentil um valor se encontra dentro de uma distribuição.
 *
 * Usa a fórmula de percentil com interpolação para valores iguais:
 * ((countBelow + 0.5 * countEqual) / total) * 100
 * Resultado arredondado para o múltiplo de 10 mais próximo.
 *
 * @param value - Valor a ser posicionado
 * @param allValues - Array com todos os valores da distribuição
 * @returns Percentil arredondado para step de 10 (0, 10, 20, ..., 100)
 */
export function calculatePercentile(value: number, allValues: number[]): number {
  /** Conta quantos valores estão estritamente abaixo do valor informado */
  const countBelow = allValues.filter((v) => v < value).length

  /** Conta quantos valores são iguais ao valor (inclui o próprio) */
  const countEqual = allValues.filter((v) => v === value).length

  const total = allValues.length

  /**
   * Calcula o percentil bruto usando interpolação:
   * metade dos valores iguais contribui para o percentil
   */
  const rawPercentile = ((countBelow + 0.5 * countEqual) / total) * 100

  /** Arredonda para o múltiplo de 10 mais próximo */
  return Math.round(rawPercentile / 10) * 10
}

/**
 * Gera um texto descritivo (insight) comparando o valor do contrato
 * com a média de mercado, baseado no percentil calculado.
 *
 * Retorna frases em inglês para exibição na interface.
 *
 * @param data - Dados do benchmark incluindo métrica, valores e percentil
 * @returns String descritiva com a posição relativa ao mercado
 */
export function generateBenchmarkInsight(data: BenchmarkInsightInput): string {
  /** Formata o nome da métrica para exibição (underscores → espaços) */
  const metricLabel = data.metric.replace(/_/g, ' ')

  /** Calcula a diferença percentual em relação à média */
  const diffPercent = Math.abs(
    Math.round(((data.yourValue - data.marketAvg) / data.marketAvg) * 100)
  )

  if (data.percentile > 50) {
    /** Valor acima da média — pode ser bom ou ruim dependendo da métrica */
    return `Your ${metricLabel} is ${diffPercent}% above market average (percentile ${data.percentile}). You are in the top ${100 - data.percentile}% of the market.`
  }

  if (data.percentile < 50) {
    /** Valor abaixo da média — pode ser bom ou ruim dependendo da métrica */
    return `Your ${metricLabel} is ${diffPercent}% below market average (percentile ${data.percentile}). You are in the bottom ${data.percentile}% of the market.`
  }

  /** Exatamente na média */
  return `Your ${metricLabel} is right at the market average (percentile ${data.percentile}).`
}
