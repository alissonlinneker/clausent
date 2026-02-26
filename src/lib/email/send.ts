/**
 * Funções de alto nível para envio de emails da Clausent.
 *
 * Este módulo combina os templates de email (src/lib/email/templates.ts)
 * com a função genérica de envio (src/lib/email/index.ts), fornecendo
 * uma API simples e tipada para cada tipo de email transacional.
 *
 * Uso típico:
 *   import { sendVerificationCode } from '@/lib/email/send'
 *   await sendVerificationCode('user@email.com', 'João', '123456')
 */

import { sendEmail } from './index'
import {
  verificationEmail,
  welcomeEmail,
  passwordResetEmail,
  analysisCompleteEmail,
  renewalAlertEmail,
} from './templates'

/**
 * Envia o código de verificação de conta por email.
 *
 * Utilizado no fluxo de cadastro para confirmar que o endereço
 * de email pertence ao usuário. O código expira em 10 minutos.
 *
 * @param email — endereço de email do destinatário
 * @param name — nome do usuário (para personalizar a saudação)
 * @param code — código de verificação de 6 dígitos
 * @returns resultado do envio (success/error)
 */
export async function sendVerificationCode(email: string, name: string, code: string) {
  const { subject, html } = verificationEmail({ name, code })
  return sendEmail({ to: email, subject, html })
}

/**
 * Envia o email de boas-vindas após a verificação da conta.
 *
 * Apresenta a plataforma, os próximos passos e direciona
 * o usuário para o dashboard.
 *
 * @param email — endereço de email do destinatário
 * @param name — nome do usuário
 * @returns resultado do envio (success/error)
 */
export async function sendWelcomeEmail(email: string, name: string) {
  const { subject, html } = welcomeEmail({ name })
  return sendEmail({ to: email, subject, html })
}

/**
 * Envia o email de redefinição de senha.
 *
 * Contém um link seguro para o formulário de reset,
 * com expiração de 1 hora e aviso de segurança.
 *
 * @param email — endereço de email do destinatário
 * @param name — nome do usuário
 * @param resetUrl — URL completa do link de redefinição de senha
 * @returns resultado do envio (success/error)
 */
export async function sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
  const { subject, html } = passwordResetEmail({ name, resetUrl })
  return sendEmail({ to: email, subject, html })
}

/**
 * Envia a notificação de que a análise de um contrato foi concluída.
 *
 * Informa o score de risco com código de cores (verde/amarelo/vermelho)
 * e direciona o usuário para os detalhes completos da análise.
 *
 * @param email — endereço de email do destinatário
 * @param name — nome do usuário
 * @param contractTitle — título/nome do contrato analisado
 * @param riskScore — pontuação de risco calculada (0-100)
 * @returns resultado do envio (success/error)
 */
export async function sendAnalysisCompleteEmail(
  email: string,
  name: string,
  contractTitle: string,
  riskScore: number
) {
  const { subject, html } = analysisCompleteEmail({ name, contractTitle, riskScore })
  return sendEmail({ to: email, subject, html })
}

/**
 * Envia o alerta de renovação de contrato.
 *
 * Notifica o usuário com antecedência sobre uma renovação próxima,
 * incluindo a data e os dias restantes com indicação visual de urgência.
 *
 * @param email — endereço de email do destinatário
 * @param name — nome do usuário
 * @param contractTitle — título/nome do contrato
 * @param daysUntilRenewal — número de dias até a data de renovação
 * @param renewalDate — data de renovação formatada (ex: "Mar 15, 2026")
 * @returns resultado do envio (success/error)
 */
export async function sendRenewalAlertEmail(
  email: string,
  name: string,
  contractTitle: string,
  daysUntilRenewal: number,
  renewalDate: string
) {
  const { subject, html } = renewalAlertEmail({ name, contractTitle, daysUntilRenewal, renewalDate })
  return sendEmail({ to: email, subject, html })
}
