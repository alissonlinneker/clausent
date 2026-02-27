'use client'

import { useState, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useContractUpload } from '@/hooks/use-contract-upload'
import { cn } from '@/lib/utils'

/** Tipos MIME aceitos */
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

/** Tamanho máximo: 25MB */
const MAX_SIZE = 25 * 1024 * 1024

/**
 * Formulário de upload de contrato com drag & drop.
 *
 * Suporta:
 * - Drag & drop de arquivos
 * - Clique para selecionar arquivo
 * - Validação de tipo (PDF, DOCX) e tamanho (25MB)
 * - Barra de progresso durante upload
 * - Upload direto ao S3 via presigned URL
 */
export function UploadForm() {
  const t = useTranslations('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)

  /** Estado de drag */
  const [isDragging, setIsDragging] = useState(false)
  /** Arquivo selecionado */
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  /** Erro de validação */
  const [validationError, setValidationError] = useState<string | null>(null)

  /** Hook de upload */
  const { progress, isUploading, error: uploadError, s3Key, upload, reset } = useContractUpload()

  /** Validar e selecionar arquivo */
  const handleFile = useCallback((file: File) => {
    setValidationError(null)

    /** Verificar tipo MIME */
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setValidationError(t('invalidFormat'))
      return
    }

    /** Verificar tamanho */
    if (file.size > MAX_SIZE) {
      setValidationError(t('fileTooLarge'))
      return
    }

    setSelectedFile(file)
  }, [t])

  /** Handlers de drag & drop */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  /** Handler de seleção via input */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  /** Iniciar upload */
  const handleUpload = useCallback(async () => {
    if (!selectedFile) return
    await upload(selectedFile)
  }, [selectedFile, upload])

  /** Remover arquivo selecionado */
  const handleRemove = useCallback(() => {
    setSelectedFile(null)
    setValidationError(null)
    reset()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [reset])

  /** Formatar tamanho do arquivo */
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('subtitle')}</p>
      </div>

      {/* Área de drag & drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={cn(
          'rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-200',
          isDragging
            ? 'border-teal-400 bg-teal-50'
            : selectedFile
              ? 'border-slate-200 bg-white cursor-default'
              : 'border-slate-300 bg-white hover:border-teal-400 hover:bg-teal-50/30',
          'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]'
        )}
      >
        {/* Input oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleInputChange}
          className="hidden"
        />

        {s3Key ? (
          /** Upload concluído */
          <div className="space-y-3">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
            <p className="text-lg font-semibold text-slate-900">{t('success')}</p>
            <p className="text-sm text-slate-500">
              {selectedFile?.name}
            </p>
            <Button
              variant="outline"
              onClick={handleRemove}
              className="rounded-xl"
            >
              {t('uploadAnother')}
            </Button>
          </div>
        ) : selectedFile ? (
          /** Arquivo selecionado — pronto para upload */
          <div className="space-y-4">
            <div className="flex items-center gap-4 justify-center">
              <FileText className="h-10 w-10 text-teal-600" />
              <div className="text-left">
                <p className="font-medium text-slate-900">{selectedFile.name}</p>
                <p className="text-xs text-slate-400">
                  {formatSize(selectedFile.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                disabled={isUploading}
                aria-label={t('removeFile')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Barra de progresso */}
            {isUploading && (
              <div className="w-full max-w-xs mx-auto">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {t('uploading')} {progress}%
                </p>
              </div>
            )}

            {/* Botão de upload */}
            {!isUploading && (
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  handleUpload()
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2"
              >
                <Upload className="h-4 w-4" />
                {t('title')}
              </Button>
            )}
          </div>
        ) : (
          /** Estado vazio — drag & drop */
          <div className="space-y-3">
            <Upload className="h-12 w-12 text-slate-300 mx-auto" />
            <p className="text-lg font-medium text-slate-600">
              {t('dragDrop')}
            </p>
            <p className="text-sm text-slate-400">
              {t('or')}{' '}
              <span className="text-teal-600 font-medium">{t('browse')}</span>
            </p>
            <p className="text-xs text-slate-400">{t('supportedFormats')}</p>
          </div>
        )}
      </div>

      {/* Erros */}
      {(validationError || uploadError) && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {validationError || uploadError}
        </div>
      )}
    </div>
  )
}
