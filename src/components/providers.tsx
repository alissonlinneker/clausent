'use client'

import { TRPCProvider } from '@/lib/trpc/react'

/** Wrapper de todos os providers client-side */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      {children}
    </TRPCProvider>
  )
}
