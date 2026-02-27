// @ts-nocheck
/**
 * Configuração base do tRPC para o servidor.
 *
 * Define o contexto, middlewares de autenticação e
 * procedimentos base (público e protegido) usados
 * por todos os routers da aplicação.
 *
 * NOTA: Requer instalação de @trpc/server e @trpc/client.
 * Executar: pnpm add @trpc/server @trpc/client @trpc/react-query @trpc/next
 */

import { initTRPC, TRPCError } from '@trpc/server'
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Database } from '@/lib/db'

/* ---- Contexto ---- */

/**
 * Contexto compartilhado por todos os procedimentos tRPC.
 *
 * Contém a instância do banco de dados, dados da sessão
 * (se autenticado) e headers da requisição original.
 */
export interface TRPCContext {
  /** Instância do Drizzle ORM */
  db: Database
  /** Sessão do usuário autenticado (null se não autenticado) */
  session: Awaited<ReturnType<typeof auth.api.getSession>>
  /** Headers da requisição original */
  headers: Headers
}

/**
 * Cria o contexto para cada requisição tRPC.
 *
 * Valida a sessão via Better Auth usando os headers
 * da requisição (cookie de sessão). O contexto é criado
 * uma vez por requisição e compartilhado entre todos os
 * procedimentos chamados nessa requisição.
 */
export async function createTRPCContext(
  opts: FetchCreateContextFnOptions
): Promise<TRPCContext> {
  /** Obtém a sessão do Better Auth a partir dos headers */
  const session = await auth.api.getSession({
    headers: opts.req.headers,
  })

  return {
    db,
    session,
    headers: opts.req.headers,
  }
}

/* ---- Inicialização do tRPC ---- */

/**
 * Instância do tRPC inicializada com o tipo de contexto.
 * Usada para criar routers, procedimentos e middlewares.
 */
const t = initTRPC.context<TRPCContext>().create({
  /**
   * Formatador de erros customizado.
   * Pode ser expandido para incluir logging, Sentry, etc.
   */
  errorFormatter({ shape }) {
    return shape
  },
})

/* ---- Exportações base ---- */

/** Cria um novo router tRPC */
export const router = t.router

/** Procedimento público — sem autenticação necessária */
export const publicProcedure = t.procedure

/* ---- Middleware de autenticação ---- */

/**
 * Middleware que verifica se o usuário está autenticado.
 *
 * Valida que existe uma sessão válida no contexto.
 * Se não houver sessão, lança um erro UNAUTHORIZED
 * que é retornado ao cliente como HTTP 401.
 *
 * O middleware enriquece o contexto com a sessão
 * garantidamente não-null para uso nos procedimentos.
 */
const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Autenticação necessária. Faça login para continuar.',
    })
  }

  return next({
    ctx: {
      /** Sessão garantidamente autenticada */
      session: ctx.session,
      /** Usuário autenticado (atalho para session.user) */
      user: ctx.session.user,
    },
  })
})

/**
 * Procedimento protegido — requer autenticação.
 *
 * Usa o middleware enforceAuth para garantir que
 * ctx.session e ctx.user estão disponíveis.
 */
export const protectedProcedure = t.procedure.use(enforceAuth)
