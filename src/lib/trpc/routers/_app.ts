import { router } from '../init'
import { contractRouter } from './contract'
import { dashboardRouter } from './dashboard'
import { alertRouter } from './alert'

/**
 * Router raiz — agrega todos os sub-routers da aplicação.
 *
 * Cada sub-router é acessível pelo seu namespace:
 * - contract.* → CRUD de contratos
 * - dashboard.* → Estatísticas agregadas do portfólio
 * - alert.* → Listagem e gestão de alertas de contrato
 */
export const appRouter = router({
  contract: contractRouter,
  dashboard: dashboardRouter,
  alert: alertRouter,
})

export type AppRouter = typeof appRouter
