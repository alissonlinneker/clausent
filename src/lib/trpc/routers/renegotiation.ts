import { z } from 'zod'
import { router, protectedProcedure } from '../init'
import { contracts, renegotiationPackages } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { generateRenegotiationPackage } from '@/lib/ai/renegotiation-generator'

/**
 * Router de pacotes de renegociação.
 *
 * Gerencia a geração, consulta e edição de pacotes de renegociação
 * baseados em dados do contrato, cláusulas e benchmarks de mercado.
 *
 * Procedures:
 * - generate: Gera um novo pacote para um contrato existente
 * - getForContract: Retorna o pacote mais recente de um contrato
 * - updateDraft: Atualiza o rascunho de email do pacote
 */
export const renegotiationRouter = router({
  /**
   * Gera um novo pacote de renegociação para o contrato informado.
   *
   * Fluxo:
   * 1. Busca o contrato com cláusulas e benchmarks
   * 2. Valida que o contrato pertence à organização
   * 3. Envia dados ao gerador que consulta o modelo de linguagem
   * 4. Salva o pacote gerado no banco de dados
   * 5. Retorna o pacote completo
   */
  generate: protectedProcedure
    .input(z.object({ contractId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      /** Busca o contrato com todos os dados relacionados */
      const contract = await ctx.db.query.contracts.findFirst({
        where: and(
          eq(contracts.id, input.contractId),
          eq(contracts.orgId, ctx.orgId),
        ),
        with: {
          clauses: true,
          benchmarks: true,
        },
      })

      /** Validação: contrato deve existir e pertencer à organização */
      if (!contract) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Contrato não encontrado',
        })
      }

      /** Monta os dados de entrada para o gerador */
      const result = await generateRenegotiationPackage({
        title: contract.title,
        counterparty: contract.counterparty,
        totalValue: contract.totalValue,
        monthlyValue: contract.monthlyValue,
        currency: contract.currency,
        autoRenew: contract.autoRenew,
        noticePeriodDays: contract.noticePeriodDays,
        renewalTerms: contract.renewalTerms,
        clauses: contract.clauses.map((c) => ({
          type: c.clauseType,
          text: c.text,
          riskLevel: c.riskLevel,
        })),
        benchmarks: contract.benchmarks.map((b) => ({
          metric: b.metric,
          yourValue: b.yourValue,
          marketAvg: b.marketAvg,
          percentile: b.percentile,
        })),
      })

      /** Persiste o pacote gerado no banco de dados */
      const [saved] = await ctx.db.insert(renegotiationPackages).values({
        contractId: input.contractId,
        points: result.points,
        draftEmail: result.draftEmail,
        estimatedSavings: result.estimatedSavings.toFixed(2),
      }).returning()

      return saved
    }),

  /**
   * Retorna o pacote de renegociação mais recente para um contrato.
   *
   * Valida que o contrato pertence à organização antes de buscar.
   * Retorna null se nenhum pacote existir.
   */
  getForContract: protectedProcedure
    .input(z.object({ contractId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      /** Verifica se o contrato pertence à organização do usuário */
      const contract = await ctx.db.query.contracts.findFirst({
        where: and(
          eq(contracts.id, input.contractId),
          eq(contracts.orgId, ctx.orgId),
        ),
        columns: { id: true },
      })

      if (!contract) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Contrato não encontrado',
        })
      }

      /** Busca o pacote mais recente (ordenado por data de criação) */
      const pkg = await ctx.db.query.renegotiationPackages.findFirst({
        where: eq(renegotiationPackages.contractId, input.contractId),
        orderBy: desc(renegotiationPackages.createdAt),
      })

      return pkg ?? null
    }),

  /**
   * Atualiza o rascunho de email de um pacote de renegociação.
   *
   * Permite que o usuário edite o texto do email gerado
   * antes de enviar à contraparte.
   *
   * Valida via join que o pacote pertence a um contrato da organização.
   */
  updateDraft: protectedProcedure
    .input(z.object({
      /** ID do pacote de renegociação a atualizar */
      packageId: z.string().uuid(),
      /** Novo conteúdo do rascunho de email */
      draftEmail: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      /** Busca o pacote com dados do contrato para validação de org */
      const pkg = await ctx.db.query.renegotiationPackages.findFirst({
        where: eq(renegotiationPackages.id, input.packageId),
        with: {
          contract: {
            columns: { orgId: true },
          },
        },
      })

      /** Validação de segurança: pacote deve existir e pertencer à org */
      if (!pkg || pkg.contract.orgId !== ctx.orgId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pacote de renegociação não encontrado',
        })
      }

      /** Atualiza o rascunho de email */
      const [updated] = await ctx.db.update(renegotiationPackages)
        .set({ draftEmail: input.draftEmail })
        .where(eq(renegotiationPackages.id, input.packageId))
        .returning()

      return updated
    }),
})
