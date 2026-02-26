import { pgTable, uuid, jsonb, text, numeric, timestamp } from 'drizzle-orm/pg-core'
import { contracts } from './contracts'

/** Pacotes de renegociação gerados pela plataforma */
export const renegotiationPackages = pgTable('renegotiation_packages', {
  id: uuid('id').primaryKey().defaultRandom(),
  contractId: uuid('contract_id').references(() => contracts.id, { onDelete: 'cascade' }).notNull(),
  points: jsonb('points').notNull(),
  draftEmail: text('draft_email'),
  estimatedSavings: numeric('estimated_savings', { precision: 12, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type RenegotiationPackage = typeof renegotiationPackages.$inferSelect
export type NewRenegotiationPackage = typeof renegotiationPackages.$inferInsert
