/**
 * Testes do template de email de alerta de renovação.
 *
 * Verifica:
 * - Subject dinâmico com dias restantes e nome do contrato
 * - Cores de urgência corretas para cada faixa
 * - Labels de urgência (Urgent, Upcoming, Scheduled)
 * - Aviso de ação requerida para <= 7 dias
 * - Pluralização de "day/days" no subject
 * - Link direto quando contractId é fornecido
 */

import { describe, it, expect } from 'vitest'
import { renewalAlertEmail } from './renewal-alert'

describe('renewalAlertEmail — template de alerta de renovação', () => {
  /** Parâmetros padrão usados na maioria dos testes */
  const parametrosPadrao = {
    name: 'Carlos',
    contractName: 'SaaS Agreement',
    vendor: 'Acme Corp',
    renewalDate: 'Mar 15, 2026',
    daysUntilRenewal: 15,
  }

  describe('geração do subject', () => {
    it('deve incluir dias restantes e nome do contrato', () => {
      const resultado = renewalAlertEmail(parametrosPadrao)

      expect(resultado.subject).toContain('15')
      expect(resultado.subject).toContain('SaaS Agreement')
    })

    it('deve usar singular "day" para 1 dia restante', () => {
      const resultado = renewalAlertEmail({
        ...parametrosPadrao,
        daysUntilRenewal: 1,
      })

      expect(resultado.subject).toContain('1 day')
      expect(resultado.subject).not.toContain('1 days')
    })

    it('deve usar plural "days" para mais de 1 dia', () => {
      const resultado = renewalAlertEmail({
        ...parametrosPadrao,
        daysUntilRenewal: 30,
      })

      expect(resultado.subject).toContain('30 days')
    })
  })

  describe('conteúdo HTML', () => {
    it('deve incluir o nome do usuário', () => {
      const resultado = renewalAlertEmail(parametrosPadrao)

      expect(resultado.html).toContain('Carlos')
    })

    it('deve incluir o nome do contrato', () => {
      const resultado = renewalAlertEmail(parametrosPadrao)

      expect(resultado.html).toContain('SaaS Agreement')
    })

    it('deve incluir o nome do fornecedor', () => {
      const resultado = renewalAlertEmail(parametrosPadrao)

      expect(resultado.html).toContain('Acme Corp')
    })

    it('deve incluir a data de renovação', () => {
      const resultado = renewalAlertEmail(parametrosPadrao)

      expect(resultado.html).toContain('Mar 15, 2026')
    })

    it('deve incluir os dias restantes no corpo', () => {
      const resultado = renewalAlertEmail(parametrosPadrao)

      expect(resultado.html).toContain('15 days')
    })

    it('deve incluir o botão "View Contract"', () => {
      const resultado = renewalAlertEmail(parametrosPadrao)

      expect(resultado.html).toContain('View Contract')
    })
  })

  describe('cores de urgência', () => {
    it('deve usar cor vermelha (#dc2626) para <= 7 dias', () => {
      const resultado = renewalAlertEmail({
        ...parametrosPadrao,
        daysUntilRenewal: 5,
      })

      expect(resultado.html).toContain('#dc2626')
    })

    it('deve usar cor amarela (#d97706) para 8-30 dias', () => {
      const resultado = renewalAlertEmail({
        ...parametrosPadrao,
        daysUntilRenewal: 20,
      })

      expect(resultado.html).toContain('#d97706')
    })

    it('deve usar cor verde/teal (#0D9488) para > 30 dias', () => {
      const resultado = renewalAlertEmail({
        ...parametrosPadrao,
        daysUntilRenewal: 45,
      })

      expect(resultado.html).toContain('#0D9488')
    })

    it('deve tratar exatamente 7 dias como urgente (vermelho)', () => {
      const resultado = renewalAlertEmail({
        ...parametrosPadrao,
        daysUntilRenewal: 7,
      })

      expect(resultado.html).toContain('#dc2626')
      expect(resultado.html).toContain('Urgent')
    })

    it('deve tratar exatamente 30 dias como upcoming (amarelo)', () => {
      const resultado = renewalAlertEmail({
        ...parametrosPadrao,
        daysUntilRenewal: 30,
      })

      expect(resultado.html).toContain('#d97706')
      expect(resultado.html).toContain('Upcoming')
    })

    it('deve tratar 31 dias como scheduled (teal)', () => {
      const resultado = renewalAlertEmail({
        ...parametrosPadrao,
        daysUntilRenewal: 31,
      })

      expect(resultado.html).toContain('Scheduled')
    })
  })

  describe('labels de urgência', () => {
    it('deve exibir "Urgent Renewal" para <= 7 dias', () => {
      const resultado = renewalAlertEmail({
        ...parametrosPadrao,
        daysUntilRenewal: 3,
      })

      expect(resultado.html).toContain('Urgent Renewal')
    })

    it('deve exibir "Upcoming Renewal" para 8-30 dias', () => {
      const resultado = renewalAlertEmail({
        ...parametrosPadrao,
        daysUntilRenewal: 15,
      })

      expect(resultado.html).toContain('Upcoming Renewal')
    })

    it('deve exibir "Scheduled Renewal" para > 30 dias', () => {
      const resultado = renewalAlertEmail({
        ...parametrosPadrao,
        daysUntilRenewal: 60,
      })

      expect(resultado.html).toContain('Scheduled Renewal')
    })
  })

  describe('aviso de ação requerida', () => {
    it('deve incluir aviso de "Action required" para <= 7 dias', () => {
      const resultado = renewalAlertEmail({
        ...parametrosPadrao,
        daysUntilRenewal: 5,
      })

      expect(resultado.html).toContain('Action required')
    })

    it('deve NÃO incluir aviso de "Action required" para > 7 dias', () => {
      const resultado = renewalAlertEmail({
        ...parametrosPadrao,
        daysUntilRenewal: 15,
      })

      expect(resultado.html).not.toContain('Action required')
    })

    it('deve pluralizar corretamente no aviso para 1 dia', () => {
      const resultado = renewalAlertEmail({
        ...parametrosPadrao,
        daysUntilRenewal: 1,
      })

      /** "in 1 day" e não "in 1 days" */
      expect(resultado.html).toContain('in 1 day')
    })
  })

  describe('link do botão CTA', () => {
    it('deve usar link direto quando contractId é fornecido', () => {
      const resultado = renewalAlertEmail({
        ...parametrosPadrao,
        contractId: 'ct-renewal-456',
      })

      expect(resultado.html).toContain('/dashboard/contracts/ct-renewal-456')
    })

    it('deve usar link genérico quando contractId não é fornecido', () => {
      const resultado = renewalAlertEmail(parametrosPadrao)

      expect(resultado.html).toContain('/dashboard/contracts')
    })
  })

  describe('estrutura HTML', () => {
    it('deve começar com DOCTYPE html', () => {
      const resultado = renewalAlertEmail(parametrosPadrao)

      expect(resultado.html).toMatch(/^<!DOCTYPE html>/)
    })

    it('deve conter link de gerenciamento de notificações', () => {
      const resultado = renewalAlertEmail(parametrosPadrao)

      expect(resultado.html).toContain('Manage notifications')
    })
  })
})
