/**
 * Templates de email da plataforma Clausent.
 *
 * Todos os templates utilizam HTML com estilos inline para garantir
 * compatibilidade com os principais clientes de email (Gmail, Outlook,
 * Apple Mail, Yahoo Mail, etc.).
 *
 * Paleta de cores:
 * - Primária (teal): #0D9488
 * - Fundo: #f8fafc
 * - Texto principal: #0f172a
 * - Texto secundário: #64748b / #94a3b8
 * - Bordas: #e2e8f0
 * - Card: #ffffff
 *
 * Conteúdo dos emails em inglês (i18n é fase futura).
 */

/** URL base do aplicativo — usa variável de ambiente com fallback */
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.clausent.com'

/**
 * Layout base (wrapper) que envolve todos os emails da Clausent.
 *
 * Estrutura:
 * 1. Doctype e meta tags para compatibilidade
 * 2. Fundo cinza claro (#f8fafc)
 * 3. Card branco centralizado (max-width 560px)
 * 4. Header com logo {C} + nome "Clausent"
 * 5. Área de conteúdo (recebida via parâmetro)
 * 6. Footer com informações da plataforma
 *
 * @param content — HTML do conteúdo principal a ser inserido no corpo do email
 * @returns string HTML completa do email
 */
export function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Clausent</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <!-- Container externo com fundo cinza -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <!-- Card principal do email -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">

          <!-- Header com logo -->
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

          <!-- Conteúdo principal (injetado via parâmetro) -->
          <tr>
            <td style="padding: 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; line-height: 1.5; text-align: center;">
                Clausent — AI-powered contract intelligence
              </p>
              <p style="margin: 0; font-size: 11px; color: #cbd5e1; line-height: 1.5; text-align: center;">
                You received this email because you have an account on Clausent.
                If you didn't expect this, you can safely ignore it.
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

/* ============================================================
 * TEMPLATES INDIVIDUAIS
 * Cada função retorna { subject, html } prontos para envio.
 * ============================================================ */

/**
 * Email de verificação de conta com código de 6 dígitos.
 *
 * Exibe o código em destaque para fácil identificação,
 * com aviso de expiração de 10 minutos.
 *
 * @param name — nome do usuário
 * @param code — código de verificação de 6 dígitos
 */
export function verificationEmail({ name, code }: { name: string; code: string }): { subject: string; html: string } {
  const content = `
    <!-- Saudação -->
    <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">
      Verify your account
    </h1>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: #64748b; line-height: 1.6;">
      Hi ${name}, use the code below to verify your Clausent account.
    </p>

    <!-- Código de verificação em destaque -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
      <tr>
        <td align="center">
          <div style="background-color: #f0fdfa; border: 2px dashed #0D9488; border-radius: 12px; padding: 24px 32px; display: inline-block;">
            <span style="font-size: 36px; font-weight: 700; color: #0D9488; letter-spacing: 8px; font-family: monospace;">
              ${code}
            </span>
          </div>
        </td>
      </tr>
    </table>

    <!-- Aviso de expiração -->
    <p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8; line-height: 1.5; text-align: center;">
      This code expires in <strong style="color: #64748b;">10 minutes</strong>.
    </p>
    <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5; text-align: center;">
      If you didn't create a Clausent account, please ignore this email.
    </p>
  `

  return {
    subject: 'Verify your Clausent account',
    html: baseTemplate(content),
  }
}

/**
 * Email de boas-vindas enviado após a verificação da conta.
 *
 * Apresenta a plataforma, próximos passos e um botão
 * para acessar o dashboard.
 *
 * @param name — nome do usuário
 */
export function welcomeEmail({ name }: { name: string }): { subject: string; html: string } {
  /** URL do dashboard para o botão CTA */
  const dashboardUrl = `${APP_URL}/dashboard`

  const content = `
    <!-- Saudação de boas-vindas -->
    <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">
      Welcome to Clausent!
    </h1>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: #64748b; line-height: 1.6;">
      Hi ${name}, your account is all set. Here's how to get started:
    </p>

    <!-- Próximos passos em lista numerada -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
      <!-- Passo 1 -->
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
      <!-- Passo 2 -->
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
      <!-- Passo 3 -->
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
  `

  return {
    subject: 'Welcome to Clausent',
    html: baseTemplate(content),
  }
}

/**
 * Email de redefinição de senha.
 *
 * Contém um botão com link seguro para reset, aviso de expiração
 * de 1 hora e nota de segurança caso o usuário não tenha solicitado.
 *
 * @param name — nome do usuário
 * @param resetUrl — URL completa do link de redefinição
 */
export function passwordResetEmail({ name, resetUrl }: { name: string; resetUrl: string }): { subject: string; html: string } {
  const content = `
    <!-- Título -->
    <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">
      Reset your password
    </h1>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: #64748b; line-height: 1.6;">
      Hi ${name}, we received a request to reset your Clausent password.
      Click the button below to choose a new one.
    </p>

    <!-- Botão de reset -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
      <tr>
        <td align="center">
          <a href="${resetUrl}" style="display: inline-block; background-color: #0D9488; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px; line-height: 1;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>

    <!-- Aviso de expiração -->
    <p style="margin: 0 0 16px 0; font-size: 13px; color: #94a3b8; line-height: 1.5; text-align: center;">
      This link expires in <strong style="color: #64748b;">1 hour</strong>.
    </p>

    <!-- Aviso de segurança -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td style="background-color: #fef3c7; border-radius: 8px; border: 1px solid #fde68a; padding: 16px;">
          <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
            <strong>Security notice:</strong> If you didn't request a password reset,
            please ignore this email. Your password will remain unchanged.
            If you suspect unauthorized access, contact our support team immediately.
          </p>
        </td>
      </tr>
    </table>
  `

  return {
    subject: 'Reset your Clausent password',
    html: baseTemplate(content),
  }
}

/**
 * Retorna a cor correspondente ao nível de risco do contrato.
 *
 * Faixas:
 * - Verde (#16a34a): risco baixo (score < 40)
 * - Amarelo (#d97706): risco moderado (score 40-70)
 * - Vermelho (#dc2626): risco alto (score > 70)
 *
 * @param score — pontuação de risco (0-100)
 * @returns objeto com cor do texto e cor de fundo
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
 * Email de notificação de análise concluída.
 *
 * Informa que a análise de IA de um contrato foi finalizada,
 * exibindo o nome do contrato, score de risco com código de cores
 * e um botão para visualizar os detalhes completos.
 *
 * @param name — nome do usuário
 * @param contractTitle — título/nome do contrato analisado
 * @param riskScore — pontuação de risco calculada (0-100)
 */
export function analysisCompleteEmail({
  name,
  contractTitle,
  riskScore,
}: {
  name: string
  contractTitle: string
  riskScore: number
}): { subject: string; html: string } {
  /** Informações visuais do nível de risco */
  const risk = getRiskColor(riskScore)

  /** URL para a página de detalhes (genérica; o link real será substituído no envio) */
  const detailsUrl = `${APP_URL}/dashboard/contracts`

  const content = `
    <!-- Título -->
    <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">
      Your analysis is ready
    </h1>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: #64748b; line-height: 1.6;">
      Hi ${name}, the AI analysis for your contract has been completed.
    </p>

    <!-- Card com detalhes do contrato -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
      <!-- Nome do contrato -->
      <tr>
        <td style="padding: 16px 16px 12px 16px; border-bottom: 1px solid #e2e8f0;">
          <span style="display: block; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Contract</span>
          <span style="display: block; font-size: 15px; font-weight: 600; color: #0f172a;">${contractTitle}</span>
        </td>
      </tr>
      <!-- Score de risco com badge colorido -->
      <tr>
        <td style="padding: 12px 16px 16px 16px;">
          <span style="display: block; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Risk Score</span>
          <table role="presentation" cellspacing="0" cellpadding="0">
            <tr>
              <!-- Número do score -->
              <td style="vertical-align: middle;">
                <span style="font-size: 32px; font-weight: 700; color: ${risk.color}; line-height: 1;">${riskScore}</span>
                <span style="font-size: 14px; color: #94a3b8; margin-left: 2px;">/100</span>
              </td>
              <!-- Badge do nível -->
              <td style="vertical-align: middle; padding-left: 16px;">
                <span style="display: inline-block; background-color: ${risk.bgColor}; color: ${risk.color}; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px;">
                  ${risk.label}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Botão para ver detalhes -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <a href="${detailsUrl}" style="display: inline-block; background-color: #0D9488; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px; line-height: 1;">
            View Full Analysis
          </a>
        </td>
      </tr>
    </table>
  `

  return {
    subject: 'Your contract analysis is ready',
    html: baseTemplate(content),
  }
}

/**
 * Email de alerta de renovação de contrato.
 *
 * Notifica o usuário sobre uma renovação próxima, exibindo
 * o nome do contrato, data de renovação, dias restantes
 * e um botão para acessar o contrato no dashboard.
 *
 * @param name — nome do usuário
 * @param contractTitle — título/nome do contrato
 * @param daysUntilRenewal — número de dias até a renovação
 * @param renewalDate — data de renovação formatada (ex: "Mar 15, 2026")
 */
export function renewalAlertEmail({
  name,
  contractTitle,
  daysUntilRenewal,
  renewalDate,
}: {
  name: string
  contractTitle: string
  daysUntilRenewal: number
  renewalDate: string
}): { subject: string; html: string } {
  /** URL do dashboard de contratos */
  const contractUrl = `${APP_URL}/dashboard/contracts`

  /**
   * Define a cor de urgência baseada nos dias restantes.
   * Quanto mais próximo da renovação, mais urgente a cor.
   */
  const urgencyColor = daysUntilRenewal <= 7 ? '#dc2626' : daysUntilRenewal <= 30 ? '#d97706' : '#0D9488'
  const urgencyBg = daysUntilRenewal <= 7 ? '#fee2e2' : daysUntilRenewal <= 30 ? '#fef3c7' : '#f0fdfa'

  const content = `
    <!-- Badge de alerta -->
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
      <tr>
        <td style="background-color: ${urgencyBg}; color: ${urgencyColor}; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
          Renewal Alert
        </td>
      </tr>
    </table>

    <!-- Título -->
    <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">
      Contract renewal approaching
    </h1>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: #64748b; line-height: 1.6;">
      Hi ${name}, a contract in your portfolio is due for renewal soon.
    </p>

    <!-- Card com detalhes da renovação -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
      <!-- Nome do contrato -->
      <tr>
        <td style="padding: 16px 16px 12px 16px; border-bottom: 1px solid #e2e8f0;">
          <span style="display: block; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Contract</span>
          <span style="display: block; font-size: 15px; font-weight: 600; color: #0f172a;">${contractTitle}</span>
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
              <!-- Dias restantes -->
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

    <!-- Botão para ver contrato -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <a href="${contractUrl}" style="display: inline-block; background-color: #0D9488; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px; line-height: 1;">
            View Contract
          </a>
        </td>
      </tr>
    </table>
  `

  return {
    subject: `Contract renewal in ${daysUntilRenewal} days`,
    html: baseTemplate(content),
  }
}
