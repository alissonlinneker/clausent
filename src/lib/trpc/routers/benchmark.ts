import { z } from 'zod'
import { router, protectedProcedure } from '../init'
import { contractBenchmarks, contracts } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

/**
 * Router de benchmarks — comparação de métricas contratuais com o mercado.
 *
 * Fornece acesso aos benchmarks calculados para contratos individuais
 * e um resumo agregado de todos os benchmarks da organização.
 *
 * Procedures:
 * - getForContract: Benchmarks de um contrato específico
 * - summary: Resumo agregado de todos os benchmarks da organização
 */
export const benchmarkRouter = router({
  /**
   * Retorna todos os benchmarks salvos para um contrato específico.
   *
   * Valida que o contrato pertence à organização do usuário
   * antes de retornar os dados, garantindo isolamento multi-tenant.
   *
   * @param contractId - UUID do contrato
   * @returns Array de benchmarks com métrica, valores e percentil
   */
  getForContract: protectedProcedure
    .input(z.object({ contractId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      /**
       * Primeiro verifica se o contrato pertence à organização.
       * Isso previne acesso a benchmarks de contratos de outras orgs.
       */
      const contract = await ctx.db.query.contracts.findFirst({
        where: eq(contracts.id, input.contractId),
        columns: { id: true, orgId: true },
      })

      /** Contrato não encontrado ou não pertence à organização */
      if (!contract || contract.orgId !== ctx.orgId) {
        return []
      }

      /** Busca todos os benchmarks associados ao contrato */
      return ctx.db.query.contractBenchmarks.findMany({
        where: eq(contractBenchmarks.contractId, input.contractId),
      })
    }),

  /**
   * Retorna o resumo agregado de todos os benchmarks da organização.
   *
   * Agrupa benchmarks de todos os contratos da org e retorna:
   * - Lista completa de benchmarks com dados do contrato associado
   * - Útil para a página de visão geral de benchmarks no dashboard
   *
   * @returns Array de benchmarks com informações do contrato pai
   */
  summary: protectedProcedure.query(async ({ ctx }) => {
    /** Busca todos os contratos da organização */
    const orgContracts = await ctx.db.query.contracts.findMany({
      where: eq(contracts.orgId, ctx.orgId),
      columns: { id: true },
    })

    /** Organização sem contratos — retorna lista vazia */
    if (orgContracts.length === 0) {
      return []
    }

    /** IDs dos contratos da organização para filtrar benchmarks */
    const contractIds = orgContracts.map((c) => c.id)

    /**
     * Busca todos os benchmarks com dados do contrato associado.
     * Inclui título e contraparte para exibição na interface.
     */
    const allBenchmarks = await ctx.db.query.contractBenchmarks.findMany({
      with: {
        contract: {
          columns: {
            id: true,
            title: true,
            counterparty: true,
            orgId: true,
          },
        },
      },
    })

    /**
     * Filtra apenas benchmarks cujo contrato pertence à organização.
     * Necessário pois contractBenchmarks não possui orgId diretamente.
     */
    return allBenchmarks.filter((b) => contractIds.includes(b.contractId))
  }),
})
