import { describe, it, expect } from 'vitest'
import * as schema from '../schema'

describe('Database Schema', () => {
  it('deve exportar todas as tabelas necessárias', () => {
    expect(schema.user).toBeDefined()
    expect(schema.session).toBeDefined()
    expect(schema.account).toBeDefined()
    expect(schema.verification).toBeDefined()
    expect(schema.subscriptions).toBeDefined()
    expect(schema.contracts).toBeDefined()
    expect(schema.contractClauses).toBeDefined()
    expect(schema.contractAlerts).toBeDefined()
    expect(schema.contractBenchmarks).toBeDefined()
    expect(schema.renegotiationPackages).toBeDefined()
    expect(schema.auditLog).toBeDefined()
    expect(schema.organizations).toBeDefined()
  })

  it('deve ter enums de categoria de contrato', () => {
    expect(schema.contractCategoryEnum.enumValues).toContain('saas')
    expect(schema.contractCategoryEnum.enumValues).toContain('vendor')
    expect(schema.contractCategoryEnum.enumValues).toContain('lease')
  })

  it('deve ter enums de status de contrato', () => {
    expect(schema.contractStatusEnum.enumValues).toContain('active')
    expect(schema.contractStatusEnum.enumValues).toContain('expired')
  })

  it('deve ter enums de plano de assinatura', () => {
    expect(schema.subscriptionPlanEnum.enumValues).toEqual([
      'free', 'starter', 'professional', 'business', 'enterprise'
    ])
  })

  it('deve ter enums de status de assinatura', () => {
    expect(schema.subscriptionStatusEnum.enumValues).toEqual([
      'active', 'canceled', 'past_due', 'trialing', 'paused'
    ])
  })
})
