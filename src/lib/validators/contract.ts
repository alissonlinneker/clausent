import { z } from 'zod'

/**
 * Schema de criação de contrato — campos obrigatórios mínimos.
 *
 * O título e a categoria são obrigatórios para identificar o contrato.
 * Todos os demais campos são opcionais e podem ser preenchidos
 * durante o fluxo de edição ou extração automática do documento.
 */
export const createContractSchema = z.object({
  /** Título descritivo do contrato */
  title: z.string().min(1).max(500),

  /** Categoria do contrato — define o tipo de análise aplicada */
  category: z.enum(['saas', 'vendor', 'lease', 'insurance', 'other']),

  /** Nome da contraparte (empresa ou pessoa) */
  counterparty: z.string().max(255).optional(),

  /** Data de início da vigência (ISO 8601) */
  startDate: z.string().datetime().optional(),

  /** Data de término da vigência (ISO 8601) */
  endDate: z.string().datetime().optional(),

  /** Prazo de aviso prévio para cancelamento (em dias) */
  noticePeriodDays: z.number().int().min(0).optional(),

  /** Se o contrato renova automaticamente */
  autoRenew: z.boolean().optional(),

  /** Termos de renovação em texto livre */
  renewalTerms: z.string().optional(),

  /** Valor total do contrato */
  totalValue: z.string().optional(),

  /** Valor mensal recorrente */
  monthlyValue: z.string().optional(),

  /** Moeda no padrão ISO 4217 (ex: USD, BRL) — padrão USD */
  currency: z.string().length(3).default('USD'),

  /** URL do arquivo original do contrato no Blob Storage */
  originalFileUrl: z.string().url().optional(),
})

/**
 * Schema de atualização de contrato — todos os campos opcionais.
 * Permite atualização parcial (PATCH) de qualquer campo.
 */
export const updateContractSchema = createContractSchema.partial()

/** Tipo TypeScript inferido para criação de contrato */
export type CreateContractInput = z.infer<typeof createContractSchema>

/** Tipo TypeScript inferido para atualização de contrato */
export type UpdateContractInput = z.infer<typeof updateContractSchema>
