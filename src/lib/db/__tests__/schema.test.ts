import { describe, it, expect } from 'vitest'
import * as schema from '../schema'

describe('Database Schema', () => {
  it('deve exportar todas as tabelas necessárias', () => {
    expect(schema.organizations).toBeDefined()
    expect(schema.users).toBeDefined()
    expect(schema.contracts).toBeDefined()
    expect(schema.contractClauses).toBeDefined()
    expect(schema.contractAlerts).toBeDefined()
    expect(schema.contractBenchmarks).toBeDefined()
    expect(schema.renegotiationPackages).toBeDefined()
    expect(schema.auditLog).toBeDefined()
  })

  it('deve ter enums de categoria de contrato', () => {
    expect(schema.contractCategoryEnum.enumValues).toEqual([
      'saas', 'vendor', 'lease', 'insurance', 'other'
    ])
  })

  it('deve ter enums de status de contrato', () => {
    expect(schema.contractStatusEnum.enumValues).toEqual([
      'active', 'expiring', 'expired', 'renewed', 'cancelled'
    ])
  })

  it('deve ter enums de role do usuário', () => {
    expect(schema.userRoleEnum.enumValues).toEqual([
      'admin', 'member', 'viewer'
    ])
  })

  it('deve ter enums de plano da organização', () => {
    expect(schema.orgPlanEnum.enumValues).toEqual([
      'starter', 'professional', 'business', 'enterprise'
    ])
  })
})
