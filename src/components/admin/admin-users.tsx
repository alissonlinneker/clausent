'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  MoreHorizontal,
  Users,
  UserCheck,
  UserX,
  Clock,
  Eye,
  Mail,
  Ban,
  Trash2,
  ChevronDown,
  Download,
  UserPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTranslations } from 'next-intl'

/**
 * Dados mockados de 8 usuários para a tabela de gestão.
 * Cada usuário possui avatar, nome, email, plano, contratos,
 * MRR gerado, data de cadastro, status e ações disponíveis.
 */
const MOCK_USERS = [
  {
    id: 'USR-001',
    name: 'Ana Carolina Silva',
    email: 'ana.silva@techcorp.com',
    avatar: 'AS',
    avatarColor: 'bg-indigo-100 text-indigo-700',
    plan: 'Professional',
    planColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    contracts: 45,
    mrr: '$99.00',
    joined: '12 Jan 2026',
    status: 'active' as const,
  },
  {
    id: 'USR-002',
    name: 'Ricardo Mendes',
    email: 'ricardo@juridicobr.com.br',
    avatar: 'RM',
    avatarColor: 'bg-violet-100 text-violet-700',
    plan: 'Business',
    planColor: 'bg-violet-50 text-violet-700 border-violet-200',
    contracts: 128,
    mrr: '$249.00',
    joined: '05 Dez 2025',
    status: 'active' as const,
  },
  {
    id: 'USR-003',
    name: 'Mariana Costa',
    email: 'mariana@legaltech.io',
    avatar: 'MC',
    avatarColor: 'bg-emerald-100 text-emerald-700',
    plan: 'Starter',
    planColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    contracts: 12,
    mrr: '$29.00',
    joined: '20 Fev 2026',
    status: 'trial' as const,
  },
  {
    id: 'USR-004',
    name: 'Pedro Almeida',
    email: 'pedro.almeida@megacorp.com',
    avatar: 'PA',
    avatarColor: 'bg-amber-100 text-amber-700',
    plan: 'Professional',
    planColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    contracts: 67,
    mrr: '$99.00',
    joined: '15 Nov 2025',
    status: 'active' as const,
  },
  {
    id: 'USR-005',
    name: 'Juliana Ferreira',
    email: 'juliana@startuplegal.com',
    avatar: 'JF',
    avatarColor: 'bg-rose-100 text-rose-700',
    plan: 'Free',
    planColor: 'bg-slate-50 text-slate-600 border-slate-200',
    contracts: 3,
    mrr: '$0.00',
    joined: '01 Fev 2026',
    status: 'active' as const,
  },
  {
    id: 'USR-006',
    name: 'Fernando Souza',
    email: 'fernando@bancojuridico.com',
    avatar: 'FS',
    avatarColor: 'bg-blue-100 text-blue-700',
    plan: 'Business',
    planColor: 'bg-violet-50 text-violet-700 border-violet-200',
    contracts: 203,
    mrr: '$249.00',
    joined: '08 Out 2025',
    status: 'active' as const,
  },
  {
    id: 'USR-007',
    name: 'Camila Rodrigues',
    email: 'camila@contratosmart.com',
    avatar: 'CR',
    avatarColor: 'bg-teal-100 text-teal-700',
    plan: 'Starter',
    planColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    contracts: 8,
    mrr: '$29.00',
    joined: '18 Jan 2026',
    status: 'suspended' as const,
  },
  {
    id: 'USR-008',
    name: 'Lucas Martins',
    email: 'lucas@lawfirm.com.br',
    avatar: 'LM',
    avatarColor: 'bg-orange-100 text-orange-700',
    plan: 'Free',
    planColor: 'bg-slate-50 text-slate-600 border-slate-200',
    contracts: 1,
    mrr: '$0.00',
    joined: '24 Fev 2026',
    status: 'trial' as const,
  },
]

/**
 * Nomes dos planos usados como filtro.
 * "all" é o valor especial para "Todos os Planos".
 */
const PLAN_FILTER_VALUES = ['all', 'Free', 'Starter', 'Professional', 'Business', 'Enterprise']

/**
 * Valores de status usados como filtro.
 * "all" é o valor especial para "Todos os Status".
 */
const STATUS_FILTER_VALUES = ['all', 'active', 'suspended', 'trial']

/**
 * Variantes de animação para o container principal.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

/**
 * Variantes de animação para cada item.
 */
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
}

/**
 * AdminUsers — Página de gestão de usuários do painel admin.
 *
 * Funcionalidades:
 * - Cards de resumo (total, ativos, trial, churn)
 * - Barra de busca com pesquisa por nome/email
 * - Filtros por plano e status
 * - Tabela com 8 usuários mockados
 * - Menu de ações por linha (ver perfil, enviar email, suspender, excluir)
 * - Botões de exportar e adicionar usuário
 *
 * Design: Light Neobrutalism com acentos indigo/violet.
 */
export function AdminUsers() {
  /** Hook de tradução usando namespace admin */
  const t = useTranslations('admin')

  /** Estado da pesquisa de texto */
  const [searchQuery, setSearchQuery] = useState('')
  /** Estado do filtro de plano selecionado */
  const [selectedPlan, setSelectedPlan] = useState('all')
  /** Estado do filtro de status selecionado */
  const [selectedStatus, setSelectedStatus] = useState('all')
  /** ID do menu de ações aberto (null = nenhum) */
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null)

  /**
   * Cards de resumo do topo da página de usuários.
   * Cada card exibe uma métrica com ícone colorido.
   * Definidos dentro do componente para acessar traduções.
   */
  const USER_STAT_CARDS = [
    {
      titleKey: 'usersStatTotal' as const,
      value: '342',
      icon: Users,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      titleKey: 'usersStatActive' as const,
      value: '289',
      icon: UserCheck,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      titleKey: 'usersStatTrial' as const,
      value: '38',
      icon: Clock,
      color: 'amber',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      titleKey: 'usersStatChurn' as const,
      value: '15',
      icon: UserX,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
    },
  ]

  /**
   * Mapeamento de status para suas chaves de tradução e cores.
   */
  const STATUS_CONFIG = {
    active: {
      labelKey: 'usersStatusActive' as const,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      dotColor: 'bg-emerald-500',
    },
    suspended: {
      labelKey: 'usersStatusSuspended' as const,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      dotColor: 'bg-red-500',
    },
    trial: {
      labelKey: 'usersStatusTrial' as const,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      dotColor: 'bg-amber-500',
    },
  }

  /**
   * Filtra os usuários com base na pesquisa e filtros selecionados.
   * Aplica filtro sequencial: texto → plano → status.
   */
  const filteredUsers = MOCK_USERS.filter((user) => {
    /** Filtro de texto — busca por nome ou email */
    const matchesSearch =
      searchQuery === '' ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    /** Filtro por plano */
    const matchesPlan = selectedPlan === 'all' || user.plan === selectedPlan

    /** Filtro por status */
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus

    return matchesSearch && matchesPlan && matchesStatus
  })

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
            {t('usersTitle')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('usersSubtitle')}
          </p>
        </div>

        {/* Ações do cabeçalho */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 text-slate-600 gap-2"
          >
            <Download className="h-4 w-4" />
            {t('usersExport')}
          </Button>
          <Button
            size="sm"
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
          >
            <UserPlus className="h-4 w-4" />
            {t('usersNewUser')}
          </Button>
        </div>
      </motion.div>

      {/* Cards de resumo — 4 métricas */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {USER_STAT_CARDS.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.titleKey}
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
              <p className="text-sm text-slate-500 mt-3">{t(card.titleKey)}</p>
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
              placeholder={t('usersSearchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Filtro por plano */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="h-10 px-3 pr-8 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
              >
                {PLAN_FILTER_VALUES.map((plan) => (
                  <option key={plan} value={plan}>
                    {plan === 'all' ? t('usersAllPlans') : plan}
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
              className="h-10 px-3 pr-8 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
            >
              {STATUS_FILTER_VALUES.map((status) => (
                <option key={status} value={status}>
                  {status === 'all'
                    ? t('usersAllStatus')
                    : t(STATUS_CONFIG[status as keyof typeof STATUS_CONFIG].labelKey)}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* Tabela de usuários */}
      <motion.div
        variants={itemVariants}
        className={cn(
          'bg-white rounded-2xl border border-slate-200 overflow-hidden',
          'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]'
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Cabeçalho da tabela */}
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('usersTableUser')}
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('usersTablePlan')}
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('usersTableContracts')}
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('usersTableMrr')}
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('usersTableJoined')}
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('usersTableStatus')}
                </th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('usersTableActions')}
                </th>
              </tr>
            </thead>

            {/* Corpo da tabela — linhas de usuários */}
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user, index) => {
                const statusConfig = STATUS_CONFIG[user.status]

                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.03 * index }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Coluna: Avatar + Nome + Email */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0',
                            user.avatarColor
                          )}
                        >
                          {user.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Coluna: Plano */}
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border',
                          user.planColor
                        )}
                      >
                        {user.plan}
                      </span>
                    </td>

                    {/* Coluna: Contratos analisados */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-700 font-medium">
                        {user.contracts}
                      </span>
                    </td>

                    {/* Coluna: MRR gerado */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-700 font-medium">{user.mrr}</span>
                    </td>

                    {/* Coluna: Data de cadastro */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-500">{user.joined}</span>
                    </td>

                    {/* Coluna: Status com badge colorido */}
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
                          statusConfig.bgColor,
                          statusConfig.textColor
                        )}
                      >
                        <span
                          className={cn('h-1.5 w-1.5 rounded-full', statusConfig.dotColor)}
                        />
                        {t(statusConfig.labelKey)}
                      </span>
                    </td>

                    {/* Coluna: Menu de ações */}
                    <td className="px-5 py-4 text-right">
                      <div className="relative inline-block">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                          onClick={() =>
                            setOpenActionMenu(
                              openActionMenu === user.id ? null : user.id
                            )
                          }
                        >
                          <MoreHorizontal className="h-4 w-4 text-slate-400" />
                        </Button>

                        {/* Dropdown de ações */}
                        {openActionMenu === user.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={cn(
                              'absolute right-0 top-full mt-1 z-50 w-48',
                              'bg-white rounded-xl border border-slate-200 py-1',
                              'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]'
                            )}
                          >
                            {/* Ver perfil */}
                            <button
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                              onClick={() => setOpenActionMenu(null)}
                            >
                              <Eye className="h-4 w-4 text-slate-400" />
                              {t('usersActionViewProfile')}
                            </button>

                            {/* Enviar email */}
                            <button
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                              onClick={() => setOpenActionMenu(null)}
                            >
                              <Mail className="h-4 w-4 text-slate-400" />
                              {t('usersActionSendEmail')}
                            </button>

                            {/* Suspender/Ativar */}
                            <button
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
                              onClick={() => setOpenActionMenu(null)}
                            >
                              <Ban className="h-4 w-4 text-amber-500" />
                              {user.status === 'suspended' ? t('usersActionReactivate') : t('usersActionSuspend')}
                            </button>

                            {/* Separador */}
                            <div className="border-t border-slate-100 my-1" />

                            {/* Excluir */}
                            <button
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              onClick={() => setOpenActionMenu(null)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                              {t('usersActionDelete')}
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Rodapé da tabela — paginação e contagem */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/30">
          <p className="text-xs text-slate-500">
            {t('usersShowingOf', { filtered: filteredUsers.length, total: MOCK_USERS.length })}
          </p>

          {/* Botões de paginação (placeholder) */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg border-slate-200"
              disabled
            >
              &lsaquo;
            </Button>
            <Button
              size="sm"
              className="h-8 w-8 p-0 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              1
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg border-slate-200"
            >
              2
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg border-slate-200"
            >
              &rsaquo;
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
