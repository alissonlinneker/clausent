import { router } from '../init'
import { contractRouter } from './contract'
import { dashboardRouter } from './dashboard'

/**
 * Router raiz — agrega todos os sub-routers da aplicação.
 *
 * Cada sub-router é acessível pelo seu namespace:
 * - contract.* → CRUD de contratos
 * - dashboard.* → Estatísticas agregadas do portfólio
 */
export const appRouter = router({
  contract: contractRouter,
  dashboard: dashboardRouter,
})

export type AppRouter = typeof appRouter
