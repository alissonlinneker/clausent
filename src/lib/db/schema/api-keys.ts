import { pgTable, uuid, varchar, text, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { organizations } from './organizations'

/**
 * Tabela de chaves de API.
 *
 * Permite que organizações criem chaves de API programáticas
 * para integrar com a plataforma via REST/tRPC. A chave real
 * nunca é armazenada — apenas o hash e o prefixo visível.
 *
 * O prefixo (ex: "cls_abc1...") permite identificar a chave
 * sem expor o valor completo. As permissões controlam quais
 * endpoints a chave pode acessar.
 */
export const apiKeys = pgTable('api_keys', {
  /** Identificador único da chave */
  id: uuid('id').primaryKey().defaultRandom(),

  /** Referência à organização dona da chave */
  orgId: uuid('org_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),

  /** Nome descritivo da chave (ex: "Integração Zapier", "CI/CD Pipeline") */
  name: varchar('name', { length: 255 }).notNull(),

  /** Hash SHA-256 da chave (nunca armazenar o valor original) */
  keyHash: text('key_hash').unique().notNull(),

  /** Prefixo visível da chave para identificação (ex: "cls_abc1") */
  keyPrefix: varchar('key_prefix', { length: 20 }).notNull(),

  /** Permissões da chave em formato JSON (ex: ["contracts:read", "contracts:write"]) */
  permissions: jsonb('permissions'),

  /** Data do último uso da chave */
  lastUsedAt: timestamp('last_used_at'),

  /** Data de expiração da chave (null = sem expiração) */
  expiresAt: timestamp('expires_at'),

  /** Data de criação da chave */
  createdAt: timestamp('created_at').defaultNow().notNull(),

  /** Data de revogação (null = chave ativa) */
  revokedAt: timestamp('revoked_at'),
})

/** Tipo de leitura — chave de API já salva no banco */
export type ApiKey = typeof apiKeys.$inferSelect

/** Tipo de inserção — dados para criar uma chave de API */
export type NewApiKey = typeof apiKeys.$inferInsert
