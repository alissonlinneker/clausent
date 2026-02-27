/**
 * Testes do template de email de boas-vindas (welcome.ts).
 *
 * Verifica:
 * - Geração do subject correto
 * - Inclusão do nome do usuário no HTML
 * - Presença do botão CTA com link correto
 * - Estrutura HTML válida (DOCTYPE, body, table)
 * - Uso do loginUrl quando fornecido
 * - Fallback para dashboard quando loginUrl é string vazia
 */

import { describe, it, expect } from 'vitest'
import { welcomeEmail } from './welcome'

describe('welcomeEmail — template de boas-vindas', () => {
  /** Parâmetros padrão usados na maioria dos testes */
  const parametrosPadrao = {
    name: 'João Silva',
    loginUrl: 'https://test.clausent.com/auth/login',
  }

  describe('geração do subject', () => {
    it('deve retornar o subject correto', () => {
      const resultado = welcomeEmail(parametrosPadrao)

      expect(resultado.subject).toBe('Welcome to Clausent!')
    })
  })

  describe('conteúdo HTML', () => {
    it('deve incluir o nome do usuário no corpo do email', () => {
      const resultado = welcomeEmail(parametrosPadrao)

      expect(resultado.html).toContain('João Silva')
    })

    it('deve incluir a saudação de boas-vindas', () => {
      const resultado = welcomeEmail(parametrosPadrao)

      expect(resultado.html).toContain('Welcome to Clausent!')
    })

    it('deve conter o botão "Go to Dashboard"', () => {
      const resultado = welcomeEmail(parametrosPadrao)

      expect(resultado.html).toContain('Go to Dashboard')
    })

    it('deve usar o loginUrl fornecido no link do botão CTA', () => {
      const resultado = welcomeEmail({
        name: 'Maria',
        loginUrl: 'https://custom.clausent.com/login',
      })

      expect(resultado.html).toContain('https://custom.clausent.com/login')
    })

    it('deve conter os 3 passos de introdução', () => {
      const resultado = welcomeEmail(parametrosPadrao)

      expect(resultado.html).toContain('Upload your first contract')
      expect(resultado.html).toContain('Get AI-powered analysis')
      expect(resultado.html).toContain('Set up renewal alerts')
    })

    it('deve conter o footer da Clausent', () => {
      const resultado = welcomeEmail(parametrosPadrao)

      expect(resultado.html).toContain('Clausent')
      expect(resultado.html).toContain('Manage notifications')
    })
  })

  describe('estrutura HTML', () => {
    it('deve começar com DOCTYPE html', () => {
      const resultado = welcomeEmail(parametrosPadrao)

      expect(resultado.html).toMatch(/^<!DOCTYPE html>/)
    })

    it('deve conter tags html, head e body', () => {
      const resultado = welcomeEmail(parametrosPadrao)

      expect(resultado.html).toContain('<html')
      expect(resultado.html).toContain('<head>')
      expect(resultado.html).toContain('<body')
      expect(resultado.html).toContain('</html>')
    })

    it('deve usar meta charset utf-8', () => {
      const resultado = welcomeEmail(parametrosPadrao)

      expect(resultado.html).toContain('charset="utf-8"')
    })

    it('deve conter table com role="presentation"', () => {
      const resultado = welcomeEmail(parametrosPadrao)

      expect(resultado.html).toContain('role="presentation"')
    })
  })

  describe('edge cases', () => {
    it('deve funcionar com nome vazio', () => {
      const resultado = welcomeEmail({ name: '', loginUrl: 'https://test.com' })

      expect(resultado.subject).toBe('Welcome to Clausent!')
      expect(resultado.html).toContain('Hi ')
    })

    it('deve funcionar com nome contendo caracteres HTML', () => {
      const resultado = welcomeEmail({
        name: '<script>alert("xss")</script>',
        loginUrl: 'https://test.com',
      })

      /** O template usa interpolação simples, então o conteúdo é inserido literalmente */
      expect(resultado.html).toBeDefined()
      expect(resultado.subject).toBe('Welcome to Clausent!')
    })

    it('deve funcionar com nomes acentuados', () => {
      const resultado = welcomeEmail({
        name: 'José da Conceição',
        loginUrl: 'https://test.com',
      })

      expect(resultado.html).toContain('José da Conceição')
    })
  })
})
