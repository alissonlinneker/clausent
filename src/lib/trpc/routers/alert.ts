// @ts-nocheck
/**
 * Router tRPC de alertas.
 *
 * Gerencia a listagem, marcação como lido e dismissão
 * de alertas de contrato para o usuário autenticado.
 */

import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'

/** Schema de entrada para listagem de alertas com filtros */
const listInputSchema = z.object({
  /** Filtrar por tipo de alerta */
  type: z.enum(['all', 'renewal', 'risk', 'price', 'compliance', 'analysis']).optional(),
  /** Filtrar por prioridade mínima (1-5) */
  priority: z.number().int().min(1).max(5).optional(),
  /** Filtrar por status de leitura */
  readStatus: z.enum(['all', 'read', 'unread']).optional(),
  /** Número da página */
  page: z.number().int().min(1).default(1),
  /** Itens por página */
  limit: z.number().int().min(1).max(50).default(20),
})

export const alertRouter = router({
  /**
   * Listar alertas do usuário com filtros.
   *
   * Retorna alertas vinculados aos contratos do usuário,
   * ordenados por prioridade e data de criação (mais recentes primeiro).
   * Suporta filtros por tipo, prioridade e status de leitura.
   */
  list: protectedProcedure
    .input(listInputSchema)
    .query(async ({ ctx, input }) => {
      // TODO: Implementar query real com Drizzle
      // - Buscar alertas dos contratos que pertencem ao ctx.user.id
      // - JOIN contractAlerts com contracts ON contracts.userId = ctx.user.id
      // - Aplicar filtro de type se !== 'all'
      // - Aplicar filtro de priority (>=)
      // - Aplicar filtro de readStatus (isRead = true/false)
      // - Excluir alertas dispensados (dismissed = true)
      // - Ordenar por priority DESC, createdAt DESC
      // - Paginar com offset/limit

      const _userId = ctx.user.id

      return {
        alerts: [],
        total: 0,
        unreadCount: 0,
        page: input.page,
        totalPages: 0,
      }
    }),

  /**
   * Marcar alerta(s) como lido.
   *
   * Aceita um único ID ou uma lista de IDs para marcação em lote.
   * Verifica que os alertas pertencem ao usuário autenticado.
   */
  markAsRead: protectedProcedure
    .input(z.object({
      /** ID único do alerta (para marcação individual) */
      id: z.string().uuid().optional(),
      /** Lista de IDs (para marcação em lote) */
      ids: z.array(z.string().uuid()).optional(),
    }).refine(
      (data) => data.id || (data.ids && data.ids.length > 0),
      { message: 'Informe id ou ids para marcar como lido' }
    ))
    .mutation(async ({ ctx, input }) => {
      // TODO: Implementar com Drizzle
      // 1. Montar lista de IDs a atualizar (id único ou ids em lote)
      // 2. Verificar que todos os alertas pertencem ao usuário
      //    (JOIN com contracts WHERE userId = ctx.user.id)
      // 3. UPDATE contractAlerts SET isRead = true WHERE id IN (...)
      // 4. Retornar contagem de atualizados

      const _userId = ctx.user.id
      const alertIds = input.ids ?? (input.id ? [input.id] : [])

      return {
        success: true,
        updatedCount: alertIds.length,
      }
    }),

  /**
   * Dispensar/arquivar um alerta.
   *
   * O alerta dispensado não aparece mais nas listagens normais,
   * mas permanece no banco para fins de auditoria.
   */
  dismiss: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Implementar com Drizzle
      // 1. Verificar que o alerta pertence ao usuário
      // 2. UPDATE contractAlerts SET dismissed = true WHERE id = input.id
      // 3. Registrar no audit log

      const _userId = ctx.user.id
      const _alertId = input.id

      return { success: true }
    }),
})
