import {
  pgTable, uuid, varchar, text, timestamp, integer,
  boolean, jsonb, pgEnum, numeric,
} from 'drizzle-orm/pg-core'
import { user } from './users'

/** Enum das categorias de contrato */
export const contractCategoryEnum = pgEnum('contract_category', [
  'saas', 'vendor', 'lease', 'insurance', 'other',
])

/** Enum dos status de contrato */
export const contractStatusEnum = pgEnum('contract_status', [
  'active', 'expiring', 'expired', 'renewed', 'cancelled',
])

/**
 * Tabela principal de contratos.
 *
 * Cada contrato pertence a um usuário (não mais a uma organização).
 * Contém os dados extraídos do documento original, resumo gerado
 * por IA e metadados de processamento.
 */
export const contracts = pgTable('contracts', {
  /** Identificador único do contrato */
  id: uuid('id').primaryKey().defaultRandom(),

  /** Referência ao usuário dono deste contrato */
  userId: text('user_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),

  /** Título/nome do contrato */
  title: varchar('title', { length: 500 }).notNull(),

  /** Categoria do contrato (SaaS, fornecedor, aluguel, etc.) */
  category: contractCategoryEnum('category').default('other').notNull(),

  /** Status atual do contrato */
  status: contractStatusEnum('status').default('active').notNull(),

  /** Nome da contraparte/fornecedor */
  counterparty: varchar('counterparty', { length: 255 }),

  /** Data de início do contrato */
  startDate: timestamp('start_date'),

  /** Data de término do contrato */
  endDate: timestamp('end_date'),

  /** Prazo de aviso prévio para cancelamento (em dias) */
  noticePeriodDays: integer('notice_period_days'),

  /** Indica se o contrato possui renovação automática */
  autoRenew: boolean('auto_renew').default(false),

  /** Termos/condições de renovação */
  renewalTerms: text('renewal_terms'),

  /** Valor total do contrato */
  totalValue: numeric('total_value', { precision: 12, scale: 2 }),

  /** Valor mensal do contrato */
  monthlyValue: numeric('monthly_value', { precision: 12, scale: 2 }),

  /** Moeda (padrão: USD) */
  currency: varchar('currency', { length: 3 }).default('USD'),

  /** Score de risco calculado pela IA (0-100) */
  riskScore: integer('risk_score'),

  /** URL do arquivo original no armazenamento */
  originalFileUrl: text('original_file_url'),

  /** Texto extraído do documento */
  extractedText: text('extracted_text'),

  /** Resumo gerado pela IA (formato JSON estruturado) */
  aiSummary: jsonb('ai_summary'),

  /** Status do processamento do documento (pending, processing, done, error) */
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
