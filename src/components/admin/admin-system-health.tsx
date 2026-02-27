'use client'

import { motion } from 'framer-motion'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  Cpu,
  HardDrive,
  Database,
  Wifi,
  Mail,
  Clock,
  ArrowUpRight,
  Server,
  Shield,
  Terminal,
  Info,
  AlertCircle,
  Bug,
  Zap,
  MemoryStick,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

/**
 * Histórico de incidentes recentes.
 * 3 incidentes com detalhes de resolução.
 */
const RECENT_INCIDENTS = [
  {
    id: 'INC-003',
    title: 'Latência elevada no serviço de e-mail',
    status: 'investigating' as const,
    severity: 'warning' as const,
    started: '26 Fev 2026, 08:15',
    duration: '2h 30min (em andamento)',
    resolution: 'Equipe investigando degradação no provedor Resend. Failover ativado para fila secundária.',
    affectedServices: ['Email'],
  },
  {
    id: 'INC-002',
    title: 'Timeout intermitente na API de análise',
    status: 'resolved' as const,
    severity: 'critical' as const,
    started: '24 Fev 2026, 14:30',
    duration: '45min',
    resolution: 'Pool de conexões do banco saturado. Aumentamos o limite de 50 para 100 conexões e implementamos connection recycling.',
    affectedServices: ['API', 'AI Engine'],
  },
  {
    id: 'INC-001',
    title: 'Pico de erro 429 na OpenAI API',
    status: 'resolved' as const,
    severity: 'warning' as const,
    started: '22 Fev 2026, 10:00',
    duration: '1h 15min',
    resolution: 'Rate limit atingido no tier atual. Implementamos exponential backoff e fila de retry. Upgrade de tier solicitado.',
    affectedServices: ['AI Engine'],
  },
]

/**
 * Logs do sistema — últimas 20 entradas.
 * Diferentes níveis de severidade (info, warning, error, debug).
 */
const SYSTEM_LOGS = [
  { time: '10:47:32', level: 'info' as const, service: 'api', message: 'POST /api/trpc/analysis.create - 201 (234ms)' },
  { time: '10:47:28', level: 'info' as const, service: 'auth', message: 'Login bem-sucedido: ana.silva@techcorp.com (IP: 187.45.xxx.xxx)' },
  { time: '10:47:15', level: 'warning' as const, service: 'email', message: 'Latência elevada no envio: 1.8s (threshold: 500ms)' },
  { time: '10:46:58', level: 'info' as const, service: 'ai', message: 'Análise ANL-1246 em progresso: etapa OCR concluída (67%)' },
  { time: '10:46:42', level: 'error' as const, service: 'email', message: 'Falha no envio para teste@dominioinexistente.xyz: DNS resolution failed' },
  { time: '10:46:30', level: 'info' as const, service: 'api', message: 'GET /api/trpc/contracts.list - 200 (89ms)' },
  { time: '10:46:15', level: 'debug' as const, service: 'db', message: 'Query executada: SELECT * FROM users WHERE id = $1 (2ms)' },
  { time: '10:45:58', level: 'info' as const, service: 'ai', message: 'Análise ANL-1245 iniciada para mariana@legaltech.io' },
  { time: '10:45:42', level: 'warning' as const, service: 'api', message: 'Rate limit atingido para IP 203.45.xxx.xxx (100 req/min)' },
  { time: '10:45:30', level: 'info' as const, service: 'stripe', message: 'Webhook recebido: invoice.paid para cus_abc123 ($99.00)' },
  { time: '10:45:15', level: 'info' as const, service: 'api', message: 'POST /api/trpc/contracts.upload - 201 (1.2s)' },
  { time: '10:44:58', level: 'debug' as const, service: 'cache', message: 'Cache hit: user_profile:USR-001 (Redis, 0.3ms)' },
  { time: '10:44:42', level: 'info' as const, service: 'auth', message: 'Signup: lucas@lawfirm.com.br — plano Free' },
  { time: '10:44:30', level: 'warning' as const, service: 'ai', message: 'OpenAI API response slow: 2.1s (p99 threshold: 1.5s)' },
  { time: '10:44:15', level: 'info' as const, service: 'api', message: 'GET /api/trpc/dashboard.stats - 200 (156ms)' },
  { time: '10:43:58', level: 'error' as const, service: 'ai', message: 'Análise ANL-1241 falhou: OCR timeout após 60s (contrato de franquia — 120 páginas)' },
  { time: '10:43:42', level: 'info' as const, service: 'stripe', message: 'Subscription atualizada: cus_def456 Professional → Business' },
  { time: '10:43:30', level: 'debug' as const, service: 'db', message: 'Migration check: esquema atualizado (v42)' },
  { time: '10:43:15', level: 'info' as const, service: 'api', message: 'Health check: todos os serviços operacionais' },
  { time: '10:42:58', level: 'info' as const, service: 'email', message: 'E-mail enviado: Welcome — ana.silva@techcorp.com (Resend, 1.1s)' },
]

/**
 * Configuração visual para níveis de log.
 */
const LOG_LEVEL_CONFIG = {
  info: { color: 'text-blue-600', bg: 'bg-blue-50', label: 'INFO' },
  warning: { color: 'text-amber-600', bg: 'bg-amber-50', label: 'WARN' },
  error: { color: 'text-red-600', bg: 'bg-red-50', label: 'ERROR' },
  debug: { color: 'text-slate-500', bg: 'bg-slate-50', label: 'DEBUG' },
}

/**
 * Variantes de animação do container.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

/**
 * Variantes de animação dos itens.
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
 * AdminSystemHealth — Página de saúde do sistema do painel admin.
 *
 * Funcionalidades:
 * - Status dos serviços (API, Database, AI Engine, Storage, Email) com indicadores visuais
 * - Métricas de desempenho (tempo de resposta, uptime, taxa de erro)
 * - Barras de uso de recursos (CPU, memória, storage, DB connections)
 * - Histórico de incidentes recentes (3 incidentes com detalhes de resolução)
 * - Visualizador de logs do sistema (últimas 20 entradas com severidade)
 *
 * Design: Light Neobrutalism com acentos indigo/violet.
 */
export function AdminSystemHealth() {
  /** Hook de tradução usando namespace admin */
  const t = useTranslations('admin')

  /**
   * Status dos serviços do sistema.
   * Cada serviço possui nome, status, latência e uptime.
   */
  const SERVICE_STATUS = [
    {
      name: 'API',
      status: 'operational' as const,
      latency: '145ms',
      uptime: '99.97%',
      icon: Server,
      descKey: 'systemServiceApiDesc' as const,
    },
    {
      name: 'Database',
      status: 'operational' as const,
      latency: '23ms',
      uptime: '99.99%',
      icon: Database,
      descKey: 'systemServiceDbDesc' as const,
    },
    {
      name: 'AI Engine',
      status: 'operational' as const,
      latency: '890ms',
      uptime: '99.95%',
      icon: Zap,
      descKey: 'systemServiceAiDesc' as const,
    },
    {
      name: 'Storage',
      status: 'operational' as const,
      latency: '67ms',
      uptime: '99.99%',
      icon: HardDrive,
      descKey: 'systemServiceStorageDesc' as const,
    },
    {
      name: 'Email',
      status: 'degraded' as const,
      latency: '1.2s',
      uptime: '98.50%',
      icon: Mail,
      descKey: 'systemServiceEmailDesc' as const,
    },
  ]

  /**
   * Configuração visual dos status de serviço.
   */
  const SERVICE_STATUS_CONFIG = {
    operational: {
      labelKey: 'systemStatusOperational' as const,
      icon: CheckCircle2,
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      dotColor: 'bg-emerald-500',
      borderColor: 'border-emerald-200',
    },
    degraded: {
      labelKey: 'systemStatusDegraded' as const,
      icon: AlertTriangle,
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      dotColor: 'bg-amber-500',
      borderColor: 'border-amber-200',
    },
    outage: {
      labelKey: 'systemStatusOutage' as const,
      icon: XCircle,
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      dotColor: 'bg-red-500',
      borderColor: 'border-red-200',
    },
  }

  /**
   * Métricas de desempenho do sistema.
   */
  const PERFORMANCE_METRICS = [
    {
      nameKey: 'systemApiResponseTime' as const,
      value: '145ms',
      descKey: 'systemApiResponseTimeDesc' as const,
      icon: Activity,
      trend: '-12ms',
      trendType: 'down' as const,
    },
    {
      nameKey: 'systemUptimeMetric' as const,
      value: '99.97%',
      descKey: 'systemUptimeMetricDesc' as const,
      icon: Shield,
      trend: '+0.02%',
      trendType: 'up' as const,
    },
    {
      nameKey: 'systemErrorRateMetric' as const,
      value: '0.03%',
      descKey: 'systemErrorRateMetricDesc' as const,
      icon: Bug,
      trend: '-0.01%',
      trendType: 'down' as const,
    },
  ]

  /**
   * Uso de recursos do sistema.
   * Barras de progresso para CPU, memória, storage e DB connections.
   */
  const RESOURCE_USAGE = [
    {
      nameKey: 'systemCpu' as const,
      value: 34,
      max: 100,
      unit: '%',
      icon: Cpu,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-100',
    },
    {
      nameKey: 'systemMemory' as const,
      value: 56,
      max: 100,
      unit: '%',
      icon: MemoryStick,
      color: 'bg-violet-500',
      bgColor: 'bg-violet-100',
    },
    {
      nameKey: 'systemStorage' as const,
      value: 42,
      max: 100,
      unit: '%',
      icon: HardDrive,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
    },
    {
      nameKey: 'systemDbConnections' as const,
      value: 23,
      max: 100,
      unit: '/100',
      icon: Database,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-100',
    },
  ]

  /**
   * Configuração visual dos status de incidente.
   */
  const INCIDENT_STATUS_CONFIG = {
    investigating: {
      labelKey: 'systemIncidentInvestigating' as const,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      dotColor: 'bg-amber-500',
    },
    resolved: {
      labelKey: 'systemIncidentResolved' as const,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      dotColor: 'bg-emerald-500',
    },
    monitoring: {
      labelKey: 'systemIncidentMonitoring' as const,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      dotColor: 'bg-blue-500',
    },
  }

  /**
   * Configuração visual de severidade de incidente.
   */
  const SEVERITY_CONFIG = {
    critical: {
      labelKey: 'systemSeverityCritical' as const,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
    },
    warning: {
      labelKey: 'systemSeverityWarning' as const,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
    },
    info: {
      labelKey: 'systemSeverityInfo' as const,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
  }

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
            {t('systemTitle')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('systemSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status geral */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">
              {t('systemDegradedService', { count: 1 })}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 text-slate-600 gap-2"
          >
            <Wifi className="h-4 w-4" />
            {t('systemStatusPage')}
          </Button>
        </div>
      </motion.div>

      {/* Status dos serviços — grid de cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {SERVICE_STATUS.map((service) => {
          const statusConfig = SERVICE_STATUS_CONFIG[service.status]
          const StatusIcon = statusConfig.icon
          const ServiceIcon = service.icon

          return (
            <motion.div
              key={service.name}
              whileHover={{ y: -2 }}
              className={cn(
                'bg-white rounded-2xl border p-5',
                'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]',
                'hover:shadow-[4px_4px_0px_rgba(0,0,0,0.08)] transition-shadow',
                service.status === 'degraded' ? 'border-amber-200' : 'border-slate-200'
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <ServiceIcon className="h-5 w-5 text-slate-500" />
                <StatusIcon className={cn('h-4 w-4', statusConfig.textColor)} />
              </div>

              <h4 className="text-sm font-semibold text-slate-900">{service.name}</h4>

              {/* Badge de status */}
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium mt-2',
                  statusConfig.bgColor,
                  statusConfig.textColor
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', statusConfig.dotColor)} />
                {t(statusConfig.labelKey)}
              </span>

              {/* Métricas do serviço */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">{t('systemLatency')}</span>
                  <span className="text-slate-600 font-medium">{service.latency}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">{t('systemUptime')}</span>
                  <span className="text-slate-600 font-medium">{service.uptime}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 mt-2">{t(service.descKey)}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Métricas de desempenho + Uso de recursos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Métricas de desempenho */}
        <motion.div
          variants={itemVariants}
          className={cn(
            'bg-white rounded-2xl border border-slate-200 p-6',
            'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]'
          )}
        >
          <h3 className="text-sm font-semibold text-slate-900 mb-5">{t('systemPerformanceMetrics')}</h3>

          <div className="space-y-4">
            {PERFORMANCE_METRICS.map((metric) => {
              const Icon = metric.icon

              return (
                <div
                  key={metric.nameKey}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50">
                      <Icon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{t(metric.nameKey)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{t(metric.descKey)}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-900">{metric.value}</p>
                    <div
                      className={cn(
                        'flex items-center gap-1 text-xs font-medium justify-end mt-0.5',
                        'text-emerald-600'
                      )}
                    >
                      <ArrowUpRight className="h-3 w-3" />
                      <span>{metric.trend}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Uso de recursos — barras de progresso */}
        <motion.div
          variants={itemVariants}
          className={cn(
            'bg-white rounded-2xl border border-slate-200 p-6',
            'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]'
          )}
        >
          <h3 className="text-sm font-semibold text-slate-900 mb-5">{t('systemResourceUsage')}</h3>

          <div className="space-y-5">
            {RESOURCE_USAGE.map((resource) => {
              const Icon = resource.icon
              /** Calcula a porcentagem de uso para a barra */
              const percentage = (resource.value / resource.max) * 100
              /** Define a cor do valor com base no uso */
              const valueColor =
                percentage > 80
                  ? 'text-red-600'
                  : percentage > 60
                    ? 'text-amber-600'
                    : 'text-slate-900'

              return (
                <div key={resource.nameKey} className="space-y-2">
                  {/* Header da barra — nome + valor */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">{t(resource.nameKey)}</span>
                    </div>
                    <span className={cn('text-sm font-bold', valueColor)}>
                      {resource.value}{resource.unit}
                    </span>
                  </div>

                  {/* Barra de progresso */}
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                      className={cn('h-full rounded-full', resource.color)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Incidentes recentes */}
      <motion.div
        variants={itemVariants}
        className={cn(
          'bg-white rounded-2xl border border-slate-200 p-6',
          'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]'
        )}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-slate-900">{t('systemRecentIncidents')}</h3>
          <span className="text-xs text-slate-400">{t('systemLast7Days')}</span>
        </div>

        <div className="space-y-4">
          {RECENT_INCIDENTS.map((incident) => {
            const statusConfig = INCIDENT_STATUS_CONFIG[incident.status]
            const severityConfig = SEVERITY_CONFIG[incident.severity]

            return (
              <div
                key={incident.id}
                className={cn(
                  'p-4 rounded-xl border',
                  incident.status === 'investigating'
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-100 bg-slate-50/30'
                )}
              >
                {/* Header do incidente */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'p-1.5 rounded-lg mt-0.5',
                        incident.status === 'investigating' ? 'bg-amber-100' : 'bg-emerald-100'
                      )}
                    >
                      {incident.status === 'investigating' ? (
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500">{incident.id}</span>
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded text-[9px] font-bold uppercase',
                            severityConfig.bgColor,
                            severityConfig.textColor
                          )}
                        >
                          {t(severityConfig.labelKey)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 mt-1">{incident.title}</p>
                    </div>
                  </div>

                  {/* Badge de status */}
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
                      statusConfig.bgColor,
                      statusConfig.textColor
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', statusConfig.dotColor)} />
                    {t(statusConfig.labelKey)}
                  </span>
                </div>

                {/* Detalhes do incidente */}
                <div className="ml-10 mt-3 space-y-2">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{t('systemIncidentStarted', { time: incident.started })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      <span>{t('systemIncidentDuration', { duration: incident.duration })}</span>
                    </div>
                  </div>

                  {/* Serviços afetados */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{t('systemIncidentAffected')}</span>
                    {incident.affectedServices.map((service) => (
                      <span
                        key={service}
                        className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded"
                      >
                        {service}
                      </span>
                    ))}
                  </div>

                  {/* Resolução */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {incident.resolution}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Logs do sistema — visualizador */}
      <motion.div
        variants={itemVariants}
        className={cn(
          'bg-white rounded-2xl border border-slate-200 overflow-hidden',
          'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]'
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">{t('systemLogs')}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{t('systemLogsLast20')}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 rounded-lg border-slate-200 text-xs text-slate-600"
            >
              {t('systemLogsRefresh')}
            </Button>
          </div>
        </div>

        {/* Container dos logs — fundo escuro estilo terminal */}
        <div className="bg-slate-900 p-4 max-h-[400px] overflow-y-auto">
          <div className="space-y-1 font-mono text-xs">
            {SYSTEM_LOGS.map((log, index) => {
              const levelConfig = LOG_LEVEL_CONFIG[log.level]

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.02 * index }}
                  className="flex items-start gap-3 py-1 px-2 rounded hover:bg-slate-800/50 transition-colors"
                >
                  {/* Timestamp */}
                  <span className="text-slate-500 flex-shrink-0 w-[72px]">{log.time}</span>

                  {/* Nível de severidade — badge colorido */}
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[9px] font-bold flex-shrink-0 w-[48px] text-center',
                      log.level === 'info' && 'bg-blue-900/40 text-blue-400',
                      log.level === 'warning' && 'bg-amber-900/40 text-amber-400',
                      log.level === 'error' && 'bg-red-900/40 text-red-400',
                      log.level === 'debug' && 'bg-slate-800 text-slate-400'
                    )}
                  >
                    {levelConfig.label}
                  </span>

                  {/* Serviço */}
                  <span className="text-violet-400 flex-shrink-0 w-[56px]">
                    [{log.service}]
                  </span>

                  {/* Mensagem */}
                  <span
                    className={cn(
                      'flex-1',
                      log.level === 'error' && 'text-red-300',
                      log.level === 'warning' && 'text-amber-300',
                      log.level === 'info' && 'text-slate-300',
                      log.level === 'debug' && 'text-slate-500'
                    )}
                  >
                    {log.message}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Footer do viewer de logs */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            {/* Contadores de nível */}
            <span className="flex items-center gap-1 text-[10px] text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              {t('systemLogsErrors', { count: SYSTEM_LOGS.filter((l) => l.level === 'error').length })}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {t('systemLogsWarnings', { count: SYSTEM_LOGS.filter((l) => l.level === 'warning').length })}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              {t('systemLogsInfo', { count: SYSTEM_LOGS.filter((l) => l.level === 'info').length })}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-6 rounded text-[10px] text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            {t('systemLogsViewFull')}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
