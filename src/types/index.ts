/**
 * Tipos globais da aplicação Clausent.
 *
 * Centraliza interfaces e tipos compartilhados
 * entre múltiplos módulos do projeto.
 */

/** Planos de assinatura disponíveis */
export type PlanSlug = 'free' | 'starter' | 'professional' | 'business' | 'enterprise'

/** Status de assinatura no Stripe */
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused'

/** Categorias de contrato */
export type ContractCategory = 'saas' | 'vendor' | 'lease' | 'insurance' | 'employment' | 'nda' | 'other'

/** Status do contrato */
export type ContractStatus = 'pending' | 'analyzing' | 'analyzed' | 'error'

/** Nível de risco de uma cláusula */
export type ClauseRiskLevel = 'low' | 'medium' | 'high' | 'critical'

/** Resultado de uma análise de contrato pela IA */
export interface ContractAnalysis {
  /** Score de risco geral (0-100) */
  riskScore: number
  /** Resumo executivo do contrato */
  summary: string
  /** Cláusulas identificadas com análise de risco */
  clauses: {
    title: string
    content: string
    riskLevel: ClauseRiskLevel
    explanation: string
    suggestion?: string
  }[]
  /** Datas-chave extraídas */
  keyDates: {
    label: string
    date: string
    isAutoRenewal?: boolean
  }[]
  /** Valores financeiros identificados */
  financials: {
    totalValue?: number
    monthlyValue?: number
    currency: string
  }
  /** Sugestões de renegociação */
  renegotiationTips: string[]
}

/** Resposta padrão da API */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  details?: Record<string, string[]>
}

/** Paginação padrão */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** Parâmetros de paginação */
export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/** Informações de sessão do usuário */
export interface UserSession {
  id: string
  email: string
  name: string | null
  image: string | null
  plan: PlanSlug
  contractsUsed: number
  contractsLimit: number
}

/** Limites por plano */
export const PLAN_LIMITS: Record<PlanSlug, { contracts: number; features: string[] }> = {
  free: {
    contracts: 1,
    features: ['basic_analysis', 'pdf_upload'],
  },
  starter: {
    contracts: 10,
    features: ['basic_analysis', 'pdf_upload', 'docx_upload', 'renewal_alerts', 'email_support'],
  },
  professional: {
    contracts: 50,
    features: [
      'full_analysis', 'pdf_upload', 'docx_upload', 'renewal_alerts',
      'market_benchmarks', 'priority_support', 'team_collaboration', 'export_reports',
    ],
  },
  business: {
    contracts: 200,
    features: [
      'full_analysis', 'pdf_upload', 'docx_upload', 'renewal_alerts',
      'market_benchmarks', 'renegotiation_kit', 'priority_support',
      'team_collaboration', 'custom_templates', 'api_access',
    ],
  },
  enterprise: {
    contracts: Infinity,
    features: [
      'full_analysis', 'pdf_upload', 'docx_upload', 'renewal_alerts',
      'market_benchmarks', 'renegotiation_kit', 'dedicated_support',
      'team_collaboration', 'custom_templates', 'api_access',
      'custom_integrations', 'sso_saml', 'custom_sla', 'on_premise',
      'training_onboarding', 'audit_log',
    ],
  },
}
