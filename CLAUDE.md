# Clausent — Contract Intelligence Platform

## Sobre o Projeto
Clausent é uma plataforma de inteligência contratual para SMBs que usa IA para monitorar, analisar e otimizar todos os contratos de uma empresa (SaaS, fornecedores, aluguéis, seguros). Alerta sobre renovações automáticas, identifica cláusulas desfavoráveis e sugere renegociações com benchmarks de mercado.

## Stack
- Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- tRPC para API type-safe
- PostgreSQL (Neon) + Drizzle ORM
- Pinecone (Vector DB para busca semântica)
- Upstash Redis (Cache + Rate Limiting)
- Clerk (Auth)
- Stripe (Subscriptions + Usage-based billing)
- OpenAI API (GPT-4o para análise de contratos)
- Inngest (Background Jobs)
- Vercel (Hosting)
- Resend (Email)
- Sentry (Monitoramento)

## Documentação
- Design: `docs/plans/2026-02-26-clausent-design.md`

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
├── app/              # Next.js pages (App Router)
├── components/       # Componentes React reutilizáveis
├── lib/              # Lógica de negócio e integrações
│   ├── ai/           # Motor de análise, prompts, embeddings
│   ├── db/           # Schemas Drizzle e queries
│   ├── stripe/       # Integração Stripe
│   ├── trpc/         # Routers tRPC
│   ├── utils/        # Utilitários
│   └── validators/   # Schemas Zod
├── hooks/            # React hooks
├── types/            # TypeScript types
└── styles/           # Estilos globais
```

## Regras Importantes
- NUNCA commitar .env ou credenciais
- NUNCA expor chaves de API no frontend
- Sempre validar input do usuário (Zod)
- Sempre usar prepared statements (Drizzle cuida disso)
- Respostas da IA via streaming quando possível
- Multi-tenant com isolamento total (Row Level Security)
