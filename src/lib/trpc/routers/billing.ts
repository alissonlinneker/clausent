// @ts-nocheck
/**
 * Router tRPC de billing/faturamento.
 *
 * Gerencia operações relacionadas a assinaturas e pagamentos:
 * consulta de assinatura, criação de sessão de checkout,
 * acesso ao portal do cliente e consulta de uso.
 */

import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'

export const billingRouter = router({
  /**
   * Obter dados da assinatura atual do usuário.
   *
   * Retorna o plano ativo, status, período de cobrança,
   * limites e uso atual de contratos. Caso não exista
   * assinatura, retorna os dados do plano free.
   */
  getSubscription: protectedProcedure
    .query(async ({ ctx }) => {
      // TODO: Implementar query real com Drizzle
      // - Buscar subscriptions WHERE userId = ctx.user.id
      // - Se não existir, retornar plano free com limites padrão
      // - Incluir dados de período, cancelamento pendente, etc.

      const _userId = ctx.user.id

      return {
        plan: 'free' as const,
        status: 'active' as const,
        contractsUsed: 0,
        contractsLimit: 3,
        currentPeriodStart: null as Date | null,
        currentPeriodEnd: null as Date | null,
        cancelAtPeriodEnd: false,
        stripeCustomerId: null as string | null,
      }
    }),

  /**
   * Criar sessão de checkout do Stripe.
   *
   * Gera uma URL de checkout para o plano selecionado.
   * O usuário é redirecionado para o Stripe Checkout para
   * fornecer dados de pagamento. Após o pagamento, o webhook
   * processa a ativação do plano.
   */
  createCheckoutSession: protectedProcedure
    .input(z.object({
      /** ID do preço no Stripe (mensal ou anual) */
      priceId: z.string().min(1, 'ID do preço é obrigatório'),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Implementar com Stripe SDK
      // 1. Validar que o priceId corresponde a um plano existente
      // 2. Verificar se o usuário já tem uma assinatura ativa
      // 3. Criar sessão de checkout no Stripe com:
      //    - mode: 'subscription'
      //    - metadata: { userId, plan }
      //    - success_url / cancel_url
      // 4. Retornar URL de checkout

      const _userId = ctx.user.id
      const _priceId = input.priceId

      return {
        url: null as string | null,
      }
    }),

  /**
   * Criar sessão do portal do cliente Stripe.
   *
   * Gera uma URL para o Customer Portal do Stripe,
   * onde o usuário pode gerenciar sua assinatura:
   * alterar plano, atualizar forma de pagamento, cancelar, etc.
   */
  createPortalSession: protectedProcedure
    .mutation(async ({ ctx }) => {
      // TODO: Implementar com Stripe SDK
      // 1. Buscar stripeCustomerId do usuário no banco
      // 2. Se não existir, retornar erro (usuário sem assinatura)
      // 3. Criar sessão do portal via stripe.billingPortal.sessions.create
      // 4. Retornar URL do portal

      const _userId = ctx.user.id

      return {
        url: null as string | null,
      }
    }),

  /**
   * Obter dados de uso atual do usuário.
   *
   * Retorna estatísticas de consumo no período atual:
   * contratos usados, limite, percentual de uso,
   * e dados para exibição na UI de billing.
   */
  getUsage: protectedProcedure
    .query(async ({ ctx }) => {
      // TODO: Implementar query real com Drizzle
      // - Buscar subscription do usuário
      // - Calcular percentual de uso (contractsUsed / contractsLimit)
      // - Buscar contagem real de contratos (SELECT COUNT(*))
      // - Incluir dados do plano para exibição

      const _userId = ctx.user.id

      return {
        /** Contratos criados no período atual */
        contractsUsed: 0,
        /** Limite máximo de contratos do plano (null = ilimitado) */
        contractsLimit: 3 as number | null,
        /** Percentual de uso (0-100) */
        usagePercentage: 0,
        /** Nome do plano atual */
        planName: 'Free',
        /** Slug do plano atual */
        planSlug: 'free',
        /** Data de reset do período (fim do ciclo de cobrança) */
        periodEndsAt: null as Date | null,
      }
    }),
})
