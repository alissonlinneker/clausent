import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/lib/trpc/routers/_app'
import { createTRPCContext } from '@/lib/trpc/init'

/** Handler HTTP para o endpoint tRPC */
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
  })

export { handler as GET, handler as POST }
