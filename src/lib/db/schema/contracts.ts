import {
  pgTable, uuid, varchar, text, timestamp, integer,
  boolean, jsonb, pgEnum, numeric,
} from 'drizzle-orm/pg-core'
import { organizations } from './organizations'

/** Enum das categorias de contrato */
export const contractCategoryEnum = pgEnum('contract_category', [
  'saas', 'vendor', 'lease', 'insurance', 'other',
])

/** Enum dos status de contrato */
export const contractStatusEnum = pgEnum('contract_status', [
  'active', 'expiring', 'expired', 'renewed', 'cancelled',
])

/** Tabela principal de contratos */
export const contracts = pgTable('contracts', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  category: contractCategoryEnum('category').default('other').notNull(),
  status: contractStatusEnum('status').default('active').notNull(),
  counterparty: varchar('counterparty', { length: 255 }),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  noticePeriodDays: integer('notice_period_days'),
  autoRenew: boolean('auto_renew').default(false),
  renewalTerms: text('renewal_terms'),
  totalValue: numeric('total_value', { precision: 12, scale: 2 }),
  monthlyValue: numeric('monthly_value', { precision: 12, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('USD'),
  riskScore: integer('risk_score'),
  originalFileUrl: text('original_file_url'),
  extractedText: text('extracted_text'),
  aiSummary: jsonb('ai_summary'),
  processingStatus: varchar('processing_status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Contract = typeof contracts.$inferSelect
export type NewContract = typeof contracts.$inferInsert
