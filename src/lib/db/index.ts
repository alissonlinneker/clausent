import { neon, type NeonQueryFunction } from '@neondatabase/serverless'
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http'
import * as schema from './schema'

/**
 * Conexão lazy com o Neon PostgreSQL.
 * A instância é criada sob demanda (na primeira chamada)
 * para evitar erros em build time quando DATABASE_URL
 * não está disponível.
 */
let _db: NeonHttpDatabase<typeof schema> | null = null

/** Retorna a instância do Drizzle ORM, criando-a se necessário */
function getDb(): NeonHttpDatabase<typeof schema> {
  if (!_db) {
    const sql: NeonQueryFunction<false, false> = neon(process.env.DATABASE_URL!)
    _db = drizzle(sql, { schema })
  }
  return _db
}

/**
 * Proxy que delega todas as operações para a instância lazy do Drizzle.
 * Permite usar `db.query`, `db.insert`, etc. normalmente,
 * mas a conexão real só é criada no primeiro acesso.
 */
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    const instance = getDb()
    const value = Reflect.get(instance, prop, receiver)
    if (typeof value === 'function') {
      return value.bind(instance)
    }
    return value
  },
})

export type Database = NeonHttpDatabase<typeof schema>
