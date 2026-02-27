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
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FileText, Upload, HelpCircle } from 'lucide-react'
import { EmptyState } from './empty-state'

describe('EmptyState — componente de estado vazio', () => {
  /** Props padrão para a maioria dos testes */
  const propsPadrao = {
    icon: FileText,
    title: 'No contracts yet',
    description: 'Upload your first contract to get started.',
  }

  describe('renderização básica', () => {
    it('deve renderizar o título fornecido', () => {
      render(<EmptyState {...propsPadrao} />)

      const titulo = screen.getByRole('heading', { level: 3 })
      expect(titulo).toBeDefined()
      expect(titulo.textContent).toBe('No contracts yet')
    })

    it('deve renderizar a descrição fornecida', () => {
      render(<EmptyState {...propsPadrao} />)

      const descricao = screen.getByText('Upload your first contract to get started.')
      expect(descricao).toBeDefined()
    })

    it('deve renderizar o ícone como SVG', () => {
      const { container } = render(<EmptyState {...propsPadrao} />)

      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('deve renderizar o título como h3', () => {
      render(<EmptyState {...propsPadrao} />)

      const titulo = screen.getByRole('heading', { level: 3 })
      expect(titulo).toBeDefined()
      expect(titulo.tagName).toBe('H3')
    })
  })

  describe('botão de ação primário', () => {
    it('deve renderizar o botão quando actionLabel e actionHref são fornecidos', () => {
      render(
        <EmptyState
          {...propsPadrao}
          actionLabel="Upload Contract"
          actionHref="/dashboard/contracts/new"
        />
      )

      /** O texto do botão deve aparecer no DOM */
      expect(screen.getByText('Upload Contract')).toBeDefined()
    })

    it('deve gerar o link com o href correto', () => {
      const { container } = render(
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
      const { container } = render(
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
      const { container } = render(
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
      render(
        <EmptyState
          {...propsPadrao}
          secondaryLabel="Learn more"
          secondaryHref="/docs"
        />
      )

      expect(screen.getByText('Learn more')).toBeDefined()
    })

    it('deve gerar o link secundário com href correto', () => {
      const { container } = render(
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
      const { container } = render(
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
      render(
        <EmptyState
          {...propsPadrao}
          actionLabel="Upload"
          actionHref="/upload"
          secondaryLabel="Help"
          secondaryHref="/help"
        />
      )

      expect(screen.getByText('Upload')).toBeDefined()
      expect(screen.getByText('Help')).toBeDefined()
    })
  })

  describe('sem botões', () => {
    it('deve renderizar apenas título e descrição quando não há ações', () => {
      const { container } = render(<EmptyState {...propsPadrao} />)

      expect(screen.getByText('No contracts yet')).toBeDefined()
      expect(screen.getByText('Upload your first contract to get started.')).toBeDefined()

      /** Não deve haver links de navegação (nenhum <a>) */
      const links = container.querySelectorAll('a')
      expect(links.length).toBe(0)
    })
  })

  describe('modo compacto', () => {
    it('deve usar padding reduzido quando compact é true', () => {
      const { container } = render(<EmptyState {...propsPadrao} compact />)

      /** O container principal deve ter p-8 em vez de p-12 */
      const wrapper = container.firstElementChild
      expect(wrapper?.className).toContain('p-8')
    })

    it('deve usar padding completo quando compact é false ou omitido', () => {
      const { container } = render(<EmptyState {...propsPadrao} />)

      const wrapper = container.firstElementChild
      expect(wrapper?.className).toContain('p-12')
    })
  })

  describe('edge cases', () => {
    it('deve funcionar com título longo', () => {
      render(
        <EmptyState
          icon={FileText}
          title="This is a very long title that might cause layout issues in some cases"
          description="Short desc."
        />
      )

      expect(
        screen.getByText('This is a very long title that might cause layout issues in some cases')
      ).toBeDefined()
    })

    it('deve funcionar com descrição longa', () => {
      const descricaoLonga = 'A'.repeat(500)
      render(
        <EmptyState
          icon={FileText}
          title="Title"
          description={descricaoLonga}
        />
      )

      expect(screen.getByText(descricaoLonga)).toBeDefined()
    })

    it('deve aceitar diferentes ícones do lucide', () => {
      const { container } = render(
        <EmptyState
          icon={HelpCircle}
          title="Need help?"
          description="Check our docs."
        />
      )

      expect(screen.getByText('Need help?')).toBeDefined()
      expect(container.querySelectorAll('svg').length).toBeGreaterThan(0)
    })
  })
})
