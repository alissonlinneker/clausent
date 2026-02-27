/**
 * Testes da função genérica de envio de email (sendEmail).
 *
 * Verifica:
 * - Envio bem-sucedido com parâmetros corretos
 * - Tratamento de erros retornados pela API do Resend
 * - Tratamento de exceções inesperadas
 * - Uso do remetente padrão (EMAIL_FROM)
 * - Campo text opcional
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

/** Mock do Resend — sobrescreve o mock global do setup para testes específicos */
const mockSend = vi.fn()

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: (...args: unknown[]) => mockSend(...args),
    },
  })),
}))

import { sendEmail } from './index'

describe('sendEmail() — módulo central de envio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    /** Configurar retorno padrão como sucesso */
    mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })
  })

  describe('envio bem-sucedido', () => {
    it('deve retornar { success: true } quando o Resend envia com sucesso', async () => {
      const resultado = await sendEmail({
        to: 'destinatario@email.com',
        subject: 'Assunto do teste',
        html: '<p>Corpo do email</p>',
      })

      expect(resultado).toEqual({ success: true })
    })

    it('deve passar os parâmetros corretos para o Resend', async () => {
      await sendEmail({
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<h1>Hello</h1>',
      })

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Test Subject',
          html: '<h1>Hello</h1>',
        })
      )
    })

    it('deve usar o remetente configurado via variável de ambiente', async () => {
      await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>test</p>',
      })

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.any(String),
        })
      )
    })

    it('deve incluir campo text quando fornecido', async () => {
      await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>HTML version</p>',
        text: 'Text version',
      })

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Text version',
        })
      )
    })

    it('deve omitir campo text quando não fornecido', async () => {
      await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>HTML only</p>',
      })

      /** Verificar que text NÃO foi incluído na chamada */
      const chamada = mockSend.mock.calls[0][0]
      expect(chamada).not.toHaveProperty('text')
    })
  })

  describe('tratamento de erros da API', () => {
    it('deve retornar { success: false, error } quando a API retorna erro', async () => {
      mockSend.mockResolvedValue({
        data: null,
        error: { message: 'Invalid API key', name: 'validation_error' },
      })

      const resultado = await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>test</p>',
      })

      expect(resultado.success).toBe(false)
      expect(resultado.error).toBe('Invalid API key')
    })

    it('deve logar o erro no console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      mockSend.mockResolvedValue({
        data: null,
        error: { message: 'Rate limit exceeded', name: 'rate_limit_error' },
      })

      await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>test</p>',
      })

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('tratamento de exceções inesperadas', () => {
    it('deve capturar exceção e retornar { success: false, error }', async () => {
      mockSend.mockRejectedValue(new Error('Network timeout'))

      const resultado = await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>test</p>',
      })

      expect(resultado.success).toBe(false)
      expect(resultado.error).toBe('Network timeout')
    })

    it('deve lidar com erro não-Error (string, object, etc.)', async () => {
      mockSend.mockRejectedValue('erro inesperado como string')

      const resultado = await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>test</p>',
      })

      expect(resultado.success).toBe(false)
      expect(resultado.error).toBeDefined()
    })

    it('deve logar exceções no console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      mockSend.mockRejectedValue(new Error('Connection refused'))

      await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>test</p>',
      })

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})
