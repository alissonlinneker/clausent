'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
  Bell,
  Mail,
  Monitor,
  Clock,
  Shield,
  FileCheck,
  Users,
  BarChart3,
  Megaphone,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'

/**
 * Componente de configurações de notificações.
 *
 * Permite ao usuário configurar preferências de notificações por e-mail,
 * notificações in-app e horários de silêncio (quiet hours).
 */
export function NotificationSettings() {
  const t = useTranslations('settings')

  /* Estado das notificações por e-mail */
  const [emailRenewal, setEmailRenewal] = useState(true)
  const [renewalDays, setRenewalDays] = useState('14')
  const [emailRiskAlerts, setEmailRiskAlerts] = useState(true)
  const [emailAnalysisComplete, setEmailAnalysisComplete] = useState(true)
  const [emailTeamActivity, setEmailTeamActivity] = useState(false)
  const [emailWeeklyDigest, setEmailWeeklyDigest] = useState(true)
  const [emailMarketing, setEmailMarketing] = useState(false)

  /* Estado das notificações in-app */
  const [appRenewal, setAppRenewal] = useState(true)
  const [appRiskAlerts, setAppRiskAlerts] = useState(true)
  const [appAnalysisComplete, setAppAnalysisComplete] = useState(true)
  const [appTeamActivity, setAppTeamActivity] = useState(true)
  const [appWeeklyDigest, setAppWeeklyDigest] = useState(false)
  const [appMarketing, setAppMarketing] = useState(false)

  /* Estado do horário de silêncio */
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false)
  const [quietStart, setQuietStart] = useState('22:00')
  const [quietEnd, setQuietEnd] = useState('08:00')

  /** Animação padrão para entrada dos cards */
  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.35 },
    }),
  }

  /** Opções de dias antes do vencimento para lembrete */
  const RENEWAL_DAYS_OPTIONS = ['7', '14', '30', '60', '90']

  /** Opções de horário (geradas de 00:00 a 23:00) */
  const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0')
    return `${hour}:00`
  })

  return (
    <div className="max-w-3xl space-y-8">
      {/* Cabeçalho da página */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {t('title')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t('notificationsDescription')}
        </p>
      </div>

      {/* Navegação de configurações (abas) */}
      <nav className="flex gap-1 border-b border-slate-200 pb-px overflow-x-auto">
        {[
          { href: '/dashboard/settings', label: t('general'), active: false },
          { href: '/dashboard/settings/billing', label: t('billing'), active: false },
          { href: '/dashboard/settings/profile', label: t('profile') || 'Profile', active: false },
          { href: '/dashboard/settings/security', label: t('security'), active: false },
          { href: '/dashboard/settings/notifications', label: t('notifications'), active: true },
          { href: '/dashboard/settings/api-keys', label: t('apiKeys'), active: false },
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

      {/* Seção: Notificações por e-mail */}
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] space-y-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <Mail className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t('emailNotifications')}
            </h2>
            <p className="text-sm text-slate-500">
              {t('emailNotificationsDescription')}
            </p>
          </div>
        </div>

        {/* Toggle: Lembretes de renovação de contrato */}
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <FileCheck className="h-4 w-4 text-slate-400" />
            <div>
              <Label className="text-sm font-medium text-slate-700">
                {t('contractRenewalReminders')}
              </Label>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('contractRenewalRemindersDescription')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Seletor de dias antes do vencimento */}
            {emailRenewal && (
              <Select value={renewalDays} onValueChange={setRenewalDays}>
                <SelectTrigger className="w-24 rounded-xl text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RENEWAL_DAYS_OPTIONS.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day} {t('daysBefore')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Switch
              checked={emailRenewal}
              onCheckedChange={setEmailRenewal}
              className="data-[state=checked]:bg-teal-600"
            />
          </div>
        </div>

        {/* Toggle: Alertas de risco */}
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-slate-400" />
            <div>
              <Label className="text-sm font-medium text-slate-700">
                {t('riskAlerts')}
              </Label>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('riskAlertsDescription')}
              </p>
            </div>
          </div>
          <Switch
            checked={emailRiskAlerts}
            onCheckedChange={setEmailRiskAlerts}
            className="data-[state=checked]:bg-teal-600"
          />
        </div>

        {/* Toggle: Análise concluída */}
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <FileCheck className="h-4 w-4 text-slate-400" />
            <div>
              <Label className="text-sm font-medium text-slate-700">
                {t('analysisComplete')}
              </Label>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('analysisCompleteDescription')}
              </p>
            </div>
          </div>
          <Switch
            checked={emailAnalysisComplete}
            onCheckedChange={setEmailAnalysisComplete}
            className="data-[state=checked]:bg-teal-600"
          />
        </div>

        {/* Toggle: Atividade da equipe */}
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-slate-400" />
            <div>
              <Label className="text-sm font-medium text-slate-700">
                {t('teamActivity')}
              </Label>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('teamActivityDescription')}
              </p>
            </div>
          </div>
          <Switch
            checked={emailTeamActivity}
            onCheckedChange={setEmailTeamActivity}
            className="data-[state=checked]:bg-teal-600"
          />
        </div>

        {/* Toggle: Resumo semanal */}
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-4 w-4 text-slate-400" />
            <div>
              <Label className="text-sm font-medium text-slate-700">
                {t('weeklyDigest')}
              </Label>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('weeklyDigestDescription')}
              </p>
            </div>
          </div>
          <Switch
            checked={emailWeeklyDigest}
            onCheckedChange={setEmailWeeklyDigest}
            className="data-[state=checked]:bg-teal-600"
          />
        </div>

        {/* Toggle: Marketing e atualizações de produto */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Megaphone className="h-4 w-4 text-slate-400" />
            <div>
              <Label className="text-sm font-medium text-slate-700">
                {t('marketingUpdates')}
              </Label>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('marketingUpdatesDescription')}
              </p>
            </div>
          </div>
          <Switch
            checked={emailMarketing}
            onCheckedChange={setEmailMarketing}
            className="data-[state=checked]:bg-teal-600"
          />
        </div>
      </motion.div>

      {/* Seção: Notificações in-app */}
      <motion.div
        custom={1}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] space-y-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Monitor className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t('inAppNotifications')}
            </h2>
            <p className="text-sm text-slate-500">
              {t('inAppNotificationsDescription')}
            </p>
          </div>
        </div>

        {/* Toggle: Lembretes de renovação (in-app) */}
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <FileCheck className="h-4 w-4 text-slate-400" />
            <Label className="text-sm font-medium text-slate-700">
              {t('contractRenewalReminders')}
            </Label>
          </div>
          <Switch
            checked={appRenewal}
            onCheckedChange={setAppRenewal}
            className="data-[state=checked]:bg-teal-600"
          />
        </div>

        {/* Toggle: Alertas de risco (in-app) */}
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-slate-400" />
            <Label className="text-sm font-medium text-slate-700">
              {t('riskAlerts')}
            </Label>
          </div>
          <Switch
            checked={appRiskAlerts}
            onCheckedChange={setAppRiskAlerts}
            className="data-[state=checked]:bg-teal-600"
          />
        </div>

        {/* Toggle: Análise concluída (in-app) */}
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <FileCheck className="h-4 w-4 text-slate-400" />
            <Label className="text-sm font-medium text-slate-700">
              {t('analysisComplete')}
            </Label>
          </div>
          <Switch
            checked={appAnalysisComplete}
            onCheckedChange={setAppAnalysisComplete}
            className="data-[state=checked]:bg-teal-600"
          />
        </div>

        {/* Toggle: Atividade da equipe (in-app) */}
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-slate-400" />
            <Label className="text-sm font-medium text-slate-700">
              {t('teamActivity')}
            </Label>
          </div>
          <Switch
            checked={appTeamActivity}
            onCheckedChange={setAppTeamActivity}
            className="data-[state=checked]:bg-teal-600"
          />
        </div>

        {/* Toggle: Resumo semanal (in-app) */}
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-4 w-4 text-slate-400" />
            <Label className="text-sm font-medium text-slate-700">
              {t('weeklyDigest')}
            </Label>
          </div>
          <Switch
            checked={appWeeklyDigest}
            onCheckedChange={setAppWeeklyDigest}
            className="data-[state=checked]:bg-teal-600"
          />
        </div>

        {/* Toggle: Marketing (in-app) */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Megaphone className="h-4 w-4 text-slate-400" />
            <Label className="text-sm font-medium text-slate-700">
              {t('marketingUpdates')}
            </Label>
          </div>
          <Switch
            checked={appMarketing}
            onCheckedChange={setAppMarketing}
            className="data-[state=checked]:bg-teal-600"
          />
        </div>
      </motion.div>

      {/* Seção: Horário de silêncio (quiet hours) */}
      <motion.div
        custom={2}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {t('quietHours')}
              </h2>
              <p className="text-sm text-slate-500">
                {t('quietHoursDescription')}
              </p>
            </div>
          </div>
          <Switch
            checked={quietHoursEnabled}
            onCheckedChange={setQuietHoursEnabled}
            className="data-[state=checked]:bg-teal-600"
          />
        </div>

        {/* Seletores de horário - exibidos apenas se quiet hours estiver ativo */}
        {quietHoursEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-4 pt-2"
          >
            <div className="flex-1 space-y-2">
              <Label className="text-xs text-slate-500 uppercase tracking-wide">
                {t('startTime')}
              </Label>
              <Select value={quietStart} onValueChange={setQuietStart}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((time) => (
                    <SelectItem key={`start-${time}`} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <span className="text-slate-400 mt-6">{t('to')}</span>

            <div className="flex-1 space-y-2">
              <Label className="text-xs text-slate-500 uppercase tracking-wide">
                {t('endTime')}
              </Label>
              <Select value={quietEnd} onValueChange={setQuietEnd}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((time) => (
                    <SelectItem key={`end-${time}`} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Botão salvar preferências */}
      <motion.div
        custom={3}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="flex justify-end"
      >
        <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2 px-6">
          <Save className="h-4 w-4" />
          {t('savePreferences')}
        </Button>
      </motion.div>
    </div>
  )
}
