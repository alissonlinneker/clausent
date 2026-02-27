'use client'

import { motion } from 'framer-motion'
import {
  DollarSign,
  Users,
  CreditCard,
  TrendingDown,
  FileText,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  ArrowUpCircle,
  FileSearch,
  Headphones,
  Clock,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

/**
 * Dados mockados de receita mensal (últimos 12 meses).
 * Usado no gráfico de tendência de receita (AreaChart).
 * Valores em USD para acompanhamento do MRR.
 */
const REVENUE_DATA = [
  { month: 'Mar', revenue: 4200 },
  { month: 'Abr', revenue: 5100 },
  { month: 'Mai', revenue: 5800 },
  { month: 'Jun', revenue: 6400 },
  { month: 'Jul', revenue: 7100 },
  { month: 'Ago', revenue: 7900 },
  { month: 'Set', revenue: 8600 },
  { month: 'Out', revenue: 9200 },
  { month: 'Nov', revenue: 9800 },
  { month: 'Dez', revenue: 10500 },
  { month: 'Jan', revenue: 11400 },
  { month: 'Fev', revenue: 12450 },
]

/**
 * Dados mockados de crescimento de usuários (últimos 6 meses).
 * Separados entre novos cadastros e usuários ativos.
 */
const USER_GROWTH_DATA = [
  { month: 'Set', novos: 28, ativos: 145 },
  { month: 'Out', novos: 35, ativos: 168 },
  { month: 'Nov', novos: 42, ativos: 195 },
  { month: 'Dez', novos: 38, ativos: 220 },
  { month: 'Jan', novos: 51, ativos: 258 },
  { month: 'Fev', novos: 24, ativos: 280 },
]

/**
 * Dados de distribuição de planos para o PieChart.
 * Cada fatia representa a porcentagem de usuários em cada plano.
 */
const PLAN_DISTRIBUTION = [
  { name: 'Free', value: 45, color: '#94a3b8' },
  { name: 'Starter', value: 30, color: '#818cf8' },
  { name: 'Professional', value: 18, color: '#6366f1' },
  { name: 'Business', value: 5, color: '#4f46e5' },
  { name: 'Enterprise', value: 2, color: '#3730a3' },
]

/**
 * KPIs (Key Performance Indicators) do painel admin.
 * Cada card exibe uma métrica com variação percentual ou absoluta.
 */
const KPI_CARDS = [
  {
    titleKey: 'mrr',
    value: '$12,450',
    changeKey: 'mrrChange',
    trend: 'up' as const,
    icon: DollarSign,
    descriptionKey: 'mrrDesc',
    color: 'indigo',
  },
  {
    titleKey: 'totalUsers',
    value: '342',
    changeKey: 'totalUsersChange',
    trend: 'up' as const,
    icon: Users,
    descriptionKey: 'totalUsersDesc',
    color: 'violet',
  },
  {
    titleKey: 'activeSubscriptions',
    value: '189',
    changeKey: 'activeSubsChange',
    trend: 'up' as const,
    icon: CreditCard,
    descriptionKey: 'activeSubsDesc',
    color: 'blue',
  },
  {
    titleKey: 'churnRate',
    value: '2.1%',
    changeKey: 'churnRateChange',
    trend: 'down' as const,
    icon: TrendingDown,
    descriptionKey: 'churnRateDesc',
    color: 'emerald',
  },
  {
    titleKey: 'contractsAnalyzed',
    value: '1,247',
    changeKey: 'contractsAnalyzedChange',
    trend: 'up' as const,
    icon: FileText,
    descriptionKey: 'contractsAnalyzedDesc',
    color: 'amber',
  },
  {
    titleKey: 'apiRequests',
    value: '45,230',
    changeKey: 'apiRequestsChange',
    trend: 'up' as const,
    icon: Zap,
    descriptionKey: 'apiRequestsDesc',
    color: 'rose',
  },
]

/**
 * Feed de atividades recentes do sistema.
 * Exibe os últimos 5 eventos relevantes com timestamp.
 */
const RECENT_ACTIVITY = [
  {
    id: 1,
    type: 'signup',
    icon: UserPlus,
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    titleKey: 'activityNewSignup',
    description: 'Maria Santos criou uma conta com plano Starter',
    timeKey: 'activity12min',
  },
  {
    id: 2,
    type: 'upgrade',
    icon: ArrowUpCircle,
    iconColor: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    titleKey: 'activityPlanUpgrade',
    description: 'Tech Solutions Ltda. migrou de Professional para Business',
    timeKey: 'activity45min',
  },
  {
    id: 3,
    type: 'analysis',
    icon: FileSearch,
    iconColor: 'text-violet-600',
    bgColor: 'bg-violet-50',
    titleKey: 'activityAnalysisComplete',
    description: 'Contrato "Acordo de Serviços AWS" — 23 cláusulas de risco identificadas',
    timeKey: 'activity1h',
  },
  {
    id: 4,
    type: 'support',
    icon: Headphones,
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    titleKey: 'activitySupportTicket',
    description: 'João Oliveira abriu ticket #1247 — "Erro ao exportar relatório"',
    timeKey: 'activity2h',
  },
  {
    id: 5,
    type: 'payment',
    icon: DollarSign,
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    titleKey: 'activityPaymentReceived',
    description: 'Banco Central Consulting — $299.00 (Professional anual)',
    timeKey: 'activity3h',
  },
]

/**
 * Mapeamento de cores para os cards de KPI.
 * Cada cor tem variantes de background, texto e ícone.
 */
const COLOR_MAP: Record<string, { bg: string; text: string; icon: string }> = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: 'text-indigo-600' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', icon: 'text-violet-600' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-600' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', icon: 'text-rose-600' },
}

/**
 * Variantes de animação para o container principal.
 * Controla o stagger (intervalo) entre filhos animados.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

/**
 * Variantes de animação para cada item filho.
 * Fade in + slide up suave.
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
 * Tooltip customizado para os gráficos Recharts.
 * Mantém o estilo neobrutalism da aplicação.
 */
function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
      <p className="text-xs font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-xs text-slate-600">
          <span className="font-medium" style={{ color: entry.color }}>
            {entry.name}:
          </span>{' '}
          {typeof entry.value === 'number' && entry.name?.toLowerCase().includes('revenue')
            ? `$${entry.value.toLocaleString()}`
            : entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

/**
 * AdminDashboard — Componente principal do painel administrativo.
 *
 * Exibe visão geral completa do sistema com:
 * - 6 cards de KPI (MRR, usuários, assinaturas, churn, análises, API)
 * - Gráfico de tendência de receita (AreaChart 12 meses)
 * - Gráfico de crescimento de usuários (BarChart 6 meses)
 * - Gráfico de distribuição de planos (PieChart)
 * - Feed de atividades recentes (5 eventos)
 *
 * Design: Light Neobrutalism com acentos indigo/violet.
 * Dados: Todos mockados para prototipagem.
 */
export function AdminDashboard() {
  /** Hook de tradução — namespace admin */
  const t = useTranslations('admin')

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
            {t('dashboardTitle')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('dashboardSubtitle')}
          </p>
        </div>

        {/* Indicador de último refresh */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          <span>{t('updatedAgo')}</span>
        </div>
      </motion.div>

      {/* Grid de cards de KPI — 6 métricas principais */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {KPI_CARDS.map((card) => {
          const Icon = card.icon
          const colors = COLOR_MAP[card.color]

          return (
            <motion.div
              key={card.titleKey}
              whileHover={{ y: -2 }}
              className={cn(
                'bg-white rounded-2xl border border-slate-200 p-5',
                'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]',
                'hover:shadow-[4px_4px_0px_rgba(0,0,0,0.08)] transition-shadow'
              )}
            >
              <div className="flex items-start justify-between">
                {/* Ícone do KPI */}
                <div className={cn('p-2.5 rounded-xl', colors.bg)}>
                  <Icon className={cn('h-5 w-5', colors.icon)} />
                </div>

                {/* Indicador de tendência (seta para cima/baixo) */}
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg',
                    card.titleKey === 'churnRate'
                      ? 'bg-emerald-50 text-emerald-700'
                      : card.trend === 'up'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                  )}
                >
                  {card.titleKey === 'churnRate' ? (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  ) : card.trend === 'up' ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  <span>{t(card.changeKey)}</span>
                </div>
              </div>

              {/* Valor principal */}
              <div className="mt-4">
                <p className="text-2xl font-bold text-slate-900 tracking-tight">
                  {card.value}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">{t(card.titleKey)}</p>
              </div>

              {/* Descrição */}
              <p className="text-[11px] text-slate-400 mt-2">{t(card.descriptionKey)}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Seção de gráficos — grid 2 colunas (desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de tendência de receita — AreaChart com gradiente indigo */}
        <motion.div
          variants={itemVariants}
          className={cn(
            'bg-white rounded-2xl border border-slate-200 p-6',
            'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]'
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{t('revenueOverTime')}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{t('revenueLast12Months')}</p>
            </div>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              {t('revenuePeriodGrowth')}
            </span>
          </div>

          <ResponsiveContainer width="100%" height={240} minWidth={0}>
            <AreaChart data={REVENUE_DATA}>
              <defs>
                {/* Gradiente vertical indigo para preenchimento da área */}
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Gráfico de crescimento de usuários — BarChart empilhado */}
        <motion.div
          variants={itemVariants}
          className={cn(
            'bg-white rounded-2xl border border-slate-200 p-6',
            'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]'
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{t('userGrowth')}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{t('userGrowthDesc')}</p>
            </div>
            {/* Legenda */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
                <span className="text-[10px] text-slate-500">{t('legendNew')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-violet-300" />
                <span className="text-[10px] text-slate-500">{t('legendActive')}</span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240} minWidth={0}>
            <BarChart data={USER_GROWTH_DATA} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="novos"
                name="Novos"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="ativos"
                name="Ativos"
                fill="#c4b5fd"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Seção inferior — Distribuição de planos + Atividades recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição de planos — PieChart */}
        <motion.div
          variants={itemVariants}
          className={cn(
            'bg-white rounded-2xl border border-slate-200 p-6',
            'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]'
          )}
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">{t('planDistribution')}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('planDistributionDesc')}</p>
          </div>

          <ResponsiveContainer width="100%" height={200} minWidth={0}>
            <PieChart>
              <Pie
                data={PLAN_DISTRIBUTION}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {PLAN_DISTRIBUTION.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const entry = payload[0]
                  return (
                    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
                      <p className="text-xs font-semibold text-slate-700">
                        {String(entry.name)}: {String(entry.value)}%
                      </p>
                    </div>
                  )
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legenda dos planos */}
          <div className="space-y-2 mt-4">
            {PLAN_DISTRIBUTION.map((plan) => (
              <div key={plan.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: plan.color }}
                  />
                  <span className="text-slate-600">{plan.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{plan.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Feed de atividades recentes — últimos 5 eventos */}
        <motion.div
          variants={itemVariants}
          className={cn(
            'bg-white rounded-2xl border border-slate-200 p-6 lg:col-span-2',
            'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]'
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{t('recentActivity')}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('recentActivityDesc')}
              </p>
            </div>
            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
              {t('viewAll')}
            </button>
          </div>

          <div className="space-y-4">
            {RECENT_ACTIVITY.map((activity, index) => {
              const Icon = activity.icon

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  {/* Ícone do evento */}
                  <div className={cn('p-2 rounded-xl flex-shrink-0', activity.bgColor)}>
                    <Icon className={cn('h-4 w-4', activity.iconColor)} />
                  </div>

                  {/* Conteúdo do evento */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{t(activity.titleKey)}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {activity.description}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">
                    {t(activity.timeKey)}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
