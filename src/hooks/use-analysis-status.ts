// @ts-nocheck
'use client'

/**
 * Hook React para acompanhar o status de análise de um contrato via SSE.
 *
 * Consome o endpoint SSE `/api/analysis/[contractId]/status` e fornece
 * atualizações reativas sobre o progresso da análise de IA.
 *
 * Funcionalidades:
 * - Conexão automática ao montar o componente
 * - Reconexão automática em caso de erro (com backoff exponencial)
 * - Cleanup automático ao desmontar
 * - Tipagem completa do estado retornado
 *
 * @example
 * ```tsx
 * function AnalysisProgress({ contractId }: { contractId: string }) {
 *   const { status, progress, error, isComplete } = useAnalysisStatus(contractId)
 *
 *   if (isComplete) return <p>Análise concluída!</p>
 *   return <ProgressBar value={progress} />
 * }
 * ```
 */

import { useState, useEffect, useRef, useCallback } from 'react'

/* ---- Tipos ---- */

/** Possíveis status da análise */
type AnalysisStatus =
  | 'idle'
  | 'connecting'
  | 'pending'
  | 'extracting'
  | 'analyzing'
  | 'completed'
  | 'analyzed'
  | 'failed'
  | 'timeout'
  | 'error'

/** Evento recebido do servidor via SSE */
interface AnalysisStatusEvent {
  /** Status atual do processamento */
  status: string
  /** Percentual de progresso estimado (0-100) */
  progress: number
  /** Mensagem descritiva do passo atual */
  message: string
  /** Timestamp do evento */
  timestamp: string
  /** Dados extras opcionais */
  metadata?: Record<string, unknown>
}

/** Retorno do hook useAnalysisStatus */
interface UseAnalysisStatusReturn {
  /** Status atual da análise */
  status: AnalysisStatus
  /** Percentual de progresso (0-100) */
  progress: number
  /** Mensagem descritiva do estado atual */
  message: string
  /** Erro ocorrido na conexão SSE, se houver */
  error: string | null
  /** Indica se a análise chegou a um status final (completed/failed) */
  isComplete: boolean
  /** Indica se está conectado ao stream */
  isConnected: boolean
  /** Metadados adicionais do último evento */
  metadata: Record<string, unknown> | null
  /** Força reconexão manual ao stream */
  reconnect: () => void
}

/* ---- Constantes ---- */

/** Número máximo de tentativas de reconexão */
const MAX_RECONNECT_ATTEMPTS = 5

/** Delay base para reconexão (em ms) — usado com backoff exponencial */
const BASE_RECONNECT_DELAY_MS = 1_000

/** Delay máximo de reconexão (em ms) */
const MAX_RECONNECT_DELAY_MS = 30_000

/** Status que indicam que a análise terminou */
const TERMINAL_STATUSES: AnalysisStatus[] = ['completed', 'analyzed', 'failed']

/* ---- Hook ---- */

/**
 * Hook para acompanhar o status de análise de um contrato via SSE.
 *
 * Conecta ao endpoint de Server-Sent Events e mantém o estado
 * atualizado conforme eventos chegam do servidor.
 *
 * @param contractId - ID do contrato a acompanhar (null/undefined desabilita)
 * @param options - Opções de configuração
 * @param options.enabled - Se false, não inicia a conexão (padrão: true)
 * @returns Estado reativo com status, progresso, erros e controles
 */
export function useAnalysisStatus(
  contractId: string | null | undefined,
  options: { enabled?: boolean } = {}
): UseAnalysisStatusReturn {
  const { enabled = true } = options

  /* ---- Estado reativo ---- */

  const [status, setStatus] = useState<AnalysisStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [metadata, setMetadata] = useState<Record<string, unknown> | null>(null)

  /* ---- Refs para controle interno ---- */

  /** Referência ao EventSource ativo */
  const eventSourceRef = useRef<EventSource | null>(null)

  /** Contador de tentativas de reconexão */
  const reconnectAttemptsRef = useRef(0)

  /** Timer de reconexão pendente */
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** Flag para evitar reconexão após cleanup intencional */
  const isCleaningUpRef = useRef(false)

  /* ---- Derivações ---- */

  /** Verifica se o status é terminal (análise finalizada) */
  const isComplete = TERMINAL_STATUSES.includes(status)

  /* ---- Funções internas ---- */

  /**
   * Limpa recursos da conexão SSE.
   * Fecha o EventSource e cancela timers de reconexão.
   */
  const cleanup = useCallback(() => {
    isCleaningUpRef.current = true

    /** Cancela timer de reconexão pendente */
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }

    /** Fecha o EventSource */
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    setIsConnected(false)
  }, [])

  /**
   * Agenda uma tentativa de reconexão com backoff exponencial.
   *
   * O delay aumenta exponencialmente a cada tentativa:
   * 1s → 2s → 4s → 8s → 16s (máximo 30s)
   *
   * Após MAX_RECONNECT_ATTEMPTS, para de tentar e reporta erro.
   */
  const scheduleReconnect = useCallback(() => {
    /** Não reconectar se estamos fazendo cleanup ou já atingimos o limite */
    if (isCleaningUpRef.current) return

    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      setError('Número máximo de tentativas de reconexão atingido.')
      setStatus('error')
      return
    }

    /** Calcula delay com backoff exponencial */
    const delay = Math.min(
      BASE_RECONNECT_DELAY_MS * Math.pow(2, reconnectAttemptsRef.current),
      MAX_RECONNECT_DELAY_MS
    )

    reconnectAttemptsRef.current += 1

    reconnectTimerRef.current = setTimeout(() => {
      if (!isCleaningUpRef.current) {
        connect()
      }
    }, delay)
  }, [])

  /**
   * Estabelece conexão SSE com o servidor.
   *
   * Cria um EventSource apontando para o endpoint de status
   * e configura handlers para os diferentes tipos de evento.
   */
  const connect = useCallback(() => {
    if (!contractId || !enabled) return

    /** Limpa conexão anterior se existir */
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    isCleaningUpRef.current = false
    setStatus('connecting')
    setError(null)

    /** Monta URL do endpoint SSE */
    const url = `/api/analysis/${contractId}/status`

    /** Cria nova conexão EventSource */
    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    /**
     * Handler de abertura — conexão estabelecida com sucesso.
     * Reseta o contador de reconexão.
     */
    eventSource.onopen = () => {
      setIsConnected(true)
      reconnectAttemptsRef.current = 0
    }

    /**
     * Handler para eventos de status.
     * Atualiza o estado reativo com os dados recebidos.
     */
    eventSource.addEventListener('status', (event: MessageEvent) => {
      try {
        const data: AnalysisStatusEvent = JSON.parse(event.data)

        setStatus(data.status as AnalysisStatus)
        setProgress(data.progress)
        setMessage(data.message)

        if (data.metadata) {
          setMetadata(data.metadata)
        }

        /** Se chegou em status terminal, fecha a conexão */
        if (TERMINAL_STATUSES.includes(data.status as AnalysisStatus)) {
          cleanup()
        }
      } catch (parseError) {
        console.error('[useAnalysisStatus] Erro ao parsear evento:', parseError)
      }
    })

    /**
     * Handler para eventos de timeout.
     * O servidor encerrou a conexão por tempo limite.
     */
    eventSource.addEventListener('timeout', (event: MessageEvent) => {
      try {
        const data: AnalysisStatusEvent = JSON.parse(event.data)
        setStatus('timeout')
        setMessage(data.message)
      } catch {
        setStatus('timeout')
        setMessage('Conexão expirou por timeout.')
      }

      cleanup()
    })

    /**
     * Handler para eventos de erro do servidor.
     * Diferente de erros de conexão — estes são erros de negócio.
     */
    eventSource.addEventListener('error', (event: MessageEvent) => {
      /** Evento custom de erro (com data) vs erro de conexão (sem data) */
      if (event.data) {
        try {
          const data: AnalysisStatusEvent = JSON.parse(event.data)
          setError(data.message)
          setStatus('error')
        } catch {
          setError('Erro desconhecido no stream.')
          setStatus('error')
        }
        cleanup()
      }
    })

    /**
     * Handler genérico de erro do EventSource.
     * Trata erros de conexão (rede, servidor caiu, etc.).
     */
    eventSource.onerror = () => {
      setIsConnected(false)

      /** Não reconectar se o status já é terminal */
      if (isComplete || isCleaningUpRef.current) return

      /** Fecha a conexão atual e agenda reconexão */
      eventSource.close()
      eventSourceRef.current = null

      scheduleReconnect()
    }
  }, [contractId, enabled, cleanup, scheduleReconnect])

  /* ---- Efeito principal — gerencia ciclo de vida da conexão ---- */

  useEffect(() => {
    /** Não conectar se desabilitado ou sem contractId */
    if (!contractId || !enabled) {
      setStatus('idle')
      setProgress(0)
      setMessage('')
      setError(null)
      return
    }

    /** Reseta estado e inicia conexão */
    reconnectAttemptsRef.current = 0
    connect()

    /** Cleanup ao desmontar ou quando dependências mudam */
    return () => {
      cleanup()
    }
  }, [contractId, enabled, connect, cleanup])

  /* ---- Função pública de reconexão manual ---- */

  /**
   * Força uma reconexão ao stream SSE.
   * Útil quando o usuário quer tentar novamente após erro.
   */
  const reconnect = useCallback(() => {
    cleanup()
    reconnectAttemptsRef.current = 0
    /** Pequeno delay para garantir que o cleanup completou */
    setTimeout(() => connect(), 100)
  }, [cleanup, connect])

  /* ---- Retorno do hook ---- */

  return {
    status,
    progress,
    message,
    error,
    isComplete,
    isConnected,
    metadata,
    reconnect,
  }
}
