import {
  FileText,
  DollarSign,
  Bell,
  Shield,
  TrendingUp,
  Inbox,
  AlertTriangle,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

/**
 * Dados mockados para os cards de estatísticas.
 * Cada item define ícone, cor de destaque, label e valor.
 * Serão substituídos por dados reais quando o backend estiver pronto.
 */
const STATS_CARDS = [
  {
    label: 'Total Contracts',
    value: '0',
    icon: FileText,
    /** Cor indigo para contratos */
    iconBgColor: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    trend: '+0%',
    trendLabel: 'from last month',
  },
  {
    label: 'Active Value',
    value: '$0',
    icon: DollarSign,
    /** Cor emerald para valores financeiros */
    iconBgColor: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    trend: '+0%',
    trendLabel: 'from last month',
  },
  {
    label: 'Upcoming Renewals',
    value: '0',
    icon: Bell,
    /** Cor amber para alertas de renovação */
    iconBgColor: 'bg-amber-100',
    iconColor: 'text-amber-600',
    trend: '0',
    trendLabel: 'in next 30 days',
  },
  {
    label: 'Avg Risk Score',
    value: 'N/A',
    icon: Shield,
    /** Cor vermelha para indicadores de risco */
    iconBgColor: 'bg-red-100',
    iconColor: 'text-red-600',
    trend: '--',
    trendLabel: 'no data yet',
  },
] as const

/**
 * Página Overview do dashboard.
 *
 * Exibe:
 * 1. Grid de 4 cards de estatísticas (responsivo: 1→2→4 colunas)
 * 2. Seção "Recent Contracts" (empty state)
 * 3. Seção "Recent Alerts" (empty state)
 *
 * Todos os dados são mockados nesta fase inicial.
 * Serão conectados ao tRPC quando os routers estiverem prontos.
 */
export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          Overview
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Welcome to your contract intelligence dashboard.
        </p>
      </div>

      {/* Grid de cards de estatísticas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS_CARDS.map((stat) => {
          const Icon = stat.icon

          return (
            <Card
              key={stat.label}
              className="border-[#E2E8F0] bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#64748B]">
                  {stat.label}
                </CardTitle>
                {/* Container do ícone com cor de destaque */}
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.iconBgColor}`}
                >
                  <Icon className={`h-4.5 w-4.5 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                {/* Valor principal — grande e destacado */}
                <p className="text-2xl font-bold text-[#0F172A]">
                  {stat.value}
                </p>
                {/* Indicador de tendência (placeholder) */}
                <div className="mt-1 flex items-center gap-1 text-xs text-[#64748B]">
                  <TrendingUp className="h-3 w-3" />
                  <span>{stat.trend}</span>
                  <span>{stat.trendLabel}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Seções de conteúdo recente — grid de 2 colunas em desktop */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Seção: Contratos Recentes (empty state) */}
        <Card className="border-[#E2E8F0] bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#0F172A]">
              Recent Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Empty state com ilustração e CTA */}
            <div className="flex flex-col items-center justify-center py-10 text-center">
              {/* Ícone decorativo */}
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
                <Inbox className="h-7 w-7 text-indigo-400" />
              </div>
              <h3 className="text-sm font-medium text-[#0F172A]">
                No contracts yet
              </h3>
              <p className="mt-1 max-w-xs text-xs text-[#64748B]">
                Upload your first contract to start getting insights,
                risk analysis, and renewal alerts.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Seção: Alertas Recentes (empty state) */}
        <Card className="border-[#E2E8F0] bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#0F172A]">
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Empty state com ilustração e CTA */}
            <div className="flex flex-col items-center justify-center py-10 text-center">
              {/* Ícone decorativo */}
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                <AlertTriangle className="h-7 w-7 text-amber-400" />
              </div>
              <h3 className="text-sm font-medium text-[#0F172A]">
                No alerts yet
              </h3>
              <p className="mt-1 max-w-xs text-xs text-[#64748B]">
                Alerts will appear here when contracts need your
                attention — renewals, risks, or savings opportunities.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
