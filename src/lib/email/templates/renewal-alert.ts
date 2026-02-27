/**
 * Template de e-mail de alerta de renovação de contrato.
 *
 * Enviado quando um contrato se aproxima da data de renovação.
 * Exibe informações do contrato, fornecedor, data de renovação,
 * dias restantes e um botão CTA para visualizar no dashboard.
 *
 * Estilização de urgência:
 * - Verde (#0D9488): mais de 30 dias
 * - Amarelo (#d97706): entre 8 e 30 dias
 * - Vermelho (#dc2626): 7 dias ou menos
 */

/** URL base do aplicativo — variável de ambiente com fallback */
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.clausent.com'

/** Parâmetros necessários para gerar o e-mail de alerta de renovação */
interface RenewalAlertParams {
  /** Nome do usuário destinatário */
  name: string
  /** Título/nome do contrato */
  contractName: string
  /** Nome do fornecedor/contraparte */
  vendor: string
  /** Data de renovação formatada (ex: "Mar 15, 2026") */
  renewalDate: string
  /** Número de dias até a renovação */
  daysUntilRenewal: number
  /** ID do contrato para link direto (opcional) */
  contractId?: string
}

/**
 * Gera o e-mail de alerta de renovação de contrato.
 *
 * @param params — dados do contrato e da renovação
 * @returns objeto com subject e html prontos para envio
 */
export function renewalAlertEmail(params: RenewalAlertParams): { subject: string; html: string } {
  const { name, contractName, vendor, renewalDate, daysUntilRenewal, contractId } = params

  /** URL de destino do botão CTA — link direto ao contrato ou lista geral */
  const contractUrl = contractId
    ? `${APP_URL}/dashboard/contracts/${contractId}`
    : `${APP_URL}/dashboard/contracts`

  /**
   * Cores de urgência baseadas nos dias restantes.
   * Quanto mais próximo da renovação, mais alarmante a cor.
   */
  const urgencyColor = daysUntilRenewal <= 7 ? '#dc2626' : daysUntilRenewal <= 30 ? '#d97706' : '#0D9488'
  const urgencyBg = daysUntilRenewal <= 7 ? '#fee2e2' : daysUntilRenewal <= 30 ? '#fef3c7' : '#f0fdfa'

  /** Label de urgência exibido no badge superior */
  const urgencyLabel = daysUntilRenewal <= 7 ? 'Urgent' : daysUntilRenewal <= 30 ? 'Upcoming' : 'Scheduled'

  /** Link de gerenciamento de notificações */
  const unsubscribeUrl = `${APP_URL}/settings/notifications`

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Contract Renewal Alert</title>
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
              <!-- Badge de urgência -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="background-color: ${urgencyBg}; color: ${urgencyColor}; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${urgencyLabel} Renewal
                  </td>
                </tr>
              </table>

              <!-- Título -->
              <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                Contract renewal approaching
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #64748b; line-height: 1.6;">
                Hi ${name}, a contract in your portfolio is due for renewal soon. Review the details below.
              </p>

              <!-- Card com detalhes do contrato -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <!-- Nome do contrato -->
                <tr>
                  <td style="padding: 16px 16px 12px 16px; border-bottom: 1px solid #e2e8f0;">
                    <span style="display: block; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Contract</span>
                    <span style="display: block; font-size: 15px; font-weight: 600; color: #0f172a;">${contractName}</span>
                  </td>
                </tr>
                <!-- Fornecedor -->
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0;">
                    <span style="display: block; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Vendor</span>
                    <span style="display: block; font-size: 15px; color: #334155;">${vendor}</span>
                  </td>
                </tr>
                <!-- Data de renovação e dias restantes -->
                <tr>
                  <td style="padding: 12px 16px 16px 16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <!-- Data -->
                        <td width="50%">
                          <span style="display: block; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Renewal Date</span>
                          <span style="display: block; font-size: 15px; color: #334155;">${renewalDate}</span>
                        </td>
                        <!-- Dias restantes com cor de urgência -->
                        <td width="50%">
                          <span style="display: block; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Time Remaining</span>
                          <span style="display: block; font-size: 15px; font-weight: 600; color: ${urgencyColor};">
                            ${daysUntilRenewal === 1 ? '1 day' : `${daysUntilRenewal} days`}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Aviso de urgência para renovações iminentes (7 dias ou menos) -->
              ${daysUntilRenewal <= 7 ? `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #fee2e2; border-radius: 8px; border: 1px solid #fecaca; padding: 16px;">
                    <p style="margin: 0; font-size: 13px; color: #991b1b; line-height: 1.5;">
                      <strong>Action required:</strong> This contract renews in ${daysUntilRenewal} day${daysUntilRenewal === 1 ? '' : 's'}.
                      Review the terms and take action before the renewal date to avoid auto-renewal or lapses.
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Botão CTA para ver contrato -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${contractUrl}" style="display: inline-block; background-color: #0D9488; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px; line-height: 1;">
                      View Contract
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
                You received this alert because you have renewal notifications enabled.
                <a href="${unsubscribeUrl}" style="color: #94a3b8; text-decoration: underline;">Manage notifications</a>
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
    subject: `Contract renewal in ${daysUntilRenewal} day${daysUntilRenewal === 1 ? '' : 's'}: ${contractName}`,
    html,
  }
}
