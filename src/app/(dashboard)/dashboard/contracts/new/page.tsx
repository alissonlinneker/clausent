'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload,
  FileText,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UploadZone } from '@/components/contracts/upload-zone'
import { ContractForm, type ContractFormValues } from '@/components/contracts/contract-form'
import { trpc } from '@/lib/trpc/react'
import { cn } from '@/lib/utils'

/**
 * Definição dos passos do stepper de criação de contrato.
 * Cada step possui ícone, label e descrição para o indicador visual.
 */
const STEPS = [
  {
    id: 1,
    label: 'Upload',
    description: 'Upload your contract file',
    icon: Upload,
  },
  {
    id: 2,
    label: 'Review',
    description: 'Review and fill contract details',
    icon: FileText,
  },
  {
    id: 3,
    label: 'Confirm',
    description: 'Review and confirm submission',
    icon: CheckCircle2,
  },
] as const

/**
 * Props do componente Stepper.
 */
interface StepperProps {
  /** Passo atual (1-indexed) */
  currentStep: number
}

/**
 * Componente visual do stepper — indica o progresso na criação do contrato.
 * Exibe 3 passos com ícones, labels e conectores.
 *
 * Estados visuais:
 * - Concluído: ícone de check verde (emerald)
 * - Atual: ícone indigo com ring
 * - Pendente: ícone cinza
 */
function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="relative">
      {/* Container dos steps com layout horizontal */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          /** Determinar se o step está completo, ativo ou pendente */
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id
          const Icon = step.icon

          return (
            <div key={step.id} className="flex flex-1 items-center">
              {/* Indicador do step */}
              <div className="flex flex-col items-center">
                {/* Círculo com ícone */}
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isCompleted && 'border-emerald-500 bg-emerald-500',
                    isCurrent && 'border-indigo-600 bg-indigo-600 ring-4 ring-indigo-100',
                    !isCompleted && !isCurrent && 'border-slate-200 bg-slate-50'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <Icon
                      className={cn(
                        'h-5 w-5 transition-colors',
                        isCurrent ? 'text-white' : 'text-slate-400'
                      )}
                    />
                  )}
                </div>

                {/* Label e descrição abaixo do ícone */}
                <div className="mt-3 text-center">
                  <p
                    className={cn(
                      'text-sm font-semibold transition-colors',
                      isCompleted && 'text-emerald-700',
                      isCurrent && 'text-indigo-700',
                      !isCompleted && !isCurrent && 'text-slate-400'
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="mt-0.5 hidden text-xs text-slate-400 sm:block">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Conector entre steps — não renderizar após o último */}
              {index < STEPS.length - 1 && (
                <div className="mx-2 mb-8 h-0.5 flex-1 sm:mx-4">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      currentStep > step.id
                        ? 'bg-emerald-400'
                        : 'bg-slate-200'
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Componente do Step 3 — Confirmação antes do envio.
 * Exibe um resumo dos dados preenchidos para revisão final.
 */
function ConfirmationStep({
  formData,
  fileUrl,
}: {
  formData: ContractFormValues
  fileUrl: string
}) {
  /**
   * Mapeamento de categorias para nomes legíveis.
   */
  const categoryLabels: Record<string, string> = {
    saas: 'SaaS / Software',
    vendor: 'Vendor / Fornecedor',
    lease: 'Lease / Locação',
    insurance: 'Insurance / Seguro',
    other: 'Other / Outro',
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho de confirmação */}
      <div className="rounded-xl bg-indigo-50/50 border border-indigo-100 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-indigo-900">
              Ready to submit
            </h3>
            <p className="text-xs text-indigo-600">
              Please review the details below before confirming.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de dados do contrato */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Título */}
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Title
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {formData.title}
          </p>
        </div>

        {/* Categoria */}
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Category
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {categoryLabels[formData.category] || formData.category}
          </p>
        </div>

        {/* Contraparte */}
        {formData.counterparty && (
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Counterparty
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {formData.counterparty}
            </p>
          </div>
        )}

        {/* Período */}
        {(formData.startDate || formData.endDate) && (
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Period
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {formData.startDate || '—'} to {formData.endDate || '—'}
            </p>
          </div>
        )}

        {/* Valor total */}
        {formData.totalValue && (
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Value
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {formData.currency} {parseFloat(formData.totalValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}

        {/* Valor mensal */}
        {formData.monthlyValue && (
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Monthly Value
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {formData.currency} {parseFloat(formData.monthlyValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}

        {/* Auto-Renew */}
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Auto-Renew
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {formData.autoRenew ? 'Yes' : 'No'}
          </p>
        </div>

        {/* Arquivo enviado */}
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Uploaded File
          </p>
          <p className="mt-1 truncate text-sm font-medium text-indigo-600">
            {fileUrl.split('/').pop() || 'Contract file'}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Página de criação de novo contrato — fluxo em 3 etapas.
 *
 * Stepper visual:
 * 1. Upload → Upload do arquivo PDF/DOCX via UploadZone
 * 2. Review → Formulário de dados do contrato via ContractForm
 * 3. Confirm → Revisão final com resumo dos dados + submissão
 *
 * Após confirmação, o contrato é criado via tRPC (contract.create)
 * e o usuário é redirecionado para a listagem de contratos.
 *
 * Rota: /dashboard/contracts/new
 */
export default function NewContractPage() {
  const router = useRouter()

  /** Passo atual do stepper (1, 2 ou 3) */
  const [currentStep, setCurrentStep] = useState(1)

  /** URL do arquivo após upload no step 1 */
  const [fileUrl, setFileUrl] = useState<string>('')

  /** Dados do formulário preenchidos no step 2 */
  const [formData, setFormData] = useState<ContractFormValues | null>(null)

  /** Mutation tRPC para criar o contrato no banco */
  const createContract = trpc.contract.create.useMutation({
    onSuccess: () => {
      /** Redirecionar para a lista de contratos após sucesso */
      router.push('/dashboard/contracts')
    },
  })

  /**
   * Handler do step 1 — Upload concluído.
   * Salva a URL e avança para o step 2.
   */
  const handleUploadComplete = useCallback((url: string) => {
    setFileUrl(url)

    /** Pequeno delay para o usuário ver o estado de sucesso */
    setTimeout(() => {
      setCurrentStep(2)
    }, 800)
  }, [])

  /**
   * Handler do step 2 — Formulário preenchido.
   * Salva os dados e avança para o step 3 (confirmação).
   */
  const handleFormSubmit = useCallback((data: ContractFormValues) => {
    setFormData(data)
    setCurrentStep(3)
  }, [])

  /**
   * Handler do step 3 — Confirmação final.
   * Envia os dados para o backend via tRPC.
   */
  const handleConfirm = useCallback(() => {
    if (!formData) return

    /**
     * Converte datas do formato "YYYY-MM-DD" (input date) para ISO 8601
     * completo com timezone, conforme esperado pelo validator z.string().datetime().
     */
    const toISODate = (dateStr?: string) =>
      dateStr ? new Date(dateStr).toISOString() : undefined

    createContract.mutate({
      title: formData.title,
      category: formData.category,
      counterparty: formData.counterparty || undefined,
      startDate: toISODate(formData.startDate),
      endDate: toISODate(formData.endDate),
      totalValue: formData.totalValue || undefined,
      monthlyValue: formData.monthlyValue || undefined,
      autoRenew: formData.autoRenew,
      currency: formData.currency,
      originalFileUrl: fileUrl || undefined,
    })
  }, [formData, fileUrl, createContract])

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Cabeçalho da página */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/contracts')}
          className="mb-4 -ml-2 text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Contracts
        </Button>

        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          New Contract
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Upload a contract file and fill in the details to start tracking.
        </p>
      </div>

      {/* Stepper visual */}
      <Stepper currentStep={currentStep} />

      {/* Conteúdo do step atual */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="pt-6">
          {/* Step 1: Upload do arquivo */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="mb-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  Upload Contract
                </h2>
                <p className="text-sm text-slate-500">
                  Start by uploading the contract document. We accept PDF and DOCX files.
                </p>
              </div>
              <UploadZone onUploadComplete={handleUploadComplete} />
            </div>
          )}

          {/* Step 2: Formulário de dados */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="mb-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  Contract Details
                </h2>
                <p className="text-sm text-slate-500">
                  Fill in the contract information below. Fields will be auto-populated when analysis is available.
                </p>
              </div>
              <ContractForm
                onSubmit={handleFormSubmit}
                defaultValues={formData ?? undefined}
              />
            </div>
          )}

          {/* Step 3: Confirmação e envio */}
          {currentStep === 3 && formData && (
            <div className="space-y-6">
              <div className="mb-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  Confirm & Submit
                </h2>
                <p className="text-sm text-slate-500">
                  Review the information below and confirm to create your contract.
                </p>
              </div>

              <ConfirmationStep formData={formData} fileUrl={fileUrl} />

              {/* Botões de navegação */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Edit
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={createContract.isPending}
                  className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {createContract.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Create Contract
                    </>
                  )}
                </Button>
              </div>

              {/* Exibir erro do tRPC se houver */}
              {createContract.isError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-700">
                    {createContract.error.message || 'An error occurred. Please try again.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navegação entre steps (botão de avançar no step 2) */}
          {currentStep === 2 && (
            <div className="mt-4 flex justify-start">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(1)}
                className="text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back to Upload
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
