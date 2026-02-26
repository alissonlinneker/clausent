import { router } from '../init'
import { contractRouter } from './contract'
import { dashboardRouter } from './dashboard'
import { alertRouter } from './alert'
import { renegotiationRouter } from './renegotiation'
import { benchmarkRouter } from './benchmark'
import { organizationRouter } from './organization'
import { auditRouter } from './audit'

/**
 * Router raiz — agrega todos os sub-routers da aplicação.
 *
 * Cada sub-router é acessível pelo seu namespace:
 * - contract.* → CRUD de contratos
 * - dashboard.* → Estatísticas agregadas do portfólio
 * - alert.* → Listagem e gestão de alertas de contrato
 * - renegotiation.* → Geração e gestão de pacotes de renegociação
 * - benchmark.* → Benchmarks de mercado e comparações
 * - organization.* → Configurações da organização
 * - audit.* → Log de auditoria
 */
export const appRouter = router({
  contract: contractRouter,
  dashboard: dashboardRouter,
  alert: alertRouter,
  renegotiation: renegotiationRouter,
  benchmark: benchmarkRouter,
  organization: organizationRouter,
  audit: auditRouter,
})

export type AppRouter = typeof appRouter
