import { describe, it, expect } from 'vitest'
import { CONTRACT_ANALYSIS_PROMPT } from '../prompts'

describe('Contract Analysis Prompt', () => {
  it('deve conter instrução para retornar JSON', () => {
    expect(CONTRACT_ANALYSIS_PROMPT).toContain('JSON')
  })

  it('deve mencionar todos os campos obrigatórios', () => {
    const requiredFields = ['title', 'counterparty', 'category', 'riskScore', 'clauses', 'summary']
    requiredFields.forEach(field => {
      expect(CONTRACT_ANALYSIS_PROMPT).toContain(field)
    })
  })

  it('deve incluir guidelines de risk scoring', () => {
    expect(CONTRACT_ANALYSIS_PROMPT).toContain('Risk scoring')
  })
})
