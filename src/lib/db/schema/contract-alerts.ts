import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core'
import { contracts } from './contracts'

/** Alertas agendados para contratos (renovações, vencimentos, etc.) */
export const contractAlerts = pgTable('contract_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  contractId: uuid('contract_id').references(() => contracts.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  triggerDate: timestamp('trigger_date').notNull(),
  sentAt: timestamp('sent_at'),
  dismissed: boolean('dismissed').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type ContractAlert = typeof contractAlerts.$inferSelect
export type NewContractAlert = typeof contractAlerts.$inferInsert
