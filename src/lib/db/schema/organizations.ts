import { pgTable, uuid, varchar, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core'
import { subscriptionPlanEnum, subscriptionStatusEnum } from './subscriptions'
import { user } from './users'

/**
 * Enum dos planos da organização (legado — mantido para compatibilidade).
 * Novos planos são gerenciados via subscriptionPlanEnum em ./subscriptions.
 */
export const orgPlanEnum = pgEnum('org_plan', [
  'starter',
  'professional',
  'business',
  'enterprise',
])

/** Enum de papel de membro dentro de uma organização */
export const memberRoleEnum = pgEnum('member_role', [
  'owner',
  'admin',
  'member',
  'viewer',
])

/**
 * Tabela de organizações — entidade multi-tenant.
 *
 * Cada organização representa um workspace colaborativo onde múltiplos
 * usuários podem gerenciar contratos juntos. O plano e a assinatura
 * são vinculados à organização (não ao usuário individual).
 */
export const organizations = pgTable('organizations', {
  /** Identificador único da organização */
  id: uuid('id').primaryKey().defaultRandom(),

  /** Nome da organização */
  name: varchar('name', { length: 255 }).notNull(),

  /** Slug URL-friendly para identificação pública */
  slug: varchar('slug', { length: 255 }).unique(),

  /** Plano atual da organização */
  plan: subscriptionPlanEnum('plan').default('free').notNull(),

  /** ID do cliente no Stripe */
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),

  /** ID da assinatura no Stripe */
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),

  /** Status da assinatura da organização */
  subscriptionStatus: subscriptionStatusEnum('subscription_status').default('active'),

  /** Quantidade de contratos utilizados no período atual */
  contractsUsed: integer('contracts_used').default(0).notNull(),

  /** Limite de contratos permitidos pelo plano (null = ilimitado) */
  contractsLimit: integer('contracts_limit'),

  /** Data de criação do registro */
  createdAt: timestamp('created_at').defaultNow().notNull(),

  /** Data da última atualização do registro */
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/**
 * Tabela de membros da organização.
 *
 * Relaciona usuários a organizações com papéis específicos.
 * Cada usuário pode pertencer a múltiplas organizações com
 * papéis diferentes em cada uma.
 */
export const organizationMembers = pgTable('organization_members', {
  /** Identificador único do membro */
  id: uuid('id').primaryKey().defaultRandom(),

  /** Referência à organização */
  orgId: uuid('org_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),

  /** Referência ao usuário */
  userId: text('user_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),

  /** Papel do membro na organização */
  role: memberRoleEnum('role').default('member').notNull(),

  /** ID do usuário que convidou este membro (null se for o criador) */
  invitedBy: text('invited_by')
    .references(() => user.id, { onDelete: 'set null' }),

  /** Data em que o membro ingressou na organização */
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
})

/**
 * Tabela de convites pendentes para organizações.
 *
 * Armazena convites enviados por email para novos membros.
 * O convite expira após um prazo definido e pode ser aceito
 * apenas uma vez (registrando a data de aceitação).
 */
export const invitations = pgTable('invitations', {
  /** Identificador único do convite */
  id: uuid('id').primaryKey().defaultRandom(),

  /** Referência à organização que enviou o convite */
  orgId: uuid('org_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),

  /** Email do convidado */
  email: varchar('email', { length: 255 }).notNull(),

  /** Papel que será atribuído ao aceitar o convite */
  role: memberRoleEnum('role').default('member').notNull(),

  /** Token único para aceitação do convite */
  token: varchar('token', { length: 255 }).unique().notNull(),

  /** Data de expiração do convite */
  expiresAt: timestamp('expires_at').notNull(),

  /** Data em que o convite foi aceito (null = pendente) */
  acceptedAt: timestamp('accepted_at'),

  /** Data de criação do convite */
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/** Tipo de leitura — organização já salva no banco */
export type Organization = typeof organizations.$inferSelect

/** Tipo de inserção — dados para criar uma organização */
export type NewOrganization = typeof organizations.$inferInsert

/** Tipo de leitura — membro de organização já salvo no banco */
export type OrganizationMember = typeof organizationMembers.$inferSelect

/** Tipo de inserção — dados para criar um membro de organização */
export type NewOrganizationMember = typeof organizationMembers.$inferInsert

/** Tipo de leitura — convite já salvo no banco */
export type Invitation = typeof invitations.$inferSelect

/** Tipo de inserção — dados para criar um convite */
export type NewInvitation = typeof invitations.$inferInsert
