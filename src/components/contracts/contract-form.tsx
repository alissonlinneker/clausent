'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Schema Zod para validação do formulário de contrato.
 * Define todos os campos obrigatórios e opcionais com suas regras.
 */
const contractFormSchema = z.object({
  /** Título do contrato — obrigatório, mínimo 3 caracteres */
  title: z.string().min(3, 'O título deve ter ao menos 3 caracteres'),

  /** Categoria do contrato — corresponde ao enum do banco */
  category: z.enum(['saas', 'vendor', 'lease', 'insurance', 'other']),

  /** Contraparte do contrato (empresa/pessoa com quem foi firmado) */
  counterparty: z.string().optional(),

  /** Data de início do contrato — formato ISO */
  startDate: z.string().optional(),

  /** Data de encerramento do contrato — formato ISO */
  endDate: z.string().optional(),

  /** Valor total do contrato */
  totalValue: z.string().optional(),

  /** Valor mensal do contrato */
  monthlyValue: z.string().optional(),

  /** Se o contrato possui renovação automática */
  autoRenew: z.boolean().default(false),

  /** Moeda do contrato — padrão USD */
  currency: z.enum(['USD', 'EUR', 'GBP', 'BRL']).default('USD'),
})

/**
 * Tipo de input do formulário — usa z.input para capturar os tipos
 * ANTES dos defaults do Zod serem aplicados (campos com .default()
 * são opcionais no input mas obrigatórios no output).
 */
export type ContractFormValues = z.input<typeof contractFormSchema>

/**
 * Mapeamento de categorias para labels legíveis.
 * Usado nos selects para exibir nomes amigáveis.
 */
const CATEGORY_OPTIONS = [
  { value: 'saas', label: 'SaaS / Software' },
  { value: 'vendor', label: 'Vendor / Fornecedor' },
  { value: 'lease', label: 'Lease / Locação' },
  { value: 'insurance', label: 'Insurance / Seguro' },
  { value: 'other', label: 'Other / Outro' },
] as const

/**
 * Opções de moeda disponíveis para o contrato.
 */
const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'BRL', label: 'BRL (R$)' },
] as const

/**
 * Props do componente ContractForm.
 */
interface ContractFormProps {
  /** Callback disparado ao submeter o formulário com dados válidos */
  onSubmit: (data: ContractFormValues) => void
  /** Valores iniciais para pré-popular o formulário (ex: dados extraídos do upload) */
  defaultValues?: Partial<ContractFormValues>
  /** Indica se o formulário está em estado de carregamento */
  isLoading?: boolean
  /** Classes CSS adicionais para o container */
  className?: string
}

/**
 * Formulário de criação/edição de contrato.
 *
 * Utiliza react-hook-form com zodResolver para validação type-safe.
 * Todos os campos seguem o schema Drizzle de contratos.
 *
 * Campos:
 * - title: Título do contrato (obrigatório)
 * - category: Categoria (SaaS, Vendor, Lease, Insurance, Other)
 * - counterparty: Contraparte / empresa
 * - startDate / endDate: Datas de vigência
 * - totalValue / monthlyValue: Valores financeiros
 * - autoRenew: Toggle de renovação automática
 * - currency: Moeda (USD, EUR, GBP, BRL)
 *
 * O componente delega a lógica de submissão ao pai via callback onSubmit.
 */
export function ContractForm({
  onSubmit,
  defaultValues,
  isLoading = false,
  className,
}: ContractFormProps) {
  /** Inicializar react-hook-form com zodResolver e valores padrão */
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      title: '',
      category: 'other',
      counterparty: '',
      startDate: '',
      endDate: '',
      totalValue: '',
      monthlyValue: '',
      autoRenew: false,
      currency: 'USD',
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-6', className)}
      >
        {/* Seção: Informações Básicas */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Basic Information
          </h3>

          {/* Campo: Título do contrato */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Contract Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. AWS Enterprise Agreement 2026"
                    className="border-slate-200 focus-visible:border-indigo-400 focus-visible:ring-indigo-500/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Grid de 2 colunas para categoria e contraparte */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Campo: Categoria */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full border-slate-200">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Contraparte */}
            <FormField
              control={form.control}
              name="counterparty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">Counterparty</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Amazon Web Services"
                      className="border-slate-200 focus-visible:border-indigo-400 focus-visible:ring-indigo-500/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Seção: Datas de Vigência */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Contract Period
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Campo: Data de início */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">Start Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="border-slate-200 focus-visible:border-indigo-400 focus-visible:ring-indigo-500/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Data de encerramento */}
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">End Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="border-slate-200 focus-visible:border-indigo-400 focus-visible:ring-indigo-500/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Toggle: Renovação automática */}
          <FormField
            control={form.control}
            name="autoRenew"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-slate-700">Auto-Renew</FormLabel>
                  <FormDescription className="text-xs text-slate-400">
                    This contract renews automatically at the end of the term
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Seção: Valores Financeiros */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Financial Details
          </h3>

          {/* Grid de 3 colunas: moeda, valor total, valor mensal */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Campo: Moeda */}
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full border-slate-200">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Valor total */}
            <FormField
              control={form.control}
              name="totalValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">Total Value</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="border-slate-200 focus-visible:border-indigo-400 focus-visible:ring-indigo-500/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Valor mensal */}
            <FormField
              control={form.control}
              name="monthlyValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">Monthly Value</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="border-slate-200 focus-visible:border-indigo-400 focus-visible:ring-indigo-500/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Botão de submit */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          size="lg"
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
      </form>
    </Form>
  )
}
