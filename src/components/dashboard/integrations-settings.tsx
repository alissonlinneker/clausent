'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
  MessageSquare,
  Users,
  FolderOpen,
  Workflow,
  BarChart3,
  Target,
  Plug,
  Settings,
  Check,
  ExternalLink,
  Clock,
  Webhook,
  Send,
  Globe,
  RefreshCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'

/**
 * Interface para representar uma integração disponível.
 *
 * Contém ícone, nome, descrição, status de conexão e metadados.
 */
interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  status: 'connected' | 'available' | 'coming_soon'
  statusDetail?: string
  lastSync?: string
  color: string
}

/**
 * Componente de configurações de integrações.
 *
 * Exibe o grid de integrações disponíveis, conectadas e futuras,
 * além de uma seção de configuração de webhooks.
 */
export function IntegrationsSettings() {
  const t = useTranslations('settings')

  /** Estado do endpoint de webhook */
  const [webhookUrl, setWebhookUrl] = useState('')

  /** Estado dos eventos selecionados para o webhook */
  const [webhookEvents, setWebhookEvents] = useState<Record<string, boolean>>({
    'contract.analyzed': true,
    'contract.renewed': false,
    'alert.created': true,
    'team.member_added': false,
    'report.generated': false,
  })

  /** Estado de teste do webhook (feedback visual) */
  const [webhookTesting, setWebhookTesting] = useState(false)
  const [webhookTestSuccess, setWebhookTestSuccess] = useState<boolean | null>(null)

  /** Dados das integrações disponíveis */
  const integrations: Integration[] = [
    {
      id: 'slack',
      name: 'Slack',
      description: t('slackDescription'),
      icon: <MessageSquare className="h-6 w-6" />,
      status: 'connected',
      statusDetail: t('syncAlerts'),
      lastSync: '5 min ago',
      color: 'text-purple-600 bg-purple-50',
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: t('teamsDescription'),
      icon: <Users className="h-6 w-6" />,
      status: 'available',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: 'gdrive',
      name: 'Google Drive',
      description: t('gdriveDescription'),
      icon: <FolderOpen className="h-6 w-6" />,
      status: 'connected',
      statusDetail: t('autoImport'),
      lastSync: '12 min ago',
      color: 'text-green-600 bg-green-50',
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: t('zapierDescription'),
      icon: <Workflow className="h-6 w-6" />,
      status: 'available',
      color: 'text-orange-600 bg-orange-50',
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: t('salesforceDescription'),
      icon: <BarChart3 className="h-6 w-6" />,
      status: 'coming_soon',
      color: 'text-sky-600 bg-sky-50',
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: t('hubspotDescription'),
      icon: <Target className="h-6 w-6" />,
      status: 'coming_soon',
      color: 'text-orange-500 bg-orange-50',
    },
  ]

  /** Animação padrão para entrada dos cards */
  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.06, duration: 0.35 },
    }),
  }

  /** Retorna o badge de status da integração */
  function getStatusBadge(status: Integration['status']) {
    switch (status) {
      case 'connected':
        return {
          label: t('connected'),
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <Check className="h-3 w-3" />,
        }
      case 'available':
        return {
          label: t('available'),
          className: 'bg-slate-50 text-slate-600 border-slate-200',
          icon: <Plug className="h-3 w-3" />,
        }
      case 'coming_soon':
        return {
          label: t('comingSoon'),
          className: 'bg-amber-50 text-amber-600 border-amber-200',
          icon: <Clock className="h-3 w-3" />,
        }
    }
  }

  /** Alterna a seleção de um evento do webhook */
  function toggleWebhookEvent(event: string) {
    setWebhookEvents((prev) => ({ ...prev, [event]: !prev[event] }))
  }

  /** Simula o teste do webhook */
  async function handleTestWebhook() {
    if (!webhookUrl) return
    setWebhookTesting(true)
    setWebhookTestSuccess(null)

    /* Simulação de envio de teste (substituir pela chamada real) */
    setTimeout(() => {
      setWebhookTesting(false)
      setWebhookTestSuccess(true)
      setTimeout(() => setWebhookTestSuccess(null), 3000)
    }, 1500)
  }

  /** Lista de eventos disponíveis para webhooks */
  const WEBHOOK_EVENTS = [
    { key: 'contract.analyzed', label: t('eventContractAnalyzed') },
    { key: 'contract.renewed', label: t('eventContractRenewed') },
    { key: 'alert.created', label: t('eventAlertCreated') },
    { key: 'team.member_added', label: t('eventTeamMemberAdded') },
    { key: 'report.generated', label: t('eventReportGenerated') },
  ]

  return (
    <div className="max-w-3xl space-y-8">
      {/* Cabeçalho da página */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {t('title')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t('integrationsDescription')}
        </p>
      </div>

      {/* Navegação de configurações (abas) */}
      <nav className="flex gap-1 border-b border-slate-200 pb-px overflow-x-auto">
        {[
          { href: '/dashboard/settings', label: t('general'), active: false },
          { href: '/dashboard/settings/billing', label: t('billing'), active: false },
          { href: '/dashboard/settings/profile', label: t('profile') || 'Profile', active: false },
          { href: '/dashboard/settings/security', label: t('security'), active: false },
          { href: '/dashboard/settings/notifications', label: t('notifications'), active: false },
          { href: '/dashboard/settings/api-keys', label: t('apiKeys'), active: false },
          { href: '/dashboard/settings/integrations', label: t('integrations') || 'Integrations', active: true },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              tab.active
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {/* Grid de integrações */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration, index) => {
          const statusBadge = getStatusBadge(integration.status)
          const isDisabled = integration.status === 'coming_soon'
          const isConnected = integration.status === 'connected'

          return (
            <motion.div
              key={integration.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className={cn(
                'rounded-2xl bg-white border border-slate-200 p-5 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] flex flex-col',
                isDisabled && 'opacity-60'
              )}
            >
              {/* Ícone e badge de status */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    integration.color
                  )}
                >
                  {integration.icon}
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs rounded-lg border px-2 py-0.5 gap-1',
                    statusBadge.className
                  )}
                >
                  {statusBadge.icon}
                  {statusBadge.label}
                </Badge>
              </div>

              {/* Nome e descrição */}
              <h3 className="font-semibold text-slate-900 mb-1">
                {integration.name}
              </h3>
              <p className="text-xs text-slate-500 mb-4 flex-1">
                {integration.description}
              </p>

              {/* Detalhes de conexão (se conectado) */}
              {isConnected && integration.lastSync && (
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                  <span className="flex items-center gap-1">
                    <RefreshCcw className="h-3 w-3" />
                    {t('lastSync')}: {integration.lastSync}
                  </span>
                  {integration.statusDetail && (
                    <span className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-emerald-500" />
                      {integration.statusDetail}
                    </span>
                  )}
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex gap-2 mt-auto">
                {isConnected ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl gap-1 text-xs"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      {t('configure')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 text-xs"
                    >
                      {t('disconnect')}
                    </Button>
                  </>
                ) : isDisabled ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="flex-1 rounded-xl text-xs"
                  >
                    {t('comingSoon')}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-1 text-xs"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t('connect')}
                  </Button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Seção de Webhooks */}
      <motion.div
        custom={6}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
            <Webhook className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t('webhooks')}
            </h2>
            <p className="text-sm text-slate-500">
              {t('webhooksDescription')}
            </p>
          </div>
        </div>

        {/* Campo de URL do endpoint */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">
            {t('endpointUrl')}
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-app.com/webhooks/clausent"
                className="pl-10 rounded-xl"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleTestWebhook}
              disabled={!webhookUrl || webhookTesting}
              className={cn(
                'rounded-xl gap-2 min-w-[120px]',
                webhookTestSuccess === true &&
                  'border-emerald-300 text-emerald-700 bg-emerald-50',
                webhookTestSuccess === false &&
                  'border-red-300 text-red-700 bg-red-50'
              )}
            >
              {webhookTesting ? (
                <>
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  {t('testing')}
                </>
              ) : webhookTestSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  {t('success')}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t('testWebhook')}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Seleção de eventos */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">
            {t('eventsToListen')}
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {WEBHOOK_EVENTS.map((event) => (
              <label
                key={event.key}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                  webhookEvents[event.key]
                    ? 'border-teal-300 bg-teal-50/50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                )}
              >
                <input
                  type="checkbox"
                  checked={webhookEvents[event.key] || false}
                  onChange={() => toggleWebhookEvent(event.key)}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">
                    {event.label}
                  </span>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {event.key}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Botão salvar configuração de webhooks */}
        <div className="flex justify-end pt-2">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2">
            <Webhook className="h-4 w-4" />
            {t('saveWebhookConfig')}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
