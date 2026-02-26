/**
 * Template de email para notificações de alerta de contrato.
 *
 * Gera HTML inline (sem dependências externas) com design profissional
 * usando a paleta de cores da Clausent (teal/slate).
 *
 * O template é compatível com a maioria dos clientes de email
 * (Gmail, Outlook, Apple Mail) por usar apenas estilos inline.
 */

/** Dados necessários para gerar o email de alerta */
interface AlertEmailData {
  /** Título/nome do contrato */
  contractTitle: string
  /** Nome da contraparte (empresa, fornecedor, etc.) */
  counterparty: string
  /** Tipo do alerta: renewal, expiration ou notice */
  alertType: string
  /** Data de disparo do alerta (aceita Date ou string ISO) */
  triggerDate: Date | string
  /** ID do contrato para gerar o link de visualização */
  contractId: string
}

/**
 * Mapeia o tipo de alerta para um label legível e cor correspondente.
 * Usado no cabeçalho do email para identificação visual rápida.
 */
function getAlertTypeLabel(type: string): { label: string; color: string; bgColor: string } {
  switch (type) {
    case 'renewal':
      return { label: 'Renewal', color: '#d97706', bgColor: '#fef3c7' }
    case 'expiration':
      return { label: 'Expiration', color: '#dc2626', bgColor: '#fee2e2' }
    case 'notice':
      return { label: 'Notice Period', color: '#2563eb', bgColor: '#dbeafe' }
    default:
      return { label: type, color: '#14B8A6', bgColor: '#CCFBF1' }
  }
}

/**
 * Calcula quantos dias faltam para a data do alerta.
 * Retorna string formatada: "in X days", "today" ou "X days ago".
 */
function getDaysRemaining(triggerDate: Date | string): string {
  const d = typeof triggerDate === 'string' ? new Date(triggerDate) : triggerDate
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'today'
  if (days === 1) return 'in 1 day'
  if (days > 1) return `in ${days} days`
  if (days === -1) return '1 day ago'
  return `${Math.abs(days)} days ago`
}

/**
 * Formata a data para exibição no email.
 * Exemplo: "Feb 26, 2026"
 */
function formatEmailDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d)
}

/**
 * Gera o HTML completo do email de notificação de alerta.
 *
 * Estrutura do email:
 * 1. Logo "Clausent" no topo
 * 2. Badge com tipo do alerta
 * 3. Detalhes do contrato (nome, contraparte, data, dias restantes)
 * 4. Botão CTA "View Contract"
 * 5. Footer com disclaimer
 *
 * @param data — dados do alerta para popular o template
 * @returns string HTML do email completo
 */
export function generateAlertEmailHtml(data: AlertEmailData): string {
  const { contractTitle, counterparty, alertType, triggerDate, contractId } = data
  const typeInfo = getAlertTypeLabel(alertType)
  const daysRemaining = getDaysRemaining(triggerDate)
  const formattedDate = formatEmailDate(triggerDate)

  /** URL base do dashboard — usa variável de ambiente ou fallback */
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.clausent.com'
  const contractUrl = `${baseUrl}/dashboard/contracts/${contractId}`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Contract Alert: ${alertType}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <!-- Container principal -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <!-- Card do email -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">

          <!-- Cabeçalho com logo -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <!-- Logo Clausent em texto com ícone -->
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="background-color: #0D9488; border-radius: 8px; width: 32px; height: 32px; text-align: center; vertical-align: middle;">
                          <span style="color: #ffffff; font-size: 16px; font-weight: bold;">C</span>
                        </td>
                        <td style="padding-left: 10px;">
                          <span style="font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">Clausent</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Conteúdo principal -->
          <tr>
            <td style="padding: 32px;">
              <!-- Badge do tipo de alerta -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="background-color: ${typeInfo.bgColor}; color: ${typeInfo.color}; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${typeInfo.label} Alert
                  </td>
                </tr>
              </table>

              <!-- Título do alerta -->
              <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                Contract Alert: ${typeInfo.label}
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #64748b; line-height: 1.5;">
                A contract in your portfolio requires attention.
              </p>

              <!-- Detalhes do contrato em cards -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <!-- Nome do contrato -->
                <tr>
                  <td style="padding: 16px 16px 12px 16px; border-bottom: 1px solid #e2e8f0;">
                    <span style="display: block; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Contract</span>
                    <span style="display: block; font-size: 15px; font-weight: 600; color: #0f172a;">${contractTitle}</span>
                  </td>
                </tr>
                <!-- Contraparte -->
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0;">
                    <span style="display: block; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Counterparty</span>
                    <span style="display: block; font-size: 15px; color: #334155;">${counterparty}</span>
                  </td>
                </tr>
                <!-- Data e dias restantes -->
                <tr>
                  <td style="padding: 12px 16px 16px 16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="50%">
                          <span style="display: block; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Date</span>
                          <span style="display: block; font-size: 15px; color: #334155;">${formattedDate}</span>
                        </td>
                        <td width="50%">
                          <span style="display: block; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Timeline</span>
                          <span style="display: block; font-size: 15px; font-weight: 600; color: ${typeInfo.color};">${daysRemaining}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Botão CTA -->
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
              <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5; text-align: center;">
                You're receiving this email because you're an admin of your organization on Clausent.
                Alert notifications are configured for contracts in your portfolio.
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
}
