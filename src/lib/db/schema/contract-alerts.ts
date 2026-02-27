import { pgTable, uuid, varchar, text, integer, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core'
import { contracts } from './contracts'
import { organizations } from './organizations'

/** Enum de tipo de alerta */
export const alertTypeEnum = pgEnum('alert_type', [
  'renewal',
  'risk',
  'price',
  'compliance',
  'analysis',
])

/**
 * Tabela de alertas de contrato.
 *
 * Armazena alertas agendados e notificações relacionadas
 * a contratos: renovações próximas, riscos detectados,
 * variações de preço, conformidade e resultados de análise.
 */
export const contractAlerts = pgTable('contract_alerts', {
  /** Identificador único do alerta */
  id: uuid('id').primaryKey().defaultRandom(),

  /** Referência à organização (opcional — para alertas organizacionais) */
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }),

  /** Referência ao contrato relacionado */
  contractId: uuid('contract_id')
    .references(() => contracts.id, { onDelete: 'cascade' })
    .notNull(),

  /** Tipo do alerta (renovação, risco, preço, conformidade, análise) */
  type: alertTypeEnum('type').default('renewal').notNull(),

  /** Título resumido do alerta */
  title: varchar('title', { length: 255 }).notNull(),

  /** Descrição detalhada do alerta */
  description: text('description'),

  /** Prioridade do alerta (1 = baixa, 5 = crítica) */
  priority: integer('priority').default(1).notNull(),

  /** Indica se o alerta já foi lido pelo usuário */
  isRead: boolean('is_read').default(false).notNull(),

  /** URL de ação associada ao alerta (ex: link para o contrato) */
  actionUrl: varchar('action_url', { length: 500 }),

  /** Data programada para envio/exibição do alerta */
  scheduledFor: timestamp('scheduled_for'),

  /** Data em que o alerta foi efetivamente enviado */
  sentAt: timestamp('sent_at'),

  /** Indica se o alerta foi dispensado/arquivado */
  dismissed: boolean('dismissed').default(false),

  /** Data de criação do registro */
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/** Tipo de leitura — alerta já salvo no banco */
export type ContractAlert = typeof contractAlerts.$inferSelect

/** Tipo de inserção — dados para criar um alerta */
export type NewContractAlert = typeof contractAlerts.$inferInsert
