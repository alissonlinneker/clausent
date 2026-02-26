import { initTRPC, TRPCError } from '@trpc/server'
import { auth } from '@clerk/nextjs/server'
import superjson from 'superjson'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Contexto base do tRPC — injetado em todos os procedures.
 * Inclui a instância do banco e os dados de autenticação do Clerk.
 */
export const createTRPCContext = async () => {
  const { userId, orgId } = await auth()

  return {
    db,
    clerkUserId: userId,
    clerkOrgId: orgId,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure

/**
 * Middleware que exige autenticação e resolve o usuário/organização do banco.
 * Injeta dbUser e orgId no contexto para procedures protegidos.
 */
const enforceAuth = t.middleware(async ({ ctx, next }) => {
  if (!ctx.clerkUserId || !ctx.clerkOrgId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  const dbUser = await ctx.db.query.users.findFirst({
    where: eq(users.clerkUserId, ctx.clerkUserId),
  })

  if (!dbUser) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Usuário não encontrado no banco' })
  }

  return next({
    ctx: {
      ...ctx,
      dbUser,
      orgId: dbUser.orgId,
    },
  })
})

/** Procedure que exige autenticação — usar para todas as rotas protegidas */
export const protectedProcedure = t.procedure.use(enforceAuth)
