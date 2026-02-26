import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { organizations, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Webhook do Clerk — sincroniza eventos de organização e membros
 * com o banco de dados local.
 *
 * Eventos tratados:
 * - organization.created: cria registro da organização no banco
 * - organizationMembership.created: vincula usuário à organização
 *
 * A verificação da assinatura é feita via Svix para garantir
 * que o payload é legítimo e veio do Clerk.
 */
export async function POST(req: Request) {
  /** Secret usada para verificar a assinatura do webhook */
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('CLERK_WEBHOOK_SECRET não configurado')
  }

  /** Extrai os cabeçalhos svix necessários para verificação */
  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  /** Se algum cabeçalho estiver ausente, rejeita a requisição */
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Cabeçalhos svix ausentes', { status: 400 })
  }

  /** Lê e serializa o corpo da requisição */
  const payload = await req.json()
  const body = JSON.stringify(payload)

  /** Inicializa o verificador de webhook do Svix */
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  /** Verifica a assinatura do webhook */
  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch {
    return new Response('Verificação de webhook falhou', { status: 400 })
  }

  const eventType = evt.type

  /**
   * Evento: organização criada.
   * Insere o registro da organização no banco com os dados do Clerk.
   */
  if (eventType === 'organization.created') {
    const { id, name } = evt.data
    await db.insert(organizations).values({
      clerkOrgId: id,
      name: name,
    })
  }

  /**
   * Evento: membro adicionado à organização.
   * Busca a organização correspondente e insere o usuário vinculado.
   * Usa onConflictDoNothing para evitar duplicatas.
   */
  if (eventType === 'organizationMembership.created') {
    const { organization, public_user_data } = evt.data
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.clerkOrgId, organization.id),
    })

    if (org) {
      await db
        .insert(users)
        .values({
          clerkUserId: public_user_data.user_id,
          orgId: org.id,
          email: public_user_data.identifier || '',
          name: `${public_user_data.first_name || ''} ${public_user_data.last_name || ''}`.trim(),
          role: evt.data.role === 'org:admin' ? 'admin' : 'member',
        })
        .onConflictDoNothing()
    }
  }

  return new Response('OK', { status: 200 })
}
