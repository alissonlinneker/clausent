import { inngest } from '../client'
import { db } from '@/lib/db'
import { contracts, contractClauses, contractAlerts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { extractTextFromFile } from '@/lib/ai/text-extractor'
import { analyzeContract } from '@/lib/ai/contract-analyzer'

/**
 * Background job que processa um contrato enviado.
 *
 * Pipeline completo executado em steps isolados (retryable):
 * 1. Marca o contrato como "processing"
 * 2. Faz download e extrai texto do arquivo (PDF/DOCX)
 * 3. Envia o texto para análise via modelo de linguagem
 * 4. Persiste os resultados (dados do contrato, cláusulas, alertas)
 * 5. Marca o contrato como "completed"
 *
 * Cada step é idempotente e pode ser retentado individualmente
 * pelo Inngest em caso de falha, sem reprocessar steps anteriores.
 *
 * Evento disparador: 'contract/uploaded'
 * Dados esperados: { contractId: string, fileUrl: string }
 */
export const processContract = inngest.createFunction(
  {
    id: 'process-contract',
    /** Configuração de retentativas em caso de falha */
    retries: 3,
  },
  { event: 'contract/uploaded' },
  async ({ event, step }) => {
    const { contractId, fileUrl } = event.data as {
      contractId: string
      fileUrl: string
    }

    /**
     * Step 1: Marca o status do contrato como "processing".
     * Indica na UI que o contrato está sendo analisado.
     */
    await step.run('mark-processing', async () => {
      await db.update(contracts)
        .set({ processingStatus: 'processing', updatedAt: new Date() })
        .where(eq(contracts.id, contractId))
    })

    /**
     * Step 2: Faz download do arquivo e extrai o texto.
     * Suporta PDF (via pdf-parse) e DOCX (via extração XML).
     * O texto extraído é salvo no banco para consultas futuras.
     */
    const extractedText = await step.run('extract-text', async () => {
      const text = await extractTextFromFile(fileUrl)

      /** Salva o texto extraído no registro do contrato */
      await db.update(contracts)
        .set({ extractedText: text, updatedAt: new Date() })
        .where(eq(contracts.id, contractId))

      return text
    })

    /**
     * Step 3: Analisa o texto com o modelo de linguagem.
     * Retorna dados estruturados: partes, datas, valores, cláusulas, risco.
     */
    const analysis = await step.run('analyze-contract', async () => {
      return analyzeContract(extractedText)
    })

    /**
     * Step 4: Persiste os resultados da análise no banco de dados.
     * Atualiza o contrato com os dados extraídos e insere as cláusulas.
     */
    await step.run('save-results', async () => {
      /** Atualiza o registro principal do contrato com os dados da análise */
      await db.update(contracts)
        .set({
          title: analysis.title,
          counterparty: analysis.counterparty,
          category: analysis.category,
          startDate: analysis.startDate ? new Date(analysis.startDate) : null,
          endDate: analysis.endDate ? new Date(analysis.endDate) : null,
          totalValue: analysis.totalValue,
          monthlyValue: analysis.monthlyValue,
          currency: analysis.currency,
          autoRenew: analysis.autoRenew,
          noticePeriodDays: analysis.noticePeriodDays,
          renewalTerms: analysis.renewalTerms,
          riskScore: analysis.riskScore,
          aiSummary: { summary: analysis.summary },
          updatedAt: new Date(),
        })
        .where(eq(contracts.id, contractId))

      /** Insere cada cláusula identificada pela análise */
      if (analysis.clauses.length > 0) {
        await db.insert(contractClauses).values(
          analysis.clauses.map(clause => ({
            contractId,
            clauseType: clause.type,
            text: clause.text,
            riskLevel: clause.riskLevel as 'low' | 'medium' | 'high' | 'critical',
          }))
        )
      }
    })

    /**
     * Step 5: Cria alertas automáticos baseados nos dados do contrato.
     * - Alerta de vencimento: 30 dias antes da data de término
     * - Alerta de renovação: 15 dias antes (se auto-renovável)
     */
    await step.run('create-alerts', async () => {
      /** Lista de alertas a serem criados */
      const alertsToCreate: Array<{
        contractId: string
        type: string
        triggerDate: Date
      }> = []

      /** Alerta de vencimento: 30 dias antes do término */
      if (analysis.endDate) {
        const endDate = new Date(analysis.endDate)
        const expirationAlert = new Date(endDate)
        expirationAlert.setDate(expirationAlert.getDate() - 30)

        /** Só cria o alerta se a data de disparo for no futuro */
        if (expirationAlert > new Date()) {
          alertsToCreate.push({
            contractId,
            type: 'expiration',
            triggerDate: expirationAlert,
          })
        }
      }

      /** Alerta de renovação: 15 dias antes (para contratos auto-renováveis) */
      if (analysis.autoRenew && analysis.endDate) {
        const endDate = new Date(analysis.endDate)
        const renewalAlert = new Date(endDate)
        renewalAlert.setDate(renewalAlert.getDate() - 15)

        /** Só cria o alerta se a data de disparo for no futuro */
        if (renewalAlert > new Date()) {
          alertsToCreate.push({
            contractId,
            type: 'renewal',
            triggerDate: renewalAlert,
          })
        }
      }

      /** Insere os alertas no banco, se houver algum */
      if (alertsToCreate.length > 0) {
        await db.insert(contractAlerts).values(alertsToCreate)
      }
    })

    /**
     * Step 6: Marca o processamento como concluído.
     * Atualiza o status para "completed" indicando que a análise finalizou.
     */
    await step.run('mark-completed', async () => {
      await db.update(contracts)
        .set({ processingStatus: 'completed', updatedAt: new Date() })
        .where(eq(contracts.id, contractId))
    })

    return { success: true, contractId }
  },
)
