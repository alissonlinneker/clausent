// @ts-nocheck
/**
 * Módulo de gerenciamento do ciclo de vida de assinaturas.
 *
 * Centraliza todas as operações de assinatura: criação, cancelamento,
 * reativação, troca de plano, tratamento de trial e sincronização
 * com o Stripe.
 *
 * Este módulo atua como uma camada intermediária entre o sistema
 * e o Stripe, garantindo que o estado da assinatura no banco de dados
 * esteja sempre consistente com o Stripe.
 *
 * @module billing/subscription-manager
 */

import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { subscriptions } from '@/lib/db/schema'
import { getStripe, getPlanByPriceId, PLAN_LIMITS } from '@/lib/stripe'

/* ---- Tipos ---- */

/**
 * Resultado da criação de uma assinatura.
 *
 * Contém a URL de checkout do Stripe para redirecionar o usuário,
 * além do ID da sessão para rastreamento.
 */
export interface SubscriptionResult {
  /** URL do Stripe Checkout para redirecionar o usuário */
  checkoutUrl: string | null
  /** ID da sessão de checkout no Stripe */
  sessionId: string
  /** Indica se a criação foi bem-sucedida */
  success: boolean
}

/**
 * Dados de uma assinatura para exibição na UI.
 *
 * Combina informações do banco de dados local com
 * dados essenciais do Stripe.
 */
export interface SubscriptionInfo {
  /** ID interno da assinatura */
  id: string
  /** Plano atual (slug) */
  plan: string
  /** Status atual da assinatura */
  status: string
  /** ID do cliente no Stripe */
  stripeCustomerId: string | null
  /** ID da assinatura no Stripe */
  stripeSubscriptionId: string | null
  /** ID do preço no Stripe */
  stripePriceId: string | null
  /** Início do período de cobrança atual */
  currentPeriodStart: Date | null
  /** Fim do período de cobrança atual */
  currentPeriodEnd: Date | null
  /** Se a assinatura será cancelada ao final do período */
  cancelAtPeriodEnd: boolean
  /** Limite de contratos do plano */
  contractsLimit: number | null
  /** Contratos já utilizados no período */
  contractsUsed: number
}

/* ---- Helpers internos ---- */

/**
 * Extrai o período de cobrança dos itens de uma subscription do Stripe.
 *
 * Na API Stripe v2025+, o período está nos SubscriptionItems,
 * não mais diretamente na Subscription.
 *
 * @param subscription - Objeto Subscription do Stripe
 * @returns Datas de início e fim do período atual
 */
function extractBillingPeriod(subscription: any): {
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
} {
  const firstItem = subscription.items?.data?.[0]

  if (!firstItem) {
    return { currentPeriodStart: null, currentPeriodEnd: null }
  }

  return {
    currentPeriodStart: new Date(firstItem.current_period_start * 1000),
    currentPeriodEnd: new Date(firstItem.current_period_end * 1000),
  }
}

/* ---- Classe SubscriptionManager ---- */

/**
 * Gerenciador do ciclo de vida de assinaturas.
 *
 * Encapsula toda a lógica de negócio relacionada a assinaturas,
 * desde a criação até o cancelamento, passando por upgrades,
 * downgrades e sincronização com o Stripe.
 *
 * Uso típico:
 * ```ts
 * const manager = new SubscriptionManager()
 *
 * // Criar nova assinatura
 * const result = await manager.createSubscription(userId, priceId)
 * redirect(result.checkoutUrl)
 *
 * // Cancelar ao final do período
 * await manager.cancelSubscription(userId, true)
 *
 * // Consultar assinatura atual
 * const sub = await manager.getSubscription(userId)
 * ```
 */
export class SubscriptionManager {
  /**
   * Cria uma nova assinatura para o usuário.
   *
   * Gera uma sessão de checkout no Stripe e retorna a URL
   * para redirecionar o usuário ao formulário de pagamento.
   *
   * Se o usuário já possui um stripeCustomerId (de uma assinatura
   * anterior), reutiliza o customer existente no Stripe.
   *
   * @param userId - ID do usuário no sistema
   * @param priceId - ID do preço no Stripe (mensal ou anual)
   * @returns URL de checkout e ID da sessão
   *
   * @throws Error se o priceId não corresponder a um plano válido
   */
  async createSubscription(userId: string, priceId: string): Promise<SubscriptionResult> {
    const stripe = getStripe()

    /** Identifica o plano pelo priceId */
    const plan = getPlanByPriceId(priceId)

    if (!plan) {
      throw new Error(`Plano não encontrado para o priceId: ${priceId}`)
    }

    /** Verifica se o usuário já tem uma assinatura (para reutilizar customer) */
    const existingSubscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
    })

    /** Monta os parâmetros da sessão de checkout */
    const sessionParams: any = {
      mode: 'subscription' as const,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        plan: plan.slug,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
    }

    /**
     * Se o usuário já tem um customer no Stripe, reutiliza.
     * Isso evita criar customers duplicados e mantém o histórico.
     */
    if (existingSubscription?.stripeCustomerId) {
      sessionParams.customer = existingSubscription.stripeCustomerId
    }

    /** Cria a sessão de checkout no Stripe */
    const session = await stripe.checkout.sessions.create(sessionParams)

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
      success: true,
    }
  }

  /**
   * Cancela a assinatura do usuário.
   *
   * Pode cancelar imediatamente ou ao final do período de cobrança
   * atual (recomendado), dependendo do parâmetro atPeriodEnd.
   *
   * O cancelamento ao final do período permite que o usuário
   * continue usando o plano até a data de expiração.
   *
   * @param userId - ID do usuário
   * @param atPeriodEnd - Se true, cancela ao final do período atual;
   *                      se false, cancela imediatamente
   *
   * @throws Error se o usuário não tiver assinatura ativa no Stripe
   */
  async cancelSubscription(userId: string, atPeriodEnd: boolean = true): Promise<void> {
    const stripe = getStripe()

    /** Busca a assinatura do usuário no banco */
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
    })

    if (!subscription?.stripeSubscriptionId) {
      throw new Error('Usuário não possui assinatura ativa no Stripe.')
    }

    if (atPeriodEnd) {
      /**
       * Cancelamento ao final do período.
       * O Stripe marca cancel_at_period_end = true e continua
       * fornecendo acesso até o fim do ciclo de cobrança.
       */
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      })

      /** Atualiza o flag no banco local */
      await db
        .update(subscriptions)
        .set({
          cancelAtPeriodEnd: true,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.userId, userId))
    } else {
      /**
       * Cancelamento imediato.
       * O Stripe cancela a subscription e emite o evento
       * customer.subscription.deleted, que será tratado pelo webhook.
       */
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)

      /** Reverte para o plano free no banco local */
      await db
        .update(subscriptions)
        .set({
          plan: 'free',
          status: 'canceled',
          stripeSubscriptionId: null,
          stripePriceId: null,
          cancelAtPeriodEnd: false,
          contractsLimit: PLAN_LIMITS.free ?? 3,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.userId, userId))
    }
  }

  /**
   * Reativa uma assinatura que está marcada para cancelamento.
   *
   * Remove o flag cancel_at_period_end no Stripe, fazendo com
   * que a assinatura continue sendo renovada normalmente.
   *
   * Só funciona para assinaturas que ainda não foram efetivamente
   * canceladas (ou seja, cancelAtPeriodEnd = true, mas o período
   * ainda não acabou).
   *
   * @param userId - ID do usuário
   *
   * @throws Error se o usuário não tiver assinatura ativa ou
   *               se a assinatura não estiver marcada para cancelamento
   */
  async reactivateSubscription(userId: string): Promise<void> {
    const stripe = getStripe()

    /** Busca a assinatura do usuário */
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
    })

    if (!subscription?.stripeSubscriptionId) {
      throw new Error('Usuário não possui assinatura ativa no Stripe.')
    }

    if (!subscription.cancelAtPeriodEnd) {
      throw new Error('A assinatura não está marcada para cancelamento.')
    }

    /** Remove o cancelamento pendente no Stripe */
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    })

    /** Atualiza o banco local */
    await db
      .update(subscriptions)
      .set({
        cancelAtPeriodEnd: false,
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId))
  }

  /**
   * Altera o plano da assinatura (upgrade ou downgrade).
   *
   * Substitui o item atual da subscription pelo novo priceId.
   * O Stripe calcula automaticamente o proration (cobrança proporcional)
   * e ajusta a próxima fatura.
   *
   * Em caso de upgrade, o acesso ao novo plano é imediato.
   * Em caso de downgrade, o novo limite será aplicado na próxima
   * renovação, mas os dados de plano são atualizados imediatamente.
   *
   * @param userId - ID do usuário
   * @param newPriceId - ID do novo preço no Stripe
   *
   * @throws Error se o priceId não corresponder a um plano válido
   * @throws Error se o usuário não tiver assinatura ativa
   */
  async changePlan(userId: string, newPriceId: string): Promise<void> {
    const stripe = getStripe()

    /** Identifica o novo plano */
    const newPlan = getPlanByPriceId(newPriceId)

    if (!newPlan) {
      throw new Error(`Plano não encontrado para o priceId: ${newPriceId}`)
    }

    /** Busca a assinatura do usuário */
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
    })

    if (!subscription?.stripeSubscriptionId) {
      throw new Error('Usuário não possui assinatura ativa no Stripe.')
    }

    /** Recupera a subscription completa do Stripe para obter o item atual */
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    )

    const currentItem = stripeSubscription.items.data[0]

    if (!currentItem) {
      throw new Error('Subscription do Stripe não possui itens.')
    }

    /**
     * Atualiza o item da subscription com o novo priceId.
     * O Stripe calcula o proration automaticamente.
     * proration_behavior: 'create_prorations' garante cobrança justa.
     */
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      items: [
        {
          id: currentItem.id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
      /** Se estava marcado para cancelar, remove o cancelamento */
      cancel_at_period_end: false,
    })

    /** Atualiza o banco local com o novo plano */
    await db
      .update(subscriptions)
      .set({
        plan: newPlan.slug as any,
        stripePriceId: newPriceId,
        contractsLimit: newPlan.contractsLimit,
        cancelAtPeriodEnd: false,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId))
  }

  /**
   * Retorna os dados da assinatura do usuário.
   *
   * Busca no banco de dados local. Se o usuário não tiver
   * assinatura registrada, retorna null (plano free implícito).
   *
   * @param userId - ID do usuário
   * @returns Dados da assinatura ou null
   */
  async getSubscription(userId: string): Promise<SubscriptionInfo | null> {
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
    })

    if (!subscription) {
      return null
    }

    return {
      id: subscription.id,
      plan: subscription.plan,
      status: subscription.status,
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      stripePriceId: subscription.stripePriceId,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      contractsLimit: subscription.contractsLimit,
      contractsUsed: subscription.contractsUsed,
    }
  }

  /**
   * Trata o fim do período de trial de um usuário.
   *
   * Chamado quando o Stripe emite o evento
   * customer.subscription.trial_will_end (3 dias antes do fim).
   *
   * Atualiza o status no banco local e pode disparar
   * notificações ao usuário sobre o fim do trial.
   *
   * @param userId - ID do usuário
   */
  async handleTrialEnd(userId: string): Promise<void> {
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
    })

    if (!subscription) {
      console.warn(
        `[SubscriptionManager] handleTrialEnd: assinatura não encontrada para userId=${userId}`
      )
      return
    }

    /**
     * Atualiza o status para indicar que o trial está acabando.
     * A mudança real de status (active ou canceled) virá via
     * webhook quando o trial efetivamente terminar.
     */
    await db
      .update(subscriptions)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId))

    /**
     * TODO: Enviar e-mail de notificação ao usuário avisando
     *       que o período de trial termina em 3 dias e que
     *       será cobrado automaticamente.
     */
    console.log(
      `[SubscriptionManager] Trial terminando em breve para userId=${userId}`
    )
  }

  /**
   * Sincroniza o estado local com os dados do Stripe.
   *
   * Recebe um objeto Subscription do Stripe (geralmente de um
   * webhook) e atualiza o banco de dados local para refletir
   * o estado mais recente.
   *
   * Usado principalmente pelos handlers de webhook para garantir
   * consistência entre Stripe e banco local.
   *
   * @param stripeSubscription - Objeto Subscription retornado pelo Stripe
   */
  async syncWithStripe(stripeSubscription: any): Promise<void> {
    /** Extrai o userId do metadata da subscription */
    const userId = stripeSubscription.metadata?.userId

    if (!userId) {
      console.error(
        '[SubscriptionManager] syncWithStripe: metadata userId ausente na subscription:',
        stripeSubscription.id
      )
      return
    }

    /** Identifica o plano pelo priceId do primeiro item */
    const priceId = stripeSubscription.items?.data?.[0]?.price?.id
    const plan = priceId ? getPlanByPriceId(priceId) : null

    /** Mapeia o status do Stripe para o enum local */
    const statusMap: Record<string, string> = {
      active: 'active',
      canceled: 'canceled',
      past_due: 'past_due',
      trialing: 'trialing',
      paused: 'paused',
    }
    const mappedStatus = statusMap[stripeSubscription.status] ?? 'active'

    /** Extrai período de cobrança */
    const { currentPeriodStart, currentPeriodEnd } =
      extractBillingPeriod(stripeSubscription)

    /** Verifica se já existe assinatura para este usuário */
    const existingSubscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
    })

    /** Monta os dados para inserção/atualização */
    const subscriptionData: Record<string, unknown> = {
      stripeCustomerId: stripeSubscription.customer,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: priceId ?? null,
      status: mappedStatus,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end ?? false,
      updatedAt: new Date(),
    }

    /** Se identificamos o plano, inclui dados do plano */
    if (plan) {
      subscriptionData.plan = plan.slug
      subscriptionData.contractsLimit = plan.contractsLimit
    }

    if (existingSubscription) {
      /** Atualiza a assinatura existente */
      await db
        .update(subscriptions)
        .set(subscriptionData)
        .where(eq(subscriptions.userId, userId))
    } else {
      /** Cria nova assinatura */
      await db.insert(subscriptions).values({
        userId,
        ...subscriptionData,
        contractsUsed: 0,
        plan: (plan?.slug ?? 'free') as any,
      })
    }

    console.log(
      `[SubscriptionManager] Assinatura sincronizada para userId=${userId}` +
        (plan ? ` — plano: ${plan.slug}` : '') +
        ` — status: ${mappedStatus}`
    )
  }
}
