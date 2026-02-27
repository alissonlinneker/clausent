/**
 * Testes do componente SkipLink.
 *
 * Verifica:
 * - Renderização correta da tag <a>
 * - Atributo href apontando para #main-content
 * - Texto de acessibilidade "Skip to main content"
 * - Classe sr-only para ficar visível apenas com foco via teclado
 *
 * Usa ReactDOM diretamente (sem @testing-library/react).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { SkipLink } from './skip-link'

/** Container DOM para montar os componentes */
let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  root.unmount()
  container.remove()
})

/** Helper para renderizar um componente de forma síncrona */
function renderSync(element: React.ReactElement) {
  /** Força o React a aplicar as atualizações de forma síncrona */
  flushSync(() => {
    root.render(element)
  })
}

describe('SkipLink — link de pular para conteúdo principal', () => {
  describe('renderização', () => {
    it('deve renderizar um elemento <a>', () => {
      renderSync(<SkipLink />)

      const link = container.querySelector('a')
      expect(link).not.toBeNull()
      expect(link?.tagName).toBe('A')
    })

    it('deve ter href apontando para #main-content', () => {
      renderSync(<SkipLink />)

      const link = container.querySelector('a')
      expect(link?.getAttribute('href')).toBe('#main-content')
    })

    it('deve conter o texto "Skip to main content"', () => {
      renderSync(<SkipLink />)

      const link = container.querySelector('a')
      expect(link?.textContent).toBe('Skip to main content')
    })
  })

  describe('acessibilidade', () => {
    it('deve ter a classe sr-only para ficar oculto visualmente por padrão', () => {
      renderSync(<SkipLink />)

      const link = container.querySelector('a')
      expect(link?.className).toContain('sr-only')
    })

    it('deve ter classes de foco para ficar visível ao receber Tab', () => {
      renderSync(<SkipLink />)

      const link = container.querySelector('a')
      expect(link?.className).toContain('focus:not-sr-only')
      expect(link?.className).toContain('focus:fixed')
    })

    it('deve ter z-index alto quando focado para sobrepor outros elementos', () => {
      renderSync(<SkipLink />)

      const link = container.querySelector('a')
      expect(link?.className).toContain('focus:z-[9999]')
    })
  })

  describe('estilização', () => {
    it('deve ter estilos de botão quando focado (bg-teal, texto branco)', () => {
      renderSync(<SkipLink />)

      const link = container.querySelector('a')
      expect(link?.className).toContain('focus:bg-teal-600')
      expect(link?.className).toContain('focus:text-white')
    })

    it('deve ter borda arredondada quando focado', () => {
      renderSync(<SkipLink />)

      const link = container.querySelector('a')
      expect(link?.className).toContain('focus:rounded-lg')
    })

    it('deve ter sombra quando focado', () => {
      renderSync(<SkipLink />)

      const link = container.querySelector('a')
      expect(link?.className).toContain('focus:shadow-lg')
    })
  })
})
