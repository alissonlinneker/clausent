'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  UserPlus,
  Crown,
  Shield,
  Eye,
  Mail,
  MoreHorizontal,
  Clock,
  FileText,
  X,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

/* =================================================================
   TIPOS E INTERFACES
   Definem a estrutura de dados para membros e convites da equipe.
   ================================================================= */

/** Papéis disponíveis para membros da equipe */
type MemberRole = 'admin' | 'member' | 'viewer'

/** Status do convite — aceito ou pendente */
type InviteStatus = 'accepted' | 'pending'

/** Estrutura de dados de um membro da equipe */
interface TeamMember {
  /** Identificador único do membro */
  id: string
  /** Nome completo do membro */
  name: string
  /** Endereço de e-mail do membro */
  email: string
  /** Papel/permissão do membro na equipe */
  role: MemberRole
  /** Iniciais do nome para avatar */
  avatar: string
  /** Data de entrada na equipe (ISO string) */
  joinedDate: string
  /** Última vez que o membro esteve ativo (ISO string) */
  lastActive: string
  /** Quantidade de contratos visualizados */
  contractsViewed: number
  /** Status do convite — aceito ou pendente */
  status: InviteStatus
}

/* =================================================================
   DADOS MOCK
   Simulam membros reais da equipe com métricas de uso.
   Serão substituídos por chamadas ao backend quando disponível.
   ================================================================= */

/** Lista inicial de membros da equipe */
const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: 'm1',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'admin',
    avatar: 'SJ',
    joinedDate: '2025-06-01',
    lastActive: '2026-02-26',
    contractsViewed: 156,
    status: 'accepted',
  },
  {
    id: 'm2',
    name: 'Michael Chen',
    email: 'michael@company.com',
    role: 'member',
    avatar: 'MC',
    joinedDate: '2025-08-15',
    lastActive: '2026-02-25',
    contractsViewed: 89,
    status: 'accepted',
  },
  {
    id: 'm3',
    name: 'Emily Rodriguez',
    email: 'emily@company.com',
    role: 'member',
    avatar: 'ER',
    joinedDate: '2025-10-01',
    lastActive: '2026-02-24',
    contractsViewed: 42,
    status: 'accepted',
  },
  {
    id: 'm4',
    name: 'David Kim',
    email: 'david@company.com',
    role: 'viewer',
    avatar: 'DK',
    joinedDate: '2026-01-15',
    lastActive: '2026-02-20',
    contractsViewed: 15,
    status: 'accepted',
  },
  {
    id: 'm5',
    name: 'Anna Petrov',
    email: 'anna@company.com',
    role: 'member',
    avatar: 'AP',
    joinedDate: '',
    lastActive: '',
    contractsViewed: 0,
    status: 'pending',
  },
]

/** Estatísticas resumidas da equipe */
const MOCK_TEAM_STATS = {
  totalMembers: 4,
  pendingInvites: 1,
  maxSeats: 10,
  adminCount: 1,
}

/* =================================================================
   UTILITÁRIOS
   Funções auxiliares para formatação e estilo dos membros.
   ================================================================= */

/**
 * Retorna as classes de cor do avatar com base no papel do membro.
 * - admin: teal (destaque principal)
 * - member: sky (colaborador padrão)
 * - viewer: slate (acesso restrito)
 */
function getAvatarColors(role: MemberRole): { bg: string; text: string } {
  switch (role) {
    case 'admin':
      return { bg: 'bg-teal-100', text: 'text-teal-700' }
    case 'member':
      return { bg: 'bg-sky-100', text: 'text-sky-700' }
    case 'viewer':
      return { bg: 'bg-slate-100', text: 'text-slate-600' }
  }
}

/**
 * Retorna o ícone adequado para cada papel.
 * Facilita a identificação visual rápida do nível de acesso.
 */
function getRoleIcon(role: MemberRole) {
  switch (role) {
    case 'admin':
      return Crown
    case 'member':
      return Shield
    case 'viewer':
      return Eye
  }
}

/**
 * Retorna as classes de estilo para o badge de papel.
 * Cada papel tem cores distintas para diferenciação visual.
 */
function getRoleBadgeStyles(role: MemberRole): string {
  switch (role) {
    case 'admin':
      return 'bg-teal-50 text-teal-700 border-teal-200'
    case 'member':
      return 'bg-sky-50 text-sky-700 border-sky-200'
    case 'viewer':
      return 'bg-slate-50 text-slate-600 border-slate-200'
  }
}

/**
 * Calcula o tempo relativo desde uma data ISO.
 * Usa o hook de traduções para retornar strings localizadas.
 */
function getRelativeTime(dateString: string, t: (key: string, params?: Record<string, string | number>) => string): string {
  if (!dateString) return '—'

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return t('relativeToday')
  if (diffDays === 1) return t('relativeYesterday')
  if (diffDays < 7) return t('relativeDaysAgo', { count: diffDays })
  if (diffDays < 30) return t('relativeWeeksAgo', { count: Math.floor(diffDays / 7) })
  if (diffDays < 365) return t('relativeMonthsAgo', { count: Math.floor(diffDays / 30) })
  return t('relativeYearsAgo', { count: Math.floor(diffDays / 365) })
}

/**
 * Formata uma data ISO para o padrão de exibição (ex: "Jun 2025").
 * Usado para mostrar a data de entrada do membro.
 */
function formatJoinDate(dateString: string): string {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

/**
 * Gera iniciais a partir de um e-mail (para convites novos).
 * Extrai as duas primeiras letras do nome antes do @.
 */
function getInitialsFromEmail(email: string): string {
  const name = email.split('@')[0]
  if (!name) return '??'
  /** Tenta separar por ponto ou hífen para pegar iniciais */
  const parts = name.split(/[._-]/)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

/* =================================================================
   VARIANTES DE ANIMAÇÃO (Framer Motion)
   Definem as transições de entrada e interação dos elementos.
   ================================================================= */

/** Container pai — orquestra o stagger dos filhos */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

/** Variante dos stat cards — surgem de baixo com fade */
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
}

/** Variante para cards de membro — stagger individual */
const memberCardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
}

/** Variante para seções maiores — fade com deslocamento */
const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
}

/** Variante para o modal de convite — escala com fade */
const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
}

/* =================================================================
   DESCRIÇÕES DE PERMISSÕES POR PAPEL
   Detalhamento das capacidades de cada papel na equipe.
   ================================================================= */

/** Descrições detalhadas de cada papel com ícone e chaves de permissões */
const ROLE_DESCRIPTIONS = [
  {
    roleKey: 'roleAdmin' as const,
    icon: Crown,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    permissionKeys: [
      'permAdminContracts' as const,
      'permAdminTeam' as const,
      'permAdminBilling' as const,
      'permAdminSettings' as const,
    ],
  },
  {
    roleKey: 'roleMember' as const,
    icon: Shield,
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    permissionKeys: [
      'permMemberContracts' as const,
      'permMemberRenegotiation' as const,
      'permMemberReports' as const,
      'permMemberUpload' as const,
    ],
  },
  {
    roleKey: 'roleViewer' as const,
    icon: Eye,
    color: 'text-slate-500',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    permissionKeys: [
      'permViewerReadOnly' as const,
      'permViewerReports' as const,
      'permViewerNoCreate' as const,
      'permViewerNoManage' as const,
    ],
  },
]

/* =================================================================
   COMPONENTE PRINCIPAL
   ================================================================= */

/**
 * Componente de gerenciamento de equipe do dashboard.
 *
 * Permite visualizar membros, convidar novos integrantes,
 * alterar papéis e entender as permissões de cada nível de acesso.
 *
 * Funcionalidades:
 * - Cards de estatísticas (membros ativos, convites pendentes, admins)
 * - Lista completa de membros com avatar, papel e métricas
 * - Modal de convite com seleção de papel
 * - Seção explicativa de permissões por papel
 * - Animações de entrada staggered e hover lift
 */
export function TeamManagement() {
  const t = useTranslations('dashboard')

  /* ---------------------------------------------------------------
     ESTADO LOCAL
     Controla a lista de membros, modal de convite e formulário.
     --------------------------------------------------------------- */

  /** Lista de membros da equipe (mutável para simulação de convites) */
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS)

  /** Controla a visibilidade do modal de convite */
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  /** E-mail digitado no formulário de convite */
  const [inviteEmail, setInviteEmail] = useState('')

  /** Papel selecionado para o novo convite */
  const [inviteRole, setInviteRole] = useState<MemberRole>('member')

  /* ---------------------------------------------------------------
     DADOS DERIVADOS
     Métricas calculadas a partir da lista atual de membros.
     --------------------------------------------------------------- */

  /** Total de membros aceitos (exclui pendentes) */
  const activeMembers = members.filter((m) => m.status === 'accepted').length

  /** Total de convites pendentes */
  const pendingInvites = members.filter((m) => m.status === 'pending').length

  /** Total de administradores */
  const adminCount = members.filter(
    (m) => m.role === 'admin' && m.status === 'accepted'
  ).length

  /* ---------------------------------------------------------------
     HANDLERS
     Funções para ações do usuário — convite, reenvio, etc.
     --------------------------------------------------------------- */

  /**
   * Envia um convite para o e-mail digitado.
   * Adiciona um novo membro pendente à lista local.
   * TODO: Integrar com API de convites do backend.
   */
  function handleSendInvite() {
    /** Validação básica do e-mail */
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) return

    /** Verifica se o e-mail já está na lista */
    const alreadyExists = members.some(
      (m) => m.email.toLowerCase() === inviteEmail.trim().toLowerCase()
    )
    if (alreadyExists) return

    /** Cria o novo membro pendente */
    const newMember: TeamMember = {
      id: `m${Date.now()}`,
      name: inviteEmail.split('@')[0] || 'New Member',
      email: inviteEmail.trim().toLowerCase(),
      role: inviteRole,
      avatar: getInitialsFromEmail(inviteEmail),
      joinedDate: '',
      lastActive: '',
      contractsViewed: 0,
      status: 'pending',
    }

    /** Adiciona à lista e limpa o formulário */
    setMembers((prev) => [...prev, newMember])
    setInviteEmail('')
    setInviteRole('member')
    setIsInviteModalOpen(false)
  }

  /**
   * Simula o reenvio de um convite pendente.
   * TODO: Integrar com API de reenvio do backend.
   */
  function handleResendInvite(memberId: string) {
    /** Em produção, dispararia um e-mail de convite novamente */
  }

  /**
   * Remove um membro da equipe.
   * TODO: Integrar com API de remoção do backend.
   */
  function handleRemoveMember(memberId: string) {
    setMembers((prev) => prev.filter((m) => m.id !== memberId))
  }

  /**
   * Altera o papel de um membro existente.
   * TODO: Integrar com API de atualização do backend.
   */
  function handleChangeRole(memberId: string, newRole: MemberRole) {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    )
  }

  /* ---------------------------------------------------------------
     RENDERIZAÇÃO
     --------------------------------------------------------------- */

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ============================================================
          CABEÇALHO — Título da página e botão de convite
          ============================================================ */}
      <motion.div
        className="flex items-center justify-between"
        variants={cardVariants}
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('team')}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('teamSubtitle')}
          </p>
        </div>
        <Button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2"
        >
          <UserPlus className="h-4 w-4" />
          {t('teamInviteMember')}
        </Button>
      </motion.div>

      {/* ============================================================
          STAT CARDS — 3 métricas resumidas da equipe
          ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card: Membros ativos / total de assentos */}
        <motion.div
          variants={cardVariants}
          className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.08)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-teal-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">
              {t('teamActiveMembers')}
            </span>
          </div>
          <div className="flex items-end gap-1.5">
            <span className="text-2xl font-bold text-slate-900">
              {activeMembers}
            </span>
            <span className="text-sm text-slate-400 mb-0.5">
              / {t('teamSeats', { count: MOCK_TEAM_STATS.maxSeats })}
            </span>
          </div>
          {/* Barra de ocupação dos assentos */}
          <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{
                width: `${(activeMembers / MOCK_TEAM_STATS.maxSeats) * 100}%`,
              }}
            />
          </div>
        </motion.div>

        {/* Card: Convites pendentes */}
        <motion.div
          variants={cardVariants}
          className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.08)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Mail className="h-5 w-5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">
              {t('teamPendingInvites')}
            </span>
          </div>
          <span className="text-2xl font-bold text-slate-900">
            {pendingInvites}
          </span>
        </motion.div>

        {/* Card: Quantidade de administradores */}
        <motion.div
          variants={cardVariants}
          className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.08)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Crown className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">
              {t('teamAdminUsers')}
            </span>
          </div>
          <span className="text-2xl font-bold text-slate-900">
            {adminCount}
          </span>
        </motion.div>
      </div>

      {/* ============================================================
          LISTA DE MEMBROS — Cards individuais com ações
          ============================================================ */}
      <motion.div variants={sectionVariants} className="space-y-3">
        {members.map((member, index) => {
          /** Cores do avatar baseadas no papel */
          const avatarColors = getAvatarColors(member.role)
          /** Ícone do papel para exibição no badge */
          const RoleIcon = getRoleIcon(member.role)
          /** Estilo do badge de papel */
          const roleBadgeStyle = getRoleBadgeStyles(member.role)
          /** Verifica se o membro está com convite pendente */
          const isPending = member.status === 'pending'

          return (
            <motion.div
              key={member.id}
              variants={memberCardVariants}
              custom={index}
              className={cn(
                'rounded-2xl bg-white border border-slate-200 p-5 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]',
                'hover:shadow-[5px_5px_0px_rgba(0,0,0,0.08)] hover:-translate-x-0.5 hover:-translate-y-0.5',
                'transition-all duration-200'
              )}
            >
              <div className="flex items-center gap-4">
                {/* ---- Avatar circular com iniciais ---- */}
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center shrink-0',
                    'text-sm font-semibold',
                    avatarColors.bg,
                    avatarColors.text
                  )}
                >
                  {member.avatar}
                </div>

                {/* ---- Informações do membro ---- */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Nome do membro */}
                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                      {member.name}
                    </h3>

                    {/* Badge do papel com ícone */}
                    <Badge
                      className={cn(
                        'text-[10px] font-medium border gap-1',
                        roleBadgeStyle
                      )}
                    >
                      <RoleIcon className="h-2.5 w-2.5" />
                      {member.role.charAt(0).toUpperCase() +
                        member.role.slice(1)}
                    </Badge>

                    {/* Badge de pendente (se aplicável) */}
                    {isPending && (
                      <Badge className="text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="h-2.5 w-2.5 mr-0.5" />
                        {t('teamStatusPending')}
                      </Badge>
                    )}
                  </div>

                  {/* E-mail do membro */}
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {member.email}
                  </p>

                  {/* Metadados: data de entrada, última atividade, contratos */}
                  {!isPending && (
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {/* Data de entrada */}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t('teamJoined', { date: formatJoinDate(member.joinedDate) })}
                      </span>

                      {/* Última atividade */}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {t('teamActive', { time: getRelativeTime(member.lastActive, t) })}
                      </span>

                      {/* Contratos visualizados */}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {t('teamContractsViewed', { count: member.contractsViewed })}
                      </span>
                    </div>
                  )}
                </div>

                {/* ---- Ações do membro ---- */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Botão de reenviar convite (apenas para pendentes) */}
                  {isPending && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResendInvite(member.id)}
                      className="rounded-xl text-xs gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                    >
                      <RefreshCw className="h-3 w-3" />
                      {t('teamResend')}
                    </Button>
                  )}

                  {/* Menu dropdown de ações */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-slate-600"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 rounded-xl"
                    >
                      {/* Sub-menu de alteração de papel */}
                      <DropdownMenuItem
                        onClick={() => handleChangeRole(member.id, 'admin')}
                        disabled={member.role === 'admin'}
                        className="gap-2 text-xs"
                      >
                        <Crown className="h-3.5 w-3.5 text-teal-600" />
                        {t('teamMakeAdmin')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleChangeRole(member.id, 'member')}
                        disabled={member.role === 'member'}
                        className="gap-2 text-xs"
                      >
                        <Shield className="h-3.5 w-3.5 text-sky-600" />
                        {t('teamMakeMember')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleChangeRole(member.id, 'viewer')}
                        disabled={member.role === 'viewer'}
                        className="gap-2 text-xs"
                      >
                        <Eye className="h-3.5 w-3.5 text-slate-500" />
                        {t('teamMakeViewer')}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {/* Remover membro */}
                      <DropdownMenuItem
                        onClick={() => handleRemoveMember(member.id)}
                        variant="destructive"
                        className="gap-2 text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t('teamRemoveMember')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* ============================================================
          SEÇÃO DE PERMISSÕES POR PAPEL
          Explica o que cada nível de acesso pode fazer.
          ============================================================ */}
      <motion.div variants={sectionVariants}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {t('teamRolePermissions')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROLE_DESCRIPTIONS.map((roleDesc) => {
            const Icon = roleDesc.icon
            return (
              <motion.div
                key={roleDesc.roleKey}
                variants={cardVariants}
                className={cn(
                  'rounded-2xl bg-white border p-5',
                  'shadow-[3px_3px_0px_rgba(0,0,0,0.06)]',
                  roleDesc.borderColor
                )}
              >
                {/* Cabeçalho do papel */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      roleDesc.bgColor
                    )}
                  >
                    <Icon className={cn('h-5 w-5', roleDesc.color)} />
                  </div>
                  <h3 className="font-semibold text-slate-900">
                    {t(roleDesc.roleKey)}
                  </h3>
                </div>

                {/* Lista de permissões */}
                <ul className="space-y-2">
                  {roleDesc.permissionKeys.map((permKey) => (
                    <li
                      key={permKey}
                      className="flex items-start gap-2 text-xs text-slate-600"
                    >
                      <div
                        className={cn(
                          'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                          roleDesc.roleKey === 'roleAdmin'
                            ? 'bg-teal-400'
                            : roleDesc.roleKey === 'roleMember'
                              ? 'bg-sky-400'
                              : 'bg-slate-300'
                        )}
                      />
                      {t(permKey)}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* ============================================================
          MODAL DE CONVITE
          Formulário para enviar convite a um novo membro.
          Usa AnimatePresence para transição suave de entrada/saída.
          ============================================================ */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Overlay escuro — fecha o modal ao clicar */}
            <motion.div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsInviteModalOpen(false)}
            />

            {/* Conteúdo do modal */}
            <motion.div
              className="relative w-full max-w-md mx-4 rounded-2xl bg-white border border-slate-200 p-6 shadow-[6px_6px_0px_rgba(0,0,0,0.08)]"
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Cabeçalho do modal */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {t('teamInviteTitle')}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('teamInviteSubtitle')}
                    </p>
                  </div>
                </div>

                {/* Botão de fechar */}
                <button
                  onClick={() => setIsInviteModalOpen(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Campo de e-mail */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">
                    {t('teamEmailAddress')}
                  </label>
                  <Input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => {
                      /** Permite enviar com Enter */
                      if (e.key === 'Enter') handleSendInvite()
                    }}
                    className="rounded-xl"
                  />
                </div>

                {/* Seletor de papel */}
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">
                    {t('teamRole')}
                  </label>
                  <Select
                    value={inviteRole}
                    onValueChange={(value: string) =>
                      setInviteRole(value as MemberRole)
                    }
                  >
                    <SelectTrigger className="w-full rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Crown className="h-3.5 w-3.5 text-teal-600" />
                          <span>{t('roleAdmin')}</span>
                          <span className="text-[10px] text-slate-400">
                            — {t('roleAdminDesc')}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="member">
                        <div className="flex items-center gap-2">
                          <Shield className="h-3.5 w-3.5 text-sky-600" />
                          <span>{t('roleMember')}</span>
                          <span className="text-[10px] text-slate-400">
                            — {t('roleMemberDesc')}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="viewer">
                        <div className="flex items-center gap-2">
                          <Eye className="h-3.5 w-3.5 text-slate-500" />
                          <span>{t('roleViewer')}</span>
                          <span className="text-[10px] text-slate-400">
                            — {t('roleViewerDesc')}
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex items-center gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 rounded-xl"
                >
                  {t('teamCancel')}
                </Button>
                <Button
                  onClick={handleSendInvite}
                  disabled={!inviteEmail.trim() || !inviteEmail.includes('@')}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] gap-2"
                >
                  <Mail className="h-4 w-4" />
                  {t('teamSendInvite')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
