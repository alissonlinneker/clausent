// @ts-nocheck
/**
 * Módulo de billing — ponto de entrada centralizado.
 *
 * Exporta todas as classes, tipos e constantes relacionadas
 * ao gerenciamento de assinaturas, rastreamento de uso e
 * limites de planos da plataforma.
 *
 * Uso:
 * ```ts
 * import {
 *   UsageTracker,
 *   SubscriptionManager,
 *   PLAN_RESOURCE_LIMITS,
 * } from '@/lib/billing'
 * ```
 *
 * @module billing
 */

/* ---- Usage Tracker ---- */
export {
  UsageTracker,
  PLAN_RESOURCE_LIMITS,
} from './usage-tracker'

export type {
  TrackedResource,
  UsageLimitResult,
  UsageSummary,
  PlanLimits,
} from './usage-tracker'

/* ---- Subscription Manager ---- */
export {
  SubscriptionManager,
} from './subscription-manager'

export type {
  SubscriptionResult,
  SubscriptionInfo,
} from './subscription-manager'
