import { db } from '@/lib/db'
import { auditLog } from '@/lib/db/schema'

/**
 * Registra uma ação no log de auditoria.
 *
 * Usar em todas as mutations que modificam dados críticos
 * (ex: atualização de organização, criação de contratos, etc.).
 *
 * @param orgId - ID da organização onde a ação ocorreu
 * @param userId - ID do usuário que executou a ação (pode ser null para ações de sistema)
 * @param action - Identificador da ação (ex: 'organization.update', 'contract.create')
 * @param details - Objeto com detalhes adicionais da ação (opcional)
 */
export async function logAuditAction(
  orgId: string,
  userId: string | null,
  action: string,
  details?: Record<string, unknown>
) {
  await db.insert(auditLog).values({
    orgId,
    userId,
    action,
    details: details || null,
  })
}
