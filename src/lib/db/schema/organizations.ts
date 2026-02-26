import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core'

/** Enum dos planos disponíveis */
export const orgPlanEnum = pgEnum('org_plan', [
  'starter',
  'professional',
  'business',
  'enterprise',
])

/** Tabela de organizações — entidade raiz do multi-tenant */
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  clerkOrgId: varchar('clerk_org_id', { length: 255 }).unique().notNull(),
  plan: orgPlanEnum('plan').default('starter').notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Organization = typeof organizations.$inferSelect
export type NewOrganization = typeof organizations.$inferInsert
