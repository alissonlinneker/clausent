/**
 * Testes do módulo de rate limiting baseado em memória.
 *
 * Cobre a função principal rateLimit() e os helpers pré-configurados
 * (apiRateLimit, authRateLimit, uploadRateLimit).
 *
 * Cenários testados:
 * - Primeira requisição é sempre permitida
 * - Contador de requisições restantes decrementa corretamente
 * - Bloqueio quando o limite é excedido
 * - Reset da janela após expiração
 * - Isolamento entre chaves diferentes
 * - Helpers com limites pré-configurados
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { rateLimit, apiRateLimit, authRateLimit, uploadRateLimit } from './rate-limit'

describe('rateLimit', () => {
  beforeEach(() => {
    /** Usar timers falsos para controlar o tempo nos testes */
    vi.useFakeTimers()
    /**
     * Avançar 6 minutos para forçar a limpeza do store interno,
     * garantindo isolamento entre testes
     */
    vi.advanceTimersByTime(6 * 60 * 1000)
    /** Chamada de limpeza — força cleanup do store */
    rateLimit({ key: '__cleanup__', limit: 1, window: 1 })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('função principal rateLimit()', () => {
    it('deve permitir a primeira requisição e retornar remaining correto', () => {
      const resultado = rateLimit({ key: 'teste-1', limit: 5, window: 60 })

      expect(resultado.success).toBe(true)
      expect(resultado.remaining).toBe(4)
    })

    it('deve decrementar remaining a cada requisição', () => {
      const chave = 'teste-decremento'
      const config = { key: chave, limit: 5, window: 60 }

      const r1 = rateLimit(config)
      const r2 = rateLimit(config)
      const r3 = rateLimit(config)

      expect(r1.remaining).toBe(4)
      expect(r2.remaining).toBe(3)
      expect(r3.remaining).toBe(2)
    })

    it('deve permitir requisições até o limite exato', () => {
      const chave = 'teste-limite-exato'
      const config = { key: chave, limit: 3, window: 60 }

      /** 3 requisições — todas devem ser permitidas */
      const r1 = rateLimit(config)
      const r2 = rateLimit(config)
      const r3 = rateLimit(config)

      expect(r1.success).toBe(true)
      expect(r2.success).toBe(true)
      expect(r3.success).toBe(true)
      expect(r3.remaining).toBe(0)
    })

    it('deve bloquear quando o limite é excedido', () => {
      const chave = 'teste-bloqueio'
      const config = { key: chave, limit: 2, window: 60 }

      /** 2 requisições permitidas */
      rateLimit(config)
      rateLimit(config)

      /** 3ª requisição deve ser bloqueada */
      const resultado = rateLimit(config)

      expect(resultado.success).toBe(false)
      expect(resultado.remaining).toBe(0)
    })

    it('deve continuar bloqueando após exceder o limite', () => {
      const chave = 'teste-bloqueio-continuo'
      const config = { key: chave, limit: 1, window: 60 }

      /** 1ª requisição permitida */
      rateLimit(config)

      /** 2ª e 3ª devem ser bloqueadas */
      const r2 = rateLimit(config)
      const r3 = rateLimit(config)

      expect(r2.success).toBe(false)
      expect(r3.success).toBe(false)
    })

    it('deve resetar o contador após a janela expirar', () => {
      const chave = 'teste-reset-janela'
      const config = { key: chave, limit: 2, window: 10 }

      /** Esgotar o limite */
      rateLimit(config)
      rateLimit(config)
      const bloqueado = rateLimit(config)
      expect(bloqueado.success).toBe(false)

      /** Avançar o tempo além da janela (10s) */
      vi.advanceTimersByTime(11 * 1000)

      /** Nova requisição deve ser permitida após reset */
      const resultado = rateLimit(config)
      expect(resultado.success).toBe(true)
      expect(resultado.remaining).toBe(1)
    })

    it('deve isolar contadores entre chaves diferentes', () => {
      const configA = { key: 'usuario-a', limit: 2, window: 60 }
      const configB = { key: 'usuario-b', limit: 2, window: 60 }

      /** Esgotar o limite do usuário A */
      rateLimit(configA)
      rateLimit(configA)
      const bloqueadoA = rateLimit(configA)

      /** Usuário B não deve ser afetado */
      const resultadoB = rateLimit(configB)

      expect(bloqueadoA.success).toBe(false)
      expect(resultadoB.success).toBe(true)
      expect(resultadoB.remaining).toBe(1)
    })

    it('deve funcionar com janela de 1 segundo', () => {
      const config = { key: 'janela-curta', limit: 1, window: 1 }

      rateLimit(config)
      const bloqueado = rateLimit(config)
      expect(bloqueado.success).toBe(false)

      /** Após 1.1s deve resetar */
      vi.advanceTimersByTime(1100)
      const liberado = rateLimit(config)
      expect(liberado.success).toBe(true)
    })

    it('deve funcionar com limite alto', () => {
      const config = { key: 'limite-alto', limit: 1000, window: 60 }

      const resultado = rateLimit(config)
      expect(resultado.success).toBe(true)
      expect(resultado.remaining).toBe(999)
    })
  })

  describe('apiRateLimit() — 30 requisições por minuto', () => {
    it('deve permitir requisições dentro do limite de 30/min', () => {
      const resultado = apiRateLimit('user-123')

      expect(resultado.success).toBe(true)
      expect(resultado.remaining).toBe(29)
    })

    it('deve bloquear após 30 requisições', () => {
      /** Consumir as 30 requisições permitidas */
      for (let i = 0; i < 30; i++) {
        apiRateLimit('user-api-esgota')
      }

      /** 31ª deve ser bloqueada */
      const resultado = apiRateLimit('user-api-esgota')
      expect(resultado.success).toBe(false)
    })

    it('deve usar prefixo "api:" na chave interna', () => {
      /** Duas chamadas com a mesma chave devem compartilhar contador */
      const r1 = apiRateLimit('mesma-chave')
      const r2 = apiRateLimit('mesma-chave')

      expect(r1.remaining).toBe(29)
      expect(r2.remaining).toBe(28)
    })
  })

  describe('authRateLimit() — 5 requisições por minuto', () => {
    it('deve permitir requisições dentro do limite de 5/min', () => {
      const resultado = authRateLimit('ip-192.168.1.1')

      expect(resultado.success).toBe(true)
      expect(resultado.remaining).toBe(4)
    })

    it('deve bloquear após 5 requisições', () => {
      /** Consumir as 5 requisições permitidas */
      for (let i = 0; i < 5; i++) {
        authRateLimit('ip-auth-esgota')
      }

      /** 6ª deve ser bloqueada */
      const resultado = authRateLimit('ip-auth-esgota')
      expect(resultado.success).toBe(false)
      expect(resultado.remaining).toBe(0)
    })

    it('deve ter limite mais restritivo que apiRateLimit', () => {
      /** authRateLimit permite 5, apiRateLimit permite 30 */
      const auth = authRateLimit('comparacao-auth')
      const api = apiRateLimit('comparacao-api')

      expect(auth.remaining).toBeLessThan(api.remaining)
    })
  })

  describe('uploadRateLimit() — 10 requisições por minuto', () => {
    it('deve permitir requisições dentro do limite de 10/min', () => {
      const resultado = uploadRateLimit('user-upload')

      expect(resultado.success).toBe(true)
      expect(resultado.remaining).toBe(9)
    })

    it('deve bloquear após 10 requisições', () => {
      /** Consumir as 10 requisições permitidas */
      for (let i = 0; i < 10; i++) {
        uploadRateLimit('user-upload-esgota')
      }

      /** 11ª deve ser bloqueada */
      const resultado = uploadRateLimit('user-upload-esgota')
      expect(resultado.success).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('deve lidar com chave vazia', () => {
      const resultado = rateLimit({ key: '', limit: 5, window: 60 })

      expect(resultado.success).toBe(true)
      expect(resultado.remaining).toBe(4)
    })

    it('deve lidar com limite de 1', () => {
      const config = { key: 'limite-um', limit: 1, window: 60 }

      const r1 = rateLimit(config)
      const r2 = rateLimit(config)

      expect(r1.success).toBe(true)
      expect(r1.remaining).toBe(0)
      expect(r2.success).toBe(false)
    })

    it('deve lidar com chaves contendo caracteres especiais', () => {
      const resultado = rateLimit({
        key: 'api:user@email.com:POST:/upload',
        limit: 5,
        window: 60,
      })

      expect(resultado.success).toBe(true)
    })
  })
})
