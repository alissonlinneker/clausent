'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

/**
 * Wrapper de todos os providers client-side.
 *
 * Inclui:
 * - React Query para cache e estado de servidor
 *
 * O QueryClient é criado dentro do componente (via useState)
 * para evitar compartilhamento entre requisições no SSR.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  /** Instância do QueryClient — uma por sessão do usuário */
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            /** Não refaz fetch ao focar a janela (evita requests desnecessários) */
            refetchOnWindowFocus: false,
            /** Retry apenas 1x em caso de falha */
            retry: 1,
            /** Cache de 5 minutos */
            staleTime: 5 * 60 * 1000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
