// @ts-nocheck
/**
 * API Route — Server-Sent Events para status de análise de contrato.
 *
 * Endpoint: GET /api/analysis/[contractId]/status
 *
 * Fornece um stream SSE (Server-Sent Events) que emite atualizações
 * em tempo real sobre o progresso da análise de IA de um contrato.
 *
 * O cliente se conecta e recebe eventos conforme o status muda:
 * pending → extracting → analyzing → completed | failed
 *
 * A conexão é encerrada automaticamente quando:
 * - A análise é concluída (completed/failed)
 * - O timeout de 5 minutos é atingido
 * - O cliente desconecta
 *
 * Requer autenticação — apenas o dono do contrato pode acompanhar.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
 */

import { NextRequest } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { contracts } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

/* ---- Constantes ---- */

/** Intervalo de polling do banco de dados (em milissegundos) */
const POLL_INTERVAL_MS = 2_000

/** Timeout máximo da conexão SSE (em milissegundos) — 5 minutos */
const MAX_CONNECTION_MS = 5 * 60 * 1_000

/** Status que indicam que a análise terminou */
const TERMINAL_STATUSES = ['completed', 'analyzed', 'failed'] as const

/* ---- Tipos internos ---- */

/** Estrutura do evento SSE enviado ao cliente */
interface AnalysisStatusEvent {
  /** Status atual do processamento */
  status: string
  /** Percentual de progresso estimado (0-100) */
  progress: number
  /** Mensagem descritiva do passo atual */
  message: string
  /** Timestamp do evento */
  timestamp: string
  /** Dados extras opcionais (ex: erro em caso de falha) */
  metadata?: Record<string, unknown>
}

/* ---- Helpers ---- */

/**
 * Mapeia o status de processamento para um percentual estimado.
 *
 * Como o processamento é assíncrono e não temos granularidade
 * fina, usamos estimativas fixas por etapa.
 *
 * @param status - Status atual do processamento no banco
 * @returns Percentual estimado entre 0 e 100
 */
function getProgressForStatus(status: string): number {
  const progressMap: Record<string, number> = {
    pending: 0,
    extracting: 25,
    analyzing: 60,
    completed: 100,
    analyzed: 100,
    failed: 100,
  }

  return progressMap[status] ?? 0
}

/**
 * Gera uma mensagem descritiva para o status atual.
 *
 * Traduzida em português para exibição na UI.
 *
 * @param status - Status atual do processamento
 * @returns Mensagem legível para o usuário
 */
function getMessageForStatus(status: string): string {
  const messageMap: Record<string, string> = {
    pending: 'Contrato na fila de processamento...',
    extracting: 'Extraindo texto do documento...',
    analyzing: 'Analisando cláusulas e riscos com IA...',
    completed: 'Análise concluída com sucesso!',
    analyzed: 'Análise concluída com sucesso!',
    failed: 'Falha na análise do contrato.',
  }

  return messageMap[status] ?? 'Processando...'
}

/**
 * Formata um evento SSE no protocolo text/event-stream.
 *
 * Formato: "data: {json}\n\n"
 *
 * @param data - Dados do evento a serem serializados
 * @param eventType - Tipo opcional do evento (campo "event:")
 * @returns String formatada no protocolo SSE
 */
function formatSSEEvent(data: AnalysisStatusEvent, eventType?: string): string {
  let event = ''

  if (eventType) {
    event += `event: ${eventType}\n`
  }

  event += `data: ${JSON.stringify(data)}\n\n`
  return event
}

/* ---- Handler ---- */

/**
 * GET /api/analysis/[contractId]/status
 *
 * Inicia um stream SSE para acompanhar o status da análise
 * de um contrato em tempo real.
 *
 * @param req - Requisição HTTP
 * @param params - Parâmetros da rota (contractId)
 * @returns Response com stream SSE
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  /** Extrai o ID do contrato dos parâmetros da rota */
  const { contractId } = await params

  /** Verifica autenticação do usuário */
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    return new Response(
      JSON.stringify({ error: 'Não autenticado' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  const userId = session.user.id

  /** Verifica se o contrato existe e pertence ao usuário */
  const contract = await db.query.contracts.findFirst({
    where: and(
      eq(contracts.id, contractId),
      eq(contracts.userId, userId)
    ),
    columns: {
      id: true,
      processingStatus: true,
    },
  })

  if (!contract) {
    return new Response(
      JSON.stringify({ error: 'Contrato não encontrado' }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  /** Se a análise já terminou, retorna o status final direto (sem stream) */
  if (TERMINAL_STATUSES.includes(contract.processingStatus as any)) {
    const finalEvent: AnalysisStatusEvent = {
      status: contract.processingStatus!,
      progress: 100,
      message: getMessageForStatus(contract.processingStatus!),
      timestamp: new Date().toISOString(),
    }

    return new Response(
      formatSSEEvent(finalEvent, 'status'),
      {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      }
    )
  }

  /** Cria o stream SSE com polling do banco de dados */
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const startTime = Date.now()

      /** Flag para controlar se a conexão ainda está ativa */
      let isActive = true

      /** Referência do intervalo para cleanup */
      let pollInterval: ReturnType<typeof setInterval> | null = null

      /**
       * Envia um evento SSE para o cliente.
       *
       * @param event - Dados do evento
       * @param eventType - Tipo do evento SSE
       */
      const sendEvent = (event: AnalysisStatusEvent, eventType: string = 'status') => {
        if (!isActive) return

        try {
          const formatted = formatSSEEvent(event, eventType)
          controller.enqueue(encoder.encode(formatted))
        } catch {
          /** Se o envio falhar, a conexão foi encerrada pelo cliente */
          isActive = false
          cleanup()
        }
      }

      /**
       * Limpa recursos e encerra a conexão.
       * Remove o intervalo de polling e fecha o stream.
       */
      const cleanup = () => {
        isActive = false
        if (pollInterval) {
          clearInterval(pollInterval)
          pollInterval = null
        }
        try {
          controller.close()
        } catch {
          /** Stream já fechado — ignorar */
        }
      }

      /** Envia evento inicial com o status atual */
      sendEvent({
        status: contract.processingStatus!,
        progress: getProgressForStatus(contract.processingStatus!),
        message: getMessageForStatus(contract.processingStatus!),
        timestamp: new Date().toISOString(),
      })

      /** Inicia polling do banco de dados */
      pollInterval = setInterval(async () => {
        /** Verifica timeout máximo da conexão */
        if (Date.now() - startTime > MAX_CONNECTION_MS) {
          sendEvent({
            status: 'timeout',
            progress: 0,
            message: 'Tempo limite de conexão atingido. Recarregue para continuar acompanhando.',
            timestamp: new Date().toISOString(),
          }, 'timeout')

          cleanup()
          return
        }

        try {
          /** Consulta o status atualizado no banco de dados */
          const updated = await db.query.contracts.findFirst({
            where: and(
              eq(contracts.id, contractId),
              eq(contracts.userId, userId)
            ),
            columns: {
              processingStatus: true,
              riskScore: true,
              riskLevel: true,
            },
          })

          if (!updated) {
            /** Contrato foi deletado durante o processamento */
            sendEvent({
              status: 'not_found',
              progress: 0,
              message: 'Contrato não encontrado. Pode ter sido removido.',
              timestamp: new Date().toISOString(),
            }, 'error')

            cleanup()
            return
          }

          const currentStatus = updated.processingStatus || 'pending'

          /** Envia atualização de status */
          sendEvent({
            status: currentStatus,
            progress: getProgressForStatus(currentStatus),
            message: getMessageForStatus(currentStatus),
            timestamp: new Date().toISOString(),
            metadata: TERMINAL_STATUSES.includes(currentStatus as any)
              ? { riskScore: updated.riskScore, riskLevel: updated.riskLevel }
              : undefined,
          })

          /** Se chegou em status terminal, encerra a conexão */
          if (TERMINAL_STATUSES.includes(currentStatus as any)) {
            /** Pequeno delay para garantir que o evento foi entregue */
            setTimeout(() => cleanup(), 500)
          }
        } catch (error) {
          console.error(
            `[SSE] Erro ao consultar status do contrato ${contractId}:`,
            error
          )

          sendEvent({
            status: 'error',
            progress: 0,
            message: 'Erro interno ao consultar status.',
            timestamp: new Date().toISOString(),
          }, 'error')
        }
      }, POLL_INTERVAL_MS)

      /** Detecta quando o cliente fecha a conexão (via AbortSignal) */
      req.signal.addEventListener('abort', () => {
        cleanup()
      })
    },
  })

  /** Retorna o stream com headers corretos para SSE */
  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
