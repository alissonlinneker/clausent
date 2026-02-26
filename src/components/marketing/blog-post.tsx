'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Twitter,
  Linkedin,
  Link2,
  ChevronUp,
  Tag,
  ArrowRight,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'

/**
 * Seções do Table of Contents (sumário lateral).
 * Cada seção possui id (âncora) e título exibido no sidebar.
 */
const TABLE_OF_CONTENTS = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'why-ai-matters', title: 'Why AI Matters for Contracts' },
  { id: 'key-capabilities', title: 'Key Capabilities' },
  { id: 'implementation', title: 'Implementation Guide' },
  { id: 'results', title: 'Real-World Results' },
  { id: 'conclusion', title: 'Conclusion' },
]

/**
 * Posts relacionados exibidos ao final do artigo.
 * Dados mock que normalmente viriam de uma query ao CMS.
 */
const RELATED_POSTS = [
  {
    slug: '5-hidden-costs-in-your-saas-contracts',
    title: '5 Hidden Costs in Your SaaS Contracts',
    excerpt:
      'Most companies are overpaying for SaaS tools without realizing it.',
    date: 'Feb 15, 2026',
    readTime: '7 min read',
    gradient: 'from-violet-400 via-purple-500 to-violet-600',
  },
  {
    slug: 'complete-guide-to-contract-risk-scoring',
    title: 'The Complete Guide to Contract Risk Scoring',
    excerpt:
      'Risk scoring turns complex legal language into actionable insights.',
    date: 'Feb 10, 2026',
    readTime: '10 min read',
    gradient: 'from-amber-400 via-orange-500 to-amber-600',
  },
  {
    slug: 'auto-renewal-traps-what-every-smb-should-know',
    title: 'Auto-Renewal Traps: What Every SMB Should Know',
    excerpt:
      'Auto-renewal clauses can lock your business into costly agreements.',
    date: 'Feb 5, 2026',
    readTime: '4 min read',
    gradient: 'from-rose-400 via-pink-500 to-rose-600',
  },
]

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
 * BlogPost — layout completo de um artigo do blog.
 *
 * Estrutura:
 * 1. Header — link voltar, título, metadados (data, autor, tempo de leitura)
 * 2. Conteúdo — artigo com headers, parágrafos, citação, imagem, código
 * 3. Sidebar — Table of Contents sticky (desktop)
 * 4. Related Posts — 3 cards horizontais
 * 5. Newsletter CTA — formulário de inscrição
 *
 * Design: Light Neobrutalism com fundo #FFFDF5, cards bg-white,
 * bordas slate-200, sombras 3px 3px, cantos arredondados 2xl.
 */
export function BlogPost() {
  /** Seção ativa no Table of Contents (tracking via scroll) */
  const [activeSection, setActiveSection] = useState('introduction')
  /** Controle de visibilidade do botão "voltar ao topo" */
  const [showScrollTop, setShowScrollTop] = useState(false)

  /**
   * Observer de interseção para destacar a seção ativa no sumário.
   * Monitora cada heading com id correspondente ao ToC.
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    )

    TABLE_OF_CONTENTS.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  /**
   * Listener de scroll para mostrar/ocultar o botão "voltar ao topo".
   * Aparece após 400px de rolagem vertical.
   */
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="bg-[#FFFDF5] min-h-screen">
      {/* Decoração de fundo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100/40 rounded-full blur-[120px] -translate-y-1/2" />

      {/* ===== HEADER DO ARTIGO ===== */}
      <section className="relative pt-32 pb-8 sm:pt-40 sm:pb-12">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Link para voltar ao blog */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="mb-8"
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Blog
            </Link>
          </motion.div>

          {/* Categorias do post */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="flex flex-wrap gap-2 mb-4"
          >
            {['AI', 'Contracts'].map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center rounded-full bg-teal-50 border border-teal-100 px-3 py-0.5 text-xs font-medium text-teal-600"
              >
                <Tag className="h-3 w-3 mr-1" />
                {cat}
              </span>
            ))}
          </motion.div>

          {/* Título do artigo */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight"
          >
            How AI is Transforming Contract Management
          </motion.h1>

          {/* Metadados do artigo: autor, data, tempo de leitura */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 flex flex-wrap items-center gap-4"
          >
            {/* Avatar e nome do autor */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-semibold text-sm">
                SC
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Sarah Chen
                </p>
                <p className="text-xs text-slate-400">Head of Content</p>
              </div>
            </div>

            {/* Separador */}
            <div className="hidden sm:block w-px h-8 bg-slate-200" />

            {/* Data e tempo de leitura */}
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Feb 20, 2026
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                5 min read
              </span>
            </div>

            {/* Separador */}
            <div className="hidden sm:block w-px h-8 bg-slate-200" />

            {/* Botões de compartilhamento */}
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <Twitter className="h-4 w-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <Linkedin className="h-4 w-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <Link2 className="h-4 w-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CORPO DO ARTIGO + SIDEBAR ===== */}
      <section className="relative pb-16">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-12">
            {/* Conteúdo principal do artigo */}
            <motion.article
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex-1 max-w-4xl"
            >
              {/* Imagem de capa placeholder */}
              <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden mb-10 border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 via-emerald-500 to-teal-600">
                  <div className="absolute top-12 left-12 w-24 h-24 rounded-full bg-white/10 blur-sm" />
                  <div className="absolute bottom-16 right-16 w-36 h-36 rounded-2xl bg-white/10 rotate-12 blur-sm" />
                  <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-xl bg-white/15 -rotate-6" />
                  <div className="absolute bottom-10 left-20 w-16 h-16 rounded-full bg-white/10" />
                </div>
              </div>

              {/* ===== CONTEÚDO DO ARTIGO ===== */}
              <div className="prose prose-slate prose-lg max-w-none">
                {/* Introdução */}
                <h2
                  id="introduction"
                  className="text-2xl font-bold text-slate-900 mb-4 scroll-mt-24"
                >
                  Introduction
                </h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Contract management has long been one of the most tedious and
                  error-prone aspects of running a business. From tracking
                  renewal dates to identifying risky clauses, the manual
                  approach simply doesn&apos;t scale. But artificial
                  intelligence is changing everything.
                </p>
                <p className="text-slate-600 leading-relaxed mb-8">
                  In this article, we&apos;ll explore how AI-powered contract
                  intelligence platforms like Clausent are helping SMBs save
                  thousands of dollars annually while reducing legal risk
                  exposure by up to 73%.
                </p>

                {/* Seção: Por que IA importa */}
                <h2
                  id="why-ai-matters"
                  className="text-2xl font-bold text-slate-900 mb-4 scroll-mt-24"
                >
                  Why AI Matters for Contracts
                </h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  The average mid-size company manages between 20,000 and
                  40,000 active contracts at any given time. Each one contains
                  critical information — pricing terms, renewal dates,
                  liability clauses, and compliance requirements — that
                  directly impacts the bottom line.
                </p>

                {/* Bloco de citação destacado */}
                <blockquote className="relative rounded-2xl bg-teal-50 border border-teal-100 p-6 sm:p-8 my-8 shadow-[3px_3px_0px_rgba(0,0,0,0.04)]">
                  <div className="absolute top-4 left-4 text-teal-300 text-4xl font-serif leading-none">
                    &ldquo;
                  </div>
                  <p className="text-teal-800 font-medium italic leading-relaxed pl-6">
                    Companies that adopt AI-driven contract management see an
                    average 40% reduction in contract cycle time and a 25%
                    decrease in overall contract-related costs.
                  </p>
                  <footer className="mt-4 pl-6 text-sm text-teal-600">
                    — Gartner Research, 2025 Contract Management Report
                  </footer>
                </blockquote>

                <p className="text-slate-600 leading-relaxed mb-8">
                  Traditional contract management relies heavily on manual
                  review, spreadsheet tracking, and calendar reminders. This
                  approach not only wastes hundreds of hours per quarter but
                  also creates significant blind spots where costly
                  auto-renewals and unfavorable terms slip through unnoticed.
                </p>

                {/* Seção: Capacidades-chave */}
                <h2
                  id="key-capabilities"
                  className="text-2xl font-bold text-slate-900 mb-4 scroll-mt-24"
                >
                  Key Capabilities
                </h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Modern AI contract platforms offer several transformative
                  capabilities that go far beyond simple document storage:
                </p>

                {/* Lista de capacidades */}
                <ul className="space-y-3 mb-8">
                  {[
                    'Automated clause extraction and categorization',
                    'Real-time risk scoring with contextual explanations',
                    'Market benchmark comparison for pricing terms',
                    'Intelligent renewal alerts with recommended actions',
                    'Natural language querying across your entire contract portfolio',
                    'Automated compliance checking against regulatory frameworks',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-teal-500 shrink-0" />
                      <span className="text-slate-600">{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Seção: Implementação com trecho de código */}
                <h2
                  id="implementation"
                  className="text-2xl font-bold text-slate-900 mb-4 scroll-mt-24"
                >
                  Implementation Guide
                </h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Getting started with AI contract analysis is simpler than
                  you might think. With Clausent&apos;s API, you can upload and
                  analyze contracts programmatically in just a few lines of
                  code:
                </p>

                {/* Bloco de código */}
                <div className="relative rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden my-8 shadow-[3px_3px_0px_rgba(0,0,0,0.15)]">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700 bg-slate-800">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400/60" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                      <div className="w-3 h-3 rounded-full bg-green-400/60" />
                    </div>
                    <span className="text-xs text-slate-400 ml-2 font-mono">
                      analysis.js
                    </span>
                  </div>
                  <pre className="p-5 text-sm text-slate-300 overflow-x-auto">
                    <code>{`const response = await fetch(
  'https://api.clausent.com/v1/contracts',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_url: 'https://example.com/contract.pdf',
      analysis_type: 'comprehensive',
    }),
  }
);

const analysis = await response.json();
console.log(analysis.risk_score);    // 67
console.log(analysis.savings);       // "$4,200"
console.log(analysis.clauses_found); // 12`}</code>
                  </pre>
                </div>

                {/* Imagem placeholder inline */}
                <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden my-8 border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-teal-50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-teal-100 border border-teal-200 flex items-center justify-center mx-auto mb-3">
                        <Share2 className="h-7 w-7 text-teal-500" />
                      </div>
                      <p className="text-sm text-slate-400">
                        Dashboard analysis overview
                      </p>
                    </div>
                  </div>
                </div>

                {/* Seção: Resultados */}
                <h2
                  id="results"
                  className="text-2xl font-bold text-slate-900 mb-4 scroll-mt-24"
                >
                  Real-World Results
                </h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Companies using Clausent have reported remarkable
                  improvements in their contract management workflows. Here
                  are some key metrics from our customer base:
                </p>

                {/* Cards de métricas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
                  {[
                    { value: '73%', label: 'Risk reduction' },
                    { value: '$4,200', label: 'Avg. savings per contract' },
                    { value: '85%', label: 'Faster review time' },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-2xl bg-white border border-slate-200 p-6 text-center shadow-[3px_3px_0px_rgba(0,0,0,0.06)]"
                    >
                      <p className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                        {metric.value}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Conclusão */}
                <h2
                  id="conclusion"
                  className="text-2xl font-bold text-slate-900 mb-4 scroll-mt-24"
                >
                  Conclusion
                </h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  AI-powered contract management isn&apos;t a future
                  possibility — it&apos;s happening right now. Companies that
                  embrace this technology are gaining significant competitive
                  advantages through reduced costs, minimized risk, and faster
                  decision-making.
                </p>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Whether you&apos;re managing 10 contracts or 10,000,
                  Clausent&apos;s AI engine adapts to your needs and delivers
                  actionable insights from day one. The question isn&apos;t
                  whether to adopt AI for contract management — it&apos;s how
                  soon you can get started.
                </p>
              </div>
            </motion.article>

            {/* ===== SIDEBAR — TABLE OF CONTENTS (desktop) ===== */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="hidden lg:block w-64 shrink-0"
            >
              <div className="sticky top-28">
                <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
                  <h4 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">
                    Table of Contents
                  </h4>
                  <nav className="space-y-1">
                    {TABLE_OF_CONTENTS.map((section) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className={cn(
                          'block text-sm py-1.5 px-3 rounded-lg transition-all duration-200',
                          activeSection === section.id
                            ? 'bg-teal-50 text-teal-700 font-medium border-l-2 border-teal-500'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        )}
                      >
                        {section.title}
                      </a>
                    ))}
                  </nav>
                </div>

                {/* Mini CTA no sidebar */}
                <div className="mt-6 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.04)]">
                  <p className="text-sm font-semibold text-slate-900 mb-2">
                    Try Clausent Free
                  </p>
                  <p className="text-xs text-slate-500 mb-4">
                    Start analyzing your contracts with AI today.
                  </p>
                  <Button
                    asChild
                    size="sm"
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                  >
                    <Link href="/sign-up">Get Started</Link>
                  </Button>
                </div>
              </div>
            </motion.aside>
          </div>
        </div>
      </section>

      {/* ===== POSTS RELACIONADOS ===== */}
      <section className="relative py-16 sm:py-20">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="mb-10"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Related Articles
            </h3>
            <p className="mt-2 text-slate-500">
              Continue reading about contract intelligence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {RELATED_POSTS.map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="group relative h-full rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.08)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
                    {/* Thumbnail gradiente */}
                    <div className="relative h-40">
                      <div
                        className={cn(
                          'absolute inset-0 bg-gradient-to-br',
                          post.gradient
                        )}
                      >
                        <div className="absolute top-6 left-6 w-12 h-12 rounded-full bg-white/10 blur-sm" />
                        <div className="absolute bottom-6 right-6 w-16 h-16 rounded-2xl bg-white/10 rotate-12 blur-sm" />
                      </div>
                    </div>

                    {/* Conteúdo do card */}
                    <div className="p-5">
                      <h4 className="text-base font-semibold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {post.date}
                        </span>
                        <span className="inline-flex items-center gap-1 text-teal-600 font-medium group-hover:gap-2 transition-all">
                          Read
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER CTA ===== */}
      <section className="relative py-16 sm:py-20 pb-24 sm:pb-32">
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 p-8 sm:p-12 shadow-[5px_5px_0px_rgba(0,0,0,0.1)] text-center"
          >
            {/* Ícone decorativo */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm mb-6">
              <Mail className="h-7 w-7 text-white" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Stay in the Loop
            </h3>
            <p className="text-teal-100 mb-8 max-w-lg mx-auto">
              Get the latest insights on contract intelligence, SaaS
              optimization, and AI-powered business tools delivered to your
              inbox weekly.
            </p>

            {/* Formulário de inscrição */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 px-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
              />
              <Button className="h-12 px-6 bg-white text-teal-700 hover:bg-white/90 rounded-xl font-semibold shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                Subscribe
              </Button>
            </div>

            <p className="mt-4 text-xs text-teal-200/60">
              No spam, ever. Unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Botão "voltar ao topo" — aparece após rolar */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-50 p-3 rounded-xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all text-slate-600 hover:text-teal-600"
          >
            <ChevronUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

