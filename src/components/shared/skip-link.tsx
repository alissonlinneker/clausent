'use client'

/**
 * Link de acessibilidade "Pular para o conteudo principal".
 * Visivel apenas quando focado via teclado (Tab).
 * Segue WCAG 2.1 AA — bypass blocks (criterio 2.4.1).
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-teal-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none"
    >
      Skip to main content
    </a>
  )
}
