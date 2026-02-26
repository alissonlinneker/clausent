'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Activity,
  Clock,
  Zap,
  Terminal,
  Check,
  ShieldCheck,
  BookOpen,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'

/**
 * Interface para representar uma chave de API.
 *
 * Contém dados como nome, valor mascarado, data de criação,
 * último uso, permissões e status.
 */
interface ApiKey {
  id: string
  name: string
  key: string
  maskedKey: string
  createdAt: string
  lastUsed: string
  permissions: 'full_access' | 'read_only' | 'webhooks_only'
  status: 'active' | 'revoked'
}

/**
 * Componente de gerenciamento de chaves de API.
 *
 * Permite visualizar, copiar e revogar chaves existentes,
 * além de gerar novas e consultar estatísticas de uso.
 */
export function ApiKeysSettings() {
  const t = useTranslations('settings')

  /** Dados mock das chaves de API */
  const [keys, setKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production Key',
      key: 'ck_live_a1b2c3d4e5f6g7h8i9j0abc123',
      maskedKey: 'ck_live_...abc123',
      createdAt: '2026-01-15',
      lastUsed: '2 hours ago',
      permissions: 'full_access',
      status: 'active',
    },
    {
      id: '2',
      name: 'Development Key',
      key: 'ck_test_k1l2m3n4o5p6q7r8s9t0def456',
      maskedKey: 'ck_test_...def456',
      createdAt: '2026-02-01',
      lastUsed: '5 days ago',
      permissions: 'read_only',
      status: 'active',
    },
    {
      id: '3',
      name: 'Webhook Key',
      key: 'ck_whk_u1v2w3x4y5z6a7b8c9d0ghi789',
      maskedKey: 'ck_whk_...ghi789',
      createdAt: '2026-02-10',
      lastUsed: 'Never',
      permissions: 'webhooks_only',
      status: 'active',
    },
  ])

  /** Controle de visibilidade das chaves (mostra/oculta) */
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})

  /** Controle de feedback visual ao copiar */
  const [copiedId, setCopiedId] = useState<string | null>(null)

  /** Animação padrão para entrada dos cards */
  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.35 },
    }),
  }

  /** Copia a chave para a área de transferência */
  async function handleCopyKey(id: string, key: string) {
    try {
      await navigator.clipboard.writeText(key)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Falha ao copiar chave:', err)
    }
  }

  /** Alterna a visibilidade de uma chave */
  function toggleKeyVisibility(id: string) {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  /** Revoga (remove) uma chave da lista */
  function handleRevokeKey(id: string) {
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: 'revoked' as const } : k))
    )
  }

  /** Retorna a cor e o texto do badge de permissão */
  function getPermissionBadge(permission: ApiKey['permissions']) {
    switch (permission) {
      case 'full_access':
        return {
          label: t('fullAccess'),
          className: 'bg-teal-50 text-teal-700 border-teal-200',
        }
      case 'read_only':
        return {
          label: t('readOnly'),
          className: 'bg-blue-50 text-blue-700 border-blue-200',
        }
      case 'webhooks_only':
        return {
          label: t('webhooksOnly'),
          className: 'bg-amber-50 text-amber-700 border-amber-200',
        }
    }
  }

  /** Exemplo de código curl para referência */
  const curlExample = `curl -X POST https://api.clausent.com/v1/contracts/analyze \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "document_url": "https://example.com/contract.pdf",
    "analysis_type": "full"
  }'`

  return (
    <div className="max-w-3xl space-y-8">
      {/* Cabeçalho da página */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {t('title')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t('apiKeysDescription')}
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
          { href: '/dashboard/settings/api-keys', label: t('apiKeys'), active: true },
          { href: '/dashboard/settings/integrations', label: t('integrations') || 'Integrations', active: false },
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

      {/* Cabeçalho com botão de gerar nova chave */}
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <Key className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t('yourApiKeys')}
            </h2>
            <p className="text-sm text-slate-500">
              {t('yourApiKeysDescription')}
            </p>
          </div>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2">
          <Plus className="h-4 w-4" />
          {t('generateNewKey')}
        </Button>
      </motion.div>

      {/* Lista de chaves de API */}
      <div className="space-y-4">
        {keys.map((apiKey, index) => {
          const permBadge = getPermissionBadge(apiKey.permissions)
          const isVisible = visibleKeys[apiKey.id]
          const isCopied = copiedId === apiKey.id
          const isRevoked = apiKey.status === 'revoked'

          return (
            <motion.div
              key={apiKey.id}
              custom={index + 1}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className={cn(
                'rounded-2xl bg-white border border-slate-200 p-5 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] space-y-4',
                isRevoked && 'opacity-60'
              )}
            >
              {/* Linha superior: nome, badge de permissão, botão revogar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-slate-900">
                    {apiKey.name}
                  </h3>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs rounded-lg border px-2 py-0.5',
                      permBadge.className
                    )}
                  >
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    {permBadge.label}
                  </Badge>
                  {isRevoked && (
                    <Badge
                      variant="outline"
                      className="text-xs rounded-lg border px-2 py-0.5 bg-red-50 text-red-700 border-red-200"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {t('revoked')}
                    </Badge>
                  )}
                </div>
                {!isRevoked && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeKey(apiKey.id)}
                    className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t('revoke')}
                  </Button>
                )}
              </div>

              {/* Linha da chave: valor mascarado/visível + botões copiar e alternar */}
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                <code className="text-sm font-mono text-slate-700 flex-1">
                  {isVisible ? apiKey.key : apiKey.maskedKey}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleKeyVisibility(apiKey.id)}
                  className="h-8 w-8 p-0 rounded-lg"
                  disabled={isRevoked}
                >
                  {isVisible ? (
                    <EyeOff className="h-4 w-4 text-slate-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-500" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyKey(apiKey.id, apiKey.key)}
                  className="h-8 w-8 p-0 rounded-lg"
                  disabled={isRevoked}
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-slate-500" />
                  )}
                </Button>
              </div>

              {/* Metadados: data de criação e último uso */}
              <div className="flex items-center gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {t('created')}: {apiKey.createdAt}
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5" />
                  {t('lastUsed')}: {apiKey.lastUsed}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Estatísticas de uso da API */}
      <motion.div
        custom={4}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Activity className="h-5 w-5 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            {t('apiUsageStats')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Requisições hoje */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
            <Zap className="h-5 w-5 text-teal-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">1,247</p>
            <p className="text-xs text-slate-500 mt-1">
              {t('requestsToday')}
            </p>
          </div>

          {/* Limite de taxa */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
            <Activity className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">10,000</p>
            <p className="text-xs text-slate-500 mt-1">
              {t('rateLimitPerDay')}
            </p>
          </div>

          {/* Tempo médio de resposta */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
            <Clock className="h-5 w-5 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">145ms</p>
            <p className="text-xs text-slate-500 mt-1">
              {t('avgResponseTime')}
            </p>
          </div>
        </div>

        {/* Barra de progresso do rate limit */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-500">{t('dailyUsage')}</span>
            <span className="font-medium text-slate-700">12.5%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all"
              style={{ width: '12.5%' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Seção de exemplo de código */}
      <motion.div
        custom={5}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Terminal className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {t('quickStart')}
              </h2>
              <p className="text-sm text-slate-500">
                {t('quickStartDescription')}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl gap-1"
          >
            <BookOpen className="h-3.5 w-3.5" />
            {t('viewDocs')}
          </Button>
        </div>

        {/* Bloco de código com exemplo curl */}
        <div className="relative rounded-xl bg-slate-900 p-4 overflow-x-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              navigator.clipboard.writeText(curlExample)
            }
            className="absolute top-3 right-3 h-7 w-7 p-0 rounded-lg hover:bg-slate-700"
          >
            <Copy className="h-3.5 w-3.5 text-slate-400" />
          </Button>
          <pre className="text-sm font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap">
            {curlExample}
          </pre>
        </div>

        {/* Nota sobre segurança */}
        <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700">
            {t('apiKeySecurityWarning')}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
