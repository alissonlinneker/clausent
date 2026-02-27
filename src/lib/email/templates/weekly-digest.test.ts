/**
 * Testes do template de email de resumo semanal (weekly digest).
 *
 * Verifica:
 * - Subject com o período correto
 * - Exibição das estatísticas (contratos, alertas, economia)
 * - Formatação de moeda USD
 * - Itens de ação com cores de prioridade corretas
 * - Limite máximo de 3 itens de ação
 * - Mensagem "all caught up" quando não há itens de ação
 */

import { describe, it, expect } from 'vitest'
import { weeklyDigestEmail } from './weekly-digest'

describe('weeklyDigestEmail — template de resumo semanal', () => {
  /** Parâmetros padrão usados na maioria dos testes */
  const parametrosPadrao = {
    name: 'Roberto',
    contractsAnalyzed: 12,
    alertsTriggered: 3,
    savingsFound: 4500,
    actionItems: [
      { title: 'Review NDA', description: 'Renewal in 5 days', priority: 'high' as const },
      { title: 'Sign vendor contract', description: 'Pending signature', priority: 'medium' as const },
      { title: 'Update template', description: 'New compliance requirements', priority: 'low' as const },
    ],
    periodLabel: 'Feb 19 — Feb 25, 2026',
  }

  describe('geração do subject', () => {
    it('deve incluir o período no subject', () => {
      const resultado = weeklyDigestEmail(parametrosPadrao)

      expect(resultado.subject).toContain('Feb 19 — Feb 25, 2026')
    })

    it('deve incluir "weekly digest" no subject', () => {
      const resultado = weeklyDigestEmail(parametrosPadrao)

      expect(resultado.subject.toLowerCase()).toContain('weekly digest')
    })
  })

  describe('estatísticas', () => {
    it('deve exibir a contagem de contratos analisados', () => {
      const resultado = weeklyDigestEmail(parametrosPadrao)

      expect(resultado.html).toContain('12')
      expect(resultado.html).toContain('Analyzed')
    })

    it('deve exibir a contagem de alertas disparados', () => {
      const resultado = weeklyDigestEmail(parametrosPadrao)

      expect(resultado.html).toContain('3')
      expect(resultado.html).toContain('Alerts')
    })

    it('deve exibir a economia encontrada em USD', () => {
      const resultado = weeklyDigestEmail(parametrosPadrao)

      /** $4,500 formatado pela Intl.NumberFormat */
      expect(resultado.html).toContain('$4,500')
      expect(resultado.html).toContain('Savings')
    })

    it('deve formatar economia de 0 como "$0"', () => {
      const resultado = weeklyDigestEmail({
        ...parametrosPadrao,
        savingsFound: 0,
      })

      expect(resultado.html).toContain('$0')
    })

    it('deve formatar economia grande corretamente', () => {
      const resultado = weeklyDigestEmail({
        ...parametrosPadrao,
        savingsFound: 1250000,
      })

      expect(resultado.html).toContain('$1,250,000')
    })

    it('deve exibir 0 contratos analisados quando não há atividade', () => {
      const resultado = weeklyDigestEmail({
        ...parametrosPadrao,
        contractsAnalyzed: 0,
        alertsTriggered: 0,
        savingsFound: 0,
      })

      expect(resultado.html).toContain('>0<')
    })
  })

  describe('itens de ação', () => {
    it('deve exibir o título de cada item de ação', () => {
      const resultado = weeklyDigestEmail(parametrosPadrao)

      expect(resultado.html).toContain('Review NDA')
      expect(resultado.html).toContain('Sign vendor contract')
      expect(resultado.html).toContain('Update template')
    })

    it('deve exibir a descrição de cada item de ação', () => {
      const resultado = weeklyDigestEmail(parametrosPadrao)

      expect(resultado.html).toContain('Renewal in 5 days')
      expect(resultado.html).toContain('Pending signature')
      expect(resultado.html).toContain('New compliance requirements')
    })

    it('deve exibir o cabeçalho "Action Items"', () => {
      const resultado = weeklyDigestEmail(parametrosPadrao)

      expect(resultado.html).toContain('Action Items')
    })

    it('deve limitar a 3 itens de ação mesmo com mais fornecidos', () => {
      const resultado = weeklyDigestEmail({
        ...parametrosPadrao,
        actionItems: [
          { title: 'Item 1', description: 'Desc 1', priority: 'high' as const },
          { title: 'Item 2', description: 'Desc 2', priority: 'medium' as const },
          { title: 'Item 3', description: 'Desc 3', priority: 'low' as const },
          { title: 'Item 4', description: 'Desc 4 - NÃO DEVE APARECER', priority: 'low' as const },
          { title: 'Item 5', description: 'Desc 5 - NÃO DEVE APARECER', priority: 'high' as const },
        ],
      })

      expect(resultado.html).toContain('Item 1')
      expect(resultado.html).toContain('Item 2')
      expect(resultado.html).toContain('Item 3')
      expect(resultado.html).not.toContain('Item 4')
      expect(resultado.html).not.toContain('Item 5')
    })
  })

  describe('cores de prioridade', () => {
    it('deve usar vermelho (#dc2626) para prioridade alta', () => {
      const resultado = weeklyDigestEmail({
        ...parametrosPadrao,
        actionItems: [
          { title: 'Urgente', description: 'Ação urgente', priority: 'high' },
        ],
      })

      expect(resultado.html).toContain('#dc2626')
    })

    it('deve usar amarelo (#d97706) para prioridade média', () => {
      const resultado = weeklyDigestEmail({
        ...parametrosPadrao,
        actionItems: [
          { title: 'Importante', description: 'Ação importante', priority: 'medium' },
        ],
      })

      expect(resultado.html).toContain('#d97706')
    })

    it('deve usar teal (#0D9488) para prioridade baixa', () => {
      const resultado = weeklyDigestEmail({
        ...parametrosPadrao,
        actionItems: [
          { title: 'Rotina', description: 'Ação de rotina', priority: 'low' },
        ],
      })

      expect(resultado.html).toContain('#0D9488')
    })
  })

  describe('estado sem itens de ação', () => {
    it('deve exibir mensagem "all caught up" quando não há itens de ação', () => {
      const resultado = weeklyDigestEmail({
        ...parametrosPadrao,
        actionItems: [],
      })

      expect(resultado.html).toContain("You're all caught up")
    })

    it('deve NÃO exibir cabeçalho "Action Items" quando lista está vazia', () => {
      const resultado = weeklyDigestEmail({
        ...parametrosPadrao,
        actionItems: [],
      })

      expect(resultado.html).not.toContain('Action Items')
    })
  })

  describe('conteúdo geral', () => {
    it('deve incluir o nome do usuário', () => {
      const resultado = weeklyDigestEmail(parametrosPadrao)

      expect(resultado.html).toContain('Roberto')
    })

    it('deve incluir o período no corpo do email', () => {
      const resultado = weeklyDigestEmail(parametrosPadrao)

      expect(resultado.html).toContain('Feb 19 — Feb 25, 2026')
    })

    it('deve incluir o botão "Go to Dashboard"', () => {
      const resultado = weeklyDigestEmail(parametrosPadrao)

      expect(resultado.html).toContain('Go to Dashboard')
    })

    it('deve incluir link de unsubscribe', () => {
      const resultado = weeklyDigestEmail(parametrosPadrao)

      expect(resultado.html).toContain('Unsubscribe from digest')
    })
  })

  describe('estrutura HTML', () => {
    it('deve começar com DOCTYPE html', () => {
      const resultado = weeklyDigestEmail(parametrosPadrao)

      expect(resultado.html).toMatch(/^<!DOCTYPE html>/)
    })

    it('deve conter meta charset utf-8', () => {
      const resultado = weeklyDigestEmail(parametrosPadrao)

      expect(resultado.html).toContain('charset="utf-8"')
    })
  })
})
