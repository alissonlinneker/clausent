import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core'

/**
 * Tabela de usuários — gerenciada pelo Better Auth.
 *
 * O Better Auth espera a tabela com nome "user" (singular)
 * e campos em camelCase. Campos extras do domínio da aplicação
 * podem ser adicionados aqui, desde que o core do Better Auth
 * (id, email, name, emailVerified, image, createdAt, updatedAt)
 * seja mantido intacto.
 */
export const user = pgTable('user', {
  /** Identificador único do usuário (gerado pelo Better Auth) */
  id: text('id').primaryKey(),

  /** E-mail do usuário — único e obrigatório */
  email: text('email').unique().notNull(),

  /** Nome de exibição do usuário */
  name: text('name'),

  /** Indica se o e-mail foi verificado */
  emailVerified: boolean('emailVerified').default(false).notNull(),

  /** URL do avatar/foto do usuário */
  image: text('image'),

  /** Data de criação do registro */
  createdAt: timestamp('createdAt').defaultNow().notNull(),

  /** Data da última atualização do registro */
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

/** Tipo de leitura — representa um usuário já salvo no banco */
export type User = typeof user.$inferSelect

/** Tipo de inserção — representa os dados necessários para criar um usuário */
export type NewUser = typeof user.$inferInsert
