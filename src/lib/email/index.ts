import { Resend } from 'resend'

/**
 * Módulo central de envio de emails da plataforma Clausent.
 *
 * Utiliza o serviço Resend para despachar emails transacionais.
 * A instância do cliente é criada de forma lazy (sob demanda)
 * para evitar erros durante o build quando a variável de ambiente
 * RESEND_API_KEY ainda não está disponível.
 */

/** Instância singleton do cliente Resend (inicialização lazy) */
let _resend: Resend | null = null

/**
 * Retorna a instância do Resend, criando-a na primeira chamada.
 * Garante que só existe uma conexão ativa por processo.
 */
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

/**
 * Remetente padrão dos emails da plataforma.
 * Usa a variável de ambiente EMAIL_FROM quando disponível,
 * com fallback para o endereço padrão da Clausent.
 */
const EMAIL_FROM = process.env.EMAIL_FROM || 'Clausent <noreply@clausent.com>'

/** Parâmetros aceitos pela função genérica de envio */
interface SendEmailParams {
  /** Endereço de email do destinatário */
  to: string
  /** Assunto do email */
  subject: string
  /** Conteúdo HTML do email */
  html: string
  /** Conteúdo em texto plano (fallback para clientes sem suporte a HTML) */
  text?: string
}

/** Resultado do envio de email */
interface SendEmailResult {
  /** Indica se o envio foi bem-sucedido */
  success: boolean
  /** Mensagem de erro, presente apenas quando success é false */
  error?: string
}

/**
 * Envia um email usando o serviço Resend.
 *
 * Centraliza toda a lógica de envio para que qualquer parte
 * da aplicação utilize o mesmo remetente, configuração e
 * tratamento de erros.
 *
 * @param params — dados do email (destinatário, assunto, corpo)
 * @returns objeto indicando sucesso ou falha com mensagem de erro
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  try {
    const { to, subject, html, text } = params

    const { error } = await getResend().emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      ...(text ? { text } : {}),
    })

    if (error) {
      console.error('[Clausent Email] Falha ao enviar email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido ao enviar email'
    console.error('[Clausent Email] Exceção no envio:', message)
    return { success: false, error: message }
  }
}
