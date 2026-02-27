/**
 * Template de e-mail de resumo semanal (weekly digest).
 *
 * Enviado semanalmente com um resumo da atividade do usuário:
 * - Estatísticas: contratos analisados, alertas, economia encontrada
 * - Top 3 itens de ação prioritários
 * - Botão CTA para o dashboard
 *
 * Utiliza a paleta de cores Clausent (teal-600) com estilos inline
 * para compatibilidade com os principais clientes de e-mail.
 */

/** URL base do aplicativo — variável de ambiente com fallback */
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.clausent.com'

/** Item de ação para exibir no resumo semanal */
interface ActionItem {
  /** Título curto da ação a ser tomada */
  title: string
  /** Descrição breve do contexto da ação */
  description: string
  /** Nível de prioridade para estilização visual */
  priority: 'high' | 'medium' | 'low'
}

/** Parâmetros necessários para gerar o e-mail de resumo semanal */
interface WeeklyDigestParams {
  /** Nome do usuário destinatário */
  name: string
  /** Número de contratos analisados na semana */
  contractsAnalyzed: number
  /** Número de alertas disparados na semana */
  alertsTriggered: number
  /** Valor total de economia potencial identificada (em USD) */
  savingsFound: number
  /** Lista dos 3 principais itens de ação */
  actionItems: ActionItem[]
  /** Período do resumo (ex: "Feb 19 — Feb 25, 2026") */
  periodLabel: string
}

/**
 * Retorna a cor correspondente ao nível de prioridade do item de ação.
 *
 * @param priority — nível de prioridade
 * @returns cor hexadecimal para o indicador visual
 */
function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high':
      return '#dc2626'
    case 'medium':
      return '#d97706'
    case 'low':
      return '#0D9488'
  }
}

/**
 * Formata um valor numérico como moeda USD abreviada.
 * Ex: 1500 → "$1,500", 0 → "$0"
 *
 * @param value — valor numérico em dólares
 * @returns string formatada como moeda
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Gera o e-mail de resumo semanal personalizado.
 *
 * @param params — dados estatísticos e itens de ação da semana
 * @returns objeto com subject e html prontos para envio
 */
export function weeklyDigestEmail(params: WeeklyDigestParams): { subject: string; html: string } {
  const { name, contractsAnalyzed, alertsTriggered, savingsFound, actionItems, periodLabel } = params

  /** URL de destino do botão CTA */
  const dashboardUrl = `${APP_URL}/dashboard`

  /** Link de gerenciamento de notificações */
  const unsubscribeUrl = `${APP_URL}/settings/notifications`

  /**
   * Gera as linhas HTML dos itens de ação.
   * Cada item mostra um indicador colorido de prioridade,
   * título em destaque e descrição abaixo.
   */
  const actionItemsHtml = actionItems
    .slice(0, 3)
    .map((item, index) => {
      const isLast = index === Math.min(actionItems.length, 3) - 1
      const borderStyle = isLast ? '' : 'border-bottom: 1px solid #e2e8f0;'
      const paddingStyle = index === 0
        ? 'padding: 16px 16px 12px 16px;'
        : isLast
          ? 'padding: 12px 16px 16px 16px;'
          : 'padding: 12px 16px;'

      return `
        <tr>
          <td style="${paddingStyle} ${borderStyle}">
            <table role="presentation" cellspacing="0" cellpadding="0">
              <tr>
                <!-- Indicador colorido de prioridade -->
                <td style="vertical-align: top; padding-top: 4px;">
                  <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${getPriorityColor(item.priority)};"></div>
                </td>
                <td style="padding-left: 12px;">
                  <span style="display: block; font-size: 14px; font-weight: 600; color: #0f172a; line-height: 1.4;">${item.title}</span>
                  <span style="display: block; font-size: 13px; color: #64748b; line-height: 1.4; margin-top: 2px;">${item.description}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `
    })
    .join('')

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Weekly Digest</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <!-- Container externo com fundo cinza -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <!-- Card principal do e-mail -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">

          <!-- Header com logo Clausent -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background-color: #0D9488; border-radius: 8px; width: 32px; height: 32px; text-align: center; vertical-align: middle;">
                    <span style="color: #ffffff; font-size: 16px; font-weight: bold; line-height: 32px;">C</span>
                  </td>
                  <td style="padding-left: 10px;">
                    <span style="font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">Clausent</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Conteúdo principal -->
          <tr>
            <td style="padding: 32px;">
              <!-- Título e período -->
              <h1 style="margin: 0 0 4px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                Your Weekly Digest
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                ${periodLabel}
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #64748b; line-height: 1.6;">
                Hi ${name}, here's a summary of your contract activity this week.
              </p>

              <!-- Estatísticas em grid de 3 colunas -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <!-- Contratos analisados -->
                  <td width="33%" style="text-align: center; padding: 16px 8px; background-color: #f0fdfa; border-radius: 8px 0 0 8px; border: 1px solid #e2e8f0; border-right: none;">
                    <span style="display: block; font-size: 28px; font-weight: 700; color: #0D9488; line-height: 1;">${contractsAnalyzed}</span>
                    <span style="display: block; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 6px;">Analyzed</span>
                  </td>
                  <!-- Alertas disparados -->
                  <td width="33%" style="text-align: center; padding: 16px 8px; background-color: #f0fdfa; border: 1px solid #e2e8f0; border-left: none; border-right: none;">
                    <span style="display: block; font-size: 28px; font-weight: 700; color: #0D9488; line-height: 1;">${alertsTriggered}</span>
                    <span style="display: block; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 6px;">Alerts</span>
                  </td>
                  <!-- Economia potencial encontrada -->
                  <td width="34%" style="text-align: center; padding: 16px 8px; background-color: #f0fdfa; border-radius: 0 8px 8px 0; border: 1px solid #e2e8f0; border-left: none;">
                    <span style="display: block; font-size: 28px; font-weight: 700; color: #0D9488; line-height: 1;">${formatCurrency(savingsFound)}</span>
                    <span style="display: block; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 6px;">Savings</span>
                  </td>
                </tr>
              </table>

              <!-- Itens de ação (top 3) -->
              ${actionItems.length > 0 ? `
              <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                Action Items
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                ${actionItemsHtml}
              </table>
              ` : `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f0fdfa; border-radius: 8px; border: 1px solid #ccfbf1; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #0D9488; font-weight: 600;">
                      No action items this week. You're all caught up!
                    </p>
                  </td>
                </tr>
              </table>
              `}

              <!-- Botão CTA para o dashboard -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; background-color: #0D9488; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px; line-height: 1;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; line-height: 1.5; text-align: center;">
                Clausent — AI-powered contract intelligence
              </p>
              <p style="margin: 0; font-size: 11px; color: #cbd5e1; line-height: 1.5; text-align: center;">
                You received this weekly digest because it's enabled in your notification settings.
                <a href="${unsubscribeUrl}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe from digest</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  return {
    subject: `Your weekly digest — ${periodLabel}`,
    html,
  }
}
