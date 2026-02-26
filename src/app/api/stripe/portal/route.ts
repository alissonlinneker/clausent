import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { organizations } from '@/lib/db/schema'
import { getStripe } from '@/lib/stripe/config'

/**
 * POST /api/stripe/portal
 *
 * Cria uma sessão do Customer Portal do Stripe.
 * O portal permite que o cliente gerencie sua assinatura:
 * alterar plano, cancelar, atualizar forma de pagamento, etc.
 *
 * Requer que a organização já tenha um stripeCustomerId
 * (criado após o primeiro checkout).
 */
export async function POST() {
  try {
    /** Verifica autenticação do Clerk */
    const { userId, orgId } = await auth()

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    /** Busca a organização do usuário no banco */
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.clerkOrgId, orgId),
    })

    if (!org) {
      return NextResponse.json(
        { error: 'Organização não encontrada' },
        { status: 404 }
      )
    }

    /** Verifica se a org possui customer no Stripe */
    if (!org.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura ativa encontrada' },
        { status: 400 }
      )
    }

    const stripe = getStripe()

    /**
     * Cria a sessão do portal do cliente.
     * O return_url redireciona de volta para a página de billing
     * quando o usuário terminar de gerenciar a assinatura.
     */
    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[STRIPE_PORTAL]', error)
    return NextResponse.json(
      { error: 'Erro ao criar sessão do portal' },
      { status: 500 }
    )
  }
}
