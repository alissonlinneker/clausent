import { describe, it, expect } from 'vitest'
import { calculatePercentile, generateBenchmarkInsight } from '../benchmark-engine'

describe('Benchmark Engine', () => {
  it('deve calcular percentil corretamente', () => {
    const values = [10, 20, 30, 40, 50]
    expect(calculatePercentile(30, values)).toBe(50)
    expect(calculatePercentile(10, values)).toBe(10)
    expect(calculatePercentile(50, values)).toBe(90)
  })

  it('deve gerar insight quando valor está acima da média', () => {
    const insight = generateBenchmarkInsight({
      metric: 'monthly_cost',
      yourValue: 150,
      marketAvg: 100,
      percentile: 80,
    })
    expect(insight).toContain('above')
  })

  it('deve gerar insight quando valor está abaixo da média', () => {
    const insight = generateBenchmarkInsight({
      metric: 'monthly_cost',
      yourValue: 50,
      marketAvg: 100,
      percentile: 20,
    })
    expect(insight).toContain('below')
  })
})
