import {
  pgTable, uuid, varchar, text, timestamp, integer,
  boolean, jsonb, pgEnum, numeric,
} from 'drizzle-orm/pg-core'
import { user } from './users'
import { organizations } from './organizations'

/** Enum das categorias de contrato */
export const contractCategoryEnum = pgEnum('contract_category', [
  'saas', 'vendor', 'lease', 'insurance', 'other',
])

/** Enum dos status de contrato */
export const contractStatusEnum = pgEnum('contract_status', [
  'active', 'expiring', 'expired', 'renewed', 'cancelled',
])

/** Enum de nível de risco do contrato */
export const riskLevelEnum = pgEnum('risk_level', [
  'low', 'medium', 'high', 'critical',
])

/**
 * Tabela principal de contratos.
 *
 * Cada contrato pertence a um usuário e opcionalmente a uma organização.
 * Contém os dados extraídos do documento original, resumo gerado
 * por IA, metadados de processamento e informações de risco.
 */
export const contracts = pgTable('contracts', {
  /** Identificador único do contrato */
  id: uuid('id').primaryKey().defaultRandom(),

  /** Referência à organização (para contratos dentro de workspaces) */
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'set null' }),

  /** Referência ao usuário que fez o upload do contrato */
  userId: text('user_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),

  /** Título/nome do contrato */
  title: varchar('title', { length: 500 }).notNull(),

  /** Nome do fornecedor/contraparte */
  vendor: varchar('vendor', { length: 255 }),

  /** Categoria do contrato (SaaS, fornecedor, aluguel, etc.) */
  category: contractCategoryEnum('category').default('other').notNull(),

  /** Nome original do arquivo enviado */
  fileName: varchar('file_name', { length: 255 }),

  /** URL do arquivo original no armazenamento */
  fileUrl: text('file_url'),

  /** Tamanho do arquivo em bytes */
  fileSize: integer('file_size'),

  /** Tipo MIME do arquivo (ex: application/pdf) */
  mimeType: varchar('mime_type', { length: 100 }),

  /** Status atual do contrato */
  status: contractStatusEnum('status').default('active').notNull(),

  /** Score de risco calculado pela IA (0-100) */
  riskScore: integer('risk_score'),

  /** Nível de risco classificado pela IA */
  riskLevel: riskLevelEnum('risk_level'),

  /** Data de início do contrato */
  startDate: timestamp('start_date'),

  /** Data de término do contrato */
  endDate: timestamp('end_date'),

  /** Valor total do contrato */
  totalValue: numeric('total_value', { precision: 12, scale: 2 }),

  /** Valor mensal do contrato */
  monthlyValue: numeric('monthly_value', { precision: 12, scale: 2 }),

  /** Indica se o contrato possui renovação automática */
  autoRenew: boolean('auto_renew').default(false),

  /** Prazo de aviso prévio para cancelamento (em dias) */
  noticePeriodDays: integer('notice_period_days'),

  /** Resumo gerado pela IA em texto */
  aiSummary: text('ai_summary'),

  /** Dados completos da análise da IA (formato JSON estruturado) */
  analysisData: jsonb('analysis_data'),

  /** Nome da contraparte/fornecedor (legado — usar vendor) */
  counterparty: varchar('counterparty', { length: 255 }),

  /** Moeda (padrão: USD) */
  currency: varchar('currency', { length: 3 }).default('USD'),

  /** Termos/condições de renovação */
  renewalTerms: text('renewal_terms'),

  /** URL do arquivo original no armazenamento (legado — usar fileUrl) */
  originalFileUrl: text('original_file_url'),

  /** Texto extraído do documento */
  extractedText: text('extracted_text'),

  /** Status do processamento do documento (pending, analyzing, analyzed, failed) */
  processingStatus: varchar('processing_status', { length: 50 }).default('pending'),

  /** Data de criação do registro */
  createdAt: timestamp('created_at').defaultNow().notNull(),

  /** Data da última atualização do registro */
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/** Tipo de leitura — contrato já salvo no banco */
export type Contract = typeof contracts.$inferSelect

/** Tipo de inserção — dados para criar um contrato */
export type NewContract = typeof contracts.$inferInsert
