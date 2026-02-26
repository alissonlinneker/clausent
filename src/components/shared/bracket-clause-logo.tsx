/**
 * BracketClauseLogo — componente SVG do logo "Bracket Clause {C}".
 *
 * Opção 2 do design system: chaves de programação { } envolvendo
 * a letra C. Fusão de "cláusula contratual" com "código/tecnologia".
 *
 * Usa `stroke="currentColor"` para herdar a cor do elemento pai,
 * permitindo controle total via classes Tailwind (ex: text-teal-600).
 *
 * @param className - Classes CSS adicionais para estilizar o SVG
 * @param strokeWidth - Espessura do traço das chaves (padrão: 3.5)
 */

import { forwardRef } from 'react'

/** Props aceitas pelo componente BracketClauseLogo */
interface BracketClauseLogoProps {
  /** Classes CSS opcionais para personalizar tamanho, cor, etc. */
  className?: string
  /** Espessura do traço SVG das chaves (padrão: 3.5) */
  strokeWidth?: number
}

/**
 * Componente reutilizável do logo Bracket Clause {C}.
 * ViewBox quadrado 56x56 com chaves { } e C central.
 * Utiliza forwardRef para permitir referências diretas ao elemento SVG.
 */
export const BracketClauseLogo = forwardRef<SVGSVGElement, BracketClauseLogoProps>(
  ({ className, strokeWidth = 3.5 }, ref) => {
    return (
      <svg
        ref={ref}
        viewBox="0 0 56 56"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        className={className}
        aria-label="Clausent logo"
        role="img"
      >
        {/* Chave esquerda { — curva suave com cantos arredondados */}
        <path
          d="M16 8C12 8 10 12 10 16V22C10 24 8 26 6 28C8 30 10 32 10 34V40C10 44 12 48 16 48"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Chave direita } — espelhada */}
        <path
          d="M40 8C44 8 46 12 46 16V22C46 24 48 26 50 28C48 30 46 32 46 34V40C46 44 44 48 40 48"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Letra C central — traço levemente mais grosso para destaque */}
        <path
          d="M35 20C33 17 30.5 16 28 16C23.5 16 20 20.5 20 28C20 35.5 23.5 40 28 40C30.5 40 33 39 35 36"
          strokeWidth={strokeWidth + 0.5}
          fill="none"
        />
      </svg>
    )
  }
)

/** Nome de exibição para DevTools */
BracketClauseLogo.displayName = 'BracketClauseLogo'
