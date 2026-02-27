/**
 * Testes do template de email de análise concluída.
 *
 * Verifica:
 * - Subject dinâmico com nome do contrato
 * - Cores de risco corretas para cada faixa (baixo/médio/alto)
 * - Inclusão do nome do contrato e do usuário
 * - Pluralização correta de "findings"
 * - Link direto quando contractId é fornecido
 * - Link genérico quando contractId não é fornecido
 */

import { describe, it, expect } from 'vitest'
import { analysisCompleteEmail } from './analysis-complete'

describe('analysisCompleteEmail — template de análise concluída', () => {
  /** Parâmetros padrão usados na maioria dos testes */
  const parametrosPadrao = {
    name: 'Ana Costa',
    contractName: 'NDA Agreement',
    riskScore: 45,
    findingsCount: 3,
  }

  describe('geração do subject', () => {
    it('deve incluir o nome do contrato no subject', () => {
      const resultado = analysisCompleteEmail(parametrosPadrao)

      expect(resultado.subject).toBe('Analysis complete: NDA Agreement')
    })

    it('deve funcionar com nomes de contrato longos', () => {
      const resultado = analysisCompleteEmail({
        ...parametrosPadrao,
        contractName: 'Master Service Agreement - Global Operations Division 2026',
      })

      expect(resultado.subject).toContain('Master Service Agreement')
    })
  })

  describe('conteúdo HTML', () => {
    it('deve incluir o nome do usuário', () => {
      const resultado = analysisCompleteEmail(parametrosPadrao)

      expect(resultado.html).toContain('Ana Costa')
    })

    it('deve incluir o nome do contrato no corpo', () => {
      const resultado = analysisCompleteEmail(parametrosPadrao)

      expect(resultado.html).toContain('NDA Agreement')
    })

    it('deve exibir o score de risco numérico', () => {
      const resultado = analysisCompleteEmail(parametrosPadrao)

      expect(resultado.html).toContain('45')
      expect(resultado.html).toContain('/100')
    })

    it('deve incluir o botão "View Full Analysis"', () => {
      const resultado = analysisCompleteEmail(parametrosPadrao)

      expect(resultado.html).toContain('View Full Analysis')
    })
  })

  describe('faixas de risco — cores e labels', () => {
    it('deve exibir "Low Risk" para score menor que 40', () => {
      const resultado = analysisCompleteEmail({
        ...parametrosPadrao,
        riskScore: 20,
      })

      expect(resultado.html).toContain('Low Risk')
      /** Cor verde (#16a34a) */
      expect(resultado.html).toContain('#16a34a')
    })

    it('deve exibir "Medium Risk" para score entre 40 e 70', () => {
      const resultado = analysisCompleteEmail({
        ...parametrosPadrao,
        riskScore: 55,
      })

      expect(resultado.html).toContain('Medium Risk')
      /** Cor amarela (#d97706) */
      expect(resultado.html).toContain('#d97706')
    })

    it('deve exibir "High Risk" para score maior que 70', () => {
      const resultado = analysisCompleteEmail({
        ...parametrosPadrao,
        riskScore: 85,
      })

      expect(resultado.html).toContain('High Risk')
      /** Cor vermelha (#dc2626) */
      expect(resultado.html).toContain('#dc2626')
    })

    it('deve tratar score exatamente 40 como "Medium Risk"', () => {
      const resultado = analysisCompleteEmail({
        ...parametrosPadrao,
        riskScore: 40,
      })

      expect(resultado.html).toContain('Medium Risk')
    })

    it('deve tratar score exatamente 70 como "Medium Risk"', () => {
      const resultado = analysisCompleteEmail({
        ...parametrosPadrao,
        riskScore: 70,
      })

      expect(resultado.html).toContain('Medium Risk')
    })

    it('deve tratar score 0 como "Low Risk"', () => {
      const resultado = analysisCompleteEmail({
        ...parametrosPadrao,
        riskScore: 0,
      })

      expect(resultado.html).toContain('Low Risk')
    })

    it('deve tratar score 100 como "High Risk"', () => {
      const resultado = analysisCompleteEmail({
        ...parametrosPadrao,
        riskScore: 100,
      })

      expect(resultado.html).toContain('High Risk')
    })
  })

  describe('contagem de findings — pluralização', () => {
    it('deve usar singular "finding" para 1 achado', () => {
      const resultado = analysisCompleteEmail({
        ...parametrosPadrao,
        findingsCount: 1,
      })

      expect(resultado.html).toContain('1 finding identified')
    })

    it('deve usar plural "findings" para mais de 1 achado', () => {
      const resultado = analysisCompleteEmail({
        ...parametrosPadrao,
        findingsCount: 5,
      })

      expect(resultado.html).toContain('5 findings identified')
    })

    it('deve usar plural "findings" para 0 achados', () => {
      const resultado = analysisCompleteEmail({
        ...parametrosPadrao,
        findingsCount: 0,
      })

      expect(resultado.html).toContain('0 findings identified')
    })
  })

  describe('link do botão CTA', () => {
    it('deve usar link direto quando contractId é fornecido', () => {
      const resultado = analysisCompleteEmail({
        ...parametrosPadrao,
        contractId: 'contract-abc-123',
      })

      expect(resultado.html).toContain('/dashboard/contracts/contract-abc-123')
    })

    it('deve usar link genérico quando contractId não é fornecido', () => {
      const resultado = analysisCompleteEmail(parametrosPadrao)

      expect(resultado.html).toContain('/dashboard/contracts')
      /** Garantir que não tem um ID aleatório no link */
      expect(resultado.html).not.toContain('/dashboard/contracts/')
    })
  })

  describe('estrutura HTML', () => {
    it('deve começar com DOCTYPE html', () => {
      const resultado = analysisCompleteEmail(parametrosPadrao)

      expect(resultado.html).toMatch(/^<!DOCTYPE html>/)
    })

    it('deve conter o badge "Analysis Complete"', () => {
      const resultado = analysisCompleteEmail(parametrosPadrao)

      expect(resultado.html).toContain('Analysis Complete')
    })

    it('deve conter o link de gerenciamento de notificações', () => {
      const resultado = analysisCompleteEmail(parametrosPadrao)

      expect(resultado.html).toContain('Manage notifications')
    })
  })
})
