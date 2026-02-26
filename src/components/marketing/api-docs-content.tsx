'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Code2,
  Key,
  Zap,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Lock,
  Server,
  Clock,
  FileText,
  Shield,
  Bell,
  BarChart3,
  Trash2,
  List,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Métodos HTTP com suas cores de badge correspondentes.
 * Usadas nos cards de endpoint para identificação visual rápida.
 */
const METHOD_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  GET: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  POST: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
  },
  DELETE: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
  PUT: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  PATCH: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
  },
}

/**
 * Interface para cada endpoint da API.
 * Contém método, path, descrição e exemplos de request/response.
 */
interface ApiEndpoint {
  method: string
  path: string
  description: string
  icon: React.ElementType
  requestBody?: string
  responseBody: string
  params?: string
}

/**
 * Lista de endpoints da API Clausent.
 * Cada endpoint contém exemplos reais de request e response JSON.
 */
const API_ENDPOINTS: ApiEndpoint[] = [
  {
    method: 'POST',
    path: '/api/v1/contracts',
    description:
      'Upload a new contract for analysis. Accepts PDF, DOCX, or TXT files via URL or base64-encoded content.',
    icon: FileText,
    requestBody: JSON.stringify(
      {
        file_url: 'https://example.com/contract.pdf',
        name: 'Acme SaaS Agreement',
        analysis_type: 'comprehensive',
        tags: ['saas', 'vendor'],
      },
      null,
      2
    ),
    responseBody: JSON.stringify(
      {
        id: 'ct_abc123def456',
        status: 'processing',
        name: 'Acme SaaS Agreement',
        analysis_type: 'comprehensive',
        created_at: '2026-02-25T10:30:00Z',
        estimated_completion: '2026-02-25T10:30:45Z',
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/v1/contracts',
    description:
      'List all contracts in your account with pagination and filtering support. Returns up to 50 contracts per page.',
    icon: List,
    params: '?page=1&limit=20&status=analyzed&sort=created_at:desc',
    responseBody: JSON.stringify(
      {
        data: [
          {
            id: 'ct_abc123def456',
            name: 'Acme SaaS Agreement',
            status: 'analyzed',
            risk_score: 67,
            created_at: '2026-02-25T10:30:00Z',
          },
        ],
        pagination: {
          total: 47,
          page: 1,
          limit: 20,
          pages: 3,
        },
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/v1/contracts/:id',
    description:
      'Retrieve detailed information about a specific contract, including metadata, status, and tags.',
    icon: Eye,
    responseBody: JSON.stringify(
      {
        id: 'ct_abc123def456',
        name: 'Acme SaaS Agreement',
        status: 'analyzed',
        file_type: 'pdf',
        file_size: 2457600,
        pages: 24,
        analysis_type: 'comprehensive',
        risk_score: 67,
        clauses_found: 12,
        savings_potential: 4200,
        tags: ['saas', 'vendor'],
        created_at: '2026-02-25T10:30:00Z',
        analyzed_at: '2026-02-25T10:30:42Z',
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/v1/contracts/:id/analysis',
    description:
      'Get the complete analysis results for a contract, including risk score, extracted clauses, benchmarks, and recommendations.',
    icon: Shield,
    responseBody: JSON.stringify(
      {
        contract_id: 'ct_abc123def456',
        risk_score: 67,
        risk_level: 'medium',
        clauses: [
          {
            type: 'auto_renewal',
            text: '30-day notice required for termination',
            risk: 'high',
            recommendation: 'Negotiate for 60-day notice period',
          },
          {
            type: 'liability_cap',
            text: 'Liability capped at $50,000',
            risk: 'medium',
            recommendation: 'Consider increasing to match contract value',
          },
        ],
        benchmarks: {
          price_percentile: 72,
          terms_comparison: 'above_average',
          market_rate: 'within_range',
        },
        savings_potential: {
          amount: 4200,
          currency: 'USD',
          breakdown: [
            { category: 'pricing', amount: 2800 },
            { category: 'terms', amount: 1400 },
          ],
        },
      },
      null,
      2
    ),
  },
  {
    method: 'DELETE',
    path: '/api/v1/contracts/:id',
    description:
      'Permanently delete a contract and all associated analysis data. This action cannot be undone.',
    icon: Trash2,
    responseBody: JSON.stringify(
      {
        id: 'ct_abc123def456',
        deleted: true,
        deleted_at: '2026-02-25T14:20:00Z',
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/v1/alerts',
    description:
      'List all active alerts for upcoming renewals, expirations, and contract milestones with filtering options.',
    icon: Bell,
    params: '?status=active&type=renewal&limit=20',
    responseBody: JSON.stringify(
      {
        data: [
          {
            id: 'al_xyz789',
            contract_id: 'ct_abc123def456',
            type: 'renewal',
            title: 'Acme SaaS Agreement renews in 30 days',
            due_date: '2026-03-25T00:00:00Z',
            status: 'active',
            priority: 'high',
          },
        ],
        pagination: { total: 5, page: 1, limit: 20, pages: 1 },
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/v1/benchmarks',
    description:
      'Access market benchmark data for your contracts, including pricing percentiles and terms comparisons across industries.',
    icon: BarChart3,
    params: '?industry=saas&category=pricing',
    responseBody: JSON.stringify(
      {
        industry: 'saas',
        category: 'pricing',
        your_percentile: 72,
        median_price: 15000,
        your_average: 18200,
        potential_savings: 3200,
        sample_size: 12400,
        last_updated: '2026-02-25T00:00:00Z',
      },
      null,
      2
    ),
  },
]

/**
 * Exemplos de código para as diferentes linguagens.
 * Usados na seção de exemplos de integração.
 */
const CODE_EXAMPLES: Record<string, string> = {
  curl: `curl -X POST https://api.clausent.com/v1/contracts \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "file_url": "https://example.com/contract.pdf",
    "name": "Acme SaaS Agreement",
    "analysis_type": "comprehensive"
  }'`,
  javascript: `const response = await fetch(
  'https://api.clausent.com/v1/contracts',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_url: 'https://example.com/contract.pdf',
      name: 'Acme SaaS Agreement',
      analysis_type: 'comprehensive',
    }),
  }
);

const data = await response.json();
console.log(data.id); // "ct_abc123def456"`,
  python: `import requests

response = requests.post(
    "https://api.clausent.com/v1/contracts",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json",
    },
    json={
        "file_url": "https://example.com/contract.pdf",
        "name": "Acme SaaS Agreement",
        "analysis_type": "comprehensive",
    },
)

data = response.json()
print(data["id"])  # "ct_abc123def456"`,
}

/** Variante genérica de fade-in com slide para cima */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
}

/**
 * ApiDocsContent — documentação de API para desenvolvedores.
 *
 * Estrutura:
 * 1. Hero — título, descrição e base URL
 * 2. Autenticação — como obter e usar a API key
 * 3. Endpoints — lista completa com exemplos de request/response
 * 4. Code Examples — exemplos em curl, JavaScript e Python
 * 5. Rate Limits — limites de uso da API
 *
 * Design: Light Neobrutalism com fundo #FFFDF5, cards bg-white,
 * bordas slate-200, sombras 3px 3px, cantos arredondados 2xl.
 */
export function ApiDocsContent() {
  /** Linguagem selecionada nos exemplos de código */
  const [activeLanguage, setActiveLanguage] = useState<string>('curl')
  /** Endpoints expandidos (mostrando detalhes) */
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(
    new Set(['/api/v1/contracts-POST'])
  )
  /** Botão de copiar — feedback visual temporário */
  const [copiedText, setCopiedText] = useState<string | null>(null)

  /**
   * Alterna a expansão de um endpoint na lista.
   * Usa Set para permitir múltiplos endpoints abertos.
   */
  const toggleEndpoint = (key: string) => {
    setExpandedEndpoints((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  /**
   * Copia texto para o clipboard e mostra feedback visual.
   * O ícone de "copiado" desaparece após 2 segundos.
   */
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(id)
    setTimeout(() => setCopiedText(null), 2000)
  }

  return (
    <div className="bg-[#FFFDF5] min-h-screen">
      {/* Decoração de fundo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100/40 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-100/20 rounded-full blur-[100px] translate-y-1/2" />

      {/* ===== HERO DA DOCUMENTAÇÃO ===== */}
      <section className="relative pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <span className="inline-flex items-center rounded-full bg-teal-50 border border-teal-100 px-4 py-1.5 text-sm font-medium text-teal-600 mb-4">
              <Code2 className="h-3.5 w-3.5 mr-1.5" />
              Developer Documentation
            </span>
          </motion.div>

          {/* Título */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight"
          >
            API{' '}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Reference
            </span>
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            Integrate Clausent&apos;s contract intelligence into your
            applications with our RESTful API. Analyze contracts, manage
            alerts, and access benchmarks programmatically.
          </motion.p>

          {/* Base URL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-900 text-white shadow-[3px_3px_0px_rgba(0,0,0,0.15)]"
          >
            <Server className="h-4 w-4 text-teal-400" />
            <code className="text-sm font-mono">
              https://api.clausent.com/v1
            </code>
            <button
              onClick={() =>
                copyToClipboard(
                  'https://api.clausent.com/v1',
                  'base-url'
                )
              }
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              {copiedText === 'base-url' ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-slate-400" />
              )}
            </button>
          </motion.div>
        </div>
      </section>

      {/* ===== SEÇÃO DE AUTENTICAÇÃO ===== */}
      <section className="relative pb-12">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
          >
            <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
              <div className="flex items-start gap-4">
                {/* Ícone de autenticação */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 shrink-0">
                  <Key className="h-6 w-6 text-amber-600" />
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    Authentication
                  </h2>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">
                    All API requests require authentication via an API key
                    passed in the{' '}
                    <code className="px-1.5 py-0.5 rounded bg-slate-100 text-sm font-mono text-slate-700">
                      Authorization
                    </code>{' '}
                    header as a Bearer token. You can generate API keys from
                    your dashboard under Settings &rarr; API Keys.
                  </p>

                  {/* Exemplo de header de autenticação */}
                  <div className="rounded-xl bg-slate-900 p-4 overflow-x-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">Header</span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            'Authorization: Bearer YOUR_API_KEY',
                            'auth-header'
                          )
                        }
                        className="p-1 rounded hover:bg-white/10 transition-colors"
                      >
                        {copiedText === 'auth-header' ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3 text-slate-400" />
                        )}
                      </button>
                    </div>
                    <code className="text-sm text-emerald-300 font-mono">
                      Authorization: Bearer YOUR_API_KEY
                    </code>
                  </div>

                  {/* Aviso de segurança */}
                  <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <Lock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700">
                      Keep your API key secure. Never expose it in
                      client-side code, public repositories, or browser
                      requests. Use environment variables and server-side
                      proxy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== LISTA DE ENDPOINTS ===== */}
      <section className="relative pb-12">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Endpoints
            </h2>
            <p className="mt-2 text-slate-500">
              Complete list of available API endpoints with request and
              response examples.
            </p>
          </motion.div>

          {/* Cards de endpoints */}
          <div className="space-y-4">
            {API_ENDPOINTS.map((endpoint, index) => {
              const key = `${endpoint.path}-${endpoint.method}`
              const isExpanded = expandedEndpoints.has(key)
              const methodColor = METHOD_COLORS[endpoint.method]
              const Icon = endpoint.icon

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-[4px_4px_0px_rgba(0,0,0,0.07)] transition-shadow">
                    {/* Header clicável do endpoint */}
                    <button
                      onClick={() => toggleEndpoint(key)}
                      className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50/50 transition-colors text-left"
                    >
                      {/* Ícone de expandir/colapsar */}
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                      )}

                      {/* Badge do método HTTP */}
                      <span
                        className={cn(
                          'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-mono font-bold shrink-0 min-w-[60px] justify-center',
                          methodColor.bg,
                          methodColor.text,
                          methodColor.border
                        )}
                      >
                        {endpoint.method}
                      </span>

                      {/* Path do endpoint */}
                      <code className="text-sm font-mono text-slate-700 truncate">
                        {endpoint.path}
                      </code>

                      {/* Descrição curta (desktop) */}
                      <span className="hidden sm:inline text-sm text-slate-400 truncate ml-auto pl-4">
                        {endpoint.description.slice(0, 60)}...
                      </span>
                    </button>

                    {/* Conteúdo expandido */}
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-slate-100"
                      >
                        <div className="p-5 space-y-5">
                          {/* Descrição completa */}
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                'inline-flex items-center justify-center w-9 h-9 rounded-lg shrink-0',
                                methodColor.bg
                              )}
                            >
                              <Icon
                                className={cn(
                                  'h-4.5 w-4.5',
                                  methodColor.text
                                )}
                              />
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed pt-1.5">
                              {endpoint.description}
                            </p>
                          </div>

                          {/* Parâmetros de query (se existirem) */}
                          {endpoint.params && (
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                Query Parameters
                              </p>
                              <div className="rounded-lg bg-slate-50 px-4 py-2.5 border border-slate-200">
                                <code className="text-xs font-mono text-slate-600">
                                  {endpoint.params}
                                </code>
                              </div>
                            </div>
                          )}

                          {/* Request Body (se existir) */}
                          {endpoint.requestBody && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                  Request Body
                                </p>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      endpoint.requestBody!,
                                      `req-${key}`
                                    )
                                  }
                                  className="p-1 rounded hover:bg-slate-100 transition-colors"
                                >
                                  {copiedText === `req-${key}` ? (
                                    <Check className="h-3 w-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-3 w-3 text-slate-400" />
                                  )}
                                </button>
                              </div>
                              <div className="rounded-xl bg-slate-900 p-4 overflow-x-auto">
                                <pre className="text-xs text-slate-300 font-mono">
                                  {endpoint.requestBody}
                                </pre>
                              </div>
                            </div>
                          )}

                          {/* Response Body */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Response{' '}
                                <span className="text-emerald-600">
                                  200 OK
                                </span>
                              </p>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    endpoint.responseBody,
                                    `res-${key}`
                                  )
                                }
                                className="p-1 rounded hover:bg-slate-100 transition-colors"
                              >
                                {copiedText === `res-${key}` ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3 text-slate-400" />
                                )}
                              </button>
                            </div>
                            <div className="rounded-xl bg-slate-900 p-4 overflow-x-auto">
                              <pre className="text-xs text-slate-300 font-mono">
                                {endpoint.responseBody}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== EXEMPLOS DE CÓDIGO ===== */}
      <section className="relative py-12">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Code Examples
            </h2>
            <p className="mt-2 text-slate-500">
              Quick start examples in your favorite language.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] overflow-hidden">
              {/* Tabs de linguagem */}
              <div className="flex items-center gap-1 px-4 pt-4 pb-0">
                {Object.keys(CODE_EXAMPLES).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLanguage(lang)}
                    className={cn(
                      'px-4 py-2 rounded-t-lg text-sm font-medium transition-all duration-200',
                      activeLanguage === lang
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                    )}
                  >
                    {lang === 'curl'
                      ? 'cURL'
                      : lang === 'javascript'
                        ? 'JavaScript'
                        : 'Python'}
                  </button>
                ))}
              </div>

              {/* Bloco de código */}
              <div className="relative">
                <div className="rounded-b-2xl bg-slate-900 p-5 overflow-x-auto">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        CODE_EXAMPLES[activeLanguage],
                        `code-${activeLanguage}`
                      )
                    }
                    className="absolute top-3 right-3 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {copiedText === `code-${activeLanguage}` ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                  <pre className="text-sm text-slate-300 font-mono leading-relaxed">
                    <code>{CODE_EXAMPLES[activeLanguage]}</code>
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== RATE LIMITS ===== */}
      <section className="relative py-12 pb-24 sm:pb-32">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
          >
            <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
              <div className="flex items-start gap-4">
                {/* Ícone de rate limits */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-50 border border-violet-200 shrink-0">
                  <Zap className="h-6 w-6 text-violet-600" />
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    Rate Limits
                  </h2>
                  <p className="text-sm text-slate-500 leading-relaxed mb-5">
                    API requests are rate-limited based on your subscription
                    plan. Rate limit headers are included in every response.
                  </p>

                  {/* Tabela de limites */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-3 text-left font-medium text-slate-600">
                            Plan
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">
                            Requests/min
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">
                            Contracts/month
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            plan: 'Free',
                            rpm: '10',
                            contracts: '5',
                          },
                          {
                            plan: 'Starter',
                            rpm: '60',
                            contracts: '50',
                          },
                          {
                            plan: 'Professional',
                            rpm: '300',
                            contracts: '500',
                          },
                          {
                            plan: 'Enterprise',
                            rpm: 'Custom',
                            contracts: 'Unlimited',
                          },
                        ].map((row, i) => (
                          <tr
                            key={row.plan}
                            className={cn(
                              'border-b border-slate-100 last:border-0',
                              i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                            )}
                          >
                            <td className="px-4 py-3 font-medium text-slate-700">
                              {row.plan}
                            </td>
                            <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                              {row.rpm}
                            </td>
                            <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                              {row.contracts}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Headers de rate limit */}
                  <div className="mt-5">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                      Response Headers
                    </p>
                    <div className="rounded-xl bg-slate-900 p-4 overflow-x-auto">
                      <pre className="text-xs text-slate-300 font-mono leading-relaxed">
                        {`X-RateLimit-Limit: 60
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1709125200
Retry-After: 30`}
                      </pre>
                    </div>
                  </div>

                  {/* Nota sobre 429 */}
                  <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <Clock className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-600">
                      When you exceed the rate limit, the API returns a{' '}
                      <code className="px-1 py-0.5 rounded bg-slate-200 text-xs font-mono">
                        429 Too Many Requests
                      </code>{' '}
                      status code. Use the{' '}
                      <code className="px-1 py-0.5 rounded bg-slate-200 text-xs font-mono">
                        Retry-After
                      </code>{' '}
                      header to determine when to retry.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
