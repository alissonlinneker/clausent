'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Mail, Headphones } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

/**
 * Tipagem dos campos do formulário de contato.
 * Utilizada pelo react-hook-form para validação e tipagem.
 */
interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
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
 * Variantes com stagger para os cards laterais.
 * Cria o efeito de aparição sequencial entre os cards.
 */
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
}

/** Variante para cada card lateral (fade in + slide up) */
const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
}

/**
 * ContactContent — conteúdo completo da página de Contato.
 *
 * Layout em duas colunas (desktop):
 * - Coluna esquerda: formulário de contato completo
 * - Coluna direita: cards de informação (Sales e Support)
 *
 * Design: Light Neobrutalism com fundo #FFFDF5, cards bg-white,
 * bordas slate-200, sombras 3px 3px, cantos 2xl.
 *
 * O formulário usa react-hook-form para gerenciamento de estado
 * e validação nativa do HTML (required). Não possui lógica de
 * backend ainda — apenas a interface visual.
 */
export function ContactContent() {
  /** Hook de traduções do namespace 'contact' */
  const t = useTranslations('contact')

  /** Estado para controlar exibição da mensagem de sucesso */
  const [submitted, setSubmitted] = useState(false)

  /** Configuração do react-hook-form */
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>()

  /**
   * Handler de submit do formulário.
   * Por enquanto apenas simula o envio e exibe a mensagem de sucesso.
   * A integração com backend será feita futuramente.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = (_data: ContactFormData) => {
    setSubmitted(true)
    reset()
  }

  return (
    <div className="bg-[#FFFDF5] min-h-screen">
      {/* Decoração de fundo — gradientes sutis */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100/40 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-100/20 rounded-full blur-[100px] translate-y-1/2" />

      <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Cabeçalho da página */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center mb-12 sm:mb-16"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
              {t('title')}
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-xl mx-auto">
              {t('subtitle')}
            </p>
          </motion.div>

          {/* Layout em duas colunas — formulário + cards informativos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* ===== COLUNA ESQUERDA: FORMULÁRIO ===== */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' as const, delay: 0.15 }}
              className="lg:col-span-2"
            >
              <div className="rounded-2xl bg-white border border-[#e2e8f0] p-8 sm:p-10 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
                {/* Mensagem de sucesso após envio */}
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 text-teal-600 mb-6">
                      <Send className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {t('successTitle')}
                    </h3>
                    <p className="text-slate-600">
                      {t('successDescription')}
                    </p>
                    {/* Botão para enviar outra mensagem */}
                    <Button
                      onClick={() => setSubmitted(false)}
                      variant="outline"
                      className="mt-6 rounded-xl border-[#e2e8f0] shadow-[2px_2px_0px_rgba(0,0,0,0.06)] hover:shadow-[3px_3px_0px_rgba(0,0,0,0.08)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      {t('send')}
                    </Button>
                  </motion.div>
                ) : (
                  /* Formulário de contato */
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Linha dupla: nome e e-mail */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Campo: Nome */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-700 font-medium">
                          {t('nameLabel')}
                        </Label>
                        <Input
                          id="name"
                          placeholder={t('namePlaceholder')}
                          aria-required="true"
                          aria-invalid={errors.name ? 'true' : undefined}
                          aria-describedby={errors.name ? 'name-error' : undefined}
                          className="rounded-xl border-[#e2e8f0] shadow-[2px_2px_0px_rgba(0,0,0,0.04)] focus:shadow-[3px_3px_0px_rgba(0,0,0,0.06)] focus:border-teal-300 transition-all duration-200"
                          {...register('name', { required: true })}
                        />
                        {errors.name && (
                          <p id="name-error" role="alert" className="text-xs text-red-500">{t('nameLabel')} is required</p>
                        )}
                      </div>

                      {/* Campo: E-mail */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700 font-medium">
                          {t('emailLabel')}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder={t('emailPlaceholder')}
                          aria-required="true"
                          aria-invalid={errors.email ? 'true' : undefined}
                          aria-describedby={errors.email ? 'email-error' : undefined}
                          className="rounded-xl border-[#e2e8f0] shadow-[2px_2px_0px_rgba(0,0,0,0.04)] focus:shadow-[3px_3px_0px_rgba(0,0,0,0.06)] focus:border-teal-300 transition-all duration-200"
                          {...register('email', { required: true })}
                        />
                        {errors.email && (
                          <p id="email-error" role="alert" className="text-xs text-red-500">{t('emailLabel')} is required</p>
                        )}
                      </div>
                    </div>

                    {/* Campo: Assunto */}
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-slate-700 font-medium">
                        {t('subjectLabel')}
                      </Label>
                      <Input
                        id="subject"
                        placeholder={t('subjectPlaceholder')}
                        aria-required="true"
                        aria-invalid={errors.subject ? 'true' : undefined}
                        aria-describedby={errors.subject ? 'subject-error' : undefined}
                        className="rounded-xl border-[#e2e8f0] shadow-[2px_2px_0px_rgba(0,0,0,0.04)] focus:shadow-[3px_3px_0px_rgba(0,0,0,0.06)] focus:border-teal-300 transition-all duration-200"
                        {...register('subject', { required: true })}
                      />
                      {errors.subject && (
                        <p id="subject-error" role="alert" className="text-xs text-red-500">{t('subjectLabel')} is required</p>
                      )}
                    </div>

                    {/* Campo: Mensagem */}
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-slate-700 font-medium">
                        {t('messageLabel')}
                      </Label>
                      <Textarea
                        id="message"
                        rows={5}
                        placeholder={t('messagePlaceholder')}
                        aria-required="true"
                        aria-invalid={errors.message ? 'true' : undefined}
                        aria-describedby={errors.message ? 'message-error' : undefined}
                        className="rounded-xl border-[#e2e8f0] shadow-[2px_2px_0px_rgba(0,0,0,0.04)] focus:shadow-[3px_3px_0px_rgba(0,0,0,0.06)] focus:border-teal-300 transition-all duration-200 resize-none"
                        {...register('message', { required: true })}
                      />
                      {errors.message && (
                        <p id="message-error" role="alert" className="text-xs text-red-500">{t('messageLabel')} is required</p>
                      )}
                    </div>

                    {/* Botão de envio */}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full sm:w-auto bg-teal-600 hover:bg-teal-500 text-white rounded-xl px-8 h-11 text-base font-semibold shadow-[3px_3px_0px_rgba(0,0,0,0.1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.12)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {t('send')}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* ===== COLUNA DIREITA: CARDS DE INFORMAÇÃO ===== */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Card de Vendas */}
              <motion.div variants={cardVariant}>
                <div className="group rounded-2xl bg-white border border-[#e2e8f0] p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.08)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300">
                  {/* Gradiente de hover sutil */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-50/50 to-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div className="relative">
                    {/* Ícone de vendas */}
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-teal-50 text-teal-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Mail className="h-5 w-5" strokeWidth={1.8} />
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 mb-1">
                      {t('salesTitle')}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                      {t('salesDescription')}
                    </p>
                    <a
                      href={`mailto:${t('salesEmail')}`}
                      className="text-sm font-medium text-teal-600 hover:text-teal-500 transition-colors"
                    >
                      {t('salesEmail')}
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* Card de Suporte */}
              <motion.div variants={cardVariant}>
                <div className="group rounded-2xl bg-white border border-[#e2e8f0] p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.08)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300">
                  {/* Gradiente de hover sutil */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div className="relative">
                    {/* Ícone de suporte */}
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Headphones className="h-5 w-5" strokeWidth={1.8} />
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 mb-1">
                      {t('supportTitle')}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                      {t('supportDescription')}
                    </p>
                    <a
                      href={`mailto:${t('supportEmail')}`}
                      className="text-sm font-medium text-teal-600 hover:text-teal-500 transition-colors"
                    >
                      {t('supportEmail')}
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
