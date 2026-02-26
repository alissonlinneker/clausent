'use client'

import { useState } from 'react'
import { CreditCard, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PLANS, type PlanId } from '@/lib/stripe/config'

/** Props do componente CurrentPlan */
interface CurrentPlanProps {
  /** Plano ativo da organização */
  plan: PlanId
  /** Número de contratos atualmente em uso */
  contractsUsed: number
  /** Se a org tem stripeCustomerId (para habilitar o portal) */
  hasSubscription: boolean
}

/**
 * Card de resumo do plano atual.
 *
 * Exibe:
 * - Nome e preço do plano ativo
 * - Barra de progresso do uso de contratos (X de Y)
 * - Data estimada da próxima cobrança
 * - Botão para acessar o Stripe Customer Portal
 *
 * A barra de uso muda de cor conforme o percentual:
 * - Verde (< 75%): uso normal
 * - Amarelo (75-90%): atenção
 * - Vermelho (> 90%): limite próximo
 */
export function CurrentPlan({
  plan,
  contractsUsed,
  hasSubscription,
}: CurrentPlanProps) {
  /** Estado de loading durante abertura do portal */
  const [isLoading, setIsLoading] = useState(false)

  /** Configuração do plano ativo */
  const planConfig = PLANS[plan]

  /** Cálculo do percentual de uso */
  const usagePercent = Math.min(
    (contractsUsed / planConfig.contracts) * 100,
    100
  )

  /**
   * Define a cor da barra de progresso baseada no uso.
   * Limites: verde < 75%, amarelo 75-90%, vermelho > 90%.
   */
  const getUsageColor = () => {
    if (usagePercent >= 90) return 'bg-red-500'
    if (usagePercent >= 75) return 'bg-amber-500'
    return 'bg-indigo-600'
  }

  /**
   * Abre o Stripe Customer Portal.
   * Faz POST para /api/stripe/portal e redireciona
   * para a URL retornada pelo Stripe.
   */
  const handleManageSubscription = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Erro ao abrir portal de assinatura:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
            <CreditCard className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Current Plan</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-indigo-100 text-indigo-700">
                {planConfig.name}
              </Badge>
              <span className="text-sm text-slate-500">
                ${(planConfig.price / 100).toFixed(0)}/month
              </span>
            </div>
          </div>
        </div>

        {/* Botão para gerenciar assinatura via portal Stripe */}
        {hasSubscription && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleManageSubscription}
            disabled={isLoading}
          >
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            {isLoading ? 'Opening...' : 'Manage Subscription'}
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {/* Informação de uso de contratos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Contract Usage</span>
            <span className="font-medium text-slate-900">
              {contractsUsed} of {planConfig.contracts} contracts
            </span>
          </div>

          {/* Barra de progresso do uso */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getUsageColor()}`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>

          {/* Data estimada da próxima cobrança */}
          <p className="text-xs text-slate-400">
            Next billing date: —
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
