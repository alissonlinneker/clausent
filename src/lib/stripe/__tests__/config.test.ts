import { describe, it, expect } from 'vitest'
import {
  PLANS,
  PLAN_LIMITS,
  getPlanByPriceId,
  getPlanLimits,
} from '../index'
import { getAvailablePlans, getAllPlans } from '../plans'

describe('Stripe — Planos', () => {
  it('deve ter 5 planos configurados (free, starter, professional, business, enterprise)', () => {
    expect(Object.keys(PLANS)).toHaveLength(5)
    expect(PLANS.free).toBeDefined()
    expect(PLANS.starter).toBeDefined()
    expect(PLANS.professional).toBeDefined()
    expect(PLANS.business).toBeDefined()
    expect(PLANS.enterprise).toBeDefined()
  })

  it('deve ter preços mensais corretos em dólares', () => {
    expect(PLANS.free.monthlyPrice).toBe(0)
    expect(PLANS.starter.monthlyPrice).toBe(29)
    expect(PLANS.professional.monthlyPrice).toBe(59)
    expect(PLANS.business.monthlyPrice).toBe(99)
    expect(PLANS.enterprise.monthlyPrice).toBe(-1)
  })

  it('deve ter preços anuais corretos em dólares', () => {
    expect(PLANS.free.yearlyPrice).toBe(0)
    expect(PLANS.starter.yearlyPrice).toBe(23)
    expect(PLANS.professional.yearlyPrice).toBe(47)
    expect(PLANS.business.yearlyPrice).toBe(79)
    expect(PLANS.enterprise.yearlyPrice).toBe(-1)
  })

  it('deve ter limites de contratos corretos', () => {
    expect(PLANS.free.contractsLimit).toBe(3)
    expect(PLANS.starter.contractsLimit).toBe(25)
    expect(PLANS.professional.contractsLimit).toBe(100)
    expect(PLANS.business.contractsLimit).toBe(500)
    expect(PLANS.enterprise.contractsLimit).toBeNull()
  })
})

describe('Stripe — PLAN_LIMITS', () => {
  it('deve mapear limites de contratos por slug', () => {
    expect(PLAN_LIMITS.free).toBe(3)
    expect(PLAN_LIMITS.starter).toBe(25)
    expect(PLAN_LIMITS.professional).toBe(100)
    expect(PLAN_LIMITS.business).toBe(500)
    expect(PLAN_LIMITS.enterprise).toBeNull()
  })
})

describe('Stripe — getPlanByPriceId', () => {
  it('deve retornar null para priceId vazio', () => {
    expect(getPlanByPriceId('')).toBeNull()
  })

  it('deve retornar null para priceId inexistente', () => {
    expect(getPlanByPriceId('price_inexistente')).toBeNull()
  })
})

describe('Stripe — getPlanLimits', () => {
  it('deve retornar limites corretos para slug válido', () => {
    const limits = getPlanLimits('starter')
    expect(limits).toEqual({
      contractsLimit: 25,
      name: 'Starter',
      slug: 'starter',
    })
  })

  it('deve retornar null para slug inexistente', () => {
    expect(getPlanLimits('plano_fake')).toBeNull()
  })

  it('deve retornar contractsLimit null para enterprise', () => {
    const limits = getPlanLimits('enterprise')
    expect(limits?.contractsLimit).toBeNull()
  })
})

describe('Stripe — getAvailablePlans', () => {
  it('deve retornar 4 planos (exclui enterprise)', () => {
    const plans = getAvailablePlans()
    expect(plans).toHaveLength(4)
    expect(plans.map((p) => p.slug)).not.toContain('enterprise')
  })
})

describe('Stripe — getAllPlans', () => {
  it('deve retornar todos os 5 planos incluindo enterprise', () => {
    const plans = getAllPlans()
    expect(plans).toHaveLength(5)
    expect(plans.map((p) => p.slug)).toContain('enterprise')
  })
})
