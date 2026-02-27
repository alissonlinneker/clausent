import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { subscriptions } from '@/lib/db/schema'
import { getStripe, getPlanByPriceId, PLAN_LIMITS } from '@/lib/stripe'
import { SubscriptionManager } from '@/lib/billing/subscription-manager'
import type Stripe from 'stripe'

/* ---- Helpers internos ---- */

/**
 * Extrai o período de cobrança atual a partir dos itens da subscription.
 *
 * Na API Stripe v2025+, `current_period_start` e `current_period_end`
 * estão no `SubscriptionItem`, não mais no `Subscription` diretamente.
 */
function extractBillingPeriod(subscription: Stripe.Subscription): {
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

/**
 * Extrai o ID da subscription a partir do campo `parent` de uma Invoice.
 *
 * Na API Stripe v2025+, `Invoice.subscription` foi substituído por
 * `Invoice.parent.subscription_details.subscription`.
 */
function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const subDetails = invoice.parent?.subscription_details
  if (!subDetails?.subscription) return null

  /** Pode ser string (ID) ou objeto expandido (Subscription) */
  if (typeof subDetails.subscription === 'string') {
    return subDetails.subscription
  }
  return subDetails.subscription.id
}

/* ---- Handler do webhook ---- */

/**
 * POST /api/webhooks/stripe
 *
 * Webhook handler para eventos do Stripe.
 * Processa eventos de assinatura para manter o estado
 * do plano sincronizado entre Stripe e banco de dados.
 *
 * Eventos tratados:
 * - checkout.session.completed: ativa o plano após pagamento
 * - customer.subscription.updated: sincroniza mudanças de plano
 * - customer.subscription.deleted: reverte para plano free
 * - customer.subscription.trial_will_end: notifica fim do trial
 * - invoice.payment_succeeded: confirma pagamento bem-sucedido
 * - invoice.payment_failed: marca assinatura como inadimplente
 *
 * IMPORTANTE: Usa req.text() para ler o body cru (raw),
 * necessário para a verificação de assinatura do Stripe.
 */
export async function POST(req: Request) {
  /** Lê o body como texto cru para verificação da assinatura */
  const body = await req.text()

  /** Extrai o header de assinatura do Stripe */
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Header stripe-signature ausente' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('[STRIPE_WEBHOOK] STRIPE_WEBHOOK_SECRET não configurado')
    return NextResponse.json(
      { error: 'Webhook secret não configurado' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  /** Verifica a assinatura do webhook para garantir autenticidade */
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('[STRIPE_WEBHOOK] Falha na verificação:', error)
    return NextResponse.json(
      { error: 'Assinatura do webhook inválida' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      /**
       * Checkout concluído com sucesso.
       *
       * Cria ou atualiza o registro de assinatura do usuário
       * com os dados do Stripe (customer_id, subscription_id, price_id).
       * Também define o plano e limites de contratos.
       */
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        /** Extrai dados do metadata definido na criação do checkout */
        const userId = session.metadata?.userId
        const planSlug = session.metadata?.plan

        if (!userId || !planSlug) {
          console.error(
            '[STRIPE_WEBHOOK] Metadata ausente no checkout:',
            session.id
          )
          break
        }

        /** Recupera a subscription completa para obter price_id e período */
        const stripe = getStripe()
        const stripeSubscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )
        const stripePriceId = stripeSubscription.items.data[0]?.price.id || null

        /** Extrai período de cobrança dos itens da subscription */
        const { currentPeriodStart, currentPeriodEnd } =
          extractBillingPeriod(stripeSubscription)

        /** Verifica se já existe assinatura para este usuário */
        const existingSubscription = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.userId, userId),
        })

        /** Obtém o limite de contratos do plano */
        const contractsLimit = PLAN_LIMITS[planSlug] ?? null

        if (existingSubscription) {
          /** Atualiza assinatura existente */
          await db
            .update(subscriptions)
            .set({
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              stripePriceId,
              plan: planSlug as 'free' | 'starter' | 'professional' | 'business' | 'enterprise',
              status: 'active',
              currentPeriodStart,
              currentPeriodEnd,
              contractsLimit,
              cancelAtPeriodEnd: false,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.userId, userId))
        } else {
          /** Cria nova assinatura */
          await db.insert(subscriptions).values({
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            stripePriceId,
            plan: planSlug as 'free' | 'starter' | 'professional' | 'business' | 'enterprise',
            status: 'active',
            currentPeriodStart,
            currentPeriodEnd,
            contractsLimit,
            contractsUsed: 0,
            cancelAtPeriodEnd: false,
          })
        }

        console.log(
          `[STRIPE_WEBHOOK] Plano ${planSlug} ativado para usuário ${userId}`
        )
        break
      }

      /**
       * Assinatura atualizada (upgrade/downgrade via portal ou renovação).
       *
       * Identifica o novo plano pelo price_id e atualiza no banco.
       * Também sincroniza o período de cobrança e status de cancelamento.
       */
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        /** Extrai o userId do metadata da subscription */
        const userId = subscription.metadata?.userId

        if (!userId) {
          console.error(
            '[STRIPE_WEBHOOK] Metadata userId ausente na subscription:',
            subscription.id
          )
          break
        }

        /** Identifica o plano pelo price_id do primeiro item */
        const priceId = subscription.items.data[0]?.price.id
        const plan = priceId ? getPlanByPriceId(priceId) : null

        /** Mapeia o status do Stripe para o nosso enum de status */
        const statusMap: Record<string, string> = {
          active: 'active',
          canceled: 'canceled',
          past_due: 'past_due',
          trialing: 'trialing',
          paused: 'paused',
        }
        const mappedStatus = statusMap[subscription.status] || 'active'

        /** Extrai período de cobrança dos itens da subscription */
        const { currentPeriodStart, currentPeriodEnd } =
          extractBillingPeriod(subscription)

        /** Monta os dados para atualização */
        const updateData: Record<string, unknown> = {
          stripePriceId: priceId || null,
          status: mappedStatus as 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused',
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          updatedAt: new Date(),
        }

        /** Se identificamos o plano, atualiza também o plano e limite */
        if (plan) {
          updateData.plan = plan.slug as 'free' | 'starter' | 'professional' | 'business' | 'enterprise'
          updateData.contractsLimit = plan.contractsLimit
        }

        await db
          .update(subscriptions)
          .set(updateData)
          .where(eq(subscriptions.userId, userId))

        console.log(
          `[STRIPE_WEBHOOK] Assinatura atualizada para usuário ${userId}` +
            (plan ? ` — plano: ${plan.slug}` : '')
        )
        break
      }

      /**
       * Assinatura cancelada/expirada.
       *
       * Reverte o usuário para o plano free e limpa os dados
       * de subscription do Stripe. Mantém o stripeCustomerId
       * para permitir reativação futura sem novo cadastro.
       */
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        const userId = subscription.metadata?.userId

        if (!userId) {
          console.error(
            '[STRIPE_WEBHOOK] Metadata userId ausente na subscription deletada:',
            subscription.id
          )
          break
        }

        /** Reverte para o plano free e limpa dados da subscription */
        await db
          .update(subscriptions)
          .set({
            plan: 'free',
            status: 'canceled',
            stripeSubscriptionId: null,
            stripePriceId: null,
            contractsLimit: PLAN_LIMITS.free ?? 3,
            cancelAtPeriodEnd: false,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.userId, userId))

        console.log(
          `[STRIPE_WEBHOOK] Assinatura cancelada para usuário ${userId}, revertido para free`
        )
        break
      }

      /**
       * Pagamento de fatura bem-sucedido.
       *
       * Confirma que o pagamento recorrente foi processado.
       * Reseta o contador de contratos usados no novo período
       * e garante que o status está como ativo.
       */
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice

        /** Extrai o ID da subscription do campo parent da Invoice */
        const subscriptionId = getSubscriptionIdFromInvoice(invoice)
        if (!subscriptionId) break

        const stripe = getStripe()

        /** Recupera a subscription para obter o userId do metadata */
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscriptionId
        )

        const userId = stripeSubscription.metadata?.userId

        if (!userId) {
          console.error(
            '[STRIPE_WEBHOOK] Metadata userId ausente na subscription da fatura:',
            invoice.id
          )
          break
        }

        /** Extrai período de cobrança atualizado */
        const { currentPeriodStart, currentPeriodEnd } =
          extractBillingPeriod(stripeSubscription)

        /** Atualiza período e reseta contador de uso */
        await db
          .update(subscriptions)
          .set({
            status: 'active',
            currentPeriodStart,
            currentPeriodEnd,
            contractsUsed: 0,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.userId, userId))

        console.log(
          `[STRIPE_WEBHOOK] Pagamento confirmado para usuário ${userId}`
        )
        break
      }

      /**
       * Pagamento de fatura falhou.
       *
       * Marca a assinatura como inadimplente (past_due).
       * O Stripe fará retry automático conforme configuração do account.
       * Se todos os retries falharem, o evento subscription.deleted será emitido.
       */
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        /** Extrai o ID da subscription do campo parent da Invoice */
        const subscriptionId = getSubscriptionIdFromInvoice(invoice)
        if (!subscriptionId) break

        const stripe = getStripe()

        /** Recupera a subscription para obter o userId do metadata */
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscriptionId
        )

        const userId = stripeSubscription.metadata?.userId

        if (!userId) {
          console.error(
            '[STRIPE_WEBHOOK] Metadata userId ausente na subscription da fatura falha:',
            invoice.id
          )
          break
        }

        /** Marca como inadimplente */
        await db
          .update(subscriptions)
          .set({
            status: 'past_due',
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.userId, userId))

        console.log(
          `[STRIPE_WEBHOOK] Pagamento falhou para usuário ${userId} — status: past_due`
        )

        // TODO: Enviar e-mail de notificação ao usuário sobre falha no pagamento
        break
      }

      /**
       * Trial está prestes a expirar (3 dias antes do fim).
       *
       * O Stripe envia este evento para que a aplicação possa
       * notificar o usuário de que o período de trial está acabando
       * e que a cobrança será iniciada automaticamente.
       *
       * Delega o tratamento para o SubscriptionManager, que
       * atualiza o banco e dispara notificações.
       */
      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription

        const userId = subscription.metadata?.userId

        if (!userId) {
          console.error(
            '[STRIPE_WEBHOOK] Metadata userId ausente no trial_will_end:',
            subscription.id
          )
          break
        }

        /** Delega para o SubscriptionManager tratar o fim do trial */
        const subscriptionManager = new SubscriptionManager()
        await subscriptionManager.handleTrialEnd(userId)

        console.log(
          `[STRIPE_WEBHOOK] Trial expirando em breve para usuário ${userId}`
        )
        break
      }

      default:
        /** Eventos não tratados são ignorados silenciosamente */
        console.log(`[STRIPE_WEBHOOK] Evento não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[STRIPE_WEBHOOK] Erro ao processar evento:', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
}
