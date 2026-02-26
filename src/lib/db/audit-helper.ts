import { db } from '@/lib/db'
import { auditLog } from '@/lib/db/schema'

/**
 * Registra uma ação no log de auditoria.
 *
 * Usar em todas as mutations que modificam dados críticos
 * (ex: criação de contratos, atualização de perfil, etc.).
 *
 * @param userId - ID do usuário que executou a ação
 * @param action - Identificador da ação (ex: 'contract.create', 'profile.update')
 * @param details - Objeto com detalhes adicionais da ação (opcional)
 */
export async function logAuditAction(
  userId: string,
  action: string,
  details?: Record<string, unknown>
) {
  await db.insert(auditLog).values({
    userId,
    action,
    details: details || null,
  })
}
