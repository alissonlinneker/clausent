import { router, protectedProcedure } from '../init'
import { contracts } from '@/lib/db/schema'
import { eq, and, count, avg, sql, gte, lte } from 'drizzle-orm'

/**
 * Router do dashboard — fornece estatísticas agregadas do portfólio de contratos.
 *
 * Todas as queries são isoladas por organização (orgId do contexto autenticado).
 */
export const dashboardRouter = router({
  /**
   * Retorna estatísticas gerais do portfólio de contratos da organização.
   *
   * Métricas calculadas:
   * - totalContracts: Número total de contratos cadastrados
   * - avgRiskScore: Média do score de risco (arredondado para inteiro)
   * - totalMonthlyValue: Soma dos valores mensais recorrentes
   * - upcomingRenewals: Contratos com renovação automática nos próximos 90 dias
   */
  stats: protectedProcedure.query(async ({ ctx }) => {
    /** Busca métricas agregadas básicas */
    const orgContracts = await ctx.db
      .select({
        totalContracts: count(),
        avgRiskScore: avg(contracts.riskScore),
        totalMonthlyValue: sql<string>`COALESCE(SUM(${contracts.monthlyValue}::numeric), 0)`,
      })
      .from(contracts)
      .where(eq(contracts.orgId, ctx.orgId))

    /** Calcula janela de 90 dias para renovações próximas */
    const now = new Date()
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

    /** Conta contratos com autoRenew ativo que vencem nos próximos 90 dias */
    const upcomingRenewals = await ctx.db
      .select({ count: count() })
      .from(contracts)
      .where(and(
        eq(contracts.orgId, ctx.orgId),
        eq(contracts.autoRenew, true),
        gte(contracts.endDate, now),
        lte(contracts.endDate, in90Days),
      ))

    return {
      totalContracts: orgContracts[0]?.totalContracts ?? 0,
      /** Arredonda a média de risco para inteiro, ou null se sem dados */
      avgRiskScore: orgContracts[0]?.avgRiskScore
        ? Math.round(Number(orgContracts[0].avgRiskScore))
        : null,
      totalMonthlyValue: orgContracts[0]?.totalMonthlyValue ?? '0',
      upcomingRenewals: upcomingRenewals[0]?.count ?? 0,
    }
  }),
})
