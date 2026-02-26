import { inngest } from '../client'
import { db } from '@/lib/db'
import { contractAlerts } from '@/lib/db/schema'
import { eq, and, lte, isNull } from 'drizzle-orm'
import { sendEmail } from '@/lib/email/resend'
import { generateAlertEmailHtml } from '@/lib/email/templates/alert-notification'
import { users } from '@/lib/db/schema'

/**
 * Cron job diário que verifica alertas de contrato pendentes.
 *
 * Execução programada para todo dia às 9h UTC.
 *
 * Fluxo:
 * 1. Busca todos os alertas com triggerDate <= hoje, ainda não enviados e não dispensados
 * 2. Para cada alerta encontrado:
 *    a. Busca os admins da organização dona do contrato
 *    b. Envia email de notificação para cada admin
 *    c. Marca o alerta como enviado (sentAt = now)
 *
 * Cada etapa é executada como um step independente do Inngest,
 * garantindo retries automáticos em caso de falha parcial.
 */
export const checkAlerts = inngest.createFunction(
  {
    id: 'check-alerts',
    name: 'Verificação diária de alertas de contratos',
  },
  { cron: '0 9 * * *' },
  async ({ step }) => {
    /** Etapa 1: Buscar alertas pendentes com dados do contrato */
    const pendingAlerts = await step.run('fetch-pending-alerts', async () => {
      return db.query.contractAlerts.findMany({
        where: and(
          /** Alertas cuja data de disparo já passou ou é hoje */
          lte(contractAlerts.triggerDate, new Date()),
          /** Ainda não foram enviados */
          isNull(contractAlerts.sentAt),
          /** Não foram dispensados pelo usuário */
          eq(contractAlerts.dismissed, false),
        ),
        with: {
          /** Inclui dados do contrato para montar o email */
          contract: true,
        },
      })
    })

    /** Se não há alertas pendentes, encerra sem processamento */
    if (pendingAlerts.length === 0) {
      return { processed: 0 }
    }

    /** Etapa 2: Processar cada alerta individualmente */
    for (const alert of pendingAlerts) {
      await step.run(`send-alert-${alert.id}`, async () => {
        /**
         * Busca os administradores da organização dona do contrato.
         * Apenas admins recebem notificações de alerta.
         */
        const orgAdmins = await db.query.users.findMany({
          where: and(
            eq(users.orgId, alert.contract.orgId),
            eq(users.role, 'admin'),
          ),
        })

        /** Envia email para cada admin da organização */
        for (const admin of orgAdmins) {
          const html = generateAlertEmailHtml({
            contractTitle: alert.contract.title,
            counterparty: alert.contract.counterparty || 'N/A',
            alertType: alert.type,
            triggerDate: alert.triggerDate,
            contractId: alert.contract.id,
          })

          await sendEmail(
            admin.email,
            `Contract Alert: ${alert.contract.title}`,
            html,
          )
        }

        /** Marca o alerta como enviado com o timestamp atual */
        await db.update(contractAlerts)
          .set({ sentAt: new Date() })
          .where(eq(contractAlerts.id, alert.id))
      })
    }

    return { processed: pendingAlerts.length }
  }
)
