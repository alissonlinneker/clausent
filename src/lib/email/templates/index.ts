/**
 * Barrel file dos templates de e-mail da Clausent.
 *
 * Centraliza a exportação de todos os templates individuais
 * para facilitar a importação em outros módulos.
 *
 * Cada template retorna { subject: string; html: string }
 * pronto para ser passado à função de envio.
 */

/** Template de notificação de alerta de contrato (já existente) */
export { generateAlertEmailHtml } from './alert-notification'

/** Template de boas-vindas para novos usuários */
export { welcomeEmail } from './welcome'

/** Template de alerta de renovação de contrato */
export { renewalAlertEmail } from './renewal-alert'

/** Template de análise de contrato concluída */
export { analysisCompleteEmail } from './analysis-complete'

/** Template de resumo semanal (weekly digest) */
export { weeklyDigestEmail } from './weekly-digest'
