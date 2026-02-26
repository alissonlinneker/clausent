'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { PlanId } from '@/lib/stripe/config'

/** Props do componente PlanCard */
interface PlanCardProps {
  /** Identificador do plano (starter, professional, business) */
  planId: PlanId
  /** Nome de exibição do plano */
  name: string
  /** Preço em centavos (USD) */
  price: number
  /** Lista de funcionalidades incluídas */
  features: readonly string[]
  /** Se é o plano marcado como popular */
  popular?: boolean
  /** Plano atual da organização */
  currentPlan: string
}

/**
 * Card de plano de assinatura.
 *
 * Exibe as informações do plano (nome, preço, features)
 * com visual diferenciado para o plano "Popular" (Professional).
 *
 * O botão CTA muda dinamicamente:
 * - "Current Plan" (desabilitado) se for o plano ativo
 * - "Upgrade" se for um plano superior
 * - "Downgrade" se for um plano inferior
 *
 * Possui efeito hover com elevação (lift) e transição suave.
 */
export function PlanCard({
  planId,
  name,
  price,
  features,
  popular,
  currentPlan,
}: PlanCardProps) {
  /** Estado de loading durante o redirecionamento para checkout */
  const [isLoading, setIsLoading] = useState(false)

  /** Verifica se este é o plano ativo do usuário */
  const isCurrentPlan = currentPlan === planId

  /** Ordem dos planos para determinar se é upgrade ou downgrade */
  const planOrder: Record<string, number> = {
    starter: 0,
    professional: 1,
    business: 2,
  }

  /** Determina o label do botão CTA baseado na comparação dos planos */
  const getButtonLabel = () => {
    if (isCurrentPlan) return 'Current Plan'
    return planOrder[planId] > planOrder[currentPlan] ? 'Upgrade' : 'Downgrade'
  }

  /**
   * Inicia o fluxo de checkout.
   * Faz POST para /api/stripe/checkout e redireciona
   * para a URL do Stripe Checkout retornada.
   */
  const handleSubscribe = async () => {
    if (isCurrentPlan) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Erro ao iniciar checkout:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card
      className={cn(
        /* Transição suave e efeito hover com elevação */
        'relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        /* Borda indigo destacada para o plano popular */
        popular && 'border-indigo-500 shadow-md'
      )}
    >
      {/* Badge "Popular" no topo do card */}
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-indigo-600 text-white">
            Popular
          </Badge>
        </div>
      )}

      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-900">
          {name}
        </CardTitle>

        {/* Preço formatado: converte centavos para dólares */}
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-slate-900">
            ${(price / 100).toFixed(0)}
          </span>
          <span className="text-sm text-slate-500">/month</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Lista de features com ícone de check */}
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
              <span className="text-sm text-slate-600">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className={cn(
            'w-full',
            /* Visual destacado para upgrade, neutro para current/downgrade */
            popular && !isCurrentPlan
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : isCurrentPlan
                ? 'bg-slate-100 text-slate-500'
                : ''
          )}
          variant={popular && !isCurrentPlan ? 'default' : 'outline'}
          disabled={isCurrentPlan || isLoading}
          onClick={handleSubscribe}
        >
          {isLoading ? 'Redirecting...' : getButtonLabel()}
        </Button>
      </CardFooter>
    </Card>
  )
}
