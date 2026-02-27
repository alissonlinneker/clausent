// @ts-nocheck
/**
 * Router raiz da aplicação tRPC.
 *
 * Combina todos os sub-routers em um único appRouter
 * que é usado tanto no servidor (API handler) quanto
 * no cliente (inferência de tipos).
 *
 * Cada sub-router é acessível via namespace:
 * - trpc.contract.list()
 * - trpc.alert.markAsRead()
 * - trpc.organization.getMembers()
 * - trpc.billing.getSubscription()
 */

import { router } from '../trpc'
import { contractRouter } from './contract'
import { alertRouter } from './alert'
import { organizationRouter } from './organization'
import { billingRouter } from './billing'

/**
 * Router principal da aplicação.
 *
 * Todos os procedimentos são acessíveis através
 * deste router, que serve como ponto de entrada
 * único para a API tRPC.
 */
export const appRouter = router({
  /** Operações de contratos (CRUD, análise, listagem) */
  contract: contractRouter,
  /** Operações de alertas (listagem, leitura, dismissão) */
  alert: alertRouter,
  /** Operações de organizações (membros, convites, papéis) */
  organization: organizationRouter,
  /** Operações de billing (assinatura, checkout, portal, uso) */
  billing: billingRouter,
})

/**
 * Tipo do router principal — usado para inferência de tipos
 * no cliente tRPC (type-safety end-to-end).
 *
 * Exemplo de uso no cliente:
 * ```ts
 * import type { AppRouter } from '@/lib/trpc/routers'
 * const trpc = createTRPCReact<AppRouter>()
 * ```
 */
export type AppRouter = typeof appRouter
