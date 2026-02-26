/**
 * Definição dos planos de assinatura da plataforma Clausent.
 *
 * Este módulo centraliza todas as informações sobre planos,
 * incluindo preços, limites, features e price IDs do Stripe.
 * Os price IDs são carregados via variáveis de ambiente para
 * separar ambientes de teste e produção.
 */

/* ---- Tipo do plano ---- */

/** Representa um plano de assinatura completo */
export interface Plan {
  /** Nome de exibição do plano */
  name: string
  /** Slug identificador único (ex: 'starter', 'professional') */
  slug: string
  /** Preço mensal em dólares (0 = gratuito, -1 = sob consulta) */
  monthlyPrice: number
  /** Preço mensal no plano anual, em dólares (0 = gratuito, -1 = sob consulta) */
  yearlyPrice: number
  /** Price ID do Stripe para cobrança mensal (vazio para free/enterprise) */
  monthlyPriceId: string
  /** Price ID do Stripe para cobrança anual (vazio para free/enterprise) */
  yearlyPriceId: string
  /** Limite de contratos permitidos (null = ilimitado) */
  contractsLimit: number | null
  /** Lista de funcionalidades incluídas no plano */
  features: string[]
}

/* ---- Constante de planos ---- */

/**
 * Todos os planos disponíveis na plataforma.
 *
 * Estrutura de 4 planos pagos + free + enterprise (sob consulta):
 * - Free: $0/mês (1 contrato)
 * - Starter: $9/mês ou $7/mês (anual) — 5 contratos
 * - Professional: $29/mês ou $23/mês (anual) — 25 contratos (MOST POPULAR)
 * - Business: $79/mês ou $63/mês (anual) — 100 contratos
 * - Enterprise: sob consulta (ilimitado)
 */
export const PLANS: Record<string, Plan> = {
  free: {
    name: 'Free',
    slug: 'free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyPriceId: '',
    yearlyPriceId: '',
    contractsLimit: 1,
    features: [
      '1 contract',
      'Basic analysis',
      'Email alerts',
    ],
  },
  starter: {
    name: 'Starter',
    slug: 'starter',
    monthlyPrice: 9,
    yearlyPrice: 7,
    monthlyPriceId: process.env.STRIPE_PRICE_STARTER_MONTHLY || '',
    yearlyPriceId: process.env.STRIPE_PRICE_STARTER_YEARLY || '',
    contractsLimit: 5,
    features: [
      '5 contracts',
      'AI contract analysis',
      'Risk scoring',
      'Renewal alerts',
      'PDF & DOCX upload',
      'Email support',
    ],
  },
  professional: {
    name: 'Professional',
    slug: 'professional',
    monthlyPrice: 29,
    yearlyPrice: 23,
    monthlyPriceId: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY || '',
    yearlyPriceId: process.env.STRIPE_PRICE_PROFESSIONAL_YEARLY || '',
    contractsLimit: 25,
    features: [
      '25 contracts',
      'Advanced AI analysis',
      'Full risk scoring',
      'Smart alerts',
      'Market benchmarks',
      'Renegotiation playbooks',
      'Team collaboration (3 seats)',
      'Export reports',
      'Priority email support',
    ],
  },
  business: {
    name: 'Business',
    slug: 'business',
    monthlyPrice: 79,
    yearlyPrice: 63,
    monthlyPriceId: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || '',
    yearlyPriceId: process.env.STRIPE_PRICE_BUSINESS_YEARLY || '',
    contractsLimit: 100,
    features: [
      '100 contracts',
      'Full AI analysis suite',
      'Market benchmarks & trends',
      'Advanced renegotiation kit',
      'Team collaboration (10 seats)',
      'Custom templates',
      'API access',
      'Priority support (chat + email)',
      'Audit log',
      'White-label reports',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    slug: 'enterprise',
    monthlyPrice: -1,
    yearlyPrice: -1,
    monthlyPriceId: '',
    yearlyPriceId: '',
    contractsLimit: null,
    features: [
      'Unlimited contracts',
      'Unlimited team seats',
      'Dedicated account manager',
      'Custom SLA',
      'SSO & SAML',
      'On-premise option',
      'Custom AI training',
      'Training & onboarding',
      'Phone support',
    ],
  },
}

/**
 * Retorna a lista de planos disponíveis para contratação.
 *
 * Exclui o plano Enterprise (que é sob consulta/custom) e
 * retorna apenas planos que podem ser comprados via self-service.
 */
export function getAvailablePlans(): Plan[] {
  return Object.values(PLANS).filter(
    (plan) => plan.slug !== 'enterprise'
  )
}

/**
 * Retorna todos os planos, incluindo Enterprise.
 * Útil para exibição na página de pricing.
 */
export function getAllPlans(): Plan[] {
  return Object.values(PLANS)
}
