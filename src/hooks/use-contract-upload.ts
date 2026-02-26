'use client'

import { useState, useCallback } from 'react'

/** Estado do upload */
interface UploadState {
  /** Progresso de 0 a 100 */
  progress: number
  /** Se está fazendo upload */
  isUploading: boolean
  /** Erro, se houver */
  error: string | null
  /** Key do arquivo no S3 após upload */
  s3Key: string | null
}

/** Estado inicial do upload */
const INITIAL_STATE: UploadState = {
  progress: 0,
  isUploading: false,
  error: null,
  s3Key: null,
}

/**
 * Hook para gerenciar upload de contratos.
 *
 * Fluxo:
 * 1. Solicita presigned URL ao backend
 * 2. Faz upload direto ao S3 via PUT
 * 3. Rastreia progresso via XMLHttpRequest
 *
 * Isso evita o limite de 4.5MB do Vercel,
 * permitindo uploads de até 25MB.
 */
export function useContractUpload() {
  const [state, setState] = useState<UploadState>(INITIAL_STATE)

  /** Reseta o estado do upload */
  const reset = useCallback(() => {
    setState(INITIAL_STATE)
  }, [])

  /**
   * Faz upload de um arquivo de contrato.
   *
   * @param file - Arquivo PDF ou DOCX para upload
   * @returns Key do arquivo no S3
   */
  const upload = useCallback(async (file: File): Promise<string | null> => {
    setState({ progress: 0, isUploading: true, error: null, s3Key: null })

    try {
      /** Passo 1: Solicitar presigned URL ao backend */
      const presignedResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      })

      if (!presignedResponse.ok) {
        const error = await presignedResponse.json()
        throw new Error(error.error || 'Failed to get upload URL')
      }

      const { uploadUrl, key } = await presignedResponse.json()

      /** Passo 2: Upload direto ao S3 com rastreamento de progresso */
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        /** Rastrear progresso do upload */
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100)
            setState((prev) => ({ ...prev, progress }))
          }
        })

        /** Upload concluído com sucesso */
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        })

        /** Erro no upload */
        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'))
        })

        /** Enviar PUT request com o arquivo */
        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })

      /** Upload concluído — atualizar estado */
      setState({ progress: 100, isUploading: false, error: null, s3Key: key })
      return key
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      setState({ progress: 0, isUploading: false, error: message, s3Key: null })
      return null
    }
  }, [])

  return {
    ...state,
    upload,
    reset,
  }
}
