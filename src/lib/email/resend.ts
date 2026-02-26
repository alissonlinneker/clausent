import { Resend } from 'resend'

/**
 * Cliente Resend com inicialização lazy.
 * A instância só é criada na primeira chamada a getResend(),
 * evitando erros em build time quando RESEND_API_KEY não está disponível.
 */
let _resend: Resend | null = null

/** Retorna a instância do Resend, criando-a se necessário */
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

/**
 * Envia um email usando Resend.
 *
 * Centraliza a lógica de envio para que todos os emails
 * da plataforma usem o mesmo remetente e configuração.
 *
 * @param to — email do destinatário
 * @param subject — assunto do email
 * @param html — conteúdo HTML do email
 */
export async function sendEmail(to: string, subject: string, html: string) {
  return getResend().emails.send({
    from: 'Clausent <alerts@clausent.com>',
    to,
    subject,
    html,
  })
}
