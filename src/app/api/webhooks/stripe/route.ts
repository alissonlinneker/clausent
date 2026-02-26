import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { organizations } from '@/lib/db/schema'
import { getStripe, PLANS } from '@/lib/stripe/config'
import type Stripe from 'stripe'

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
 * - customer.subscription.deleted: reverte para plano starter
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
       * Salva o customer_id e subscription_id na organização,
       * e ativa o plano selecionado pelo usuário.
       */
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        /** Extrai dados do metadata definido na criação do checkout */
        const orgId = session.metadata?.orgId
        const planId = session.metadata?.planId as keyof typeof PLANS | undefined

        if (!orgId || !planId) {
          console.error('[STRIPE_WEBHOOK] Metadata ausente no checkout:', session.id)
          break
        }

        /** Atualiza a organização com os dados do Stripe */
        await db
          .update(organizations)
          .set({
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            plan: planId,
            updatedAt: new Date(),
          })
          .where(eq(organizations.id, orgId))

        console.log(`[STRIPE_WEBHOOK] Plano ${planId} ativado para org ${orgId}`)
        break
      }

      /**
       * Assinatura atualizada (upgrade/downgrade via portal).
       * Identifica o novo plano pelo price_id e atualiza no banco.
       */
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        /** Extrai o orgId do metadata da subscription */
        const orgId = subscription.metadata?.orgId

        if (!orgId) {
          console.error('[STRIPE_WEBHOOK] Metadata orgId ausente na subscription:', subscription.id)
          break
        }

        /** Identifica o plano pelo price_id do primeiro item */
        const priceId = subscription.items.data[0]?.price.id
        const newPlan = Object.entries(PLANS).find(
          ([, plan]) => plan.priceId === priceId
        )

        if (newPlan) {
          const [planId] = newPlan

          await db
            .update(organizations)
            .set({
              plan: planId as keyof typeof PLANS,
              updatedAt: new Date(),
            })
            .where(eq(organizations.id, orgId))

          console.log(`[STRIPE_WEBHOOK] Plano atualizado para ${planId} na org ${orgId}`)
        }
        break
      }

      /**
       * Assinatura cancelada/expirada.
       * Reverte a organização para o plano starter (gratuito).
       */
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        const orgId = subscription.metadata?.orgId

        if (!orgId) {
          console.error('[STRIPE_WEBHOOK] Metadata orgId ausente na subscription deletada:', subscription.id)
          break
        }

        /** Reverte para o plano starter e limpa o subscription_id */
        await db
          .update(organizations)
          .set({
            plan: 'starter',
            stripeSubscriptionId: null,
            updatedAt: new Date(),
          })
          .where(eq(organizations.id, orgId))

        console.log(`[STRIPE_WEBHOOK] Assinatura cancelada para org ${orgId}, revertido para starter`)
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
