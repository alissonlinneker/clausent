'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  CheckCircle2,
  Eye,
  AlertTriangle,
  Mail,
  MailOpen,
  MailX,
  XCircle,
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
  Clock,
  UserPlus,
  CreditCard,
  FileText,
  BarChart3,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

/**
 * Cards de estatísticas de e-mail.
 * Métricas agregadas do sistema de envio.
 */
const EMAIL_STAT_CARDS = [
  {
    title: 'Enviados Hoje',
    value: '124',
    icon: Send,
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    title: 'Entregues',
    value: '98%',
    icon: CheckCircle2,
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Abertos',
    value: '45%',
    icon: Eye,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    title: 'Bounce',
    value: '2',
    icon: AlertTriangle,
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
  },
]

/**
 * Dados mockados do log de e-mails enviados.
 * 10 registros com diferentes tipos e status.
 */
const EMAIL_LOG = [
  {
    id: 'EML-001',
    to: 'ana.silva@techcorp.com',
    toName: 'Ana Carolina Silva',
    subject: 'Bem-vinda ao Clausent!',
    type: 'transactional' as const,
    status: 'delivered' as const,
    sentAt: '26 Fev 2026, 10:32',
  },
  {
    id: 'EML-002',
    to: 'ricardo@juridicobr.com.br',
    toName: 'Ricardo Mendes',
    subject: 'Sua análise de contrato está pronta',
    type: 'transactional' as const,
    status: 'opened' as const,
    sentAt: '26 Fev 2026, 10:15',
  },
  {
    id: 'EML-003',
    to: 'pedro.almeida@megacorp.com',
    toName: 'Pedro Almeida',
    subject: 'Resumo semanal — 47 contratos analisados',
    type: 'marketing' as const,
    status: 'opened' as const,
    sentAt: '26 Fev 2026, 09:00',
  },
  {
    id: 'EML-004',
    to: 'mariana@legaltech.io',
    toName: 'Mariana Costa',
    subject: 'Seu período de trial termina em 3 dias',
    type: 'alert' as const,
    status: 'delivered' as const,
    sentAt: '26 Fev 2026, 08:30',
  },
  {
    id: 'EML-005',
    to: 'fernando@bancojuridico.com',
    toName: 'Fernando Souza',
    subject: 'Fatura de renovação — Business Plan',
    type: 'transactional' as const,
    status: 'opened' as const,
    sentAt: '25 Fev 2026, 18:44',
  },
  {
    id: 'EML-006',
    to: 'julia@invalidemail',
    toName: 'Julia Dias',
    subject: 'Bem-vinda ao Clausent!',
    type: 'transactional' as const,
    status: 'bounced' as const,
    sentAt: '25 Fev 2026, 16:22',
  },
  {
    id: 'EML-007',
    to: 'lucas@lawfirm.com.br',
    toName: 'Lucas Martins',
    subject: 'Nova funcionalidade: Análise Comparativa',
    type: 'marketing' as const,
    status: 'delivered' as const,
    sentAt: '25 Fev 2026, 14:00',
  },
  {
    id: 'EML-008',
    to: 'camila@contratosmart.com',
    toName: 'Camila Rodrigues',
    subject: 'Conta suspensa — ação necessária',
    type: 'alert' as const,
    status: 'opened' as const,
    sentAt: '25 Fev 2026, 11:33',
  },
  {
    id: 'EML-009',
    to: 'teste@dominioinexistente.xyz',
    toName: 'Teste Bounce',
    subject: 'Confirme seu e-mail',
    type: 'transactional' as const,
    status: 'failed' as const,
    sentAt: '25 Fev 2026, 09:15',
  },
  {
    id: 'EML-010',
    to: 'juliana@startuplegal.com',
    toName: 'Juliana Ferreira',
    subject: 'Resumo semanal — 3 contratos analisados',
    type: 'marketing' as const,
    status: 'delivered' as const,
    sentAt: '24 Fev 2026, 09:00',
  },
]

/**
 * Configuração visual dos status de e-mail.
 */
const EMAIL_STATUS_CONFIG = {
  delivered: {
    label: 'Entregue',
    icon: Mail,
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
  },
  opened: {
    label: 'Aberto',
    icon: MailOpen,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
  },
  bounced: {
    label: 'Bounce',
    icon: MailX,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
  },
  failed: {
    label: 'Falha',
    icon: XCircle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
  },
}

/**
 * Configuração dos tipos de e-mail.
 */
const EMAIL_TYPE_CONFIG = {
  transactional: {
    label: 'Transacional',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
  },
  marketing: {
    label: 'Marketing',
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-700',
  },
  alert: {
    label: 'Alerta',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
  },
}

/**
 * Templates de e-mail disponíveis.
 * 4 tipos com preview de conteúdo.
 */
const EMAIL_TEMPLATES = [
  {
    id: 'tpl-welcome',
    name: 'Boas-vindas',
    description: 'Enviado automaticamente ao criar conta',
    icon: UserPlus,
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    subject: 'Bem-vindo(a) ao Clausent!',
    preview:
      'Olá {nome}! Sua conta foi criada com sucesso. Comece enviando seu primeiro contrato para análise...',
    lastEdited: '20 Fev 2026',
    sentCount: 342,
  },
  {
    id: 'tpl-renewal',
    name: 'Alerta de Renovação',
    description: 'Enviado 7 dias antes do vencimento',
    icon: CreditCard,
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    subject: 'Sua assinatura renova em {dias} dias',
    preview:
      'Olá {nome}, este é um lembrete de que sua assinatura do plano {plano} será renovada automaticamente em {dias} dias...',
    lastEdited: '18 Fev 2026',
    sentCount: 89,
  },
  {
    id: 'tpl-analysis',
    name: 'Análise Concluída',
    description: 'Enviado quando a análise de IA termina',
    icon: FileText,
    iconColor: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    subject: 'Sua análise de "{contrato}" está pronta',
    preview:
      'Olá {nome}! A análise do contrato "{contrato}" foi concluída. Encontramos {num} cláusulas de risco...',
    lastEdited: '22 Fev 2026',
    sentCount: 1247,
  },
  {
    id: 'tpl-digest',
    name: 'Resumo Semanal',
    description: 'Enviado toda segunda-feira às 9h',
    icon: BarChart3,
    iconColor: 'text-violet-600',
    bgColor: 'bg-violet-50',
    subject: 'Resumo semanal — {num} contratos analisados',
    preview:
      'Olá {nome}! Aqui está seu resumo da semana: {num} contratos analisados, {alertas} alertas de risco, {score} score médio...',
    lastEdited: '24 Fev 2026',
    sentCount: 567,
  },
]

/**
 * Filtros disponíveis para o log de e-mails.
 */
const TYPE_FILTERS = ['Todos', 'Transacional', 'Marketing', 'Alerta']
const STATUS_FILTERS = ['Todos', 'Entregue', 'Aberto', 'Bounce', 'Falha']

/**
 * Variantes de animação.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
}

/**
 * AdminEmails — Página de logs de e-mail do painel admin.
 *
 * Funcionalidades:
 * - Cards de estatísticas (enviados, entregues, abertos, bounce)
 * - Tabela de logs com 10 registros (destinatário, assunto, tipo, status, data)
 * - Filtros por tipo e status
 * - Preview de 4 templates de e-mail (Welcome, Renewal, Analysis, Digest)
 * - Modal de preview ao clicar em "Ver template"
 *
 * Design: Light Neobrutalism com acentos indigo/violet.
 */
export function AdminEmails() {
  /** Estado da pesquisa de texto */
  const [searchQuery, setSearchQuery] = useState('')
  /** Estado do filtro de tipo */
  const [selectedType, setSelectedType] = useState('Todos')
  /** Estado do filtro de status */
  const [selectedStatus, setSelectedStatus] = useState('Todos')
  /** ID do template em preview (null = modal fechado) */
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null)

  /**
   * Filtra os e-mails com base na pesquisa e filtros.
   */
  const filteredEmails = EMAIL_LOG.filter((email) => {
    const matchesSearch =
      searchQuery === '' ||
      email.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType =
      selectedType === 'Todos' ||
      EMAIL_TYPE_CONFIG[email.type].label === selectedType

    const matchesStatus =
      selectedStatus === 'Todos' ||
      EMAIL_STATUS_CONFIG[email.status].label === selectedStatus

    return matchesSearch && matchesType && matchesStatus
  })

  /** Template selecionado para preview */
  const activeTemplate = EMAIL_TEMPLATES.find((t) => t.id === previewTemplate)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Cabeçalho da página */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Logs de E-mail
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitore envios, entregas e templates de e-mail
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 text-slate-600 gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Resend Dashboard
          </Button>
        </div>
      </motion.div>

      {/* Cards de estatísticas — 4 métricas */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {EMAIL_STAT_CARDS.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.title}
              className={cn(
                'bg-white rounded-2xl border border-slate-200 p-5',
                'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]'
              )}
            >
              <div className="flex items-center justify-between">
                <div className={cn('p-2.5 rounded-xl', card.bgColor)}>
                  <Icon className={cn('h-5 w-5', card.iconColor)} />
                </div>
                <span className="text-2xl font-bold text-slate-900">{card.value}</span>
              </div>
              <p className="text-sm text-slate-500 mt-3">{card.title}</p>
            </div>
          )
        })}
      </motion.div>

      {/* Barra de busca e filtros */}
      <motion.div
        variants={itemVariants}
        className={cn(
          'bg-white rounded-2xl border border-slate-200 p-4',
          'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]'
        )}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Campo de pesquisa */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Buscar por destinatário ou assunto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Filtro por tipo */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="h-10 px-3 pr-8 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {TYPE_FILTERS.map((type) => (
                  <option key={type} value={type}>
                    {type === 'Todos' ? 'Todos os Tipos' : type}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Filtro por status */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 px-3 pr-8 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {STATUS_FILTERS.map((status) => (
                <option key={status} value={status}>
                  {status === 'Todos' ? 'Todos os Status' : status}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* Tabela de log de e-mails */}
      <motion.div
        variants={itemVariants}
        className={cn(
          'bg-white rounded-2xl border border-slate-200 overflow-hidden',
          'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]'
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Destinatário
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Assunto
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Enviado em
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredEmails.map((email, index) => {
                const statusConfig = EMAIL_STATUS_CONFIG[email.status]
                const typeConfig = EMAIL_TYPE_CONFIG[email.type]
                const StatusIcon = statusConfig.icon

                return (
                  <motion.tr
                    key={email.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.03 * index }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Destinatário */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{email.toName}</p>
                        <p className="text-xs text-slate-500">{email.to}</p>
                      </div>
                    </td>

                    {/* Assunto */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-700 truncate max-w-[250px] block">
                        {email.subject}
                      </span>
                    </td>

                    {/* Tipo */}
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'inline-flex px-2.5 py-1 rounded-lg text-xs font-medium',
                          typeConfig.bgColor,
                          typeConfig.textColor
                        )}
                      >
                        {typeConfig.label}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
                          statusConfig.bgColor,
                          statusConfig.textColor
                        )}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusConfig.label}
                      </span>
                    </td>

                    {/* Data de envio */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-500">{email.sentAt}</span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Rodapé da tabela */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/30">
          <p className="text-xs text-slate-500">
            Exibindo <span className="font-medium text-slate-700">{filteredEmails.length}</span> de{' '}
            <span className="font-medium text-slate-700">{EMAIL_LOG.length}</span> e-mails
          </p>
        </div>
      </motion.div>

      {/* Templates de e-mail — grid de cards */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Templates de E-mail</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EMAIL_TEMPLATES.map((template) => {
            const Icon = template.icon

            return (
              <motion.div
                key={template.id}
                whileHover={{ y: -2 }}
                className={cn(
                  'bg-white rounded-2xl border border-slate-200 p-5',
                  'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]',
                  'hover:shadow-[4px_4px_0px_rgba(0,0,0,0.08)] transition-shadow'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Ícone do template */}
                  <div className={cn('p-3 rounded-xl flex-shrink-0', template.bgColor)}>
                    <Icon className={cn('h-5 w-5', template.iconColor)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900">{template.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{template.description}</p>

                    {/* Subject do template */}
                    <div className="mt-3 p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-400 mb-1">Assunto:</p>
                      <p className="text-xs font-medium text-slate-700">{template.subject}</p>
                    </div>

                    {/* Metadados */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        <span>Editado: {template.lastEdited}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Send className="h-3 w-3" />
                        <span>{template.sentCount} envios</span>
                      </div>
                    </div>

                    {/* Botão de preview */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 rounded-lg border-slate-200 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1.5"
                      onClick={() => setPreviewTemplate(template.id)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver template
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Modal de preview do template */}
      <AnimatePresence>
        {previewTemplate && activeTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'bg-white rounded-2xl border border-slate-200 w-full max-w-lg',
                'shadow-[6px_6px_0px_rgba(0,0,0,0.08)]'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do modal */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-xl', activeTemplate.bgColor)}>
                    <activeTemplate.icon
                      className={cn('h-4 w-4', activeTemplate.iconColor)}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {activeTemplate.name}
                    </h3>
                    <p className="text-xs text-slate-500">{activeTemplate.description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setPreviewTemplate(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Corpo do modal — preview do e-mail */}
              <div className="p-6 space-y-4">
                {/* Campos do e-mail */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-medium w-16">De:</span>
                    <span className="text-slate-700">Clausent &lt;noreply@clausent.com&gt;</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-medium w-16">Para:</span>
                    <span className="text-slate-700">{'{destinatário}'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-medium w-16">Assunto:</span>
                    <span className="text-slate-700 font-medium">{activeTemplate.subject}</span>
                  </div>
                </div>

                {/* Separador */}
                <div className="border-t border-slate-100" />

                {/* Preview do conteúdo */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {activeTemplate.preview}
                  </p>
                </div>

                {/* Informações adicionais */}
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Última edição: {activeTemplate.lastEdited}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Send className="h-3.5 w-3.5" />
                    <span>{activeTemplate.sentCount} envios totais</span>
                  </div>
                </div>
              </div>

              {/* Footer do modal */}
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/30 rounded-b-2xl">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-slate-200"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Fechar
                </Button>
                <Button
                  size="sm"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                >
                  Editar Template
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
