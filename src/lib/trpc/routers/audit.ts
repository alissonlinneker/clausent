import { z } from 'zod'
import { router, protectedProcedure } from '../init'
import { auditLog } from '@/lib/db/schema'
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm'

/**
 * Router de auditoria — consulta do log de ações da organização.
 *
 * Procedures:
 * - list: lista entradas do audit log com paginação e filtros
 */
export const auditRouter = router({
  /**
   * Lista entradas do audit log da organização.
   *
   * Suporta:
   * - Paginação via limit/offset
   * - Filtro por tipo de ação (action)
   * - Filtro por intervalo de datas (dateFrom / dateTo)
   *
   * Retorna as entradas ordenadas pela mais recente primeiro,
   * junto com os dados do usuário que executou a ação.
   */
  list: protectedProcedure
    .input(
      z.object({
        /** Número máximo de registros a retornar (padrão: 20) */
        limit: z.number().min(1).max(100).optional().default(20),
        /** Deslocamento para paginação (padrão: 0) */
        offset: z.number().min(0).optional().default(0),
        /** Filtro por tipo de ação — ex: 'organization.update' */
        action: z.string().optional(),
        /** Filtro por data inicial (ISO 8601) */
        dateFrom: z.string().optional(),
        /** Filtro por data final (ISO 8601) */
        dateTo: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      /** Monta as condições de filtro dinamicamente */
      const conditions = [eq(auditLog.orgId, ctx.orgId)]

      /** Filtro por ação — correspondência exata */
      if (input.action) {
        conditions.push(eq(auditLog.action, input.action))
      }

      /** Filtro por data inicial — registros a partir dessa data */
      if (input.dateFrom) {
        conditions.push(gte(auditLog.createdAt, new Date(input.dateFrom)))
      }

      /** Filtro por data final — registros até essa data */
      if (input.dateTo) {
        conditions.push(lte(auditLog.createdAt, new Date(input.dateTo)))
      }

      /** Combina todas as condições com AND */
      const whereClause = conditions.length > 1
        ? and(...conditions)
        : conditions[0]

      /** Busca os registros com os dados do usuário associado */
      const entries = await ctx.db.query.auditLog.findMany({
        where: whereClause,
        orderBy: desc(auditLog.createdAt),
        limit: input.limit,
        offset: input.offset,
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      /**
       * Conta o total de registros para informar a paginação.
       * Usa a mesma cláusula WHERE da consulta principal.
       */
      const [countResult] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(auditLog)
        .where(whereClause)

      return {
        /** Lista de entradas do audit log */
        entries,
        /** Total de registros (para paginação) */
        total: Number(countResult.count),
      }
    }),
})
