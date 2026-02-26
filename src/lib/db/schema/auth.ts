import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './users'

/**
 * Tabela de sessões — gerenciada pelo Better Auth.
 *
 * Armazena sessões ativas dos usuários. O Better Auth cria,
 * atualiza e remove registros automaticamente durante o ciclo
 * de autenticação.
 */
export const session = pgTable('session', {
  /** Identificador único da sessão */
  id: text('id').primaryKey(),

  /** Data/hora de expiração da sessão */
  expiresAt: timestamp('expiresAt').notNull(),

  /** Token único da sessão (usado em cookies) */
  token: text('token').unique().notNull(),

  /** Data de criação da sessão */
  createdAt: timestamp('createdAt').defaultNow().notNull(),

  /** Data da última atualização da sessão */
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),

  /** Endereço IP de onde a sessão foi iniciada */
  ipAddress: text('ipAddress'),

  /** User-Agent do navegador/cliente que iniciou a sessão */
  userAgent: text('userAgent'),

  /** Referência ao usuário dono desta sessão */
  userId: text('userId')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),
})

/** Tipo de leitura — sessão já salva no banco */
export type Session = typeof session.$inferSelect

/** Tipo de inserção — dados para criar uma sessão */
export type NewSession = typeof session.$inferInsert

/**
 * Tabela de contas vinculadas — gerenciada pelo Better Auth.
 *
 * Cada registro representa um provedor de autenticação vinculado
 * ao usuário (credenciais de e-mail/senha, Google, GitHub, etc.).
 * Um usuário pode ter múltiplas contas vinculadas.
 */
export const account = pgTable('account', {
  /** Identificador único da conta */
  id: text('id').primaryKey(),

  /** ID da conta no provedor externo (ex: Google sub, GitHub id) */
  accountId: text('accountId').notNull(),

  /** Identificador do provedor (ex: "credential", "google", "github") */
  providerId: text('providerId').notNull(),

  /** Referência ao usuário dono desta conta */
  userId: text('userId')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),

  /** Token de acesso fornecido pelo provedor OAuth */
  accessToken: text('accessToken'),

  /** Token de atualização fornecido pelo provedor OAuth */
  refreshToken: text('refreshToken'),

  /** Token de identidade (OpenID Connect) */
  idToken: text('idToken'),

  /** Data/hora de expiração do access token */
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),

  /** Data/hora de expiração do refresh token */
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),

  /** Escopos concedidos pelo provedor OAuth */
  scope: text('scope'),

  /** Hash da senha (apenas para provedor "credential") */
  password: text('password'),

  /** Data de criação do registro */
  createdAt: timestamp('createdAt').defaultNow().notNull(),

  /** Data da última atualização do registro */
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

/** Tipo de leitura — conta já salva no banco */
export type Account = typeof account.$inferSelect

/** Tipo de inserção — dados para criar uma conta */
export type NewAccount = typeof account.$inferInsert

/**
 * Tabela de verificações — gerenciada pelo Better Auth.
 *
 * Armazena tokens temporários de verificação (confirmação de e-mail,
 * redefinição de senha, magic links, etc.). Registros expiram
 * automaticamente após o prazo definido.
 */
export const verification = pgTable('verification', {
  /** Identificador único da verificação */
  id: text('id').primaryKey(),

  /** Identificador do alvo da verificação (ex: e-mail do usuário) */
  identifier: text('identifier').notNull(),

  /** Valor/token da verificação */
  value: text('value').notNull(),

  /** Data/hora de expiração da verificação */
  expiresAt: timestamp('expiresAt').notNull(),

  /** Data de criação do registro */
  createdAt: timestamp('createdAt').defaultNow().notNull(),

  /** Data da última atualização do registro */
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

/** Tipo de leitura — verificação já salva no banco */
export type Verification = typeof verification.$inferSelect

/** Tipo de inserção — dados para criar uma verificação */
export type NewVerification = typeof verification.$inferInsert
