import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { subscriptions } from '@/lib/db/schema'
import { getStripe } from '@/lib/stripe'

/**
 * POST /api/stripe/portal
 *
 * Cria uma sessão do Customer Portal do Stripe.
 * O portal permite que o cliente gerencie sua assinatura:
 * alterar plano, cancelar, atualizar forma de pagamento, etc.
 *
 * Requer que o usuário já possua um stripeCustomerId
 * (criado após o primeiro checkout bem-sucedido).
 *
 * Autenticação: Better Auth (sessão via cookie/header).
 */
export async function POST() {
  try {
    /**
     * Obtém a sessão do usuário via Better Auth.
     * Faz uma chamada interna à rota de sessão para validar
     * o cookie de autenticação.
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

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    /**
     * Busca a assinatura do usuário no banco de dados.
     * Precisamos do stripeCustomerId para abrir o portal.
     */
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
    })

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura ativa encontrada' },
        { status: 400 }
      )
    }

    const stripe = getStripe()

    /**
     * Cria a sessão do portal do cliente no Stripe.
     * O return_url redireciona de volta para a página de billing
     * quando o usuário terminar de gerenciar a assinatura.
     */
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('[STRIPE_PORTAL] Erro ao criar sessão:', error)
    return NextResponse.json(
      { error: 'Erro ao criar sessão do portal' },
      { status: 500 }
    )
  }
}
