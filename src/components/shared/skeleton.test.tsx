/**
 * Testes dos componentes de skeleton loader.
 *
 * Componentes testados:
 * - Skeleton — loader genérico com className customizável
 * - StatCardSkeleton — skeleton para cards de estatísticas
 * - TableSkeleton — skeleton para tabelas com linhas e colunas configuráveis
 * - ChartSkeleton — skeleton para gráficos
 * - AlertCardSkeleton — skeleton para lista de alertas
 * - DashboardOverviewSkeleton — skeleton completo do dashboard
 *
 * Verifica:
 * - Renderização de cada variante
 * - Classes CSS de animação (animate-pulse)
 * - Quantidade correta de elementos repetidos (linhas, colunas, cards)
 * - Props padrão vs customizadas
 *
 * Usa ReactDOM diretamente (sem @testing-library/react).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  Skeleton,
  StatCardSkeleton,
  TableSkeleton,
  ChartSkeleton,
  AlertCardSkeleton,
  DashboardOverviewSkeleton,
} from './skeleton'

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

describe('Skeleton — loader genérico', () => {
  describe('renderização', () => {
    it('deve renderizar um div', () => {
      renderSync(<Skeleton />)

      const div = container.firstElementChild
      expect(div).not.toBeNull()
      expect(div?.tagName).toBe('DIV')
    })

    it('deve ter a classe animate-pulse', () => {
      renderSync(<Skeleton />)

      const div = container.firstElementChild
      expect(div?.className).toContain('animate-pulse')
    })

    it('deve ter a classe de fundo bg-slate-200/60', () => {
      renderSync(<Skeleton />)

      const div = container.firstElementChild
      expect(div?.className).toContain('bg-slate-200/60')
    })

    it('deve ter borda arredondada padrão', () => {
      renderSync(<Skeleton />)

      const div = container.firstElementChild
      expect(div?.className).toContain('rounded-lg')
    })
  })

  describe('className customizada', () => {
    it('deve aceitar className adicional', () => {
      renderSync(<Skeleton className="h-4 w-32" />)

      const div = container.firstElementChild
      expect(div?.className).toContain('h-4')
      expect(div?.className).toContain('w-32')
    })

    it('deve mesclar className com classes padrão', () => {
      renderSync(<Skeleton className="h-10 w-10 rounded-full" />)

      const div = container.firstElementChild
      /** Classes padrão devem estar presentes */
      expect(div?.className).toContain('animate-pulse')
      /** Classes customizadas também */
      expect(div?.className).toContain('h-10')
      expect(div?.className).toContain('w-10')
    })

    it('deve funcionar sem className (undefined)', () => {
      renderSync(<Skeleton />)

      const div = container.firstElementChild
      expect(div?.className).toContain('animate-pulse')
    })
  })
})

describe('StatCardSkeleton — skeleton de card de estatísticas', () => {
  it('deve renderizar sem erros', () => {
    renderSync(<StatCardSkeleton />)

    expect(container.firstElementChild).not.toBeNull()
  })

  it('deve conter múltiplos elementos skeleton internos', () => {
    renderSync(<StatCardSkeleton />)

    /** O stat card tem pelo menos 4 skeletons: ícone, indicador, valor, label */
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThanOrEqual(3)
  })

  it('deve ter o estilo de card neobrutalism', () => {
    renderSync(<StatCardSkeleton />)

    const card = container.firstElementChild
    expect(card?.className).toContain('rounded-2xl')
    expect(card?.className).toContain('bg-white')
    expect(card?.className).toContain('border')
  })
})

describe('TableSkeleton — skeleton de tabela', () => {
  describe('valores padrão', () => {
    it('deve renderizar com valores padrão sem erros', () => {
      renderSync(<TableSkeleton />)

      expect(container.firstElementChild).not.toBeNull()
    })

    it('deve renderizar 4 colunas por padrão no cabeçalho', () => {
      renderSync(<TableSkeleton />)

      /** O cabeçalho (bg-slate-50) contém 4 skeletons de coluna */
      const cabecalho = container.querySelector('.bg-slate-50')
      expect(cabecalho).not.toBeNull()

      const skeletonsNoCabecalho = cabecalho?.querySelectorAll('.animate-pulse')
      expect(skeletonsNoCabecalho?.length).toBe(4)
    })

    it('deve renderizar 5 linhas de dados por padrão', () => {
      renderSync(<TableSkeleton />)

      /**
       * Cada linha de dados tem a classe flex items-center gap-6.
       * Selecionamos essas linhas específicas (excluindo o cabeçalho).
       */
      const wrapper = container.firstElementChild
      /** O cabeçalho + 5 linhas = 6 filhos diretos */
      const filhos = wrapper?.children
      /** Subtrai 1 do cabeçalho */
      expect(filhos && filhos.length - 1).toBe(5)
    })
  })

  describe('props customizadas', () => {
    it('deve renderizar o número de linhas especificado', () => {
      renderSync(<TableSkeleton rows={3} cols={2} />)

      const wrapper = container.firstElementChild
      /** Cabeçalho + 3 linhas = 4 filhos */
      expect(wrapper?.children.length).toBe(4)
    })

    it('deve renderizar o número de colunas especificado no cabeçalho', () => {
      renderSync(<TableSkeleton rows={1} cols={6} />)

      const cabecalho = container.querySelector('.bg-slate-50')
      const skeletonsNoCabecalho = cabecalho?.querySelectorAll('.animate-pulse')
      expect(skeletonsNoCabecalho?.length).toBe(6)
    })

    it('deve funcionar com 0 linhas (apenas cabeçalho)', () => {
      renderSync(<TableSkeleton rows={0} cols={3} />)

      const cabecalho = container.querySelector('.bg-slate-50')
      expect(cabecalho).not.toBeNull()

      const wrapper = container.firstElementChild
      /** Apenas o cabeçalho */
      expect(wrapper?.children.length).toBe(1)
    })

    it('deve funcionar com muitas linhas', () => {
      renderSync(<TableSkeleton rows={20} cols={2} />)

      const wrapper = container.firstElementChild
      /** Cabeçalho + 20 linhas = 21 filhos */
      expect(wrapper?.children.length).toBe(21)
    })
  })

  describe('estilização', () => {
    it('deve ter o container com estilo neobrutalism', () => {
      renderSync(<TableSkeleton />)

      const wrapper = container.firstElementChild
      expect(wrapper?.className).toContain('rounded-2xl')
      expect(wrapper?.className).toContain('bg-white')
    })
  })
})

describe('ChartSkeleton — skeleton de gráfico', () => {
  it('deve renderizar sem erros', () => {
    renderSync(<ChartSkeleton />)

    expect(container.firstElementChild).not.toBeNull()
  })

  it('deve conter múltiplos skeletons (título, subtítulo, seletor, área do gráfico)', () => {
    renderSync(<ChartSkeleton />)

    const skeletons = container.querySelectorAll('.animate-pulse')
    /** Pelo menos: título + subtítulo + botão + área do gráfico */
    expect(skeletons.length).toBeGreaterThanOrEqual(4)
  })

  it('deve ter o estilo de card neobrutalism', () => {
    renderSync(<ChartSkeleton />)

    const card = container.firstElementChild
    expect(card?.className).toContain('rounded-2xl')
    expect(card?.className).toContain('bg-white')
    expect(card?.className).toContain('border')
  })
})

describe('AlertCardSkeleton — skeleton de cards de alerta', () => {
  describe('valores padrão', () => {
    it('deve renderizar 3 cards por padrão', () => {
      renderSync(<AlertCardSkeleton />)

      /** O container <div class="space-y-3"> contém 3 filhos */
      const wrapper = container.firstElementChild
      expect(wrapper?.children.length).toBe(3)
    })
  })

  describe('count customizado', () => {
    it('deve renderizar o número especificado de cards', () => {
      renderSync(<AlertCardSkeleton count={5} />)

      const wrapper = container.firstElementChild
      expect(wrapper?.children.length).toBe(5)
    })

    it('deve renderizar 1 card quando count é 1', () => {
      renderSync(<AlertCardSkeleton count={1} />)

      const wrapper = container.firstElementChild
      expect(wrapper?.children.length).toBe(1)
    })

    it('deve renderizar 0 cards quando count é 0', () => {
      renderSync(<AlertCardSkeleton count={0} />)

      const wrapper = container.firstElementChild
      expect(wrapper?.children.length).toBe(0)
    })
  })

  describe('estrutura interna de cada card', () => {
    it('deve conter skeletons para ícone, título, descrição e badges', () => {
      renderSync(<AlertCardSkeleton count={1} />)

      const skeletons = container.querySelectorAll('.animate-pulse')
      /** Cada card tem: ícone + título + descrição + badge + data */
      expect(skeletons.length).toBeGreaterThanOrEqual(4)
    })
  })
})

describe('DashboardOverviewSkeleton — skeleton completo do dashboard', () => {
  it('deve renderizar sem erros', () => {
    renderSync(<DashboardOverviewSkeleton />)

    expect(container.firstElementChild).not.toBeNull()
  })

  it('deve conter 4 stat cards skeleton no grid', () => {
    renderSync(<DashboardOverviewSkeleton />)

    /**
     * Os 4 stat cards estão dentro de um grid com classes específicas.
     * Procuramos o grid de 4 colunas.
     */
    const grids = container.querySelectorAll('.grid')
    /** O primeiro grid com 4 filhos contém os stat cards */
    const statCardGrid = Array.from(grids).find(
      (g) => g.children.length === 4
    )
    expect(statCardGrid).not.toBeUndefined()
  })

  it('deve conter o skeleton de tabela (reconhecido pelo cabeçalho bg-slate-50)', () => {
    renderSync(<DashboardOverviewSkeleton />)

    const tabelaCabecalho = container.querySelector('.bg-slate-50')
    expect(tabelaCabecalho).not.toBeNull()
  })

  it('deve conter múltiplos skeletons animados no total', () => {
    renderSync(<DashboardOverviewSkeleton />)

    const todosSkeletons = container.querySelectorAll('.animate-pulse')
    /**
     * São muitos skeletons: cabeçalho + 4 stat cards + chart + alerts + tabela.
     * Estimativa conservadora: pelo menos 20 elementos animados.
     */
    expect(todosSkeletons.length).toBeGreaterThanOrEqual(20)
  })

  it('deve ter a estrutura de espaçamento correto (space-y-8)', () => {
    renderSync(<DashboardOverviewSkeleton />)

    const wrapper = container.firstElementChild
    expect(wrapper?.className).toContain('space-y-8')
  })
})
