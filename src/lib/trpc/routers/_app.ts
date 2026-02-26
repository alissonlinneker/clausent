import { router } from '../init'

/** Router raiz — todos os sub-routers são agregados aqui */
export const appRouter = router({
  // Sub-routers serão adicionados nas próximas tasks
})

export type AppRouter = typeof appRouter
