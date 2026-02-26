import { z } from 'zod'
import { router, protectedProcedure } from '../init'
import { contractAlerts, contracts } from '@/lib/db/schema'
import { eq, and, desc, lte, gte, isNull } from 'drizzle-orm'

/**
 * Router de alertas — gestão de alertas da organização.
 *
 * Todas as queries filtram por organização via join com contracts,
 * já que contractAlerts não possui orgId diretamente.
 *
 * Procedures:
 * - list: Lista todos os alertas da organização com dados do contrato
 * - upcoming: Lista alertas dos próximos 30 dias (pendentes)
 * - dismiss: Marca um alerta como dispensado
 */
export const alertRouter = router({
  /**
   * Lista todos os alertas da organização com dados do contrato.
   *
   * Como contractAlerts não tem orgId, fazemos o join via
   * `with: { contract: true }` e filtramos no lado da aplicação
   * usando SQL direto com subquery para garantir isolamento.
   *
   * Ordenação: mais recentes primeiro (por triggerDate desc).
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    /**
     * Busca os IDs dos contratos pertencentes à organização.
     * Depois filtra os alertas que pertencem a esses contratos.
     */
    const orgContracts = await ctx.db.query.contracts.findMany({
      where: eq(contracts.orgId, ctx.orgId),
      columns: { id: true },
    })

    /** Se a organização não tem contratos, retorna lista vazia */
    if (orgContracts.length === 0) {
      return []
    }

    /** IDs dos contratos da organização para filtrar alertas */
    const contractIds = orgContracts.map((c) => c.id)

    /** Busca todos os alertas desses contratos */
    const allAlerts = await ctx.db.query.contractAlerts.findMany({
      with: {
        contract: {
          columns: {
            id: true,
            title: true,
            orgId: true,
            counterparty: true,
            endDate: true,
          },
        },
      },
      orderBy: desc(contractAlerts.triggerDate),
    })

    /** Filtra apenas alertas cujo contrato pertence à organização */
    return allAlerts.filter((alert) => contractIds.includes(alert.contractId))
  }),

  /**
   * Lista alertas dos próximos 30 dias que ainda não foram enviados.
   *
   * Útil para exibir no dashboard uma prévia dos alertas que
   * serão disparados em breve.
   */
  upcoming: protectedProcedure.query(async ({ ctx }) => {
    /** Calcula a janela de 30 dias */
    const now = new Date()
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    /** Busca contratos da organização */
    const orgContracts = await ctx.db.query.contracts.findMany({
      where: eq(contracts.orgId, ctx.orgId),
      columns: { id: true },
    })

    if (orgContracts.length === 0) {
      return []
    }

    const contractIds = orgContracts.map((c) => c.id)

    /** Busca alertas futuros (próximos 30 dias) */
    const upcomingAlerts = await ctx.db.query.contractAlerts.findMany({
      where: and(
        /** Data de disparo dentro da janela */
        gte(contractAlerts.triggerDate, now),
        lte(contractAlerts.triggerDate, in30Days),
        /** Ainda não enviados */
        isNull(contractAlerts.sentAt),
        /** Não dispensados */
        eq(contractAlerts.dismissed, false),
      ),
      with: {
        contract: {
          columns: {
            id: true,
            title: true,
            orgId: true,
            counterparty: true,
            endDate: true,
          },
        },
      },
      orderBy: contractAlerts.triggerDate,
    })

    /** Filtra apenas alertas de contratos da organização */
    return upcomingAlerts.filter((alert) => contractIds.includes(alert.contractId))
  }),

  /**
   * Marca um alerta como dispensado.
   *
   * Alertas dispensados não são mais exibidos como pendentes
   * e não recebem notificação por email.
   */
  dismiss: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      /**
       * Primeiro verifica se o alerta pertence a um contrato da organização.
       * Isso previne que um usuário dispense alertas de outra organização.
       */
      const alert = await ctx.db.query.contractAlerts.findFirst({
        where: eq(contractAlerts.id, input.id),
        with: {
          contract: {
            columns: { orgId: true },
          },
        },
      })

      /** Validação de segurança: alerta deve existir e pertencer à org */
      if (!alert || alert.contract.orgId !== ctx.orgId) {
        throw new Error('Alert not found')
      }

      /** Atualiza o alerta como dispensado */
      await ctx.db.update(contractAlerts)
        .set({ dismissed: true })
        .where(eq(contractAlerts.id, input.id))

      return { success: true }
    }),
})
