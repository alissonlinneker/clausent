'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

/**
 * Possíveis estados do componente de upload.
 *
 * idle      → Nenhum arquivo selecionado, aguardando interação
 * selected  → Arquivo selecionado, aguardando confirmação de upload
 * uploading → Upload em andamento, exibindo progress bar
 * success   → Upload concluído com sucesso
 * error     → Ocorreu um erro durante o upload
 */
type UploadState = 'idle' | 'selected' | 'uploading' | 'success' | 'error'

/**
 * Dados do arquivo selecionado para exibição no preview.
 */
interface FilePreview {
  /** Nome original do arquivo */
  name: string
  /** Tamanho em bytes */
  size: number
  /** Tipo MIME do arquivo */
  type: string
  /** Referência ao objeto File para envio */
  file: File
}

/**
 * Props do componente UploadZone.
 */
interface UploadZoneProps {
  /** Callback disparado quando o upload é concluído com sucesso */
  onUploadComplete: (url: string) => void
  /** Classes CSS adicionais para o container */
  className?: string
}

/**
 * Formata o tamanho do arquivo em formato legível (KB, MB).
 * Exemplo: 1048576 → "1.00 MB"
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * Retorna o ícone de tipo de arquivo para exibição no preview.
 * Identifica PDF e DOCX pelo tipo MIME.
 */
function getFileTypeLabel(type: string): string {
  if (type === 'application/pdf') return 'PDF'
  if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'DOCX'
  return 'Arquivo'
}

/**
 * Componente de upload com drag-and-drop para contratos.
 *
 * Funcionalidades:
 * - Área de drop com feedback visual (borda pontilhada indigo)
 * - Preview do arquivo selecionado (nome, tamanho, tipo)
 * - Progress bar simulada durante o upload para melhor UX
 * - Estados visuais distintos: idle, selected, uploading, success, error
 * - Suporta PDF e DOCX apenas
 * - Limite de 10MB
 *
 * O componente dispara onUploadComplete(url) quando o upload é bem-sucedido,
 * permitindo que o componente pai (ex: formulário de contrato) receba a URL.
 */
export function UploadZone({ onUploadComplete, className }: UploadZoneProps) {
  /** Estado atual do fluxo de upload */
  const [state, setState] = useState<UploadState>('idle')

  /** Dados do arquivo selecionado para preview */
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null)

  /** Progresso do upload (0-100) — simulado para melhor UX */
  const [progress, setProgress] = useState(0)

  /** Mensagem de erro para exibição */
  const [errorMessage, setErrorMessage] = useState<string>('')

  /** Controle do estado de drag over para feedback visual */
  const [isDragOver, setIsDragOver] = useState(false)

  /** Referência ao input de arquivo oculto */
  const inputRef = useRef<HTMLInputElement>(null)

  /** Tipos MIME aceitos para validação no frontend */
  const ACCEPTED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]

  /** Limite de 10MB em bytes */
  const MAX_SIZE = 10 * 1024 * 1024

  /**
   * Valida o arquivo selecionado antes de prosseguir.
   * Verifica tipo MIME e tamanho máximo.
   * Retorna true se válido, false caso contrário (com erro setado).
   */
  const validateFile = useCallback((file: File): boolean => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMessage('Tipo de arquivo não suportado. Envie PDF ou DOCX.')
      setState('error')
      return false
    }

    if (file.size > MAX_SIZE) {
      setErrorMessage('Arquivo excede o limite de 10MB.')
      setState('error')
      return false
    }

    return true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Processa o arquivo selecionado — valida e atualiza o preview.
   * Chamado tanto pelo input quanto pelo drop.
   */
  const handleFileSelect = useCallback((file: File) => {
    if (!validateFile(file)) return

    setFilePreview({
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    })

    setErrorMessage('')
    setState('selected')
  }, [validateFile])

  /**
   * Handler para mudança no input de arquivo.
   * Extrai o primeiro arquivo selecionado e processa.
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  /**
   * Handlers de drag-and-drop.
   * Controlam o estado visual durante o arrasto e processam o arquivo no drop.
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  /**
   * Executa o upload do arquivo para a API /api/upload.
   * Simula uma progress bar para melhor experiência do usuário,
   * já que o XMLHttpRequest não é necessário aqui.
   */
  const handleUpload = useCallback(async () => {
    if (!filePreview) return

    setState('uploading')
    setProgress(0)

    /** Simulação de progresso para UX — incrementa gradualmente */
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 200)

    try {
      /** Preparar FormData com o arquivo para envio */
      const formData = new FormData()
      formData.append('file', filePreview.file)

      /** Enviar para a API de upload */
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      /** Limpar intervalo de progresso simulado */
      clearInterval(progressInterval)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao fazer upload')
      }

      const data = await response.json()

      /** Upload concluído — atualizar progresso para 100% */
      setProgress(100)
      setState('success')

      /** Notificar o componente pai com a URL do arquivo */
      onUploadComplete(data.url)
    } catch (err) {
      clearInterval(progressInterval)
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao fazer upload')
      setState('error')
      setProgress(0)
    }
  }, [filePreview, onUploadComplete])

  /**
   * Reseta o estado do componente para permitir novo upload.
   * Limpa arquivo, progresso, erro e volta ao estado idle.
   */
  const handleReset = useCallback(() => {
    setState('idle')
    setFilePreview(null)
    setProgress(0)
    setErrorMessage('')
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }, [])

  return (
    <div className={cn('w-full', className)}>
      {/* Input de arquivo oculto — ativado pelo clique na área de drop */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleInputChange}
        className="hidden"
        aria-label="Selecionar arquivo de contrato"
      />

      {/* Estado idle: Área de drop para seleção de arquivo */}
      {state === 'idle' && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'group relative flex w-full cursor-pointer flex-col items-center justify-center',
            'rounded-xl border-2 border-dashed p-10 transition-all duration-300',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
            isDragOver
              ? 'border-indigo-500 bg-indigo-50/80 scale-[1.02]'
              : 'border-slate-300 bg-slate-50/50 hover:border-indigo-400 hover:bg-indigo-50/30'
          )}
        >
          {/* Ícone central com efeito de hover */}
          <div
            className={cn(
              'mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300',
              isDragOver
                ? 'bg-indigo-100 scale-110'
                : 'bg-indigo-50 group-hover:bg-indigo-100 group-hover:scale-105'
            )}
          >
            <Upload
              className={cn(
                'h-8 w-8 transition-colors duration-300',
                isDragOver ? 'text-indigo-600' : 'text-indigo-400 group-hover:text-indigo-600'
              )}
            />
          </div>

          {/* Texto principal com destaque na ação clicável */}
          <p className="mb-1 text-sm font-medium text-slate-700">
            Drop your contract here or{' '}
            <span className="text-indigo-600 underline decoration-indigo-300 underline-offset-2">
              click to browse
            </span>
          </p>

          {/* Informações sobre formatos e limite */}
          <p className="text-xs text-slate-400">
            PDF or DOCX up to 10MB
          </p>
        </button>
      )}

      {/* Estado selected: Preview do arquivo com opção de upload ou troca */}
      {state === 'selected' && filePreview && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            {/* Ícone representando o tipo do arquivo */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>

            {/* Informações do arquivo */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {filePreview.name}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium">
                  {getFileTypeLabel(filePreview.type)}
                </span>
                <span>{formatFileSize(filePreview.size)}</span>
              </div>
            </div>

            {/* Botão para remover o arquivo selecionado */}
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Remover arquivo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Botões de ação */}
          <div className="mt-5 flex gap-3">
            <Button
              onClick={handleUpload}
              className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Contract
            </Button>
            <Button
              variant="outline"
              onClick={() => inputRef.current?.click()}
              className="border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Change File
            </Button>
          </div>
        </div>
      )}

      {/* Estado uploading: Progress bar durante o envio */}
      {state === 'uploading' && filePreview && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-6">
          <div className="flex items-center gap-4">
            {/* Spinner de loading */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {filePreview.name}
              </p>
              <p className="mt-0.5 text-xs text-indigo-600">
                Uploading... {Math.round(progress)}%
              </p>

              {/* Barra de progresso */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-indigo-100">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estado success: Upload concluído */}
      {state === 'success' && filePreview && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-6">
          <div className="flex items-center gap-4">
            {/* Ícone de sucesso */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {filePreview.name}
              </p>
              <p className="mt-0.5 text-xs text-emerald-600 font-medium">
                Upload completed successfully
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estado error: Exibir mensagem de erro com opção de retry */}
      {state === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-6">
          <div className="flex items-start gap-4">
            {/* Ícone de erro */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-red-800">
                Upload failed
              </p>
              <p className="mt-0.5 text-xs text-red-600">
                {errorMessage}
              </p>

              {/* Botão para tentar novamente */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="mt-3 border-red-200 text-red-700 hover:bg-red-50"
              >
                Try again
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
