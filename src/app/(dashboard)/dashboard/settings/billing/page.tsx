import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { eq, and, count } from 'drizzle-orm'
import { db } from '@/lib/db'
import { organizations, contracts } from '@/lib/db/schema'
import { PLANS, type PlanId } from '@/lib/stripe/config'
import { CurrentPlan } from '@/components/billing/current-plan'
import { PlanCard } from '@/components/billing/plan-card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

/**
 * Página de configuração de billing e assinatura.
 *
 * Exibe:
 * 1. Card do plano atual com barra de uso
 * 2. Grid de planos disponíveis para upgrade/downgrade
 * 3. FAQ sobre billing e assinatura
 *
 * Dados carregados no servidor (RSC) para evitar
 * loading states desnecessários na primeira renderização.
 */
export default async function BillingPage() {
  /** Verifica autenticação */
  const { userId, orgId } = await auth()

  if (!userId || !orgId) {
    redirect('/sign-in')
  }

  /** Busca a organização do usuário */
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.clerkOrgId, orgId),
  })

  if (!org) {
    redirect('/dashboard')
  }

  /** Conta o número de contratos da organização */
  const [contractCount] = await db
    .select({ value: count() })
    .from(contracts)
    .where(eq(contracts.orgId, org.id))

  /** Plano atual da organização (default: starter) */
  const currentPlan = (org.plan || 'starter') as PlanId

  /** Total de contratos em uso */
  const contractsUsed = contractCount?.value || 0

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Cabeçalho da página */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Billing & Subscription
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your subscription plan and billing details.
        </p>
      </div>

      {/* Card do plano atual com informações de uso */}
      <CurrentPlan
        plan={currentPlan}
        contractsUsed={contractsUsed}
        hasSubscription={!!org.stripeCustomerId}
      />

      {/* Seção de planos disponíveis */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Available Plans
        </h2>

        {/* Grid responsivo: 1 coluna em mobile, 3 em desktop */}
        <div className="grid gap-6 md:grid-cols-3">
          {(Object.entries(PLANS) as [PlanId, (typeof PLANS)[PlanId]][]).map(
            ([planId, plan]) => (
              <PlanCard
                key={planId}
                planId={planId}
                name={plan.name}
                price={plan.price}
                features={plan.features}
                popular={'popular' in plan ? plan.popular : undefined}
                currentPlan={currentPlan}
              />
            )
          )}
        </div>
      </div>

      {/* Seção de FAQ sobre billing */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="change-plan">
            <AccordionTrigger>
              How do I change my plan?
            </AccordionTrigger>
            <AccordionContent>
              Click the &quot;Upgrade&quot; or &quot;Downgrade&quot; button on the plan you want to switch to.
              You&apos;ll be redirected to Stripe to complete the change. Plan changes take effect immediately.
              If you upgrade, you&apos;ll be charged a prorated amount for the remainder of the billing cycle.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cancel">
            <AccordionTrigger>
              Can I cancel my subscription?
            </AccordionTrigger>
            <AccordionContent>
              Yes, you can cancel anytime through the &quot;Manage Subscription&quot; button above.
              Your plan will remain active until the end of the current billing period.
              After that, you&apos;ll be downgraded to the Starter plan.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="contract-limit">
            <AccordionTrigger>
              What happens if I reach my contract limit?
            </AccordionTrigger>
            <AccordionContent>
              When you reach your plan&apos;s contract limit, you won&apos;t be able to upload new contracts
              until you upgrade your plan or delete existing contracts. All your existing contracts
              and analyses will remain accessible.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="refunds">
            <AccordionTrigger>
              Do you offer refunds?
            </AccordionTrigger>
            <AccordionContent>
              We offer a 14-day money-back guarantee for all new subscriptions. If you&apos;re not
              satisfied with the service, contact our support team within 14 days of your first
              payment for a full refund.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="payment-methods">
            <AccordionTrigger>
              What payment methods do you accept?
            </AccordionTrigger>
            <AccordionContent>
              We accept all major credit and debit cards (Visa, Mastercard, American Express).
              All payments are processed securely through Stripe.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
