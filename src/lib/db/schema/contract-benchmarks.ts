import { pgTable, uuid, varchar, numeric, integer } from 'drizzle-orm/pg-core'
import { contracts } from './contracts'

/** Benchmarks de mercado comparados a um contrato específico */
export const contractBenchmarks = pgTable('contract_benchmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  contractId: uuid('contract_id').references(() => contracts.id, { onDelete: 'cascade' }).notNull(),
  metric: varchar('metric', { length: 255 }).notNull(),
  yourValue: numeric('your_value', { precision: 12, scale: 2 }),
  marketAvg: numeric('market_avg', { precision: 12, scale: 2 }),
  percentile: integer('percentile'),
})

export type ContractBenchmark = typeof contractBenchmarks.$inferSelect
export type NewContractBenchmark = typeof contractBenchmarks.$inferInsert
