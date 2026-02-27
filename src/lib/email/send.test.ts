/**
 * Testes das funções de envio de email de alto nível.
 *
 * Cada função deste módulo combina um template de email com
 * a função sendEmail() genérica. Os testes verificam:
 * - Chamada correta do template com os parâmetros fornecidos
 * - Repasse correto do subject e html para sendEmail()
 * - Retorno do resultado de envio (sucesso/erro)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

/** Mock do módulo de envio genérico */
const mockSendEmail = vi.fn()
vi.mock('./index', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}))

/** Mocks dos templates */
const mockVerificationEmail = vi.fn()
const mockWelcomeEmail = vi.fn()
const mockPasswordResetEmail = vi.fn()
const mockAnalysisCompleteEmail = vi.fn()
const mockRenewalAlertEmail = vi.fn()

vi.mock('./templates', () => ({
  verificationEmail: (...args: unknown[]) => mockVerificationEmail(...args),
  welcomeEmail: (...args: unknown[]) => mockWelcomeEmail(...args),
  passwordResetEmail: (...args: unknown[]) => mockPasswordResetEmail(...args),
  analysisCompleteEmail: (...args: unknown[]) => mockAnalysisCompleteEmail(...args),
  renewalAlertEmail: (...args: unknown[]) => mockRenewalAlertEmail(...args),
}))

/** Importar as funções após configurar os mocks */
import {
  sendVerificationCode,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAnalysisCompleteEmail,
  sendRenewalAlertEmail,
} from './send'

describe('Módulo de envio de emails (send.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    /** Configurar retorno padrão dos mocks de template */
    mockVerificationEmail.mockReturnValue({
      subject: 'Verify your Clausent account',
      html: '<html>verification</html>',
    })
    mockWelcomeEmail.mockReturnValue({
      subject: 'Welcome to Clausent',
      html: '<html>welcome</html>',
    })
    mockPasswordResetEmail.mockReturnValue({
      subject: 'Reset your Clausent password',
      html: '<html>reset</html>',
    })
    mockAnalysisCompleteEmail.mockReturnValue({
      subject: 'Your contract analysis is ready',
      html: '<html>analysis</html>',
    })
    mockRenewalAlertEmail.mockReturnValue({
      subject: 'Contract renewal in 15 days',
      html: '<html>renewal</html>',
    })

    /** Retorno padrão do envio */
    mockSendEmail.mockResolvedValue({ success: true })
  })

  describe('sendVerificationCode()', () => {
    it('deve chamar verificationEmail com name e code corretos', async () => {
      await sendVerificationCode('joao@email.com', 'João', '123456')

      expect(mockVerificationEmail).toHaveBeenCalledWith({
        name: 'João',
        code: '123456',
      })
    })

    it('deve chamar sendEmail com to, subject e html do template', async () => {
      await sendVerificationCode('joao@email.com', 'João', '123456')

      expect(mockSendEmail).toHaveBeenCalledWith({
        to: 'joao@email.com',
        subject: 'Verify your Clausent account',
        html: '<html>verification</html>',
      })
    })

    it('deve retornar o resultado do envio com sucesso', async () => {
      mockSendEmail.mockResolvedValue({ success: true })

      const resultado = await sendVerificationCode('joao@email.com', 'João', '123456')
      expect(resultado).toEqual({ success: true })
    })

    it('deve propagar erro do envio', async () => {
      mockSendEmail.mockResolvedValue({ success: false, error: 'Falha na API' })

      const resultado = await sendVerificationCode('joao@email.com', 'João', '123456')
      expect(resultado).toEqual({ success: false, error: 'Falha na API' })
    })
  })

  describe('sendWelcomeEmail()', () => {
    it('deve chamar welcomeEmail com o nome do usuário', async () => {
      await sendWelcomeEmail('maria@email.com', 'Maria')

      expect(mockWelcomeEmail).toHaveBeenCalledWith({ name: 'Maria' })
    })

    it('deve enviar para o email correto com subject do template', async () => {
      await sendWelcomeEmail('maria@email.com', 'Maria')

      expect(mockSendEmail).toHaveBeenCalledWith({
        to: 'maria@email.com',
        subject: 'Welcome to Clausent',
        html: '<html>welcome</html>',
      })
    })

    it('deve funcionar com nomes contendo caracteres especiais', async () => {
      await sendWelcomeEmail('jose@email.com', 'José da Silva')

      expect(mockWelcomeEmail).toHaveBeenCalledWith({ name: 'José da Silva' })
    })
  })

  describe('sendPasswordResetEmail()', () => {
    it('deve chamar passwordResetEmail com name e resetUrl', async () => {
      const resetUrl = 'https://app.clausent.com/reset?token=abc123'

      await sendPasswordResetEmail('user@email.com', 'User', resetUrl)

      expect(mockPasswordResetEmail).toHaveBeenCalledWith({
        name: 'User',
        resetUrl,
      })
    })

    it('deve enviar para o email correto', async () => {
      await sendPasswordResetEmail('user@email.com', 'User', 'https://reset.url')

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'user@email.com' })
      )
    })
  })

  describe('sendAnalysisCompleteEmail()', () => {
    it('deve chamar analysisCompleteEmail com todos os parâmetros', async () => {
      await sendAnalysisCompleteEmail('user@email.com', 'Ana', 'NDA Contract', 75)

      expect(mockAnalysisCompleteEmail).toHaveBeenCalledWith({
        name: 'Ana',
        contractTitle: 'NDA Contract',
        riskScore: 75,
      })
    })

    it('deve funcionar com score de risco zero', async () => {
      await sendAnalysisCompleteEmail('user@email.com', 'Ana', 'Safe Contract', 0)

      expect(mockAnalysisCompleteEmail).toHaveBeenCalledWith({
        name: 'Ana',
        contractTitle: 'Safe Contract',
        riskScore: 0,
      })
    })

    it('deve funcionar com score de risco máximo', async () => {
      await sendAnalysisCompleteEmail('user@email.com', 'Ana', 'Risky Contract', 100)

      expect(mockAnalysisCompleteEmail).toHaveBeenCalledWith({
        name: 'Ana',
        contractTitle: 'Risky Contract',
        riskScore: 100,
      })
    })
  })

  describe('sendRenewalAlertEmail()', () => {
    it('deve chamar renewalAlertEmail com todos os parâmetros', async () => {
      await sendRenewalAlertEmail(
        'user@email.com',
        'Pedro',
        'SaaS Agreement',
        15,
        'Mar 15, 2026'
      )

      expect(mockRenewalAlertEmail).toHaveBeenCalledWith({
        name: 'Pedro',
        contractTitle: 'SaaS Agreement',
        daysUntilRenewal: 15,
        renewalDate: 'Mar 15, 2026',
      })
    })

    it('deve enviar para o email correto com subject do template', async () => {
      await sendRenewalAlertEmail(
        'pedro@email.com',
        'Pedro',
        'SaaS Agreement',
        15,
        'Mar 15, 2026'
      )

      expect(mockSendEmail).toHaveBeenCalledWith({
        to: 'pedro@email.com',
        subject: 'Contract renewal in 15 days',
        html: '<html>renewal</html>',
      })
    })

    it('deve funcionar com 1 dia restante', async () => {
      await sendRenewalAlertEmail(
        'user@email.com',
        'Pedro',
        'Contract',
        1,
        'Feb 27, 2026'
      )

      expect(mockRenewalAlertEmail).toHaveBeenCalledWith(
        expect.objectContaining({ daysUntilRenewal: 1 })
      )
    })
  })

  describe('tratamento de erros', () => {
    it('deve propagar exceção se sendEmail rejeitar a promise', async () => {
      mockSendEmail.mockRejectedValue(new Error('Network error'))

      await expect(
        sendVerificationCode('user@email.com', 'User', '123456')
      ).rejects.toThrow('Network error')
    })
  })
})
