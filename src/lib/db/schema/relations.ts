import { relations } from 'drizzle-orm'
import { organizations } from './organizations'
import { users } from './users'
import { contracts } from './contracts'
import { contractClauses } from './contract-clauses'
import { contractAlerts } from './contract-alerts'
import { contractBenchmarks } from './contract-benchmarks'
import { renegotiationPackages } from './renegotiation-packages'
import { auditLog } from './audit-log'

/** Relações da organização */
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  contracts: many(contracts),
  auditLog: many(auditLog),
}))

/** Relações do usuário */
export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
}))

/** Relações do contrato */
export const contractsRelations = relations(contracts, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [contracts.orgId],
    references: [organizations.id],
  }),
  clauses: many(contractClauses),
  alerts: many(contractAlerts),
  benchmarks: many(contractBenchmarks),
  renegotiationPackages: many(renegotiationPackages),
}))

/** Relações das cláusulas */
export const contractClausesRelations = relations(contractClauses, ({ one }) => ({
  contract: one(contracts, {
    fields: [contractClauses.contractId],
    references: [contracts.id],
  }),
}))

/** Relações dos alertas */
export const contractAlertsRelations = relations(contractAlerts, ({ one }) => ({
  contract: one(contracts, {
    fields: [contractAlerts.contractId],
    references: [contracts.id],
  }),
}))

/** Relações dos benchmarks */
export const contractBenchmarksRelations = relations(contractBenchmarks, ({ one }) => ({
  contract: one(contracts, {
    fields: [contractBenchmarks.contractId],
    references: [contracts.id],
  }),
}))

/** Relações dos pacotes de renegociação */
export const renegotiationPackagesRelations = relations(renegotiationPackages, ({ one }) => ({
  contract: one(contracts, {
    fields: [renegotiationPackages.contractId],
    references: [contracts.id],
  }),
}))

/** Relações do audit log */
export const auditLogRelations = relations(auditLog, ({ one }) => ({
  organization: one(organizations, {
    fields: [auditLog.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [auditLog.userId],
    references: [users.id],
  }),
}))
