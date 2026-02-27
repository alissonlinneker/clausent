'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  ArrowRight,
  Tag,
  Search,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

/**
 * Definição de tipo para um post do blog.
 * Contém todas as informações necessárias para exibição
 * no card da listagem e na página do post individual.
 */
interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: string
  categories: string[]
  gradient: string
  featured?: boolean
}

/**
 * Lista de posts mock do blog.
 * Em produção, esses dados viriam de um CMS ou banco de dados.
 * O primeiro post é destacado como featured (layout horizontal).
 */
const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-ai-is-transforming-contract-management',
    title: 'How AI is Transforming Contract Management',
    excerpt:
      'Discover how artificial intelligence is revolutionizing the way businesses handle contracts, from automated extraction to predictive risk analysis.',
    date: 'Feb 20, 2026',
    readTime: '5 min read',
    categories: ['AI', 'Contracts'],
    gradient: 'from-teal-400 via-emerald-500 to-teal-600',
    featured: true,
  },
  {
    slug: '5-hidden-costs-in-your-saas-contracts',
    title: '5 Hidden Costs in Your SaaS Contracts',
    excerpt:
      'Most companies are overpaying for SaaS tools without realizing it. Learn the five most common cost traps lurking in your contracts.',
    date: 'Feb 15, 2026',
    readTime: '7 min read',
    categories: ['SaaS', 'Savings'],
    gradient: 'from-violet-400 via-purple-500 to-violet-600',
  },
  {
    slug: 'complete-guide-to-contract-risk-scoring',
    title: 'The Complete Guide to Contract Risk Scoring',
    excerpt:
      'Risk scoring turns complex legal language into actionable insights. Here\'s everything you need to know about how it works.',
    date: 'Feb 10, 2026',
    readTime: '10 min read',
    categories: ['Risk', 'Guide'],
    gradient: 'from-amber-400 via-orange-500 to-amber-600',
  },
  {
    slug: 'auto-renewal-traps-what-every-smb-should-know',
    title: 'Auto-Renewal Traps: What Every SMB Should Know',
    excerpt:
      'Auto-renewal clauses can lock your business into costly agreements. Learn how to identify and manage them effectively.',
    date: 'Feb 5, 2026',
    readTime: '4 min read',
    categories: ['Renewals'],
    gradient: 'from-rose-400 via-pink-500 to-rose-600',
  },
  {
    slug: 'market-benchmarks-are-you-overpaying',
    title: 'Market Benchmarks: Are You Overpaying?',
    excerpt:
      'Compare your contract costs against industry benchmarks to find out if you\'re paying fair market rates for your services.',
    date: 'Jan 28, 2026',
    readTime: '6 min read',
    categories: ['Benchmarks'],
    gradient: 'from-sky-400 via-blue-500 to-sky-600',
  },
  {
    slug: 'clausent-vs-manual-contract-review',
    title: 'Clausent vs Manual Contract Review: A Comparison',
    excerpt:
      'We compared traditional manual contract review against Clausent\'s AI-powered approach. The results speak for themselves.',
    date: 'Jan 20, 2026',
    readTime: '8 min read',
    categories: ['Product'],
    gradient: 'from-emerald-400 via-teal-500 to-emerald-600',
  },
]

/**
 * Categorias únicas extraídas de todos os posts.
 * Adicionamos "All" como primeira opção para exibir todos.
 */
const ALL_CATEGORIES = [
  'All',
  ...Array.from(new Set(BLOG_POSTS.flatMap((post) => post.categories))),
]

/**
 * Variantes de animação para o container com efeito stagger.
 * Cada card filho aparece com atraso incremental.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
}

/** Variante individual para cada card do blog */
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      damping: 22,
      stiffness: 100,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
}

/** Variante de fade-in com slide para cima */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
}

/**
 * BlogList — listagem completa dos posts do blog.
 *
 * Funcionalidades:
 * - Filtro por categoria via pills clicáveis
 * - Post featured (primeiro) com layout horizontal expandido
 * - Cards regulares em grid 2 colunas (desktop) / 1 coluna (mobile)
 * - Thumbnail gradiente placeholder com formas abstratas
 * - Animações de entrada stagger + transição de filtro
 *
 * Design: Light Neobrutalism com fundo #FFFDF5, cards bg-white,
 * bordas slate-200, sombras 3px 3px, cantos arredondados 2xl.
 */
export function BlogList() {
  /** Traduções do namespace blog */
  const t = useTranslations('blog')

  /** Categoria selecionada para filtro — 'All' exibe todos */
  const [activeCategory, setActiveCategory] = useState('All')

  /** Posts filtrados pela categoria ativa */
  const filteredPosts =
    activeCategory === 'All'
      ? BLOG_POSTS
      : BLOG_POSTS.filter((post) => post.categories.includes(activeCategory))

  /** Separação: primeiro post filtrado como featured, restante como regulares */
  const featuredPost = filteredPosts[0]
  const regularPosts = filteredPosts.slice(1)

  return (
    <div className="bg-[#FFFDF5] min-h-screen">
      {/* Decoração de fundo — gradientes sutis */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100/40 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-100/20 rounded-full blur-[100px] translate-y-1/2" />

      {/* ===== HERO DO BLOG ===== */}
      <section className="relative pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge da seção */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <span className="inline-flex items-center rounded-full bg-teal-50 border border-teal-100 px-4 py-1.5 text-sm font-medium text-teal-600 mb-4">
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              Insights & Resources
            </span>
          </motion.div>

          {/* Título da página */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight"
          >
            Clausent{' '}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Blog
            </span>
          </motion.h1>

          {/* Subtítulo descritivo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            Tips, guides, and insights on contract intelligence, SaaS cost
            optimization, and building smarter business operations.
          </motion.p>

          {/* Barra de busca decorativa (mock) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 max-w-md mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300 transition-all"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FILTROS DE CATEGORIA ===== */}
      <section className="relative pb-8">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center gap-2 justify-center"
          >
            {ALL_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
                  activeCategory === category
                    ? 'bg-teal-600 text-white border-teal-600 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600 shadow-[2px_2px_0px_rgba(0,0,0,0.04)]'
                )}
              >
                {category}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== LISTAGEM DE POSTS ===== */}
      <section className="relative pb-24 sm:pb-32">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Post featured — layout horizontal (desktop) */}
              {featuredPost && (
                <motion.div variants={cardVariants} className="mb-8">
                  <Link href={`/blog/${featuredPost.slug}`}>
                    <div className="group relative rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.08)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
                      <div className="flex flex-col lg:flex-row">
                        {/* Thumbnail gradiente — lado esquerdo */}
                        <div className="relative lg:w-1/2 h-56 lg:h-auto min-h-[280px]">
                          <div
                            className={cn(
                              'absolute inset-0 bg-gradient-to-br',
                              featuredPost.gradient
                            )}
                          >
                            {/* Formas abstratas decorativas */}
                            <div className="absolute top-8 left-8 w-20 h-20 rounded-full bg-white/10 blur-sm" />
                            <div className="absolute bottom-12 right-12 w-32 h-32 rounded-2xl bg-white/10 rotate-12 blur-sm" />
                            <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-xl bg-white/15 -rotate-6" />
                            <div className="absolute bottom-8 left-16 w-12 h-12 rounded-full bg-white/10" />
                            <div className="absolute top-12 right-24 w-24 h-2 rounded-full bg-white/20" />
                          </div>

                          {/* Badge "Featured" */}
                          <div className="absolute top-4 left-4 z-10">
                            <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-teal-700 shadow-sm">
                              Featured
                            </span>
                          </div>
                        </div>

                        {/* Conteúdo textual — lado direito */}
                        <div className="lg:w-1/2 p-8 lg:p-10 flex flex-col justify-center">
                          {/* Categorias do post */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {featuredPost.categories.map((cat) => (
                              <span
                                key={cat}
                                className="inline-flex items-center rounded-full bg-teal-50 border border-teal-100 px-3 py-0.5 text-xs font-medium text-teal-600"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {cat}
                              </span>
                            ))}
                          </div>

                          {/* Título do post */}
                          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 group-hover:text-teal-700 transition-colors">
                            {featuredPost.title}
                          </h2>

                          {/* Trecho do post */}
                          <p className="text-slate-500 leading-relaxed mb-6 line-clamp-3">
                            {featuredPost.excerpt}
                          </p>

                          {/* Metadados: data e tempo de leitura */}
                          <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {featuredPost.date}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {featuredPost.readTime}
                            </span>
                          </div>

                          {/* Link de leitura */}
                          <div className="inline-flex items-center gap-1.5 text-teal-600 font-medium text-sm group-hover:gap-3 transition-all">
                            Read More
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Grid de posts regulares */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts.map((post) => (
                  <motion.div key={post.slug} variants={cardVariants}>
                    <Link href={`/blog/${post.slug}`}>
                      <div className="group relative h-full rounded-2xl bg-white border border-slate-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.08)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
                        {/* Thumbnail gradiente */}
                        <div className="relative h-48">
                          <div
                            className={cn(
                              'absolute inset-0 bg-gradient-to-br',
                              post.gradient
                            )}
                          >
                            {/* Formas abstratas decorativas */}
                            <div className="absolute top-6 left-6 w-14 h-14 rounded-full bg-white/10 blur-sm" />
                            <div className="absolute bottom-6 right-6 w-20 h-20 rounded-2xl bg-white/10 rotate-12 blur-sm" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-white/15 -rotate-6" />
                          </div>
                        </div>

                        {/* Conteúdo textual do card */}
                        <div className="p-6">
                          {/* Categorias */}
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {post.categories.map((cat) => (
                              <span
                                key={cat}
                                className="inline-flex items-center rounded-full bg-teal-50 border border-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-600"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>

                          {/* Título */}
                          <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors line-clamp-2">
                            {post.title}
                          </h3>

                          {/* Trecho */}
                          <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>

                          {/* Metadados e link */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {post.date}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {post.readTime}
                              </span>
                            </div>
                            <span className="inline-flex items-center gap-1 text-teal-600 text-xs font-medium group-hover:gap-2 transition-all">
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

              {/* Mensagem quando nenhum post encontrado */}
              {filteredPosts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <p className="text-slate-400 text-lg">
                    No posts found in this category.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
