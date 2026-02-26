import { describe, it, expect } from 'vitest'
import { createContractSchema, updateContractSchema } from '../contract'

describe('Contract Validators', () => {
  it('deve validar criação de contrato com campos obrigatórios', () => {
    const result = createContractSchema.safeParse({
      title: 'Contrato de SaaS',
      category: 'saas',
    })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar contrato sem título', () => {
    const result = createContractSchema.safeParse({
      category: 'saas',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar categoria inválida', () => {
    const result = createContractSchema.safeParse({
      title: 'Contrato',
      category: 'invalid',
    })
    expect(result.success).toBe(false)
  })

  it('deve aceitar campos opcionais na atualização', () => {
    const result = updateContractSchema.safeParse({
      title: 'Título atualizado',
      counterparty: 'Empresa X',
      monthlyValue: '99.99',
    })
    expect(result.success).toBe(true)
  })

  it('deve aceitar schema de atualização completamente vazio', () => {
    const result = updateContractSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('deve rejeitar título vazio na criação', () => {
    const result = createContractSchema.safeParse({
      title: '',
      category: 'saas',
    })
    expect(result.success).toBe(false)
  })

  it('deve aceitar todas as categorias válidas', () => {
    const categorias = ['saas', 'vendor', 'lease', 'insurance', 'other'] as const

    for (const category of categorias) {
      const result = createContractSchema.safeParse({
        title: 'Contrato teste',
        category,
      })
      expect(result.success).toBe(true)
    }
  })

  it('deve definir USD como moeda padrão', () => {
    const result = createContractSchema.safeParse({
      title: 'Contrato sem moeda',
      category: 'saas',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.currency).toBe('USD')
    }
  })

  it('deve rejeitar moeda com comprimento diferente de 3', () => {
    const result = createContractSchema.safeParse({
      title: 'Contrato',
      category: 'saas',
      currency: 'US',
    })
    expect(result.success).toBe(false)
  })

  it('deve aceitar campos opcionais completos na criação', () => {
    const result = createContractSchema.safeParse({
      title: 'Contrato completo',
      category: 'vendor',
      counterparty: 'Empresa XPTO',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2027-01-01T00:00:00.000Z',
      noticePeriodDays: 30,
      autoRenew: true,
      renewalTerms: 'Renovação automática anual',
      totalValue: '12000.00',
      monthlyValue: '1000.00',
      currency: 'BRL',
    })
    expect(result.success).toBe(true)
  })
})
