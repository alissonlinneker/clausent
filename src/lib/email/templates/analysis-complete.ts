/**
 * Template de e-mail de análise de contrato concluída.
 *
 * Enviado quando o processamento de IA de um contrato é finalizado.
 * Exibe o nome do contrato, score de risco com código de cores
 * (verde/amarelo/vermelho), contagem de achados relevantes
 * e um botão CTA para visualizar os resultados completos.
 *
 * Faixas de risco:
 * - Verde (#16a34a): score < 40 (baixo risco)
 * - Amarelo (#d97706): score 40-70 (risco moderado)
 * - Vermelho (#dc2626): score > 70 (alto risco)
 */

/** URL base do aplicativo — variável de ambiente com fallback */
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.clausent.com'

/** Parâmetros necessários para gerar o e-mail de análise concluída */
interface AnalysisCompleteParams {
  /** Nome do usuário destinatário */
  name: string
  /** Título/nome do contrato analisado */
  contractName: string
  /** Pontuação de risco calculada pela IA (0-100) */
  riskScore: number
  /** Número de achados/observações relevantes encontrados */
  findingsCount: number
  /** ID do contrato para link direto (opcional) */
  contractId?: string
}

/**
 * Retorna a cor e o label correspondente ao nível de risco.
 *
 * @param score — pontuação de risco (0-100)
 * @returns objeto com cor de texto, cor de fundo e label descritivo
 */
function getRiskColor(score: number): { color: string; bgColor: string; label: string } {
  if (score < 40) {
    return { color: '#16a34a', bgColor: '#dcfce7', label: 'Low Risk' }
  }
  if (score <= 70) {
    return { color: '#d97706', bgColor: '#fef3c7', label: 'Medium Risk' }
  }
  return { color: '#dc2626', bgColor: '#fee2e2', label: 'High Risk' }
}

/**
 * Gera o e-mail de notificação de análise concluída.
 *
 * @param params — dados do contrato e da análise
 * @returns objeto com subject e html prontos para envio
 */
export function analysisCompleteEmail(params: AnalysisCompleteParams): { subject: string; html: string } {
  const { name, contractName, riskScore, findingsCount, contractId } = params

  /** Informações visuais do nível de risco */
  const risk = getRiskColor(riskScore)

  /** URL de destino do botão CTA — link direto ou lista geral */
  const resultsUrl = contractId
    ? `${APP_URL}/dashboard/contracts/${contractId}`
    : `${APP_URL}/dashboard/contracts`

  /** Link de gerenciamento de notificações */
  const unsubscribeUrl = `${APP_URL}/settings/notifications`

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Analysis Complete</title>
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
              <!-- Badge de status -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="background-color: #dcfce7; color: #16a34a; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                    Analysis Complete
                  </td>
                </tr>
              </table>

              <!-- Título -->
              <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                Your analysis is ready
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #64748b; line-height: 1.6;">
                Hi ${name}, the AI analysis for your contract has been completed. Here's a summary:
              </p>

              <!-- Card com resultados da análise -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <!-- Nome do contrato -->
                <tr>
                  <td style="padding: 16px 16px 12px 16px; border-bottom: 1px solid #e2e8f0;">
                    <span style="display: block; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Contract</span>
                    <span style="display: block; font-size: 15px; font-weight: 600; color: #0f172a;">${contractName}</span>
                  </td>
                </tr>
                <!-- Score de risco com badge colorido -->
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0;">
                    <span style="display: block; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Risk Score</span>
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <!-- Número do score com cor correspondente -->
                        <td style="vertical-align: middle;">
                          <span style="font-size: 32px; font-weight: 700; color: ${risk.color}; line-height: 1;">${riskScore}</span>
                          <span style="font-size: 14px; color: #94a3b8; margin-left: 2px;">/100</span>
                        </td>
                        <!-- Badge do nível de risco -->
                        <td style="vertical-align: middle; padding-left: 16px;">
                          <span style="display: inline-block; background-color: ${risk.bgColor}; color: ${risk.color}; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px;">
                            ${risk.label}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Contagem de achados -->
                <tr>
                  <td style="padding: 12px 16px 16px 16px;">
                    <span style="display: block; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Key Findings</span>
                    <span style="display: block; font-size: 15px; font-weight: 600; color: #0f172a;">
                      ${findingsCount} finding${findingsCount === 1 ? '' : 's'} identified
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Botão CTA para ver resultados -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${resultsUrl}" style="display: inline-block; background-color: #0D9488; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px; line-height: 1;">
                      View Full Analysis
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
                You received this email because a contract analysis was completed on your account.
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
    subject: `Analysis complete: ${contractName}`,
    html,
  }
}
