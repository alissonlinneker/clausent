import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

/**
 * Cria a conexão HTTP com o Neon PostgreSQL.
 * Usa variável de ambiente DATABASE_URL.
 */
const sql = neon(process.env.DATABASE_URL!)

/** Instância do Drizzle ORM com todos os schemas carregados */
export const db = drizzle(sql, { schema })

export type Database = typeof db
