import type { Metadata } from 'next'
import { UploadForm } from '@/components/dashboard/upload-form'

/** Metadados da página de upload */
export const metadata: Metadata = {
  title: 'Upload Contract',
}

/**
 * Página de upload de novo contrato.
 *
 * Exibe a área de drag & drop para upload de PDFs/DOCXs
 * com validação de tipo e tamanho.
 */
export default function NewContractPage() {
  return <UploadForm />
}
