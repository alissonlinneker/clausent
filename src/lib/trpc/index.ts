// @ts-nocheck
/**
 * Ponto de entrada do módulo tRPC.
 *
 * Re-exporta o appRouter, tipos e contexto para facilitar
 * importações em outros módulos da aplicação.
 *
 * Uso típico:
 * ```ts
 * import { appRouter, type AppRouter, createTRPCContext } from '@/lib/trpc'
 * ```
 */

export { appRouter, type AppRouter } from './routers'
export { createTRPCContext, type TRPCContext } from './trpc'
export { router, publicProcedure, protectedProcedure } from './trpc'
