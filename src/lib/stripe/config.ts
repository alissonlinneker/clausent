/**
 * Arquivo de compatibilidade — re-exporta tudo do módulo principal.
 *
 * Mantido para que importações existentes (ex: `@/lib/stripe/config`)
 * continuem funcionando sem necessidade de atualizar todos os consumidores.
 *
 * Novos arquivos devem importar de `@/lib/stripe` diretamente.
 */

export { getStripe, PLANS, PLAN_LIMITS, getPlanByPriceId, getPlanLimits } from './index'
export { getAvailablePlans, getAllPlans } from './plans'
export type { Plan } from './plans'

/**
 * Tipo legado para identificação de planos pelo slug.
 * Mantido para compatibilidade com componentes existentes.
 */
export type PlanId = 'free' | 'starter' | 'professional' | 'business' | 'enterprise'
