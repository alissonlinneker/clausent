import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest/client'
import { processContract } from '@/lib/inngest/functions/process-contract'
import { checkAlerts } from '@/lib/inngest/functions/check-alerts'

/**
 * Rota de API para o Inngest.
 *
 * Expõe os endpoints GET, POST e PUT necessários para que o
 * Inngest possa descobrir e executar as funções registradas.
 *
 * - GET: endpoint de introspecção (usado pelo Inngest Dev Server)
 * - POST: recebe eventos e dispara execuções
 * - PUT: sincroniza funções registradas com o Inngest Cloud
 *
 * Funções registradas:
 * - processContract: processamento assíncrono de contratos enviados
 * - checkAlerts: cron job diário para envio de alertas de contrato
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processContract,
    checkAlerts,
  ],
})
