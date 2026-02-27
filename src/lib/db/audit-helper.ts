import { db } from '@/lib/db'
import { auditLog } from '@/lib/db/schema'

/**
 * Parâmetros para registro de ação no audit log.
 */
interface AuditLogParams {
  /** ID do usuário que executou a ação */
  userId: string
  /** Identificador da ação (ex: 'contract.create', 'member.invited') */
  action: string
  /** ID da organização (opcional — para ações dentro de workspaces) */
  orgId?: string
  /** Tipo do recurso afetado (ex: 'contract', 'organization') */
  resourceType?: string
  /** ID do recurso afetado */
  resourceId?: string
  /** Metadados adicionais em formato JSON */
  metadata?: Record<string, unknown>
  /** Endereço IP do cliente */
  ipAddress?: string
  /** User-Agent do navegador/cliente */
  userAgent?: string
}

/**
 * Registra uma ação no log de auditoria.
 *
 * Usar em todas as mutations que modificam dados críticos
 * (ex: criação de contratos, atualização de perfil, gerenciamento de membros, etc.).
 *
 * @param params - Dados da ação a registrar
 *
 * @example
 * ```ts
 * await logAuditAction({
 *   userId: session.user.id,
 *   action: 'contract.create',
 *   resourceType: 'contract',
 *   resourceId: newContract.id,
 *   metadata: { title: newContract.title },
 * })
 * ```
 */
export async function logAuditAction(params: AuditLogParams): Promise<void>
/**
 * Sobrecarga legada — mantida para compatibilidade com chamadas existentes.
 *
 * @param userId - ID do usuário
 * @param action - Identificador da ação
 * @param details - Detalhes adicionais (opcional)
 */
export async function logAuditAction(
  userId: string,
  action: string,
  details?: Record<string, unknown>
): Promise<void>
/**
 * Implementação unificada do registro de auditoria.
 * Aceita tanto a interface nova (objeto) quanto a legada (args posicionais).
 */
export async function logAuditAction(
  paramsOrUserId: AuditLogParams | string,
  actionArg?: string,
  detailsArg?: Record<string, unknown>
): Promise<void> {
  /** Normalizar para a interface de objeto */
  const params: AuditLogParams =
    typeof paramsOrUserId === 'string'
      ? {
          userId: paramsOrUserId,
          action: actionArg!,
          metadata: detailsArg || undefined,
        }
      : paramsOrUserId

  await db.insert(auditLog).values({
    userId: params.userId,
    action: params.action,
    orgId: params.orgId || null,
    resourceType: params.resourceType || null,
    resourceId: params.resourceId || null,
    metadata: params.metadata || null,
    ipAddress: params.ipAddress || null,
    userAgent: params.userAgent || null,
  })
}
