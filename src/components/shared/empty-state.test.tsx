/**
 * Testes do componente EmptyState.
 *
 * Verifica:
 * - Renderização do ícone, título e descrição
 * - Botão de ação primário com link e ícone
 * - Botão de ação secundário com link
 * - Modo compacto (prop compact)
 * - Ausência de botões quando não fornecidos
 * - Tratamento de edge cases (strings longas, etc.)
 *
 * Usa ReactDOM diretamente (sem @testing-library/react).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { FileText, Upload, HelpCircle } from 'lucide-react'
import { EmptyState } from './empty-state'

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

describe('EmptyState — componente de estado vazio', () => {
  /** Props padrão para a maioria dos testes */
  const propsPadrao = {
    icon: FileText,
    title: 'No contracts yet',
    description: 'Upload your first contract to get started.',
  }

  describe('renderização básica', () => {
    it('deve renderizar o título fornecido', () => {
      renderSync(<EmptyState {...propsPadrao} />)

      const titulo = container.querySelector('h3')
      expect(titulo).not.toBeNull()
      expect(titulo?.textContent).toBe('No contracts yet')
    })

    it('deve renderizar a descrição fornecida', () => {
      renderSync(<EmptyState {...propsPadrao} />)

      const descricao = container.querySelector('p')
      expect(descricao).not.toBeNull()
      expect(descricao?.textContent).toBe('Upload your first contract to get started.')
    })

    it('deve renderizar o ícone como SVG', () => {
      renderSync(<EmptyState {...propsPadrao} />)

      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('deve renderizar o título como h3', () => {
      renderSync(<EmptyState {...propsPadrao} />)

      const titulo = container.querySelector('h3')
      expect(titulo).not.toBeNull()
      expect(titulo?.tagName).toBe('H3')
    })
  })

  describe('botão de ação primário', () => {
    it('deve renderizar o botão quando actionLabel e actionHref são fornecidos', () => {
      renderSync(
        <EmptyState
          {...propsPadrao}
          actionLabel="Upload Contract"
          actionHref="/dashboard/contracts/new"
        />
      )

      /** O texto do botão deve aparecer no DOM */
      expect(container.textContent).toContain('Upload Contract')
    })

    it('deve gerar o link com o href correto', () => {
      renderSync(
        <EmptyState
          {...propsPadrao}
          actionLabel="Upload Contract"
          actionHref="/dashboard/contracts/new"
        />
      )

      /** O Link do i18n/navigation é mockado como <a> */
      const links = container.querySelectorAll('a')
      const linkComHref = Array.from(links).find(
        (l) => l.getAttribute('href') === '/dashboard/contracts/new'
      )
      expect(linkComHref).not.toBeUndefined()
    })

    it('deve renderizar o ícone de ação quando actionIcon é fornecido', () => {
      renderSync(
        <EmptyState
          {...propsPadrao}
          actionLabel="Upload Contract"
          actionHref="/dashboard/contracts/new"
          actionIcon={Upload}
        />
      )

      /** Deve ter pelo menos 2 SVGs: o ícone principal + o ícone do botão */
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThanOrEqual(2)
    })

    it('deve NÃO renderizar o botão quando apenas actionLabel é fornecido (sem href)', () => {
      renderSync(
        <EmptyState
          {...propsPadrao}
          actionLabel="Upload Contract"
        />
      )

      /** O texto do botão de ação não deve aparecer como link */
      const links = container.querySelectorAll('a')
      const linkDeAcao = Array.from(links).find(
        (l) => l.textContent?.includes('Upload Contract')
      )
      expect(linkDeAcao).toBeUndefined()
    })
  })

  describe('botão de ação secundário', () => {
    it('deve renderizar o botão secundário quando label e href são fornecidos', () => {
      renderSync(
        <EmptyState
          {...propsPadrao}
          secondaryLabel="Learn more"
          secondaryHref="/docs"
        />
      )

      expect(container.textContent).toContain('Learn more')
    })

    it('deve gerar o link secundário com href correto', () => {
      renderSync(
        <EmptyState
          {...propsPadrao}
          secondaryLabel="Learn more"
          secondaryHref="/docs"
        />
      )

      const links = container.querySelectorAll('a')
      const linkSecundario = Array.from(links).find(
        (l) => l.getAttribute('href') === '/docs'
      )
      expect(linkSecundario).not.toBeUndefined()
    })

    it('deve NÃO renderizar o botão secundário quando apenas label é fornecido', () => {
      renderSync(
        <EmptyState
          {...propsPadrao}
          secondaryLabel="Learn more"
        />
      )

      const links = container.querySelectorAll('a')
      const linkSecundario = Array.from(links).find(
        (l) => l.textContent?.includes('Learn more')
      )
      expect(linkSecundario).toBeUndefined()
    })
  })

  describe('ambos os botões', () => {
    it('deve renderizar botão primário e secundário juntos', () => {
      renderSync(
        <EmptyState
          {...propsPadrao}
          actionLabel="Upload"
          actionHref="/upload"
          secondaryLabel="Help"
          secondaryHref="/help"
        />
      )

      expect(container.textContent).toContain('Upload')
      expect(container.textContent).toContain('Help')
    })
  })

  describe('sem botões', () => {
    it('deve renderizar apenas título e descrição quando não há ações', () => {
      renderSync(<EmptyState {...propsPadrao} />)

      expect(container.textContent).toContain('No contracts yet')
      expect(container.textContent).toContain('Upload your first contract to get started.')

      /** Não deve haver links de navegação (nenhum <a>) */
      const links = container.querySelectorAll('a')
      expect(links.length).toBe(0)
    })
  })

  describe('modo compacto', () => {
    it('deve usar padding reduzido quando compact é true', () => {
      renderSync(<EmptyState {...propsPadrao} compact />)

      /** O container principal deve ter p-8 em vez de p-12 */
      const wrapper = container.firstElementChild
      expect(wrapper?.className).toContain('p-8')
    })

    it('deve usar padding completo quando compact é false ou omitido', () => {
      renderSync(<EmptyState {...propsPadrao} />)

      const wrapper = container.firstElementChild
      expect(wrapper?.className).toContain('p-12')
    })
  })

  describe('edge cases', () => {
    it('deve funcionar com título longo', () => {
      renderSync(
        <EmptyState
          icon={FileText}
          title="This is a very long title that might cause layout issues in some cases"
          description="Short desc."
        />
      )

      expect(container.textContent).toContain(
        'This is a very long title that might cause layout issues in some cases'
      )
    })

    it('deve funcionar com descrição longa', () => {
      const descricaoLonga = 'A'.repeat(500)
      renderSync(
        <EmptyState
          icon={FileText}
          title="Title"
          description={descricaoLonga}
        />
      )

      expect(container.textContent).toContain(descricaoLonga)
    })

    it('deve aceitar diferentes ícones do lucide', () => {
      renderSync(
        <EmptyState
          icon={HelpCircle}
          title="Need help?"
          description="Check our docs."
        />
      )

      expect(container.textContent).toContain('Need help?')
      expect(container.querySelectorAll('svg').length).toBeGreaterThan(0)
    })
  })
})
