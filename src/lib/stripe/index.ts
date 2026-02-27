/**
 * Módulo principal de integração com o Stripe.
 *
 * Exporta a instância do Stripe SDK, constantes de limites por plano,
 * e funções auxiliares para identificação e consulta de planos.
 */

import Stripe from 'stripe'
import { PLANS, type Plan } from './plans'

/* ---- Instância do Stripe SDK ---- */

/** Instância lazy — evita erro em build time quando a chave não está disponível */
let stripeInstance: Stripe | null = null

/**
 * Retorna a instância do Stripe SDK.
 *
 * Criada sob demanda na primeira chamada para evitar
 * erros quando STRIPE_SECRET_KEY não está disponível
 * em tempo de build.
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error(
        '[STRIPE] STRIPE_SECRET_KEY não configurada. Verifique suas variáveis de ambiente.'
      )
    }

    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
    })
  }
  return stripeInstance
}

/* ---- Limites de contratos por plano ---- */

/**
 * Mapa de limites de contratos por plano.
 *
 * Valor null indica limite ilimitado (Enterprise).
 * Estes valores são usados para enforcement de cotas
 * no backend antes de permitir upload de novos contratos.
 */
export const PLAN_LIMITS: Record<string, number | null> = {
  free: 1,
  starter: 5,
  professional: 25,
  business: 100,
  enterprise: null,
}

/* ---- Funções auxiliares ---- */

/**
 * Identifica o plano correspondente a um price ID do Stripe.
 *
 * Percorre todos os planos configurados e compara tanto o
 * price ID mensal quanto o anual. Retorna o objeto Plan
 * completo ou null se nenhum plano corresponder.
 *
 * @param priceId - ID do preço retornado pelo Stripe
 * @returns O plano correspondente ou null
 */
export function getPlanByPriceId(priceId: string): Plan | null {
  if (!priceId) return null

  const found = Object.values(PLANS).find(
    (plan) =>
      plan.monthlyPriceId === priceId || plan.yearlyPriceId === priceId
  )

  return found ?? null
}

/**
 * Retorna os limites e informações de um plano pelo slug.
 *
 * @param planSlug - Slug do plano (ex: 'starter', 'professional')
 * @returns Objeto com contractsLimit e demais informações, ou null
 */
export function getPlanLimits(planSlug: string): {
  contractsLimit: number | null
  name: string
  slug: string
} | null {
  const plan = PLANS[planSlug]
  if (!plan) return null

  return {
    contractsLimit: plan.contractsLimit,
    name: plan.name,
    slug: plan.slug,
  }
}

/* ---- Re-exportações ---- */

export { PLANS, type Plan } from './plans'
export { getAvailablePlans, getAllPlans } from './plans'
