import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { organizations } from '@/lib/db/schema'
import { getStripe, PLANS, type PlanId } from '@/lib/stripe/config'

/**
 * POST /api/stripe/checkout
 *
 * Cria uma sessão de checkout do Stripe para assinatura.
 * O usuário é redirecionado para o Stripe Checkout onde
 * fornece os dados de pagamento. Após o pagamento,
 * o webhook processa a ativação do plano.
 *
 * Body esperado: { planId: 'starter' | 'professional' | 'business' }
 */
export async function POST(req: Request) {
  try {
    /** Verifica autenticação do Clerk */
    const { userId, orgId } = await auth()

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    /** Extrai o plano selecionado do corpo da requisição */
    const body = await req.json()
    const planId = body.planId as PlanId

    /** Valida se o plano existe na configuração */
    if (!planId || !PLANS[planId]) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      )
    }

    const plan = PLANS[planId]

    /** Valida se o priceId está configurado para o plano */
    if (!plan.priceId) {
      return NextResponse.json(
        { error: 'Plano não configurado no Stripe' },
        { status: 500 }
      )
    }

    /** Busca a organização do usuário no banco de dados */
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.clerkOrgId, orgId),
    })

    if (!org) {
      return NextResponse.json(
        { error: 'Organização não encontrada' },
        { status: 404 }
      )
    }

    const stripe = getStripe()

    /**
     * Cria a sessão de checkout do Stripe.
     * Passa o orgId como metadata para que o webhook
     * consiga identificar qual organização ativar.
     * Se a org já tem um stripeCustomerId, reutiliza o customer.
     */
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      /** Reutiliza customer existente ou cria novo */
      ...(org.stripeCustomerId
        ? { customer: org.stripeCustomerId }
        : { customer_email: undefined }),
      /** Metadata para identificação no webhook */
      metadata: {
        orgId: org.id,
        clerkOrgId: orgId,
        planId,
      },
      subscription_data: {
        metadata: {
          orgId: org.id,
          clerkOrgId: orgId,
          planId,
        },
      },
      /** URLs de redirecionamento pós-checkout */
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[STRIPE_CHECKOUT]', error)
    return NextResponse.json(
      { error: 'Erro ao criar sessão de checkout' },
      { status: 500 }
    )
  }
}
