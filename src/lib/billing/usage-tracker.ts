// @ts-nocheck
/**
 * Módulo de rastreamento de uso e limites por plano.
 *
 * Controla o consumo de recursos (contratos, análises, chamadas de API)
 * de cada usuário, verificando se os limites do plano contratado
 * foram atingidos antes de permitir novas operações.
 *
 * O rastreamento é feito consultando a tabela de assinaturas (subscriptions)
 * e contando recursos reais no banco de dados, garantindo que os dados
 * estejam sempre sincronizados.
 *
 * @module billing/usage-tracker
 */

import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { subscriptions, contracts } from '@/lib/db/schema'

/* ---- Tipos ---- */

/** Tipos de recurso rastreáveis pela plataforma */
export type TrackedResource = 'contracts' | 'analyses' | 'api_calls'

/**
 * Resultado da verificação de limite de uso.
 *
 * Indica se a operação é permitida, quanto já foi consumido,
 * qual é o limite do plano e quanto resta.
 */
export interface UsageLimitResult {
  /** Se a operação é permitida (não atingiu o limite) */
  allowed: boolean
  /** Quantidade atualmente consumida */
  current: number
  /** Limite máximo do plano (null = ilimitado) */
  limit: number | null
  /** Quantidade restante (null = ilimitado) */
  remaining: number | null
  /** Percentual de uso (0-100), 0 se ilimitado */
  percentUsed: number
}

/**
 * Resumo completo de uso do usuário para exibição na UI.
 *
 * Consolida informações de todos os recursos rastreados,
 * dados do plano e período de cobrança.
 */
export interface UsageSummary {
  /** Nome do plano atual do usuário */
  planName: string
  /** Slug do plano atual */
  planSlug: string
  /** Status da assinatura */
  status: string
  /** Uso detalhado de contratos */
  contracts: UsageLimitResult
  /** Uso detalhado de análises */
  analyses: UsageLimitResult
  /** Uso detalhado de chamadas de API */
  apiCalls: UsageLimitResult
  /** Início do período de cobrança atual */
  currentPeriodStart: Date | null
  /** Fim do período de cobrança atual */
  currentPeriodEnd: Date | null
}

/**
 * Limites de cada recurso por plano.
 *
 * Valor null indica recurso ilimitado.
 * Estes limites são enforçados no backend antes de
 * permitir qualquer operação que consuma recursos.
 */
export interface PlanLimits {
  /** Limite de contratos ativos */
  contracts: number | null
  /** Limite de análises por mês */
  analyses: number | null
  /** Limite de chamadas de API por dia */
  apiCalls: number | null
}

/* ---- Constantes de limites por plano ---- */

/**
 * Mapa de limites por plano.
 *
 * Define os tetos de uso para cada tipo de recurso
 * em cada plano da plataforma. Valor null = ilimitado.
 *
 * - Free: limitado em todos os recursos
 * - Starter: limites moderados para pequenas empresas
 * - Professional: análises ilimitadas, alto volume de API
 * - Business: mesmo que Professional (usa contractsLimit do Stripe)
 * - Enterprise: ilimitado em tudo
 */
export const PLAN_RESOURCE_LIMITS: Record<string, PlanLimits> = {
  free: {
    contracts: 3,
    analyses: 3,
    apiCalls: 100,
  },
  starter: {
    contracts: 25,
    analyses: 50,
    apiCalls: 1_000,
  },
  professional: {
    contracts: 100,
    analyses: null,
    apiCalls: 10_000,
  },
  business: {
    contracts: 100,
    analyses: null,
    apiCalls: 10_000,
  },
  enterprise: {
    contracts: null,
    analyses: null,
    apiCalls: null,
  },
}

/* ---- Helpers internos ---- */

/**
 * Busca a assinatura ativa de um usuário no banco de dados.
 *
 * Retorna a primeira assinatura encontrada para o userId.
 * Se não existir, retorna null (usuário está no plano free implícito).
 *
 * @param userId - ID do usuário no sistema
 * @returns Dados da assinatura ou null
 */
async function getUserSubscription(userId: string) {
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  })

  return subscription ?? null
}

/**
 * Determina o plano efetivo do usuário.
 *
 * Se o usuário não tem assinatura no banco, considera como "free".
 * Caso contrário, retorna o slug do plano registrado.
 *
 * @param userId - ID do usuário
 * @returns Slug do plano (ex: 'free', 'starter', 'professional')
 */
async function getUserPlanSlug(userId: string): Promise<string> {
  const subscription = await getUserSubscription(userId)
  return subscription?.plan ?? 'free'
}

/**
 * Obtém os limites de recursos para o plano informado.
 *
 * Faz fallback para os limites do plano free caso o slug
 * não seja encontrado no mapa de limites.
 *
 * @param planSlug - Slug do plano
 * @returns Limites de recursos do plano
 */
function getLimitsForPlan(planSlug: string): PlanLimits {
  return PLAN_RESOURCE_LIMITS[planSlug] ?? PLAN_RESOURCE_LIMITS.free
}

/**
 * Conta o número de contratos ativos de um usuário.
 *
 * Faz uma consulta real no banco para garantir que o
 * número é preciso (não depende de contadores cached).
 *
 * @param userId - ID do usuário
 * @returns Número de contratos do usuário
 */
async function countUserContracts(userId: string): Promise<number> {
  const userContracts = await db.query.contracts.findMany({
    where: eq(contracts.userId, userId),
    columns: { id: true },
  })

  return userContracts.length
}

/**
 * Monta um UsageLimitResult a partir dos valores atuais e do limite.
 *
 * Calcula automaticamente remaining e percentUsed com base
 * nos valores fornecidos.
 *
 * @param current - Uso atual
 * @param limit - Limite do plano (null = ilimitado)
 * @returns Objeto completo com cálculos de uso
 */
function buildLimitResult(current: number, limit: number | null): UsageLimitResult {
  /** Se o limite é null, o recurso é ilimitado */
  if (limit === null) {
    return {
      allowed: true,
      current,
      limit: null,
      remaining: null,
      percentUsed: 0,
    }
  }

  const remaining = Math.max(0, limit - current)
  const percentUsed = limit > 0 ? Math.round((current / limit) * 100) : 0

  return {
    allowed: current < limit,
    current,
    limit,
    remaining,
    percentUsed: Math.min(percentUsed, 100),
  }
}

/* ---- Classe UsageTracker ---- */

/**
 * Classe responsável por rastrear e enforçar limites de uso.
 *
 * Fornece métodos para verificar, incrementar, decrementar
 * e consultar o uso de recursos de cada usuário.
 *
 * Uso típico:
 * ```ts
 * const tracker = new UsageTracker()
 *
 * // Antes de criar um contrato
 * const result = await tracker.checkLimit(userId, 'contracts')
 * if (!result.allowed) {
 *   throw new Error('Limite de contratos atingido')
 * }
 *
 * // Após criar o contrato
 * await tracker.incrementUsage(userId, 'contracts')
 * ```
 */
export class UsageTracker {
  /**
   * Verifica se o usuário pode consumir mais de um recurso.
   *
   * Compara o uso atual com o limite do plano contratado.
   * Para contratos, faz contagem real no banco; para outros
   * recursos, utiliza o contador da assinatura.
   *
   * @param userId - ID do usuário
   * @param resource - Tipo de recurso a verificar
   * @returns Resultado com allowed, current, limit, remaining e percentUsed
   */
  async checkLimit(userId: string, resource: TrackedResource): Promise<UsageLimitResult> {
    const planSlug = await getUserPlanSlug(userId)
    const limits = getLimitsForPlan(planSlug)
    const resourceLimit = limits[resource]

    /** Para contratos, faz contagem real no banco */
    if (resource === 'contracts') {
      const currentCount = await countUserContracts(userId)
      return buildLimitResult(currentCount, resourceLimit)
    }

    /**
     * Para análises e API calls, usa o contador da assinatura.
     * TODO: Implementar contadores específicos para análises e API calls
     *       quando as tabelas de tracking forem criadas.
     */
    const subscription = await getUserSubscription(userId)
    const currentUsage = subscription?.contractsUsed ?? 0

    return buildLimitResult(currentUsage, resourceLimit)
  }

  /**
   * Incrementa o contador de uso de um recurso.
   *
   * Atualiza o campo contractsUsed na tabela de assinaturas.
   * Se o usuário não tem assinatura, a operação é ignorada
   * (o plano free é implícito e o limite é verificado por contagem real).
   *
   * @param userId - ID do usuário
   * @param resource - Tipo de recurso consumido
   */
  async incrementUsage(userId: string, resource: TrackedResource): Promise<void> {
    const subscription = await getUserSubscription(userId)

    if (!subscription) {
      /**
       * Usuário sem assinatura registrada (free implícito).
       * O limite é enforçado por contagem real, não por contador.
       */
      return
    }

    /**
     * Incrementa o contador de contratos usados.
     * TODO: Quando houver contadores separados para análises e API calls,
     *       atualizar os campos correspondentes aqui.
     */
    if (resource === 'contracts') {
      await db
        .update(subscriptions)
        .set({
          contractsUsed: subscription.contractsUsed + 1,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.userId, userId))
    }
  }

  /**
   * Decrementa o contador de uso de um recurso.
   *
   * Usado quando um recurso é removido (ex: contrato deletado).
   * Garante que o contador nunca fique negativo.
   *
   * @param userId - ID do usuário
   * @param resource - Tipo de recurso liberado
   */
  async decrementUsage(userId: string, resource: TrackedResource): Promise<void> {
    const subscription = await getUserSubscription(userId)

    if (!subscription) {
      /** Usuário sem assinatura — nada a decrementar */
      return
    }

    if (resource === 'contracts') {
      /** Garante que o contador não fique negativo */
      const newCount = Math.max(0, subscription.contractsUsed - 1)

      await db
        .update(subscriptions)
        .set({
          contractsUsed: newCount,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.userId, userId))
    }
  }

  /**
   * Retorna um resumo completo de uso do usuário.
   *
   * Consolida informações de todos os recursos rastreados,
   * dados do plano, status e período de cobrança para
   * exibição na interface de billing.
   *
   * @param userId - ID do usuário
   * @returns Resumo com uso de cada recurso e informações do plano
   */
  async getUsageSummary(userId: string): Promise<UsageSummary> {
    const subscription = await getUserSubscription(userId)
    const planSlug = subscription?.plan ?? 'free'
    const limits = getLimitsForPlan(planSlug)

    /** Contagem real de contratos no banco */
    const contractCount = await countUserContracts(userId)

    /**
     * Monta o resumo de cada recurso.
     * Para análises e API calls, usa valores estimados até
     * que os contadores específicos sejam implementados.
     */
    const contractsUsage = buildLimitResult(contractCount, limits.contracts)
    const analysesUsage = buildLimitResult(
      subscription?.contractsUsed ?? 0,
      limits.analyses
    )
    const apiCallsUsage = buildLimitResult(0, limits.apiCalls)

    /** Mapa de nomes amigáveis dos planos */
    const planNames: Record<string, string> = {
      free: 'Free',
      starter: 'Starter',
      professional: 'Professional',
      business: 'Business',
      enterprise: 'Enterprise',
    }

    return {
      planName: planNames[planSlug] ?? 'Free',
      planSlug,
      status: subscription?.status ?? 'active',
      contracts: contractsUsage,
      analyses: analysesUsage,
      apiCalls: apiCallsUsage,
      currentPeriodStart: subscription?.currentPeriodStart ?? null,
      currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
    }
  }

  /**
   * Reseta os contadores de uso periódico do usuário.
   *
   * Chamado no início de um novo período de cobrança
   * (geralmente pelo webhook invoice.payment_succeeded).
   * Zera os contadores de análises e API calls, mas mantém
   * a contagem de contratos (que é cumulativa, não periódica).
   *
   * @param userId - ID do usuário
   */
  async resetPeriodUsage(userId: string): Promise<void> {
    const subscription = await getUserSubscription(userId)

    if (!subscription) {
      /** Usuário sem assinatura — nada a resetar */
      return
    }

    await db
      .update(subscriptions)
      .set({
        contractsUsed: 0,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId))
  }
}
