/**
 * Testes do template de email de notificação de alerta de contrato.
 *
 * Verifica:
 * - Geração do HTML completo com dados corretos
 * - Labels e cores para cada tipo de alerta (renewal, expiration, notice, desconhecido)
 * - Cálculo de dias restantes (futuro, hoje, passado)
 * - Formatação de datas
 * - Link direto para o contrato
 * - Estrutura HTML válida (DOCTYPE, body, table, etc.)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateAlertEmailHtml } from './alert-notification'

describe('generateAlertEmailHtml — template de notificação de alerta', () => {
  /** Parâmetros padrão usados na maioria dos testes */
  const parametrosPadrao = {
    contractTitle: 'NDA Agreement',
    counterparty: 'Acme Corp',
    alertType: 'renewal',
    triggerDate: new Date('2026-04-15T12:00:00Z'),
    contractId: 'ct-abc-123',
  }

  beforeEach(() => {
    /** Fixar a data atual para testes determinísticos */
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-26T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('estrutura HTML', () => {
    it('deve retornar HTML começando com DOCTYPE', () => {
      const html = generateAlertEmailHtml(parametrosPadrao)

      expect(html).toMatch(/^<!DOCTYPE html>/)
    })

    it('deve conter tags html, head e body', () => {
      const html = generateAlertEmailHtml(parametrosPadrao)

      expect(html).toContain('<html')
      expect(html).toContain('<head>')
      expect(html).toContain('<body')
      expect(html).toContain('</html>')
    })

    it('deve conter meta charset utf-8', () => {
      const html = generateAlertEmailHtml(parametrosPadrao)

      expect(html).toContain('charset="utf-8"')
    })

    it('deve conter table com role="presentation"', () => {
      const html = generateAlertEmailHtml(parametrosPadrao)

      expect(html).toContain('role="presentation"')
    })

    it('deve conter o logo Clausent', () => {
      const html = generateAlertEmailHtml(parametrosPadrao)

      expect(html).toContain('Clausent')
    })
  })

  describe('conteúdo principal', () => {
    it('deve incluir o título do contrato', () => {
      const html = generateAlertEmailHtml(parametrosPadrao)

      expect(html).toContain('NDA Agreement')
    })

    it('deve incluir o nome da contraparte', () => {
      const html = generateAlertEmailHtml(parametrosPadrao)

      expect(html).toContain('Acme Corp')
    })

    it('deve incluir o botão "View Contract"', () => {
      const html = generateAlertEmailHtml(parametrosPadrao)

      expect(html).toContain('View Contract')
    })

    it('deve conter o link direto para o contrato usando contractId', () => {
      const html = generateAlertEmailHtml(parametrosPadrao)

      expect(html).toContain('/dashboard/contracts/ct-abc-123')
    })

    it('deve incluir o footer com informações sobre notificações', () => {
      const html = generateAlertEmailHtml(parametrosPadrao)

      expect(html).toContain('Alert notifications are configured')
    })
  })

  describe('tipos de alerta — labels e cores', () => {
    it('deve exibir "Renewal Alert" para tipo renewal', () => {
      const html = generateAlertEmailHtml({
        ...parametrosPadrao,
        alertType: 'renewal',
      })

      expect(html).toContain('Renewal Alert')
      expect(html).toContain('Renewal')
      /** Cor amarela do renewal (#d97706) */
      expect(html).toContain('#d97706')
    })

    it('deve exibir "Expiration Alert" para tipo expiration', () => {
      const html = generateAlertEmailHtml({
        ...parametrosPadrao,
        alertType: 'expiration',
      })

      expect(html).toContain('Expiration Alert')
      /** Cor vermelha (#dc2626) */
      expect(html).toContain('#dc2626')
    })

    it('deve exibir "Notice Period Alert" para tipo notice', () => {
      const html = generateAlertEmailHtml({
        ...parametrosPadrao,
        alertType: 'notice',
      })

      expect(html).toContain('Notice Period Alert')
      /** Cor azul (#2563eb) */
      expect(html).toContain('#2563eb')
    })

    it('deve usar o próprio tipo como label para tipos desconhecidos', () => {
      const html = generateAlertEmailHtml({
        ...parametrosPadrao,
        alertType: 'custom-type',
      })

      expect(html).toContain('custom-type Alert')
    })
  })

  describe('cálculo de dias restantes (getDaysRemaining)', () => {
    it('deve exibir "in X days" para datas futuras', () => {
      const html = generateAlertEmailHtml({
        ...parametrosPadrao,
        /** 48 dias no futuro a partir de 2026-02-26 */
        triggerDate: new Date('2026-04-15T12:00:00Z'),
      })

      expect(html).toContain('in')
      expect(html).toContain('days')
    })

    it('deve exibir "in 1 day" para amanhã', () => {
      const html = generateAlertEmailHtml({
        ...parametrosPadrao,
        triggerDate: new Date('2026-02-27T12:00:00Z'),
      })

      expect(html).toContain('in 1 day')
    })

    it('deve exibir "today" para a data de hoje', () => {
      const html = generateAlertEmailHtml({
        ...parametrosPadrao,
        triggerDate: new Date('2026-02-26T12:00:00Z'),
      })

      expect(html).toContain('today')
    })

    it('deve exibir "X days ago" para datas passadas', () => {
      const html = generateAlertEmailHtml({
        ...parametrosPadrao,
        triggerDate: new Date('2026-02-20T12:00:00Z'),
      })

      expect(html).toContain('days ago')
    })

    it('deve exibir "1 day ago" para ontem', () => {
      const html = generateAlertEmailHtml({
        ...parametrosPadrao,
        triggerDate: new Date('2026-02-25T00:00:00Z'),
      })

      expect(html).toContain('day ago')
    })
  })

  describe('formatação de data (formatEmailDate)', () => {
    it('deve formatar a data no formato "Mon DD, YYYY"', () => {
      const html = generateAlertEmailHtml({
        ...parametrosPadrao,
        triggerDate: new Date('2026-04-15T12:00:00Z'),
      })

      expect(html).toContain('Apr 15, 2026')
    })

    it('deve aceitar string ISO como triggerDate', () => {
      const html = generateAlertEmailHtml({
        ...parametrosPadrao,
        triggerDate: '2026-06-01T00:00:00Z',
      })

      /** Verifica que a data foi formatada com mês abreviado e ano */
      expect(html).toContain('Jun')
      expect(html).toContain('2026')
    })
  })

  describe('URL do contrato', () => {
    it('deve usar NEXT_PUBLIC_APP_URL da variável de ambiente', () => {
      const html = generateAlertEmailHtml(parametrosPadrao)

      /** A variável de ambiente está configurada no setup.ts como https://test.clausent.com */
      expect(html).toContain('test.clausent.com')
    })

    it('deve montar a URL completa com contractId', () => {
      const html = generateAlertEmailHtml({
        ...parametrosPadrao,
        contractId: 'my-contract-456',
      })

      expect(html).toContain('/dashboard/contracts/my-contract-456')
    })
  })

  describe('edge cases', () => {
    it('deve funcionar com título de contrato longo', () => {
      const html = generateAlertEmailHtml({
        ...parametrosPadrao,
        contractTitle: 'Master Service Agreement - Global Operations Division 2026 (Revised)',
      })

      expect(html).toContain('Master Service Agreement - Global Operations Division 2026 (Revised)')
    })

    it('deve funcionar com contraparte contendo caracteres especiais', () => {
      const html = generateAlertEmailHtml({
        ...parametrosPadrao,
        counterparty: 'São Paulo Ltda. & Cia.',
      })

      /** O template usa interpolação simples, então o & é inserido literalmente */
      expect(html).toContain('São Paulo Ltda.')
      expect(html).toContain('Cia.')
    })

    it('deve funcionar com contractId contendo caracteres UUID', () => {
      const html = generateAlertEmailHtml({
        ...parametrosPadrao,
        contractId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      })

      expect(html).toContain('/dashboard/contracts/f47ac10b-58cc-4372-a567-0e02b2c3d479')
    })
  })
})
