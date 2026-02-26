import { describe, it, expect } from 'vitest'
import { PLANS } from '../config'

describe('Stripe Config', () => {
  it('deve ter 3 planos configurados', () => {
    expect(Object.keys(PLANS)).toHaveLength(3)
  })

  it('deve ter preços corretos em centavos', () => {
    expect(PLANS.starter.price).toBe(2900)
    expect(PLANS.professional.price).toBe(5900)
    expect(PLANS.business.price).toBe(9900)
  })

  it('deve ter limites de contratos corretos', () => {
    expect(PLANS.starter.contracts).toBe(25)
    expect(PLANS.professional.contracts).toBe(100)
    expect(PLANS.business.contracts).toBe(500)
  })
})
