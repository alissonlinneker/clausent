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
 *
 * Usa ReactDOM diretamente (sem @testing-library/react).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ErrorState } from './error-state'

/** Container DOM para montar os componentes */
let container: HTMLDivElement
let root: ReactDOM.Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = ReactDOM.createRoot(container)
})

afterEach(() => {
  root.unmount()
  container.remove()
})

/** Helper para renderizar um componente de forma síncrona */
function renderSync(element: React.ReactElement) {
  ReactDOM.flushSync(() => {
    root.render(element)
  })
}

describe('ErrorState — componente de estado de erro', () => {
  describe('renderização com título padrão', () => {
    it('deve renderizar o título padrão usando a chave de tradução "error"', () => {
      renderSync(<ErrorState />)

      /**
       * O mock de useTranslations retorna a própria chave.
       * Então t('error') retorna 'error'.
       */
      const titulo = container.querySelector('h3')
      expect(titulo?.textContent).toBe('error')
    })

    it('deve renderizar como h3', () => {
      renderSync(<ErrorState />)

      const titulo = container.querySelector('h3')
      expect(titulo).not.toBeNull()
      expect(titulo?.tagName).toBe('H3')
    })
  })

  describe('renderização com título customizado', () => {
    it('deve usar o título customizado quando fornecido', () => {
      renderSync(<ErrorState title="Something went wrong" />)

      const titulo = container.querySelector('h3')
      expect(titulo?.textContent).toBe('Something went wrong')
    })

    it('deve priorizar o título customizado sobre o padrão', () => {
      renderSync(<ErrorState title="Custom error" />)

      const titulo = container.querySelector('h3')
      expect(titulo?.textContent).toBe('Custom error')
      /** O título padrão (chave 'error') não deve aparecer */
      expect(titulo?.textContent).not.toBe('error')
    })
  })

  describe('mensagem de erro', () => {
    it('deve exibir a mensagem quando fornecida', () => {
      renderSync(<ErrorState message="Failed to load contracts." />)

      const mensagem = container.querySelector('p')
      expect(mensagem).not.toBeNull()
      expect(mensagem?.textContent).toBe('Failed to load contracts.')
    })

    it('deve renderizar a mensagem como parágrafo <p>', () => {
      renderSync(<ErrorState message="Network error" />)

      const mensagem = container.querySelector('p')
      expect(mensagem?.tagName).toBe('P')
    })

    it('deve NÃO renderizar parágrafo de mensagem quando não fornecida', () => {
      renderSync(<ErrorState />)

      /** Deve ter apenas o h3, sem parágrafo de mensagem */
      const paragrafos = container.querySelectorAll('p')
      expect(paragrafos.length).toBe(0)
    })
  })

  describe('botão de retry', () => {
    it('deve renderizar o botão quando onRetry é fornecido', () => {
      const onRetry = vi.fn()
      renderSync(<ErrorState onRetry={onRetry} />)

      /**
       * O texto do botão vem de t('retry'), que pelo mock retorna 'retry'.
       */
      const botao = container.querySelector('button')
      expect(botao).not.toBeNull()
      expect(botao?.textContent).toContain('retry')
    })

    it('deve chamar onRetry ao clicar no botão', () => {
      const onRetry = vi.fn()
      renderSync(<ErrorState onRetry={onRetry} />)

      const botao = container.querySelector('button')
      expect(botao).not.toBeNull()

      botao?.click()

      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('deve chamar onRetry múltiplas vezes em cliques consecutivos', () => {
      const onRetry = vi.fn()
      renderSync(<ErrorState onRetry={onRetry} />)

      const botao = container.querySelector('button')

      botao?.click()
      botao?.click()
      botao?.click()

      expect(onRetry).toHaveBeenCalledTimes(3)
    })

    it('deve NÃO renderizar o botão quando onRetry não é fornecido', () => {
      renderSync(<ErrorState />)

      const botao = container.querySelector('button')
      expect(botao).toBeNull()
    })
  })

  describe('ícone de erro', () => {
    it('deve renderizar um ícone SVG (AlertCircle)', () => {
      renderSync(<ErrorState />)

      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })
  })

  describe('combinação de props', () => {
    it('deve renderizar título, mensagem e botão juntos', () => {
      const onRetry = vi.fn()
      renderSync(
        <ErrorState
          title="Connection lost"
          message="Please check your internet connection."
          onRetry={onRetry}
        />
      )

      const titulo = container.querySelector('h3')
      expect(titulo?.textContent).toBe('Connection lost')

      const mensagem = container.querySelector('p')
      expect(mensagem?.textContent).toBe('Please check your internet connection.')

      const botao = container.querySelector('button')
      expect(botao).not.toBeNull()
    })

    it('deve renderizar apenas título e botão (sem mensagem)', () => {
      const onRetry = vi.fn()
      renderSync(
        <ErrorState
          title="Error"
          onRetry={onRetry}
        />
      )

      const titulo = container.querySelector('h3')
      expect(titulo?.textContent).toBe('Error')

      const botao = container.querySelector('button')
      expect(botao).not.toBeNull()

      const paragrafos = container.querySelectorAll('p')
      expect(paragrafos.length).toBe(0)
    })

    it('deve renderizar apenas título e mensagem (sem botão)', () => {
      renderSync(
        <ErrorState
          title="500 Internal Server Error"
          message="The server encountered an unexpected condition."
        />
      )

      const titulo = container.querySelector('h3')
      expect(titulo?.textContent).toBe('500 Internal Server Error')

      const mensagem = container.querySelector('p')
      expect(mensagem?.textContent).toBe('The server encountered an unexpected condition.')

      const botao = container.querySelector('button')
      expect(botao).toBeNull()
    })
  })

  describe('estilos', () => {
    it('deve ter borda vermelha no container', () => {
      renderSync(<ErrorState />)

      const wrapper = container.firstElementChild
      expect(wrapper?.className).toContain('border-red-200')
    })

    it('deve ter fundo branco', () => {
      renderSync(<ErrorState />)

      const wrapper = container.firstElementChild
      expect(wrapper?.className).toContain('bg-white')
    })

    it('deve ter cantos arredondados', () => {
      renderSync(<ErrorState />)

      const wrapper = container.firstElementChild
      expect(wrapper?.className).toContain('rounded-2xl')
    })
  })
})
