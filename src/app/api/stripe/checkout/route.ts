import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getStripe, PLANS } from '@/lib/stripe'

/**
 * POST /api/stripe/checkout
 *
 * Cria uma sessão de checkout do Stripe para assinatura.
 * O usuário é redirecionado para o Stripe Checkout onde
 * fornece os dados de pagamento. Após o pagamento,
 * o webhook processa a ativação do plano.
 *
 * Body esperado: { priceId: string, isAnnual?: boolean }
 *
 * Autenticação: Better Auth (sessão via cookie/header).
 */
export async function POST(req: Request) {
  try {
    /**
     * Obtém a sessão do usuário via Better Auth.
     *
     * O Better Auth armazena o token de sessão em cookies.
     * Fazemos uma chamada interna à API de sessão para validar.
     */
    const headersList = await headers()
    const sessionResponse = await fetch(
      `${process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/api/auth/get-session`,
      {
        headers: {
          cookie: headersList.get('cookie') || '',
        },
      }
    )

    /** Verifica se a sessão é válida */
    if (!sessionResponse.ok) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const session = await sessionResponse.json()
    const userId = session?.user?.id
    const userEmail = session?.user?.email

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    /** Extrai o priceId e flag de plano anual do corpo da requisição */
    const body = await req.json()
    const { priceId } = body as { priceId: string; isAnnual?: boolean }

    if (!priceId) {
      return NextResponse.json(
        { error: 'priceId é obrigatório' },
        { status: 400 }
      )
    }

    /**
     * Identifica o plano pelo priceId recebido.
     * Percorre todos os planos e compara tanto o price mensal
     * quanto o anual para encontrar o plano correto.
     */
    const matchedPlan = Object.entries(PLANS).find(
      ([, plan]) =>
        plan.monthlyPriceId === priceId || plan.yearlyPriceId === priceId
    )

    if (!matchedPlan) {
      return NextResponse.json(
        { error: 'Plano inválido ou não configurado no Stripe' },
        { status: 400 }
      )
    }

    const [planSlug] = matchedPlan

    const stripe = getStripe()

    /**
     * Cria a sessão de checkout do Stripe.
     *
     * Passa userId e planSlug como metadata para que o webhook
     * consiga identificar qual usuário e plano ativar.
     */
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      /** E-mail do usuário pré-preenchido no checkout */
      customer_email: userEmail || undefined,
      /** Metadata para identificação no webhook */
      metadata: {
        userId,
        plan: planSlug,
      },
      subscription_data: {
        metadata: {
          userId,
          plan: planSlug,
        },
      },
      /** URLs de redirecionamento pós-checkout */
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?canceled=true`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('[STRIPE_CHECKOUT] Erro ao criar sessão:', error)
    return NextResponse.json(
      { error: 'Erro ao criar sessão de checkout' },
      { status: 500 }
    )
  }
}
