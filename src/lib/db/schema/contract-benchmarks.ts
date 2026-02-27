import { pgTable, uuid, varchar, numeric, integer, timestamp } from 'drizzle-orm/pg-core'
import { contracts } from './contracts'

/**
 * Tabela de benchmarks de mercado.
 *
 * Armazena comparações entre os valores do contrato do usuário
 * e os dados médios de mercado para contratos similares.
 * Os benchmarks são gerados pela IA durante a análise do contrato.
 */
export const contractBenchmarks = pgTable('contract_benchmarks', {
  /** Identificador único do benchmark */
  id: uuid('id').primaryKey().defaultRandom(),

  /** Referência ao contrato analisado */
  contractId: uuid('contract_id')
    .references(() => contracts.id, { onDelete: 'cascade' })
    .notNull(),

  /** Categoria do benchmark (ex: 'saas', 'lease', 'insurance') */
  category: varchar('category', { length: 100 }),

  /** Nome da métrica comparada (ex: 'Preço mensal', 'Duração do contrato') */
  metric: varchar('metric', { length: 255 }).notNull(),

  /** Valor encontrado no contrato do usuário */
  contractValue: numeric('contract_value', { precision: 12, scale: 2 }),

  /** Média de mercado para esta métrica */
  marketAvg: numeric('market_avg', { precision: 12, scale: 2 }),

  /** Valor mínimo encontrado no mercado */
  marketMin: numeric('market_min', { precision: 12, scale: 2 }),

  /** Valor máximo encontrado no mercado */
  marketMax: numeric('market_max', { precision: 12, scale: 2 }),

  /** Percentil do contrato em relação ao mercado (0-100) */
  percentile: integer('percentile'),

  /** Data de criação do benchmark */
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/** Tipo de leitura — benchmark já salvo no banco */
export type ContractBenchmark = typeof contractBenchmarks.$inferSelect

/** Tipo de inserção — dados para criar um benchmark */
export type NewContractBenchmark = typeof contractBenchmarks.$inferInsert
