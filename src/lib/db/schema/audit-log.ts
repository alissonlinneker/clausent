import { pgTable, uuid, varchar, text, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { user } from './users'

/**
 * Log de auditoria — registra todas as ações relevantes do sistema.
 *
 * Migrado para referenciar diretamente o usuário (Better Auth)
 * ao invés de organizações. O campo orgId foi removido já que
 * contratos agora pertencem a usuários individuais.
 */
export const auditLog = pgTable('audit_log', {
  /** Identificador único do registro de auditoria */
  id: uuid('id').primaryKey().defaultRandom(),

  /** Referência ao usuário que executou a ação */
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),

  /** Tipo de ação executada (ex: "contract.created", "contract.deleted") */
  action: varchar('action', { length: 100 }).notNull(),

  /** Detalhes adicionais da ação em formato JSON */
  details: jsonb('details'),

  /** Data/hora em que a ação ocorreu */
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/** Tipo de leitura — registro de auditoria já salvo no banco */
export type AuditLogEntry = typeof auditLog.$inferSelect

/** Tipo de inserção — dados para criar um registro de auditoria */
export type NewAuditLogEntry = typeof auditLog.$inferInsert
