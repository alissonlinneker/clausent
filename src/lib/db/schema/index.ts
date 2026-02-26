/** ============================================================
 * Exportações centralizadas de todos os schemas do banco de dados.
 *
 * Este arquivo serve como ponto único de importação para
 * tabelas, enums, tipos e relações do Drizzle ORM.
 * ============================================================ */

/* ---- Usuários (Better Auth) ---- */
export { user } from './users'
export type { User, NewUser } from './users'

/* ---- Tabelas de autenticação (Better Auth) ---- */
export { session, account, verification } from './auth'
export type {
  Session, NewSession,
  Account, NewAccount,
  Verification, NewVerification,
} from './auth'

/* ---- Assinaturas e planos ---- */
export { subscriptions, subscriptionPlanEnum, subscriptionStatusEnum } from './subscriptions'
export type { Subscription, NewSubscription } from './subscriptions'

/* ---- Organizações (legado — fase futura: times/workspaces) ---- */
export { organizations, orgPlanEnum } from './organizations'
export type { Organization, NewOrganization } from './organizations'

/* ---- Contratos ---- */
export { contracts, contractCategoryEnum, contractStatusEnum } from './contracts'
export type { Contract, NewContract } from './contracts'

/* ---- Cláusulas de contrato ---- */
export { contractClauses, clauseRiskLevelEnum } from './contract-clauses'
export type { ContractClause, NewContractClause } from './contract-clauses'

/* ---- Alertas de contrato ---- */
export { contractAlerts } from './contract-alerts'
export type { ContractAlert, NewContractAlert } from './contract-alerts'

/* ---- Benchmarks de contrato ---- */
export { contractBenchmarks } from './contract-benchmarks'
export type { ContractBenchmark, NewContractBenchmark } from './contract-benchmarks'

/* ---- Pacotes de renegociação ---- */
export { renegotiationPackages } from './renegotiation-packages'
export type { RenegotiationPackage, NewRenegotiationPackage } from './renegotiation-packages'

/* ---- Audit log ---- */
export { auditLog } from './audit-log'
export type { AuditLogEntry, NewAuditLogEntry } from './audit-log'

/* ---- Relações (Drizzle ORM) ---- */
export * from './relations'
