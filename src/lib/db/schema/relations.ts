import { relations } from 'drizzle-orm'
import { user } from './users'
import { session, account } from './auth'
import { subscriptions } from './subscriptions'
import { organizations, organizationMembers, invitations } from './organizations'
import { contracts } from './contracts'
import { contractClauses } from './contract-clauses'
import { contractAlerts } from './contract-alerts'
import { contractBenchmarks } from './contract-benchmarks'
import { renegotiationPackages } from './renegotiation-packages'
import { auditLog } from './audit-log'
import { apiKeys } from './api-keys'

/**
 * Relações do usuário.
 *
 * Um usuário possui sessões, contas vinculadas, assinaturas,
 * contratos, memberships em organizações e registros de auditoria.
 */
export const userRelations = relations(user, ({ many }) => ({
  /** Sessões ativas do usuário */
  sessions: many(session),

  /** Contas vinculadas (credenciais, Google, GitHub, etc.) */
  accounts: many(account),

  /** Assinaturas do usuário (normalmente apenas uma ativa) */
  subscriptions: many(subscriptions),

  /** Contratos do usuário */
  contracts: many(contracts),

  /** Memberships em organizações */
  organizationMemberships: many(organizationMembers),

  /** Registros de auditoria das ações do usuário */
  auditLog: many(auditLog),
}))

/**
 * Relações da sessão.
 *
 * Cada sessão pertence a exatamente um usuário.
 */
export const sessionRelations = relations(session, ({ one }) => ({
  /** Usuário dono da sessão */
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

/**
 * Relações da conta vinculada.
 *
 * Cada conta pertence a exatamente um usuário.
 */
export const accountRelations = relations(account, ({ one }) => ({
  /** Usuário dono da conta */
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

/**
 * Relações da assinatura.
 *
 * Cada assinatura pertence a exatamente um usuário.
 */
export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  /** Usuário dono da assinatura */
  user: one(user, {
    fields: [subscriptions.userId],
    references: [user.id],
  }),
}))

/**
 * Relações da organização.
 *
 * Cada organização possui membros, convites, contratos,
 * alertas, chaves de API e registros de auditoria.
 */
export const organizationsRelations = relations(organizations, ({ many }) => ({
  /** Membros da organização */
  members: many(organizationMembers),

  /** Convites pendentes */
  invitations: many(invitations),

  /** Contratos da organização */
  contracts: many(contracts),

  /** Alertas da organização */
  alerts: many(contractAlerts),

  /** Chaves de API da organização */
  apiKeys: many(apiKeys),

  /** Registros de auditoria da organização */
  auditLog: many(auditLog),
}))

/**
 * Relações do membro de organização.
 *
 * Cada membro conecta um usuário a uma organização.
 */
export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  /** Organização à qual o membro pertence */
  organization: one(organizations, {
    fields: [organizationMembers.orgId],
    references: [organizations.id],
  }),

  /** Usuário que é o membro */
  user: one(user, {
    fields: [organizationMembers.userId],
    references: [user.id],
  }),
}))

/**
 * Relações dos convites.
 *
 * Cada convite pertence a uma organização.
 */
export const invitationsRelations = relations(invitations, ({ one }) => ({
  /** Organização que enviou o convite */
  organization: one(organizations, {
    fields: [invitations.orgId],
    references: [organizations.id],
  }),
}))

/**
 * Relações do contrato.
 *
 * Cada contrato pertence a um usuário e opcionalmente a uma organização.
 * Possui cláusulas, alertas, benchmarks e pacotes de renegociação.
 */
export const contractsRelations = relations(contracts, ({ one, many }) => ({
  /** Usuário que fez o upload do contrato */
  user: one(user, {
    fields: [contracts.userId],
    references: [user.id],
  }),

  /** Organização à qual o contrato pertence (opcional) */
  organization: one(organizations, {
    fields: [contracts.orgId],
    references: [organizations.id],
  }),

  /** Cláusulas extraídas do contrato */
  clauses: many(contractClauses),

  /** Alertas agendados para o contrato */
  alerts: many(contractAlerts),

  /** Benchmarks de mercado comparativos */
  benchmarks: many(contractBenchmarks),

  /** Pacotes de renegociação gerados */
  renegotiationPackages: many(renegotiationPackages),
}))

/**
 * Relações das cláusulas.
 *
 * Cada cláusula pertence a exatamente um contrato.
 */
export const contractClausesRelations = relations(contractClauses, ({ one }) => ({
  /** Contrato ao qual a cláusula pertence */
  contract: one(contracts, {
    fields: [contractClauses.contractId],
    references: [contracts.id],
  }),
}))

/**
 * Relações dos alertas.
 *
 * Cada alerta pertence a um contrato e opcionalmente a uma organização.
 */
export const contractAlertsRelations = relations(contractAlerts, ({ one }) => ({
  /** Contrato ao qual o alerta pertence */
  contract: one(contracts, {
    fields: [contractAlerts.contractId],
    references: [contracts.id],
  }),

  /** Organização à qual o alerta pertence (opcional) */
  organization: one(organizations, {
    fields: [contractAlerts.orgId],
    references: [organizations.id],
  }),
}))

/**
 * Relações dos benchmarks.
 *
 * Cada benchmark pertence a exatamente um contrato.
 */
export const contractBenchmarksRelations = relations(contractBenchmarks, ({ one }) => ({
  /** Contrato ao qual o benchmark pertence */
  contract: one(contracts, {
    fields: [contractBenchmarks.contractId],
    references: [contracts.id],
  }),
}))

/**
 * Relações dos pacotes de renegociação.
 *
 * Cada pacote pertence a exatamente um contrato.
 */
export const renegotiationPackagesRelations = relations(renegotiationPackages, ({ one }) => ({
  /** Contrato ao qual o pacote de renegociação pertence */
  contract: one(contracts, {
    fields: [renegotiationPackages.contractId],
    references: [contracts.id],
  }),
}))

/**
 * Relações do audit log.
 *
 * Cada registro de auditoria pertence a um usuário
 * e opcionalmente a uma organização.
 */
export const auditLogRelations = relations(auditLog, ({ one }) => ({
  /** Usuário que executou a ação */
  user: one(user, {
    fields: [auditLog.userId],
    references: [user.id],
  }),

  /** Organização na qual a ação ocorreu (opcional) */
  organization: one(organizations, {
    fields: [auditLog.orgId],
    references: [organizations.id],
  }),
}))

/**
 * Relações das chaves de API.
 *
 * Cada chave pertence a exatamente uma organização.
 */
export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  /** Organização dona da chave */
  organization: one(organizations, {
    fields: [apiKeys.orgId],
    references: [organizations.id],
  }),
}))
