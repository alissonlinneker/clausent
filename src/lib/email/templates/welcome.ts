/**
 * Template de e-mail de boas-vindas para novos usuários.
 *
 * Enviado após a confirmação do e-mail.
 * Apresenta a plataforma, os 3 passos iniciais e um botão CTA
 * para acessar o dashboard.
 *
 * Paleta de cores: teal-600 (#0D9488) como cor primária,
 * fundo cinza (#f8fafc), card branco (#ffffff).
 *
 * Todos os estilos são inline para compatibilidade com
 * Gmail, Outlook, Apple Mail e Yahoo Mail.
 */

/** URL base do aplicativo — variável de ambiente com fallback */
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.clausent.com'

/**
 * Gera o e-mail de boas-vindas personalizado.
 *
 * @param params.name — nome do usuário para personalização da saudação
 * @param params.loginUrl — URL para login no dashboard
 * @returns objeto com subject e html prontos para envio
 */
export function welcomeEmail(params: {
  name: string
  loginUrl: string
}): { subject: string; html: string } {
  const { name, loginUrl } = params

  /** URL de destino do botão CTA — usa loginUrl se fornecido, senão dashboard */
  const ctaUrl = loginUrl || `${APP_URL}/dashboard`

  /** Link fictício de unsubscribe (será substituído por link real em produção) */
  const unsubscribeUrl = `${APP_URL}/settings/notifications`

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Clausent</title>
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
                  <!-- Ícone {C} com fundo teal -->
                  <td style="background-color: #0D9488; border-radius: 8px; width: 32px; height: 32px; text-align: center; vertical-align: middle;">
                    <span style="color: #ffffff; font-size: 16px; font-weight: bold; line-height: 32px;">C</span>
                  </td>
                  <!-- Nome da plataforma -->
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
              <!-- Saudação personalizada -->
              <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                Welcome to Clausent!
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #64748b; line-height: 1.6;">
                Hi ${name}, your account is all set. Here's how to get the most out of Clausent:
              </p>

              <!-- 3 passos para começar -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <!-- Passo 1: Upload de contrato -->
                <tr>
                  <td style="padding: 16px 16px 12px 16px; border-bottom: 1px solid #e2e8f0;">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="background-color: #0D9488; border-radius: 50%; width: 24px; height: 24px; text-align: center; vertical-align: middle;">
                          <span style="color: #ffffff; font-size: 12px; font-weight: 700; line-height: 24px;">1</span>
                        </td>
                        <td style="padding-left: 12px;">
                          <span style="font-size: 14px; font-weight: 600; color: #0f172a;">Upload your first contract</span>
                          <br />
                          <span style="font-size: 13px; color: #64748b;">PDF, DOCX, or plain text — we handle it all.</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Passo 2: Análise por IA -->
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0;">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="background-color: #0D9488; border-radius: 50%; width: 24px; height: 24px; text-align: center; vertical-align: middle;">
                          <span style="color: #ffffff; font-size: 12px; font-weight: 700; line-height: 24px;">2</span>
                        </td>
                        <td style="padding-left: 12px;">
                          <span style="font-size: 14px; font-weight: 600; color: #0f172a;">Get AI-powered analysis</span>
                          <br />
                          <span style="font-size: 13px; color: #64748b;">Risk scores, key clauses, and actionable insights in seconds.</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Passo 3: Configurar alertas -->
                <tr>
                  <td style="padding: 12px 16px 16px 16px;">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="background-color: #0D9488; border-radius: 50%; width: 24px; height: 24px; text-align: center; vertical-align: middle;">
                          <span style="color: #ffffff; font-size: 12px; font-weight: 700; line-height: 24px;">3</span>
                        </td>
                        <td style="padding-left: 12px;">
                          <span style="font-size: 14px; font-weight: 600; color: #0f172a;">Set up renewal alerts</span>
                          <br />
                          <span style="font-size: 13px; color: #64748b;">Never miss a deadline — we'll notify you in advance.</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Botão CTA para login -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${ctaUrl}" style="display: inline-block; background-color: #0D9488; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px; line-height: 1;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer com unsubscribe -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; line-height: 1.5; text-align: center;">
                Clausent — AI-powered contract intelligence
              </p>
              <p style="margin: 0; font-size: 11px; color: #cbd5e1; line-height: 1.5; text-align: center;">
                You received this email because you created an account on Clausent.
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
    subject: 'Welcome to Clausent!',
    html,
  }
}
