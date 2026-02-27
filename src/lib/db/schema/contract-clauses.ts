import { pgTable, uuid, varchar, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { contracts } from './contracts'

/** Nível de risco de uma cláusula */
export const clauseRiskLevelEnum = pgEnum('clause_risk_level', [
  'low', 'medium', 'high', 'critical',
])

/**
 * Tabela de cláusulas extraídas de contratos.
 *
 * Cada cláusula representa um trecho relevante identificado
 * pela IA durante a análise do documento. Inclui avaliação de
 * risco e sugestões de melhoria geradas automaticamente.
 */
export const contractClauses = pgTable('contract_clauses', {
  /** Identificador único da cláusula */
  id: uuid('id').primaryKey().defaultRandom(),

  /** Referência ao contrato de origem */
  contractId: uuid('contract_id')
    .references(() => contracts.id, { onDelete: 'cascade' })
    .notNull(),

  /** Título descritivo da cláusula */
  title: varchar('title', { length: 255 }),

  /** Tipo/classificação da cláusula (ex: 'rescisão', 'confidencialidade') */
  clauseType: varchar('clause_type', { length: 100 }).notNull(),

  /** Conteúdo textual completo da cláusula */
  content: text('content').notNull(),

  /** Seção do documento onde a cláusula se encontra */
  section: varchar('section', { length: 100 }),

  /** Nível de risco avaliado pela IA */
  riskLevel: clauseRiskLevelEnum('risk_level').default('low').notNull(),

  /** Sugestão de melhoria gerada pela IA */
  aiSuggestion: text('ai_suggestion'),

  /** Posição inicial no texto extraído (para highlight) */
  positionStart: integer('position_start'),

  /** Posição final no texto extraído (para highlight) */
  positionEnd: integer('position_end'),

  /** Data de criação do registro */
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/** Tipo de leitura — cláusula já salva no banco */
export type ContractClause = typeof contractClauses.$inferSelect

/** Tipo de inserção — dados para criar uma cláusula */
export type NewContractClause = typeof contractClauses.$inferInsert
