import {
  pgTable, uuid, text, timestamp, integer,
  boolean, pgEnum,
} from 'drizzle-orm/pg-core'
import { user } from './users'

/** Enum dos planos disponíveis na plataforma */
export const subscriptionPlanEnum = pgEnum('subscription_plan', [
  'free',
  'starter',
  'professional',
  'business',
  'enterprise',
])

/** Enum dos status possíveis de uma assinatura */
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'canceled',
  'past_due',
  'trialing',
  'paused',
])

/**
 * Tabela de assinaturas — controla o plano e cobrança de cada usuário.
 *
 * Integra diretamente com o Stripe para gerenciamento de pagamentos
 * recorrentes. Cada usuário pode ter no máximo uma assinatura ativa.
 */
export const subscriptions = pgTable('subscriptions', {
  /** Identificador único da assinatura */
  id: uuid('id').primaryKey().defaultRandom(),

  /** Referência ao usuário dono desta assinatura */
  userId: text('user_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),

  /** ID do cliente no Stripe */
  stripeCustomerId: text('stripe_customer_id').unique(),

  /** ID da assinatura no Stripe */
  stripeSubscriptionId: text('stripe_subscription_id').unique(),

  /** ID do preço/price no Stripe */
  stripePriceId: text('stripe_price_id'),

  /** Plano contratado pelo usuário */
  plan: subscriptionPlanEnum('plan').default('free').notNull(),

  /** Status atual da assinatura */
  status: subscriptionStatusEnum('status').default('active').notNull(),

  /** Início do período de cobrança atual */
  currentPeriodStart: timestamp('current_period_start'),

  /** Fim do período de cobrança atual */
  currentPeriodEnd: timestamp('current_period_end'),

  /** Se true, a assinatura será cancelada ao final do período */
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),

  /** Quantidade de contratos já utilizados no período */
  contractsUsed: integer('contracts_used').default(0).notNull(),

  /** Limite de contratos permitidos pelo plano (null = ilimitado) */
  contractsLimit: integer('contracts_limit'),

  /** Data de criação do registro */
  createdAt: timestamp('created_at').defaultNow().notNull(),

  /** Data da última atualização do registro */
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/** Tipo de leitura — assinatura já salva no banco */
export type Subscription = typeof subscriptions.$inferSelect

/** Tipo de inserção — dados para criar uma assinatura */
export type NewSubscription = typeof subscriptions.$inferInsert
