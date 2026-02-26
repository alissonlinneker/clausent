import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import * as schema from '@/lib/db/schema'

/**
 * Configuração principal do Better Auth — servidor.
 *
 * Este módulo inicializa o Better Auth com:
 * - Adaptador Drizzle (PostgreSQL via Neon)
 * - Autenticação por email/senha com verificação obrigatória
 * - Envio de emails transacionais via Resend
 * - Sessões com validade de 7 dias e renovação diária
 * - Plugin nextCookies para compatibilidade com Server Actions
 *
 * Variáveis de ambiente necessárias:
 * - BETTER_AUTH_SECRET — chave secreta para assinar tokens/sessões
 * - BETTER_AUTH_URL — URL base da aplicação
 * - DATABASE_URL — string de conexão do PostgreSQL (Neon)
 * - RESEND_API_KEY — chave da API do Resend
 * - EMAIL_FROM — remetente padrão dos emails
 * - NEXT_PUBLIC_APP_URL — URL pública da aplicação (fallback)
 */
export const auth = betterAuth({
  /**
   * Adaptador de banco de dados — Drizzle ORM com PostgreSQL.
   * Passa o schema customizado para que o Better Auth
   * reconheça as tabelas existentes (user, session, account, verification).
   */
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),

  /**
   * Autenticação por email e senha.
   * - Habilitada por padrão
   * - Verificação de email obrigatória (403 se não verificado)
   * - Envio de email de redefinição de senha via Resend
   */
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,

    /**
     * Callback disparado quando o usuário solicita redefinição de senha.
     * Envia um email com o link contendo o token de reset.
     */
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Clausent — Redefinição de senha',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Redefinição de senha</h2>
            <p>Olá${user.name ? `, ${user.name}` : ''},</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta Clausent.</p>
            <p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Redefinir senha
              </a>
            </p>
            <p style="color: #6b7280; font-size: 14px;">
              Se você não solicitou esta redefinição, ignore este email.
              O link expira em 1 hora.
            </p>
          </div>
        `,
      })
    },
  },

  /**
   * Configuração de verificação de email.
   * Envia um email com link de verificação após o cadastro.
   * O token é gerado automaticamente pelo Better Auth.
   */
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Clausent — Verifique seu email',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verificação de email</h2>
            <p>Olá${user.name ? `, ${user.name}` : ''},</p>
            <p>Obrigado por criar sua conta na Clausent. Clique no botão abaixo para verificar seu email:</p>
            <p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Verificar email
              </a>
            </p>
            <p style="color: #6b7280; font-size: 14px;">
              Se você não criou esta conta, ignore este email.
            </p>
          </div>
        `,
      })
    },
  },

  /**
   * Configuração de sessão.
   * - expiresIn: 7 dias (em segundos) — tempo total de vida da sessão
   * - updateAge: 1 dia (em segundos) — intervalo para renovação automática
   */
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  /**
   * Origens confiáveis para requisições de autenticação.
   * Em produção, BETTER_AUTH_URL deve apontar para o domínio real.
   */
  trustedOrigins: [process.env.BETTER_AUTH_URL || 'http://localhost:3000'],

  /**
   * Plugins do Better Auth.
   * - nextCookies: permite que Server Actions do Next.js definam
   *   cookies de sessão corretamente (deve ser o último plugin).
   */
  plugins: [nextCookies()],
})

/**
 * Tipo exportado da instância auth.
 * Útil para inferir tipos em outros módulos sem importar a instância diretamente.
 */
export type Auth = typeof auth
