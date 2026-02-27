import { pgTable, uuid, varchar, text, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { user } from './users'
import { organizations } from './organizations'

/**
 * Tabela de log de auditoria — registra todas as ações relevantes do sistema.
 *
 * Cada entrada documenta quem fez o quê, quando, em qual recurso,
 * e inclui metadados técnicos (IP, user-agent) para compliance e
 * investigação de incidentes.
 */
export const auditLog = pgTable('audit_log', {
  /** Identificador único do registro de auditoria */
  id: uuid('id').primaryKey().defaultRandom(),

  /** Referência à organização (para filtro por workspace) */
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'set null' }),

  /** Referência ao usuário que executou a ação */
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),

  /** Tipo de ação executada (ex: "contract.created", "member.invited") */
  action: varchar('action', { length: 100 }).notNull(),

  /** Tipo do recurso afetado (ex: "contract", "organization", "member") */
  resourceType: varchar('resource_type', { length: 50 }),

  /** ID do recurso afetado (ex: UUID do contrato modificado) */
  resourceId: varchar('resource_id', { length: 255 }),

  /** Metadados adicionais da ação em formato JSON */
  metadata: jsonb('metadata'),

  /** Endereço IP do cliente que executou a ação */
  ipAddress: varchar('ip_address', { length: 45 }),

  /** User-Agent do navegador/cliente que executou a ação */
  userAgent: text('user_agent'),

  /** Data/hora em que a ação ocorreu */
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/** Tipo de leitura — registro de auditoria já salvo no banco */
export type AuditLogEntry = typeof auditLog.$inferSelect

/** Tipo de inserção — dados para criar um registro de auditoria */
export type NewAuditLogEntry = typeof auditLog.$inferInsert
