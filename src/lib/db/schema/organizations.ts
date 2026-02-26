import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core'

/**
 * NOTA: Esta tabela está mantida para compatibilidade e será
 * substituída por um sistema de times/workspaces em fase futura.
 * Referências ao Clerk foram removidas.
 */

/** Enum dos planos da organização (legado — será migrado para subscriptions) */
export const orgPlanEnum = pgEnum('org_plan', [
  'starter',
  'professional',
  'business',
  'enterprise',
])

/**
 * Tabela de organizações — entidade legado do multi-tenant.
 *
 * Mantida para preservar dados existentes e facilitar migração futura
 * para um sistema de times/workspaces. Referências ao Clerk foram removidas.
 */
export const organizations = pgTable('organizations', {
  /** Identificador único da organização */
  id: uuid('id').primaryKey().defaultRandom(),

  /** Nome da organização */
  name: varchar('name', { length: 255 }).notNull(),

  /** Plano contratado (legado — novos planos em subscriptions) */
  plan: orgPlanEnum('plan').default('starter').notNull(),

  /** ID do cliente no Stripe (legado — novos IDs em subscriptions) */
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),

  /** ID da assinatura no Stripe (legado — novas assinaturas em subscriptions) */
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),

  /** Data de criação do registro */
  createdAt: timestamp('created_at').defaultNow().notNull(),

  /** Data da última atualização do registro */
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/** Tipo de leitura — organização já salva no banco */
export type Organization = typeof organizations.$inferSelect

/** Tipo de inserção — dados para criar uma organização */
export type NewOrganization = typeof organizations.$inferInsert
