import Stripe from 'stripe'

/** Instância lazy do Stripe SDK (evita erro em build sem chave) */
let stripeInstance: Stripe | null = null

/**
 * Retorna a instância do Stripe SDK.
 * Criada sob demanda na primeira chamada para evitar
 * erros quando STRIPE_SECRET_KEY não está disponível
 * em tempo de build.
 */
export function getStripe() {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-02-25.clover',
    })
  }
  return stripeInstance
}

/** Tipo para identificar planos pelo slug */
export type PlanId = keyof typeof PLANS

/**
 * Configuração dos planos de assinatura.
 * Preços em centavos (USD), conforme padrão do Stripe.
 * Os priceIds são carregados via variáveis de ambiente
 * para separar ambientes de teste e produção.
 */
export const PLANS = {
  starter: {
    name: 'Starter',
    price: 2900,
    contracts: 25,
    features: ['25 contracts', 'Basic analysis', 'Email alerts', 'Risk scoring'],
    priceId: process.env.STRIPE_STARTER_PRICE_ID || '',
  },
  professional: {
    name: 'Professional',
    price: 5900,
    contracts: 100,
    features: ['100 contracts', 'Full analysis', 'Market benchmarks', 'Priority support', 'API access'],
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    popular: true,
  },
  business: {
    name: 'Business',
    price: 9900,
    contracts: 500,
    features: ['500 contracts', 'Renegotiation kit', 'Custom integrations', 'Dedicated support', 'Audit log', 'Advanced analytics'],
    priceId: process.env.STRIPE_BIZ_PRICE_ID || '',
  },
} as const
