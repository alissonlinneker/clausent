import { z } from 'zod'
import { router, protectedProcedure } from '../init'
import { contracts } from '@/lib/db/schema'
import { createContractSchema, updateContractSchema } from '@/lib/validators/contract'
import { eq, and, desc } from 'drizzle-orm'
import { inngest } from '@/lib/inngest/client'

/**
 * Router de contratos — CRUD completo com isolamento por organização.
 *
 * Todas as operações filtram por orgId do contexto autenticado,
 * garantindo que nenhum usuário acesse contratos de outra organização.
 */
export const contractRouter = router({
  /**
   * Lista todos os contratos da organização.
   * Ordenados por data de criação (mais recente primeiro).
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.contracts.findMany({
      where: eq(contracts.orgId, ctx.orgId),
      orderBy: desc(contracts.createdAt),
    })
  }),

  /**
   * Busca um contrato específico pelo ID.
   * Inclui cláusulas, alertas e benchmarks relacionados.
   * Valida que o contrato pertence à organização do usuário.
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.contracts.findFirst({
        where: and(
          eq(contracts.id, input.id),
          eq(contracts.orgId, ctx.orgId),
        ),
        with: {
          clauses: true,
          alerts: true,
          benchmarks: true,
        },
      })
    }),

  /**
   * Cria um novo contrato na organização.
   * Converte datas de string ISO para objetos Date antes de inserir.
   */
  create: protectedProcedure
    .input(createContractSchema)
    .mutation(async ({ ctx, input }) => {
      const [contract] = await ctx.db.insert(contracts).values({
        ...input,
        orgId: ctx.orgId,
        /** Converte string ISO 8601 para Date nativa do PostgreSQL */
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
      }).returning()

      /**
       * Se o contrato possui arquivo anexado, dispara o pipeline
       * de processamento assíncrono via Inngest:
       * download → extração de texto → análise → alertas
       */
      if (contract.originalFileUrl) {
        await inngest.send({
          name: 'contract/uploaded',
          data: { contractId: contract.id, fileUrl: contract.originalFileUrl },
        })
      }

      return contract
    }),

  /**
   * Atualiza campos de um contrato existente.
   * Aceita atualização parcial (PATCH) — só os campos enviados são alterados.
   * Valida que o contrato pertence à organização antes de atualizar.
   */
  update: protectedProcedure
    .input(z.object({
      /** ID do contrato a ser atualizado */
      id: z.string().uuid(),
      /** Campos a serem atualizados (todos opcionais) */
      data: updateContractSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db.update(contracts)
        .set({
          ...input.data,
          /** Converte datas se fornecidas */
          startDate: input.data.startDate ? new Date(input.data.startDate) : undefined,
          endDate: input.data.endDate ? new Date(input.data.endDate) : undefined,
          /** Marca timestamp de atualização */
          updatedAt: new Date(),
        })
        .where(and(
          eq(contracts.id, input.id),
          eq(contracts.orgId, ctx.orgId),
        ))
        .returning()

      return updated
    }),

  /**
   * Deleta permanentemente um contrato.
   * As cláusulas, alertas e benchmarks são deletados em cascata (ON DELETE CASCADE).
   * Valida que o contrato pertence à organização antes de deletar.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(contracts)
        .where(and(
          eq(contracts.id, input.id),
          eq(contracts.orgId, ctx.orgId),
        ))
    }),
})
