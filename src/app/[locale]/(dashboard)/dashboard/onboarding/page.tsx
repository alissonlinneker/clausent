import type { Metadata } from 'next'
import { OnboardingWizard } from '@/components/dashboard/onboarding-wizard'

/** Metadados da página de onboarding */
export const metadata: Metadata = {
  title: 'Welcome to Clausent',
  description: 'Set up your account and start analyzing contracts with AI.',
}

/**
 * Página de onboarding para novos usuários.
 *
 * Server component que renderiza o wizard multi-step
 * client-side (OnboardingWizard).
 *
 * Fluxo: Welcome → Company Profile → First Upload → Done
 */
export default function OnboardingPage() {
  return <OnboardingWizard />
}
