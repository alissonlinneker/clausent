/**
 * Testes do componente ErrorState.
 *
 * Verifica:
 * - Renderização com título padrão (tradução) e customizado
 * - Exibição condicional da mensagem de erro
 * - Botão de retry com callback funcional
 * - Ausência do botão de retry quando onRetry não é fornecido
 * - Ícone de erro presente no DOM
 * - Estilos de borda vermelha
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorState } from './error-state'

describe('ErrorState — componente de estado de erro', () => {
  describe('renderização com título padrão', () => {
    it('deve renderizar o título padrão usando a chave de tradução "error"', () => {
      render(<ErrorState />)

      /**
       * O mock de useTranslations retorna a própria chave.
       * Então t('error') retorna 'error'.
       */
      const titulo = screen.getByRole('heading', { level: 3 })
      expect(titulo.textContent).toBe('error')
    })

    it('deve renderizar como h3', () => {
      render(<ErrorState />)

      const titulo = screen.getByRole('heading', { level: 3 })
      expect(titulo).toBeDefined()
      expect(titulo.tagName).toBe('H3')
    })
  })

  describe('renderização com título customizado', () => {
    it('deve usar o título customizado quando fornecido', () => {
      render(<ErrorState title="Something went wrong" />)

      const titulo = screen.getByRole('heading', { level: 3 })
      expect(titulo.textContent).toBe('Something went wrong')
    })

    it('deve priorizar o título customizado sobre o padrão', () => {
      render(<ErrorState title="Custom error" />)

      const titulo = screen.getByRole('heading', { level: 3 })
      expect(titulo.textContent).toBe('Custom error')
      /** O título padrão (chave 'error') não deve aparecer */
      expect(titulo.textContent).not.toBe('error')
    })
  })

  describe('mensagem de erro', () => {
    it('deve exibir a mensagem quando fornecida', () => {
      render(<ErrorState message="Failed to load contracts." />)

      const mensagem = screen.getByText('Failed to load contracts.')
      expect(mensagem).toBeDefined()
    })

    it('deve renderizar a mensagem como parágrafo <p>', () => {
      render(<ErrorState message="Network error" />)

      const mensagem = screen.getByText('Network error')
      expect(mensagem.tagName).toBe('P')
    })

    it('deve NÃO renderizar parágrafo de mensagem quando não fornecida', () => {
      const { container } = render(<ErrorState />)

      /** Deve ter apenas o h3, sem parágrafo de mensagem */
      const paragrafos = container.querySelectorAll('p')
      expect(paragrafos.length).toBe(0)
    })
  })

  describe('botão de retry', () => {
    it('deve renderizar o botão quando onRetry é fornecido', () => {
      const onRetry = vi.fn()
      render(<ErrorState onRetry={onRetry} />)

      /**
       * O texto do botão vem de t('retry'), que pelo mock retorna 'retry'.
       */
      const botao = screen.getByRole('button')
      expect(botao).toBeDefined()
      expect(botao.textContent).toContain('retry')
    })

    it('deve chamar onRetry ao clicar no botão', () => {
      const onRetry = vi.fn()
      render(<ErrorState onRetry={onRetry} />)

      const botao = screen.getByRole('button')
      fireEvent.click(botao)

      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('deve chamar onRetry múltiplas vezes em cliques consecutivos', () => {
      const onRetry = vi.fn()
      render(<ErrorState onRetry={onRetry} />)

      const botao = screen.getByRole('button')

      fireEvent.click(botao)
      fireEvent.click(botao)
      fireEvent.click(botao)

      expect(onRetry).toHaveBeenCalledTimes(3)
    })

    it('deve NÃO renderizar o botão quando onRetry não é fornecido', () => {
      render(<ErrorState />)

      const botao = screen.queryByRole('button')
      expect(botao).toBeNull()
    })
  })

  describe('ícone de erro', () => {
    it('deve renderizar um ícone SVG (AlertCircle)', () => {
      const { container } = render(<ErrorState />)

      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })
  })

  describe('combinação de props', () => {
    it('deve renderizar título, mensagem e botão juntos', () => {
      const onRetry = vi.fn()
      render(
        <ErrorState
          title="Connection lost"
          message="Please check your internet connection."
          onRetry={onRetry}
        />
      )

      const titulo = screen.getByRole('heading', { level: 3 })
      expect(titulo.textContent).toBe('Connection lost')

      const mensagem = screen.getByText('Please check your internet connection.')
      expect(mensagem).toBeDefined()

      const botao = screen.getByRole('button')
      expect(botao).toBeDefined()
    })

    it('deve renderizar apenas título e botão (sem mensagem)', () => {
      const onRetry = vi.fn()
      const { container } = render(
        <ErrorState
          title="Error"
          onRetry={onRetry}
        />
      )

      const titulo = screen.getByRole('heading', { level: 3 })
      expect(titulo.textContent).toBe('Error')

      const botao = screen.getByRole('button')
      expect(botao).toBeDefined()

      const paragrafos = container.querySelectorAll('p')
      expect(paragrafos.length).toBe(0)
    })

    it('deve renderizar apenas título e mensagem (sem botão)', () => {
      render(
        <ErrorState
          title="500 Internal Server Error"
          message="The server encountered an unexpected condition."
        />
      )

      const titulo = screen.getByRole('heading', { level: 3 })
      expect(titulo.textContent).toBe('500 Internal Server Error')

      const mensagem = screen.getByText('The server encountered an unexpected condition.')
      expect(mensagem).toBeDefined()

      const botao = screen.queryByRole('button')
      expect(botao).toBeNull()
    })
  })

  describe('estilos', () => {
    it('deve ter borda vermelha no container', () => {
      const { container } = render(<ErrorState />)

      const wrapper = container.firstElementChild
      expect(wrapper?.className).toContain('border-red-200')
    })

    it('deve ter fundo branco', () => {
      const { container } = render(<ErrorState />)

      const wrapper = container.firstElementChild
      expect(wrapper?.className).toContain('bg-white')
    })

    it('deve ter cantos arredondados', () => {
      const { container } = render(<ErrorState />)

      const wrapper = container.firstElementChild
      expect(wrapper?.className).toContain('rounded-2xl')
    })
  })
})
