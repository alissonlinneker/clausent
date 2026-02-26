import { pgTable, uuid, varchar, text, integer, pgEnum } from 'drizzle-orm/pg-core'
import { contracts } from './contracts'

/** Nível de risco de uma cláusula */
export const clauseRiskLevelEnum = pgEnum('clause_risk_level', [
  'low', 'medium', 'high', 'critical',
])

/** Cláusulas individuais extraídas de um contrato */
export const contractClauses = pgTable('contract_clauses', {
  id: uuid('id').primaryKey().defaultRandom(),
  contractId: uuid('contract_id').references(() => contracts.id, { onDelete: 'cascade' }).notNull(),
  clauseType: varchar('clause_type', { length: 100 }).notNull(),
  text: text('text').notNull(),
  riskLevel: clauseRiskLevelEnum('risk_level').default('low').notNull(),
  positionStart: integer('position_start'),
  positionEnd: integer('position_end'),
})

export type ContractClause = typeof contractClauses.$inferSelect
export type NewContractClause = typeof contractClauses.$inferInsert
