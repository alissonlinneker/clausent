# Clausent — Contract Intelligence Platform

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Construir uma plataforma de inteligência contratual para SMBs que monitora, analisa e otimiza todos os contratos de uma empresa usando IA.

**Architecture:** Monolito Next.js 15 (App Router) com tRPC para API type-safe, PostgreSQL (Neon) + Drizzle ORM para persistência, Inngest para background jobs de processamento de contratos, e OpenAI GPT-4o para análise inteligente.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, tRPC, PostgreSQL (Neon), Drizzle ORM, Clerk, Stripe, OpenAI API, Inngest, Pinecone, Upstash Redis, Resend, Vercel.

---

## 1. Visão Geral

**Clausent** é uma plataforma de inteligência contratual para SMBs que usa IA para monitorar, analisar e otimizar todos os contratos de uma empresa — SaaS, fornecedores, aluguéis, seguros — alertando sobre renovações automáticas, identificando cláusulas desfavoráveis e sugerindo renegociações com dados de mercado.

**Proposta de valor:** "Pare de perder dinheiro com contratos que você esqueceu que tinha."

**Público-alvo:** SMBs (5-200 funcionários) sem departamento jurídico, que gerenciam contratos em planilhas, pastas do Google Drive, ou simplesmente não gerenciam.

**Domínios:** clausent.com, clausent.ai, clausent.app, clausent.com.br, clausent.ia.br

---

## 2. Modelo de Negócio

| Plano | Preço | Contratos | Features |
|---|---|---|---|
| **Starter** | $29/mês | Até 25 | Upload, extração, alertas, dashboard |
| **Professional** | $59/mês | Até 100 | + Risk scoring, benchmarks básicos, relatórios |
| **Business** | $99/mês | Até 500 | + Benchmarks avançados, pacote de renegociação, API |
| **Enterprise** | Custom | Ilimitado | + SSO, audit log, suporte dedicado |

**Receita adicional:**
- **Pay-per-analysis:** $2 por contrato analisado além do limite do plano
- **Renegotiation success fee:** 5% do valor economizado (opt-in, só cobra se economizar)

---

## 3. Arquitetura Técnica

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│  Next.js 15 (App Router) + Tailwind + shadcn/ui     │
│  ┌──────────┬──────────┬──────────┬───────────┐     │
│  │Dashboard │Contratos │ Alertas  │ Negocia-  │     │
│  │          │          │          │ ção       │     │
│  └──────────┴──────────┴──────────┴───────────┘     │
├─────────────────────────────────────────────────────┤
│                    API LAYER                         │
│  tRPC (type-safe) + Next.js API Routes               │
│  Clerk (Auth) + Stripe (Billing)                     │
├─────────────────────────────────────────────────────┤
│               PROCESSING ENGINE                      │
│  Inngest (Background Jobs)                           │
│  ┌──────────┬──────────┬──────────┐                 │
│  │ OCR/     │ AI       │ Benchmark│                 │
│  │ Parser   │ Analyzer │ Engine   │                 │
│  └──────────┴──────────┴──────────┘                 │
├─────────────────────────────────────────────────────┤
│                  DATA LAYER                          │
│  PostgreSQL (Neon) + Drizzle ORM                     │
│  Upstash Redis (Cache + Rate Limiting)               │
│  Pinecone (Vector DB — busca semântica)              │
├─────────────────────────────────────────────────────┤
│               EXTERNAL SERVICES                      │
│  OpenAI API (GPT-4o) │ Resend (Email)               │
│  Stripe (Payments)   │ Clerk (Auth)                  │
└─────────────────────────────────────────────────────┘
```

---

## 4. Stack Tecnológica

| Camada | Tecnologia | Motivo |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR, API routes, deploy Vercel |
| Linguagem | TypeScript | Type-safety |
| Styling | Tailwind CSS + shadcn/ui | Componentização rápida |
| API | tRPC | Type-safety end-to-end |
| Auth | Clerk | Multi-tenant, SSO, webhooks |
| Database | PostgreSQL (Neon) | Serverless, branching, scale-to-zero |
| ORM | Drizzle | Leve, type-safe, migrations |
| Cache | Upstash Redis | Rate limiting, cache de análises |
| Vector DB | Pinecone | Busca semântica em contratos |
| Background Jobs | Inngest | Event-driven, retries, cron |
| Pagamentos | Stripe | Subscriptions, usage-based billing |
| AI/LLM | OpenAI GPT-4o | Análise de contratos |
| PDF/OCR | pdf-parse + Tesseract.js | Extração de texto de PDFs |
| Email | Resend | Alertas e notificações |
| Hosting | Vercel | Deploy automático, edge |
| Monitoramento | Sentry | Error tracking |

---

## 5. Funcionalidades Core (MVP)

### 5.1 Upload e Processamento de Contratos
- Upload de PDF, DOCX, imagens (OCR)
- Extração automática via IA: partes, datas, valores, cláusulas-chave, termos de renovação
- Categorização automática (SaaS, fornecedor, aluguel, seguro, outro)
- Armazenamento do texto extraído + embeddings vetoriais para busca

### 5.2 Dashboard Inteligente
- Visão geral: total de contratos, valor total comprometido, próximas renovações
- Timeline de eventos (renovações, vencimentos, notice periods)
- Risk score geral do portfólio (0-100)
- Gráficos: gastos por categoria, distribuição de risco

### 5.3 Alertas e Notificações
- Alertas configuráveis: 90, 60, 30, 15, 7 dias antes de renovação/vencimento
- Notificação de notice periods (janela para cancelar)
- Alerta quando IA identifica cláusula desfavorável
- Canais: email (Resend), in-app, futuramente Slack/webhook

### 5.4 Análise de Risco (Risk Scoring)
- Cada contrato recebe um risk score (0-100) baseado em:
  - Cláusulas de auto-renovação sem opt-out
  - Aumentos de preço automáticos (escalation clauses)
  - Penalidades de cancelamento desproporcional
  - Lock-in periods longos
  - Limitações de responsabilidade unilaterais
  - Falta de SLA ou garantias
- Destaque visual de cláusulas problemáticas no texto do contrato

### 5.5 Benchmarks de Mercado (Diferencial)
- Comparação de preços/termos com dados agregados e anônimos de outros usuários da plataforma
- Ex: "Você paga $X/usuário por este CRM. A média do mercado é $Y/usuário."
- Ex: "Seu contrato de aluguel tem reajuste de 10%. A média da região é 5%."
- Os benchmarks melhoram conforme mais contratos são analisados (network effect)

### 5.6 Pacote de Renegociação
- Resumo executivo do contrato atual
- Pontos de renegociação priorizados (do mais impactante ao menos)
- Argumentos sugeridos baseados em benchmarks
- Draft de email/carta de renegociação gerado por IA
- Estimativa de economia potencial

---

## 6. Modelo de Dados

```
organizations (multi-tenant)
├── id, name, plan, stripe_customer_id
├── clerk_org_id
│
├── users
│   ├── id, clerk_user_id, org_id, role (admin/member/viewer)
│
├── contracts
│   ├── id, org_id, title, category (saas/vendor/lease/insurance/other)
│   ├── status (active/expiring/expired/renewed/cancelled)
│   ├── counterparty (nome da outra parte)
│   ├── start_date, end_date, notice_period_days
│   ├── auto_renew (boolean), renewal_terms
│   ├── total_value, monthly_value, currency
│   ├── risk_score (0-100)
│   ├── original_file_url, extracted_text
│   ├── ai_summary (JSON — cláusulas-chave extraídas)
│   ├── created_at, updated_at
│   │
│   ├── contract_clauses
│   │   ├── id, contract_id, clause_type, text, risk_level
│   │   ├── position_start, position_end (no texto original)
│   │
│   ├── contract_alerts
│   │   ├── id, contract_id, type, trigger_date, sent_at
│   │
│   └── contract_benchmarks
│       ├── id, contract_id, metric, your_value, market_avg, percentile
│
├── renegotiation_packages
│   ├── id, contract_id, points (JSON), draft_email, estimated_savings
│
└── audit_log
    ├── id, org_id, user_id, action, details, created_at
```

---

## 7. Fluxo Principal do Usuário

```
1. Signup (Clerk) → Criar organização → Escolher plano (Stripe)
2. Upload de contrato (PDF/DOCX/IMG)
3. [Background] Inngest processa:
   a. Extrai texto (pdf-parse / Tesseract.js)
   b. Envia para GPT-4o com prompt estruturado
   c. GPT-4o retorna: partes, datas, valores, cláusulas, riscos
   d. Calcula risk score
   e. Gera embeddings → Pinecone
   f. Agenda alertas baseado nas datas extraídas
4. Dashboard atualizado em tempo real
5. Alertas enviados nos períodos configurados
6. Usuário pode pedir "Pacote de Renegociação" para qualquer contrato
7. IA gera análise comparativa + draft de email
```

---

## 8. Segurança e Compliance

- **Multi-tenant com isolamento total:** cada organização só acessa seus dados (Row Level Security no Postgres + filtros no Drizzle)
- **Criptografia:** TLS em trânsito, dados sensíveis criptografados at-rest
- **Armazenamento de arquivos:** Vercel Blob Storage (ou S3 compatível) com URLs assinadas e temporárias
- **Auth:** Clerk com MFA disponível
- **Dados de IA:** contratos NÃO são usados para treinar modelos (OpenAI API com data privacy)
- **Audit log:** toda ação relevante é registrada

---

## 9. Landing Page e Conversão

- Hero com proposta de valor clara + calculadora de economia
- Demo interativa (upload de contrato de exemplo → análise instantânea)
- Social proof (números de economia, depoimentos quando houver)
- Pricing transparente
- CTA: "Analise seu primeiro contrato grátis" (free trial de 14 dias, sem cartão)

---

## 10. Métricas de Sucesso (KPIs)

- **Ativação:** % de signups que fazem upload do primeiro contrato em 24h
- **Retenção:** % de usuários ativos após 30/60/90 dias
- **Receita:** MRR, ARPU, churn rate
- **Valor entregue:** total de economia identificada para clientes
- **Engajamento:** contratos analisados/mês, alertas configurados

---

## 11. O Que NÃO Entra no MVP (YAGNI)

- Integração com Slack/Teams/Discord
- API pública para terceiros
- App mobile nativo
- Negociação autônoma (a la Pactum)
- OCR de fotos de contratos via câmera
- Marketplace de templates legais
- Multi-idioma (só inglês no MVP)
- SSO/SAML (só Enterprise, pós-MVP)

---

## 12. Pesquisa de Mercado — Validação

### Mercado
- CLM market: $1.8B-$3.39B (2026), CAGR 12-27%
- Legal tech funding 2025: $5.99B
- Empresas perdem 9.2% da receita anual por má gestão de contratos
- 69% dos contratos SaaS auto-renovam
- 50% das organizações não conseguem rastrear seus contratos

### Gap Validado
Nenhum concorrente oferece a combinação:
- Monitora TODOS os tipos de contrato (SaaS + vendors + leases + insurance)
- Risk scoring inteligente com IA
- Benchmarks de mercado para renegociação
- Acessível para SMBs ($29-99/mês)
- Setup em minutos

### Concorrentes Mais Próximos
- **ContractSafe** ($450/mês): repositório + alertas, mas IA básica, sem benchmarks
- **SimpleDocs/Law Insider** ($159/user/mês): benchmarks reais, mas só review pontual, não monitora
- **Zoho Contracts** ($25-50/user/mês): acessível, mas IA limitada
- **CloudEagle** ($2.500/mês): benchmarks de SaaS, mas só SaaS, caro

### White Space do Clausent
Entre "planilhas/nada" (o que SMBs usam) e "$60K+/ano" (enterprise CLM).
