import { z } from 'zod'
import { router, protectedProcedure } from '../init'
import { organizations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { logAuditAction } from '@/lib/db/audit-helper'

/**
 * Router de organização — leitura e atualização dos dados da org.
 *
 * Procedures:
 * - get: retorna dados da organização do usuário autenticado
 * - update: atualiza nome da organização (exige role admin)
 */
export const organizationRouter = router({
  /**
   * Retorna os dados completos da organização do usuário autenticado.
   * Usa o orgId injetado pelo middleware de autenticação.
   */
  get: protectedProcedure.query(async ({ ctx }) => {
    /** Busca a organização pelo ID do contexto */
    const org = await ctx.db.query.organizations.findFirst({
      where: eq(organizations.id, ctx.orgId),
    })

    if (!org) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Organização não encontrada',
      })
    }

    return org
  }),

  /**
   * Atualiza o nome da organização.
   *
   * Restrições:
   * - Somente usuários com role 'admin' podem executar
   * - Nome deve ter entre 2 e 255 caracteres
   *
   * Registra a alteração no audit log.
   */
  update: protectedProcedure
    .input(
      z.object({
        /** Novo nome da organização — mínimo 2, máximo 255 caracteres */
        name: z.string().min(2, 'O nome deve ter ao menos 2 caracteres').max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      /** Verifica se o usuário é admin da organização */
      if (ctx.dbUser.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Apenas administradores podem alterar configurações da organização',
        })
      }

      /** Busca o nome anterior para registrar no audit log */
      const currentOrg = await ctx.db.query.organizations.findFirst({
        where: eq(organizations.id, ctx.orgId),
        columns: { name: true },
      })

      /** Atualiza o nome e marca o timestamp de atualização */
      const [updated] = await ctx.db
        .update(organizations)
        .set({
          name: input.name,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, ctx.orgId))
        .returning()

      /** Registra a ação no audit log com o valor anterior e novo */
      await logAuditAction(ctx.orgId, ctx.dbUser.id, 'organization.update', {
        field: 'name',
        previousValue: currentOrg?.name ?? null,
        newValue: input.name,
      })

      return updated
    }),
})
