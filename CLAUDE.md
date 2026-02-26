# Clausent — AI Contract Intelligence Platform

## Sobre o Projeto
Clausent é uma plataforma SaaS de inteligência contratual (B2B + B2C) que usa IA para analisar contratos, identificar riscos, monitorar renovações, fornecer benchmarks de mercado e sugerir renegociações. Atende desde profissionais individuais até SMBs sem departamento jurídico.

## Stack Técnica
- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend (leve):** Next.js API Routes (Vercel Pro) — auth, Stripe webhooks, CRUD
- **Backend (pesado):** AWS Lambda + SQS — processamento de contratos, OCR, IA
- **Database:** PostgreSQL (Neon Pro, projeto separado) + Drizzle ORM
- **Auth:** Better Auth (self-hosted, $0) — email+senha, código por email, recuperação
- **Pagamentos:** Stripe (Checkout + Customer Portal + Webhooks + Metered Billing)
- **AI/OCR:** Amazon Textract (OCR) + DeepSeek V3/R1 (análise) + Perplexity Sonar (pesquisa contextual)
- **Storage:** AWS S3 (uploads via presigned URL)
- **Filas:** AWS SQS
- **Email:** Resend (início) → AWS SES (escala)
- **CDN/DNS:** CloudFlare
- **Hosting:** Vercel Pro (frontend) + AWS (backend)
- **i18n:** next-intl (en, pt, es, fr, it, de)
- **Validação:** Zod
- **Forms:** React Hook Form

## Identidade Visual
- **Estilo:** Light Neobrutalism (bordas finas slate-200, sombras sólidas sutis sem blur)
- **Cor primária:** Teal (#0D9488 primary-600, escala completa 50-950)
- **Accent:** Amber (#F59E0B)
- **Background marketing:** Off-white quente (#FFFDF5)
- **Background dashboard:** Branco (#FFFFFF) / Slate-50 (#F8FAFC)
- **Bordas:** 1px solid #e2e8f0 (slate-200)
- **Sombras:** 3px 3px 0px rgba(0,0,0,0.06) — sem blur, semi-transparente
- **Logo:** Bracket Clause {C} — fusão de chaves de programação com letra C
- **PROIBIDO:** Lilás, indigo, roxo em qualquer variação

## Ambientes
- **Development:** localhost:3000 (banco local ou Neon branch dev)
- **Staging:** Vercel Preview + Neon branch staging
- **Production:** Vercel Production + Neon branch main
- **REGRA CRÍTICA:** NUNCA mexer em recursos de outros projetos (MeusDireitos, etc.)
- **Prefixo AWS:** Todos os recursos AWS DEVEM usar prefixo "clausent-" (bucket: clausent-uploads, queue: clausent-analysis-queue, lambda: clausent-analysis, etc.)

## Internacionalização (i18n)
- Idioma nativo/padrão: Inglês (en)
- Idiomas suportados: en, pt, es, fr, it, de
- Detecção automática via Accept-Language header + navigator.language
- Fallback: en (se não detectar)
- Roteamento: /[locale]/... (ex: /pt/dashboard, /es/pricing)
- Arquivos de tradução: messages/[locale].json
- REGRA: NUNCA hardcodar strings de UI — SEMPRE usar arquivos de tradução
- Conteúdo gerado por IA (análises) pode ser em inglês, com opção de traduzir

## Documentação
- Design completo: `docs/plans/2026-02-26-clausent-design.md`
- Branding: `docs/BRANDING.md`
- Regras de Negócio: `docs/BUSINESS_RULES.md`

## Convenções de Código
- Todo código DEVE ser extensivamente comentado em português
- Commits em inglês, Conventional Commits (feat:, fix:, refactor:, etc.)
- Componentes React: PascalCase, um por arquivo
- Hooks: camelCase, prefixo "use"
- Funções utilitárias: camelCase
- Tipos/Interfaces: PascalCase, prefixo "I" apenas se necessário
- Constantes: UPPER_SNAKE_CASE
- Arquivos: kebab-case
- Testes: colocalizados com o código (arquivo.test.ts)

## Estrutura de Diretórios
```
src/
├── app/
│   ├── [locale]/            # Roteamento i18n
│   │   ├── (marketing)/     # Site público (landing, features, pricing, etc.)
│   │   ├── (auth)/          # Páginas de autenticação
│   │   ├── (dashboard)/     # Dashboard do app
│   │   └── (admin)/         # Painel administrativo
│   └── api/                 # API Routes (sem i18n)
│       ├── auth/            # Better Auth handlers
│       ├── stripe/          # Webhooks Stripe
│       ├── contracts/       # Upload e gestão de contratos
│       ├── analysis/        # Status e resultados de análises
│       └── admin/           # Endpoints administrativos
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── marketing/           # Componentes do site público
│   ├── dashboard/           # Componentes do dashboard
│   ├── auth/                # Componentes de autenticação
│   └── shared/              # Componentes compartilhados
├── lib/
│   ├── auth/                # Configuração Better Auth
│   ├── db/                  # Schemas Drizzle e queries
│   ├── ai/                  # Prompts, sanitização, integração DeepSeek
│   ├── aws/                 # S3, SQS, SES, Textract
│   ├── stripe/              # Integração Stripe
│   ├── email/               # Templates e envio de email
│   ├── i18n/                # Configuração next-intl
│   ├── validators/          # Schemas Zod
│   └── utils/               # Utilitários gerais
├── hooks/                   # React hooks customizados
├── types/                   # TypeScript types globais
├── messages/                # Arquivos de tradução i18n
│   ├── en.json
│   ├── pt.json
│   ├── es.json
│   ├── fr.json
│   ├── it.json
│   └── de.json
└── styles/                  # Estilos globais
```

## Regras Importantes
- NUNCA commitar .env ou credenciais
- NUNCA expor chaves de API no frontend
- NUNCA mexer em recursos AWS/Neon/Vercel de outros projetos
- Sempre prefixar recursos AWS com "clausent-"
- Sempre validar input do usuário (Zod)
- Upload de arquivos via presigned URL direto ao S3 (não pelo Vercel — limite 4.5MB)
- Anti-injection multi-camada em todos os prompts de IA (reutilizar padrão do MeusDireitos)
- Rate limiting em todas as rotas sensíveis (auth, upload, API)
- Todas as strings de UI via i18n (NUNCA hardcoded)
- Respostas da IA via streaming quando possível
- Separar ambientes (dev/staging/prod) com zero risco de cross-contamination

## Segurança
- Better Auth: hash scrypt, CSRF nativo, sessões stateful no banco
- Zod: validação em TODAS as rotas de API
- Presigned URLs: uploads nunca passam pelo servidor
- Prompt Security: sanitização anti-injection (delimitadores, detecção de padrões, escape)
- Stripe: verificação de assinatura de webhook
- Rate Limiting: sliding window (5/min auth, 30/min API, 10/min checkout)
- Headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- Turnstile: CAPTCHA em sign-up e upload
- Drizzle ORM: prepared statements (sem SQL dinâmico)

## Referência: MeusDireitos
- Projeto irmão em /Users/alissonlinneker/www/MeusDireitos/
- Reutilizar padrões de: prompt-security.ts, rate-limit.ts, email templates, AWS integration
- NUNCA modificar ou afetar dados/recursos do MeusDireitos
