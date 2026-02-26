# Clausent Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Construir o MVP completo do Clausent — plataforma de inteligência contratual para SMBs com upload de contratos, análise por IA, risk scoring, alertas, benchmarks e pacote de renegociação.

**Architecture:** Monolito Next.js 15 (App Router) com tRPC type-safe, PostgreSQL (Neon) + Drizzle ORM, Inngest para background jobs, OpenAI GPT-4o para análise de contratos, Clerk para auth, Stripe para billing.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, tRPC, PostgreSQL (Neon), Drizzle ORM, Clerk, Stripe, OpenAI API, Inngest, Pinecone, Upstash Redis, Resend, Vitest, Vercel.

**Design Doc:** `docs/plans/2026-02-26-clausent-design.md`

---

## Task 1: Project Scaffolding

**Context:** Criar o projeto Next.js 15 do zero com todas as configurações base. O diretório atual só tem `.git/` e `.gitignore`.

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `components.json` (shadcn/ui)
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/page.tsx`
- Create: `src/lib/utils.ts`
- Create: `.env.example`
- Create: `drizzle.config.ts`

**Step 1: Initialize Next.js 15 project**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --yes
```

**Step 2: Install core dependencies**

```bash
npm install @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query superjson zod drizzle-orm @neondatabase/serverless dotenv
npm install -D drizzle-kit @types/node vitest @vitejs/plugin-react
```

**Step 3: Install shadcn/ui and initialize**

```bash
npx shadcn@latest init -d
```

Instalar componentes base:
```bash
npx shadcn@latest add button card input label form dialog dropdown-menu separator sheet tabs textarea badge avatar scroll-area select switch tooltip sonner popover command accordion
```

**Step 4: Install auth, payments, and service dependencies**

```bash
npm install @clerk/nextjs stripe @stripe/stripe-js inngest openai @upstash/redis @upstash/ratelimit resend @sentry/nextjs pdf-parse
npm install -D @types/pdf-parse
```

**Step 5: Create environment example file**

Create `.env.example`:
```env
# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI
OPENAI_API_KEY=sk-...

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Pinecone
PINECONE_API_KEY=...
PINECONE_INDEX=clausent-contracts

# Resend
RESEND_API_KEY=re_...

# Inngest
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 6: Configure Vitest**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Step 7: Configure Drizzle**

Create `drizzle.config.ts`:
```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/lib/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

**Step 8: Update next.config.ts**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse'],
}

export default nextConfig
```

**Step 9: Add scripts to package.json**

Adicionar ao `scripts` do `package.json`:
```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio",
  "test": "vitest",
  "test:run": "vitest run"
}
```

**Step 10: Verify project builds and runs**

```bash
npm run build
npm run dev
```

Expected: projeto compila sem erros, roda em localhost:3000.

**Step 11: Commit**

```bash
git add .
git commit -m "feat: initialize Next.js 15 project with core dependencies"
```

---

## Task 2: Database Schema

**Context:** Criar todos os schemas Drizzle ORM baseados no modelo de dados do design doc. Multi-tenant com org_id em todas as tabelas.

**Files:**
- Create: `src/lib/db/index.ts`
- Create: `src/lib/db/schema/organizations.ts`
- Create: `src/lib/db/schema/users.ts`
- Create: `src/lib/db/schema/contracts.ts`
- Create: `src/lib/db/schema/contract-clauses.ts`
- Create: `src/lib/db/schema/contract-alerts.ts`
- Create: `src/lib/db/schema/contract-benchmarks.ts`
- Create: `src/lib/db/schema/renegotiation-packages.ts`
- Create: `src/lib/db/schema/audit-log.ts`
- Create: `src/lib/db/schema/index.ts`
- Create: `src/lib/db/schema/relations.ts`
- Test: `src/lib/db/__tests__/schema.test.ts`

**Step 1: Write schema validation test**

Create `src/lib/db/__tests__/schema.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import * as schema from '../schema'

describe('Database Schema', () => {
  it('deve exportar todas as tabelas necessárias', () => {
    expect(schema.organizations).toBeDefined()
    expect(schema.users).toBeDefined()
    expect(schema.contracts).toBeDefined()
    expect(schema.contractClauses).toBeDefined()
    expect(schema.contractAlerts).toBeDefined()
    expect(schema.contractBenchmarks).toBeDefined()
    expect(schema.renegotiationPackages).toBeDefined()
    expect(schema.auditLog).toBeDefined()
  })

  it('deve ter enums de categoria de contrato', () => {
    expect(schema.contractCategoryEnum.enumValues).toEqual([
      'saas', 'vendor', 'lease', 'insurance', 'other'
    ])
  })

  it('deve ter enums de status de contrato', () => {
    expect(schema.contractStatusEnum.enumValues).toEqual([
      'active', 'expiring', 'expired', 'renewed', 'cancelled'
    ])
  })

  it('deve ter enums de role do usuário', () => {
    expect(schema.userRoleEnum.enumValues).toEqual([
      'admin', 'member', 'viewer'
    ])
  })

  it('deve ter enums de plano da organização', () => {
    expect(schema.orgPlanEnum.enumValues).toEqual([
      'starter', 'professional', 'business', 'enterprise'
    ])
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/db/__tests__/schema.test.ts
```
Expected: FAIL — módulo não encontrado

**Step 3: Create database connection**

Create `src/lib/db/index.ts`:
```typescript
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

/**
 * Cria a conexão HTTP com o Neon PostgreSQL.
 * Usa variável de ambiente DATABASE_URL.
 */
const sql = neon(process.env.DATABASE_URL!)

/** Instância do Drizzle ORM com todos os schemas carregados */
export const db = drizzle(sql, { schema })

export type Database = typeof db
```

**Step 4: Create all schema files**

Create `src/lib/db/schema/organizations.ts`:
```typescript
import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core'

/** Enum dos planos disponíveis */
export const orgPlanEnum = pgEnum('org_plan', [
  'starter',
  'professional',
  'business',
  'enterprise',
])

/** Tabela de organizações — entidade raiz do multi-tenant */
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  clerkOrgId: varchar('clerk_org_id', { length: 255 }).unique().notNull(),
  plan: orgPlanEnum('plan').default('starter').notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Organization = typeof organizations.$inferSelect
export type NewOrganization = typeof organizations.$inferInsert
```

Create `src/lib/db/schema/users.ts`:
```typescript
import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { organizations } from './organizations'

/** Enum de roles do usuário na organização */
export const userRoleEnum = pgEnum('user_role', [
  'admin',
  'member',
  'viewer',
])

/** Tabela de usuários — vinculados a uma organização */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }).unique().notNull(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  role: userRoleEnum('role').default('member').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

Create `src/lib/db/schema/contracts.ts`:
```typescript
import {
  pgTable, uuid, varchar, text, timestamp, integer,
  boolean, jsonb, pgEnum, numeric,
} from 'drizzle-orm/pg-core'
import { organizations } from './organizations'

/** Enum das categorias de contrato */
export const contractCategoryEnum = pgEnum('contract_category', [
  'saas', 'vendor', 'lease', 'insurance', 'other',
])

/** Enum dos status de contrato */
export const contractStatusEnum = pgEnum('contract_status', [
  'active', 'expiring', 'expired', 'renewed', 'cancelled',
])

/** Tabela principal de contratos */
export const contracts = pgTable('contracts', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  category: contractCategoryEnum('category').default('other').notNull(),
  status: contractStatusEnum('status').default('active').notNull(),
  counterparty: varchar('counterparty', { length: 255 }),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  noticePeriodDays: integer('notice_period_days'),
  autoRenew: boolean('auto_renew').default(false),
  renewalTerms: text('renewal_terms'),
  totalValue: numeric('total_value', { precision: 12, scale: 2 }),
  monthlyValue: numeric('monthly_value', { precision: 12, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('USD'),
  riskScore: integer('risk_score'),
  originalFileUrl: text('original_file_url'),
  extractedText: text('extracted_text'),
  aiSummary: jsonb('ai_summary'),
  processingStatus: varchar('processing_status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Contract = typeof contracts.$inferSelect
export type NewContract = typeof contracts.$inferInsert
```

Create `src/lib/db/schema/contract-clauses.ts`:
```typescript
import { pgTable, uuid, varchar, text, integer, pgEnum } from 'drizzle-orm/pg-core'
import { contracts } from './contracts'

/** Nível de risco de uma cláusula */
export const clauseRiskLevelEnum = pgEnum('clause_risk_level', [
  'low', 'medium', 'high', 'critical',
])

/** Cláusulas individuais extraídas de um contrato */
export const contractClauses = pgTable('contract_clauses', {
  id: uuid('id').primaryKey().defaultRandom(),
  contractId: uuid('contract_id').references(() => contracts.id, { onDelete: 'cascade' }).notNull(),
  clauseType: varchar('clause_type', { length: 100 }).notNull(),
  text: text('text').notNull(),
  riskLevel: clauseRiskLevelEnum('risk_level').default('low').notNull(),
  positionStart: integer('position_start'),
  positionEnd: integer('position_end'),
})

export type ContractClause = typeof contractClauses.$inferSelect
export type NewContractClause = typeof contractClauses.$inferInsert
```

Create `src/lib/db/schema/contract-alerts.ts`:
```typescript
import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core'
import { contracts } from './contracts'

/** Alertas agendados para contratos (renovações, vencimentos, etc.) */
export const contractAlerts = pgTable('contract_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  contractId: uuid('contract_id').references(() => contracts.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  triggerDate: timestamp('trigger_date').notNull(),
  sentAt: timestamp('sent_at'),
  dismissed: boolean('dismissed').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type ContractAlert = typeof contractAlerts.$inferSelect
export type NewContractAlert = typeof contractAlerts.$inferInsert
```

Create `src/lib/db/schema/contract-benchmarks.ts`:
```typescript
import { pgTable, uuid, varchar, numeric, integer } from 'drizzle-orm/pg-core'
import { contracts } from './contracts'

/** Benchmarks de mercado comparados a um contrato específico */
export const contractBenchmarks = pgTable('contract_benchmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  contractId: uuid('contract_id').references(() => contracts.id, { onDelete: 'cascade' }).notNull(),
  metric: varchar('metric', { length: 255 }).notNull(),
  yourValue: numeric('your_value', { precision: 12, scale: 2 }),
  marketAvg: numeric('market_avg', { precision: 12, scale: 2 }),
  percentile: integer('percentile'),
})

export type ContractBenchmark = typeof contractBenchmarks.$inferSelect
export type NewContractBenchmark = typeof contractBenchmarks.$inferInsert
```

Create `src/lib/db/schema/renegotiation-packages.ts`:
```typescript
import { pgTable, uuid, jsonb, text, numeric, timestamp } from 'drizzle-orm/pg-core'
import { contracts } from './contracts'

/** Pacotes de renegociação gerados por IA */
export const renegotiationPackages = pgTable('renegotiation_packages', {
  id: uuid('id').primaryKey().defaultRandom(),
  contractId: uuid('contract_id').references(() => contracts.id, { onDelete: 'cascade' }).notNull(),
  points: jsonb('points').notNull(),
  draftEmail: text('draft_email'),
  estimatedSavings: numeric('estimated_savings', { precision: 12, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type RenegotiationPackage = typeof renegotiationPackages.$inferSelect
export type NewRenegotiationPackage = typeof renegotiationPackages.$inferInsert
```

Create `src/lib/db/schema/audit-log.ts`:
```typescript
import { pgTable, uuid, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { organizations } from './organizations'
import { users } from './users'

/** Log de auditoria — registra todas as ações relevantes */
export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(),
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type AuditLogEntry = typeof auditLog.$inferSelect
export type NewAuditLogEntry = typeof auditLog.$inferInsert
```

Create `src/lib/db/schema/relations.ts`:
```typescript
import { relations } from 'drizzle-orm'
import { organizations } from './organizations'
import { users } from './users'
import { contracts } from './contracts'
import { contractClauses } from './contract-clauses'
import { contractAlerts } from './contract-alerts'
import { contractBenchmarks } from './contract-benchmarks'
import { renegotiationPackages } from './renegotiation-packages'
import { auditLog } from './audit-log'

/** Relações da organização */
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  contracts: many(contracts),
  auditLog: many(auditLog),
}))

/** Relações do usuário */
export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
}))

/** Relações do contrato */
export const contractsRelations = relations(contracts, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [contracts.orgId],
    references: [organizations.id],
  }),
  clauses: many(contractClauses),
  alerts: many(contractAlerts),
  benchmarks: many(contractBenchmarks),
  renegotiationPackages: many(renegotiationPackages),
}))

/** Relações das cláusulas */
export const contractClausesRelations = relations(contractClauses, ({ one }) => ({
  contract: one(contracts, {
    fields: [contractClauses.contractId],
    references: [contracts.id],
  }),
}))

/** Relações dos alertas */
export const contractAlertsRelations = relations(contractAlerts, ({ one }) => ({
  contract: one(contracts, {
    fields: [contractAlerts.contractId],
    references: [contracts.id],
  }),
}))

/** Relações dos benchmarks */
export const contractBenchmarksRelations = relations(contractBenchmarks, ({ one }) => ({
  contract: one(contracts, {
    fields: [contractBenchmarks.contractId],
    references: [contracts.id],
  }),
}))

/** Relações dos pacotes de renegociação */
export const renegotiationPackagesRelations = relations(renegotiationPackages, ({ one }) => ({
  contract: one(contracts, {
    fields: [renegotiationPackages.contractId],
    references: [contracts.id],
  }),
}))

/** Relações do audit log */
export const auditLogRelations = relations(auditLog, ({ one }) => ({
  organization: one(organizations, {
    fields: [auditLog.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [auditLog.userId],
    references: [users.id],
  }),
}))
```

Create `src/lib/db/schema/index.ts`:
```typescript
export { organizations, orgPlanEnum } from './organizations'
export type { Organization, NewOrganization } from './organizations'

export { users, userRoleEnum } from './users'
export type { User, NewUser } from './users'

export { contracts, contractCategoryEnum, contractStatusEnum } from './contracts'
export type { Contract, NewContract } from './contracts'

export { contractClauses, clauseRiskLevelEnum } from './contract-clauses'
export type { ContractClause, NewContractClause } from './contract-clauses'

export { contractAlerts } from './contract-alerts'
export type { ContractAlert, NewContractAlert } from './contract-alerts'

export { contractBenchmarks } from './contract-benchmarks'
export type { ContractBenchmark, NewContractBenchmark } from './contract-benchmarks'

export { renegotiationPackages } from './renegotiation-packages'
export type { RenegotiationPackage, NewRenegotiationPackage } from './renegotiation-packages'

export { auditLog } from './audit-log'
export type { AuditLogEntry, NewAuditLogEntry } from './audit-log'

export * from './relations'
```

**Step 5: Run test to verify it passes**

```bash
npx vitest run src/lib/db/__tests__/schema.test.ts
```
Expected: PASS — todos os 4 testes passando

**Step 6: Commit**

```bash
git add src/lib/db/
git commit -m "feat: add database schema with Drizzle ORM"
```

---

## Task 3: Authentication (Clerk)

**Context:** Configurar Clerk para autenticação, criar middleware para proteger rotas, e configurar webhook para sincronizar usuários com o banco de dados.

**Files:**
- Create: `src/middleware.ts`
- Create: `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- Create: `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/api/webhooks/clerk/route.ts`
- Modify: `src/app/layout.tsx` — wrap com ClerkProvider

**Step 1: Create Clerk middleware**

Create `src/middleware.ts`:
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

/** Rotas que exigem autenticação */
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/trpc(.*)',
])

/** Rotas públicas (não requerem login) */
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing',
  '/api/webhooks(.*)',
  '/api/inngest(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

**Step 2: Update root layout with ClerkProvider**

Modify `src/app/layout.tsx` — wrap com ClerkProvider e adicionar fonts, metadata base:
```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Clausent — Contract Intelligence for SMBs',
  description: 'Stop losing money on contracts you forgot you had. AI-powered contract monitoring, risk analysis, and renegotiation for small businesses.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
```

**Step 3: Create auth pages**

Create `src/app/(auth)/layout.tsx`:
```tsx
/** Layout centralizado para páginas de autenticação */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      {children}
    </div>
  )
}
```

Create `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`:
```tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return <SignIn />
}
```

Create `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`:
```tsx
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return <SignUp />
}
```

**Step 4: Create Clerk webhook for user sync**

Create `src/app/api/webhooks/clerk/route.ts`:
```typescript
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { organizations, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Webhook do Clerk — sincroniza criação de organizações e membros
 * com o banco de dados local.
 */
export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('CLERK_WEBHOOK_SECRET não configurado')
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Cabeçalhos svix ausentes', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch {
    return new Response('Verificação de webhook falhou', { status: 400 })
  }

  const eventType = evt.type

  if (eventType === 'organization.created') {
    const { id, name } = evt.data
    await db.insert(organizations).values({
      clerkOrgId: id,
      name: name,
    })
  }

  if (eventType === 'organizationMembership.created') {
    const { organization, public_user_data } = evt.data
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.clerkOrgId, organization.id),
    })

    if (org) {
      await db.insert(users).values({
        clerkUserId: public_user_data.user_id,
        orgId: org.id,
        email: public_user_data.identifier || '',
        name: `${public_user_data.first_name || ''} ${public_user_data.last_name || ''}`.trim(),
        role: evt.data.role === 'org:admin' ? 'admin' : 'member',
      }).onConflictDoNothing()
    }
  }

  return new Response('OK', { status: 200 })
}
```

**Step 5: Add svix dependency**

```bash
npm install svix
```

**Step 6: Verify build**

```bash
npm run build
```
Expected: compila sem erros

**Step 7: Commit**

```bash
git add src/middleware.ts src/app/ src/lib/
git commit -m "feat: add Clerk authentication with webhook sync"
```

---

## Task 4: tRPC Setup

**Context:** Configurar tRPC com contexto autenticado (Clerk), criar router base, e configurar o provider no frontend.

**Files:**
- Create: `src/lib/trpc/init.ts`
- Create: `src/lib/trpc/routers/_app.ts`
- Create: `src/lib/trpc/react.tsx`
- Create: `src/app/api/trpc/[trpc]/route.ts`
- Create: `src/components/providers.tsx`
- Modify: `src/app/layout.tsx` — adicionar Providers

**Step 1: Create tRPC initialization with Clerk context**

Create `src/lib/trpc/init.ts`:
```typescript
import { initTRPC, TRPCError } from '@trpc/server'
import { auth } from '@clerk/nextjs/server'
import superjson from 'superjson'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Contexto base do tRPC — injetado em todos os procedures.
 * Inclui a instância do banco e os dados de autenticação do Clerk.
 */
export const createTRPCContext = async () => {
  const { userId, orgId } = await auth()

  return {
    db,
    clerkUserId: userId,
    clerkOrgId: orgId,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure

/**
 * Middleware que exige autenticação e resolve o usuário/organização do banco.
 * Injeta dbUser e orgId no contexto para procedures protegidos.
 */
const enforceAuth = t.middleware(async ({ ctx, next }) => {
  if (!ctx.clerkUserId || !ctx.clerkOrgId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  const dbUser = await ctx.db.query.users.findFirst({
    where: eq(users.clerkUserId, ctx.clerkUserId),
  })

  if (!dbUser) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Usuário não encontrado no banco' })
  }

  return next({
    ctx: {
      ...ctx,
      dbUser,
      orgId: dbUser.orgId,
    },
  })
})

/** Procedure que exige autenticação — usar para todas as rotas protegidas */
export const protectedProcedure = t.procedure.use(enforceAuth)
```

**Step 2: Create app router**

Create `src/lib/trpc/routers/_app.ts`:
```typescript
import { router } from '../init'

/** Router raiz — todos os sub-routers são agregados aqui */
export const appRouter = router({
  // Sub-routers serão adicionados nas próximas tasks
})

export type AppRouter = typeof appRouter
```

**Step 3: Create tRPC API route**

Create `src/app/api/trpc/[trpc]/route.ts`:
```typescript
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/lib/trpc/routers/_app'
import { createTRPCContext } from '@/lib/trpc/init'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
  })

export { handler as GET, handler as POST }
```

**Step 4: Create React client**

Create `src/lib/trpc/react.tsx`:
```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { useState } from 'react'
import superjson from 'superjson'
import type { AppRouter } from './routers/_app'

/** Hook tRPC tipado para uso nos componentes React */
export const trpc = createTRPCReact<AppRouter>()

/** Provider que inicializa tRPC + React Query */
export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          transformer: superjson,
        }),
      ],
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}
```

**Step 5: Create providers wrapper**

Create `src/components/providers.tsx`:
```tsx
'use client'

import { TRPCProvider } from '@/lib/trpc/react'

/** Wrapper de todos os providers client-side */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      {children}
    </TRPCProvider>
  )
}
```

**Step 6: Update root layout to include Providers**

Modify `src/app/layout.tsx` — adicionar `<Providers>` dentro do `<ClerkProvider>`:
```tsx
import { Providers } from '@/components/providers'
// ... (manter imports anteriores)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Providers>
            {children}
          </Providers>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
```

**Step 7: Verify build**

```bash
npm run build
```

**Step 8: Commit**

```bash
git add .
git commit -m "feat: add tRPC setup with authenticated context"
```

---

## Task 5: Landing Page

**Context:** Criar a landing page de marketing com hero, features, how it works, pricing, e footer. Layout responsivo, foco em conversão.

**Files:**
- Create: `src/app/(marketing)/layout.tsx`
- Create: `src/app/(marketing)/page.tsx`
- Create: `src/app/(marketing)/pricing/page.tsx`
- Create: `src/components/marketing/hero-section.tsx`
- Create: `src/components/marketing/features-section.tsx`
- Create: `src/components/marketing/how-it-works-section.tsx`
- Create: `src/components/marketing/pricing-section.tsx`
- Create: `src/components/layout/marketing-header.tsx`
- Create: `src/components/layout/marketing-footer.tsx`

**Step 1: Create marketing layout with header and footer**

Criar o layout, header e footer do marketing. O header deve ter logo, links de navegação (Features, Pricing, Sign In), e CTA "Get Started". O footer deve ter links básicos e copyright.

**Step 2: Create hero section**

Headline: "Stop Losing Money on Forgotten Contracts"
Subheadline: "AI-powered contract intelligence that monitors renewals, spots unfavorable terms, and suggests renegotiations — saving SMBs an average of 9.2% on contract costs."
CTA: "Analyze Your First Contract Free" → link para /sign-up
Elemento visual: mockup do dashboard ou ilustração abstrata.

**Step 3: Create features section**

6 features em grid 3x2:
1. Smart Upload — Upload PDF/DOCX, AI extracts everything
2. Risk Scoring — 0-100 risk score for every contract
3. Auto-Alerts — Notifications before renewals and deadlines
4. Market Benchmarks — Compare your terms with market data
5. Renegotiation Kit — AI-generated renegotiation playbook
6. Dashboard — Full portfolio visibility at a glance

**Step 4: Create how it works section**

3 passos:
1. Upload your contracts (drag & drop)
2. AI analyzes in seconds (extraction, risk, benchmarks)
3. Save money (alerts, renegotiation, insights)

**Step 5: Create pricing section**

4 planos conforme design doc (Starter $29, Professional $59, Business $99, Enterprise custom).
Cada card com lista de features, CTA "Start Free Trial".

**Step 6: Create pricing page**

Standalone `/pricing` que reutiliza o `PricingSection` com FAQ expandido.

**Step 7: Assemble landing page**

Montar `page.tsx` com Hero → Features → HowItWorks → Pricing → Footer.

**Step 8: Verify visually**

```bash
npm run dev
```
Verificar que a landing page renderiza corretamente em desktop e mobile.

**Step 9: Commit**

```bash
git add .
git commit -m "feat: add marketing landing page with hero, features, and pricing"
```

---

## Task 6: Dashboard Layout

**Context:** Criar o layout do dashboard com sidebar, header, e navegação. Protegido por autenticação.

**Files:**
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/app/(dashboard)/dashboard/page.tsx`
- Create: `src/components/layout/dashboard-sidebar.tsx`
- Create: `src/components/layout/dashboard-header.tsx`

**Step 1: Create dashboard sidebar**

Links da sidebar:
- Overview (ícone: LayoutDashboard)
- Contracts (ícone: FileText)
- Alerts (ícone: Bell)
- Benchmarks (ícone: BarChart3)
- Settings (ícone: Settings)

Usar ícones do `lucide-react`. Sidebar colapsável em mobile via Sheet.

**Step 2: Create dashboard header**

Header com: breadcrumb, barra de busca (placeholder), UserButton do Clerk, OrganizationSwitcher do Clerk.

**Step 3: Create dashboard layout**

Layout flex com sidebar fixa à esquerda (w-64) e área de conteúdo scrollable à direita.

**Step 4: Create dashboard overview page**

Página placeholder com cards de estatísticas:
- Total Contracts: 0
- Active Value: $0
- Upcoming Renewals: 0
- Average Risk Score: N/A

Dados mockados por enquanto (serão conectados ao tRPC na próxima task).

**Step 5: Verify navigation**

```bash
npm run dev
```
Navegar para `/dashboard`, verificar sidebar e layout.

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add dashboard layout with sidebar and navigation"
```

---

## Task 7: Contract tRPC Router + Dashboard Data

**Context:** Criar o router tRPC de contratos (CRUD) e o router de dashboard (estatísticas). Conectar o dashboard overview aos dados reais.

**Files:**
- Create: `src/lib/trpc/routers/contract.ts`
- Create: `src/lib/trpc/routers/dashboard.ts`
- Create: `src/lib/validators/contract.ts`
- Modify: `src/lib/trpc/routers/_app.ts` — adicionar sub-routers
- Modify: `src/app/(dashboard)/dashboard/page.tsx` — conectar dados reais
- Test: `src/lib/validators/__tests__/contract.test.ts`

**Step 1: Write validator test**

Create `src/lib/validators/__tests__/contract.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { createContractSchema, updateContractSchema } from '../contract'

describe('Contract Validators', () => {
  it('deve validar criação de contrato com campos obrigatórios', () => {
    const result = createContractSchema.safeParse({
      title: 'Contrato de SaaS',
      category: 'saas',
    })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar contrato sem título', () => {
    const result = createContractSchema.safeParse({
      category: 'saas',
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar categoria inválida', () => {
    const result = createContractSchema.safeParse({
      title: 'Contrato',
      category: 'invalid',
    })
    expect(result.success).toBe(false)
  })

  it('deve aceitar campos opcionais na atualização', () => {
    const result = updateContractSchema.safeParse({
      title: 'Título atualizado',
      counterparty: 'Empresa X',
      monthlyValue: '99.99',
    })
    expect(result.success).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/validators/__tests__/contract.test.ts
```

**Step 3: Create contract validators**

Create `src/lib/validators/contract.ts`:
```typescript
import { z } from 'zod'

/** Schema de criação de contrato — campos obrigatórios mínimos */
export const createContractSchema = z.object({
  title: z.string().min(1).max(500),
  category: z.enum(['saas', 'vendor', 'lease', 'insurance', 'other']),
  counterparty: z.string().max(255).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  noticePeriodDays: z.number().int().min(0).optional(),
  autoRenew: z.boolean().optional(),
  renewalTerms: z.string().optional(),
  totalValue: z.string().optional(),
  monthlyValue: z.string().optional(),
  currency: z.string().length(3).default('USD'),
})

/** Schema de atualização — todos os campos opcionais */
export const updateContractSchema = createContractSchema.partial()

export type CreateContractInput = z.infer<typeof createContractSchema>
export type UpdateContractInput = z.infer<typeof updateContractSchema>
```

**Step 4: Run tests**

```bash
npx vitest run src/lib/validators/__tests__/contract.test.ts
```
Expected: PASS

**Step 5: Create contract router**

Create `src/lib/trpc/routers/contract.ts`:
```typescript
import { z } from 'zod'
import { router, protectedProcedure } from '../init'
import { contracts } from '@/lib/db/schema'
import { createContractSchema, updateContractSchema } from '@/lib/validators/contract'
import { eq, and, desc } from 'drizzle-orm'

/** Router de contratos — CRUD completo com isolamento por organização */
export const contractRouter = router({
  /** Lista todos os contratos da organização */
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.contracts.findMany({
      where: eq(contracts.orgId, ctx.orgId),
      orderBy: desc(contracts.createdAt),
    })
  }),

  /** Busca um contrato por ID (com validação de acesso) */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.contracts.findFirst({
        where: and(
          eq(contracts.id, input.id),
          eq(contracts.orgId, ctx.orgId),
        ),
        with: {
          clauses: true,
          alerts: true,
          benchmarks: true,
        },
      })
    }),

  /** Cria um novo contrato */
  create: protectedProcedure
    .input(createContractSchema)
    .mutation(async ({ ctx, input }) => {
      const [contract] = await ctx.db.insert(contracts).values({
        ...input,
        orgId: ctx.orgId,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
      }).returning()

      return contract
    }),

  /** Atualiza um contrato existente */
  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: updateContractSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db.update(contracts)
        .set({
          ...input.data,
          startDate: input.data.startDate ? new Date(input.data.startDate) : undefined,
          endDate: input.data.endDate ? new Date(input.data.endDate) : undefined,
          updatedAt: new Date(),
        })
        .where(and(
          eq(contracts.id, input.id),
          eq(contracts.orgId, ctx.orgId),
        ))
        .returning()

      return updated
    }),

  /** Deleta um contrato */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(contracts)
        .where(and(
          eq(contracts.id, input.id),
          eq(contracts.orgId, ctx.orgId),
        ))
    }),
})
```

**Step 6: Create dashboard router**

Create `src/lib/trpc/routers/dashboard.ts`:
```typescript
import { router, protectedProcedure } from '../init'
import { contracts, contractAlerts } from '@/lib/db/schema'
import { eq, and, count, avg, sql, gte, lte } from 'drizzle-orm'

/** Router do dashboard — estatísticas agregadas da organização */
export const dashboardRouter = router({
  /** Retorna estatísticas gerais do portfólio de contratos */
  stats: protectedProcedure.query(async ({ ctx }) => {
    const orgContracts = await ctx.db
      .select({
        totalContracts: count(),
        avgRiskScore: avg(contracts.riskScore),
        totalMonthlyValue: sql<string>`COALESCE(SUM(${contracts.monthlyValue}::numeric), 0)`,
      })
      .from(contracts)
      .where(eq(contracts.orgId, ctx.orgId))

    /** Conta renovações próximas (nos próximos 90 dias) */
    const now = new Date()
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

    const upcomingRenewals = await ctx.db
      .select({ count: count() })
      .from(contracts)
      .where(and(
        eq(contracts.orgId, ctx.orgId),
        eq(contracts.autoRenew, true),
        gte(contracts.endDate, now),
        lte(contracts.endDate, in90Days),
      ))

    return {
      totalContracts: orgContracts[0]?.totalContracts ?? 0,
      avgRiskScore: orgContracts[0]?.avgRiskScore
        ? Math.round(Number(orgContracts[0].avgRiskScore))
        : null,
      totalMonthlyValue: orgContracts[0]?.totalMonthlyValue ?? '0',
      upcomingRenewals: upcomingRenewals[0]?.count ?? 0,
    }
  }),
})
```

**Step 7: Register routers**

Modify `src/lib/trpc/routers/_app.ts`:
```typescript
import { router } from '../init'
import { contractRouter } from './contract'
import { dashboardRouter } from './dashboard'

export const appRouter = router({
  contract: contractRouter,
  dashboard: dashboardRouter,
})

export type AppRouter = typeof appRouter
```

**Step 8: Connect dashboard to real data**

Update `src/app/(dashboard)/dashboard/page.tsx` para usar `trpc.dashboard.stats.useQuery()` em vez de dados mockados.

**Step 9: Verify build + tests**

```bash
npx vitest run && npm run build
```

**Step 10: Commit**

```bash
git add .
git commit -m "feat: add contract and dashboard tRPC routers with validators"
```

---

## Task 8: Contract Upload + File Storage

**Context:** Criar o componente de upload de contratos (drag & drop), API route para upload de arquivos (Vercel Blob), e UI de criação de contrato.

**Files:**
- Create: `src/app/api/upload/route.ts`
- Create: `src/app/(dashboard)/dashboard/contracts/page.tsx`
- Create: `src/app/(dashboard)/dashboard/contracts/new/page.tsx`
- Create: `src/components/contracts/upload-zone.tsx`
- Create: `src/components/contracts/contract-form.tsx`
- Create: `src/components/contracts/contract-list.tsx`

**Step 1: Install Vercel Blob**

```bash
npm install @vercel/blob
```

**Step 2: Create upload API route**

Create `src/app/api/upload/route.ts` — aceitar multipart/form-data, salvar no Vercel Blob, retornar URL. Validar tipo de arquivo (PDF, DOCX, PNG, JPG), limitar tamanho (10MB).

**Step 3: Create drag & drop upload zone**

Create `src/components/contracts/upload-zone.tsx` — componente com drag & drop, preview do arquivo, progress bar, e estado de sucesso/erro.

**Step 4: Create contract creation form**

Create `src/components/contracts/contract-form.tsx` — formulário com campos: título, categoria (select), contraparte, datas, valores, arquivo. Usa react-hook-form + zod resolver + trpc mutation.

**Step 5: Create contract list page**

Create `src/app/(dashboard)/dashboard/contracts/page.tsx` — lista de contratos com tabela (título, categoria, status, risk score, valor, data de vencimento). Link para "/contracts/new" e para detalhe de cada contrato.

**Step 6: Create new contract page**

Create `src/app/(dashboard)/dashboard/contracts/new/page.tsx` — página com UploadZone + ContractForm. Upload primeiro, depois preencher campos (muitos preenchidos automaticamente pela IA).

**Step 7: Verify upload flow**

```bash
npm run dev
```
Navegar para /dashboard/contracts/new, fazer upload de um PDF de teste.

**Step 8: Commit**

```bash
git add .
git commit -m "feat: add contract upload with drag-and-drop and Vercel Blob storage"
```

---

## Task 9: Contract Processing Engine (Inngest + AI)

**Context:** Criar o motor de processamento de contratos usando Inngest para background jobs. Pipeline: upload → extração de texto → análise por IA → salvar resultados no banco.

**Files:**
- Create: `src/lib/ai/contract-analyzer.ts`
- Create: `src/lib/ai/text-extractor.ts`
- Create: `src/lib/ai/prompts.ts`
- Create: `src/lib/inngest/client.ts`
- Create: `src/lib/inngest/functions/process-contract.ts`
- Create: `src/app/api/inngest/route.ts`
- Test: `src/lib/ai/__tests__/prompts.test.ts`

**Step 1: Create Inngest client**

Create `src/lib/inngest/client.ts`:
```typescript
import { Inngest } from 'inngest'

/** Cliente Inngest para despacho e execução de background jobs */
export const inngest = new Inngest({ id: 'clausent' })
```

**Step 2: Create text extractor**

Create `src/lib/ai/text-extractor.ts` — função que recebe URL do arquivo, detecta tipo (PDF/DOCX/IMG), e extrai texto usando pdf-parse. Para DOCX, usar mammoth. Para imagens, placeholder para OCR (Tesseract futuro).

**Step 3: Create AI prompts**

Create `src/lib/ai/prompts.ts` — prompts estruturados para o GPT-4o:
- `CONTRACT_ANALYSIS_PROMPT`: prompt que recebe texto do contrato e retorna JSON com: title, counterparty, category, startDate, endDate, totalValue, monthlyValue, currency, autoRenew, noticePeriodDays, renewalTerms, clauses (array com type, text, riskLevel), riskScore (0-100), summary.

Teste: verificar que o prompt contém instruções para retornar JSON válido.

**Step 4: Create contract analyzer**

Create `src/lib/ai/contract-analyzer.ts`:
```typescript
import OpenAI from 'openai'
import { CONTRACT_ANALYSIS_PROMPT } from './prompts'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

/**
 * Analisa o texto de um contrato usando GPT-4o.
 * Retorna dados estruturados: partes, datas, valores, cláusulas, riscos.
 */
export async function analyzeContract(extractedText: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: CONTRACT_ANALYSIS_PROMPT },
      { role: 'user', content: extractedText },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Resposta vazia do modelo')

  return JSON.parse(content) as ContractAnalysisResult
}

/** Tipagem do resultado da análise */
export interface ContractAnalysisResult {
  title: string
  counterparty: string
  category: 'saas' | 'vendor' | 'lease' | 'insurance' | 'other'
  startDate: string | null
  endDate: string | null
  totalValue: string | null
  monthlyValue: string | null
  currency: string
  autoRenew: boolean
  noticePeriodDays: number | null
  renewalTerms: string | null
  riskScore: number
  summary: string
  clauses: Array<{
    type: string
    text: string
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
  }>
}
```

**Step 5: Create Inngest process-contract function**

Create `src/lib/inngest/functions/process-contract.ts`:
```typescript
import { inngest } from '../client'
import { db } from '@/lib/db'
import { contracts, contractClauses, contractAlerts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { extractText } from '@/lib/ai/text-extractor'
import { analyzeContract } from '@/lib/ai/contract-analyzer'

/**
 * Background job que processa um contrato recém-uploadado.
 * Pipeline: download arquivo → extração texto → análise IA → salvar resultados.
 */
export const processContract = inngest.createFunction(
  { id: 'process-contract', retries: 3 },
  { event: 'contract/uploaded' },
  async ({ event, step }) => {
    const { contractId, fileUrl } = event.data

    // Passo 1: Extrair texto do arquivo
    const extractedText = await step.run('extract-text', async () => {
      return extractText(fileUrl)
    })

    // Passo 2: Analisar com IA
    const analysis = await step.run('analyze-contract', async () => {
      return analyzeContract(extractedText)
    })

    // Passo 3: Atualizar contrato com resultados
    await step.run('save-results', async () => {
      await db.update(contracts)
        .set({
          title: analysis.title,
          counterparty: analysis.counterparty,
          category: analysis.category,
          startDate: analysis.startDate ? new Date(analysis.startDate) : null,
          endDate: analysis.endDate ? new Date(analysis.endDate) : null,
          totalValue: analysis.totalValue,
          monthlyValue: analysis.monthlyValue,
          currency: analysis.currency,
          autoRenew: analysis.autoRenew,
          noticePeriodDays: analysis.noticePeriodDays,
          renewalTerms: analysis.renewalTerms,
          riskScore: analysis.riskScore,
          extractedText,
          aiSummary: analysis,
          processingStatus: 'completed',
          updatedAt: new Date(),
        })
        .where(eq(contracts.id, contractId))
    })

    // Passo 4: Salvar cláusulas extraídas
    await step.run('save-clauses', async () => {
      if (analysis.clauses.length > 0) {
        await db.insert(contractClauses).values(
          analysis.clauses.map((clause) => ({
            contractId,
            clauseType: clause.type,
            text: clause.text,
            riskLevel: clause.riskLevel,
          }))
        )
      }
    })

    // Passo 5: Criar alertas de renovação se aplicável
    await step.run('create-alerts', async () => {
      if (analysis.endDate) {
        const endDate = new Date(analysis.endDate)
        const alertDays = [90, 60, 30, 15, 7]

        const alertValues = alertDays
          .map((days) => {
            const triggerDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)
            if (triggerDate > new Date()) {
              return {
                contractId,
                type: `renewal_${days}d`,
                triggerDate,
              }
            }
            return null
          })
          .filter(Boolean)

        if (alertValues.length > 0) {
          await db.insert(contractAlerts).values(alertValues as any)
        }
      }
    })

    return { success: true, contractId }
  }
)
```

**Step 6: Create Inngest API route**

Create `src/app/api/inngest/route.ts`:
```typescript
import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest/client'
import { processContract } from '@/lib/inngest/functions/process-contract'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processContract],
})
```

**Step 7: Trigger processing after upload**

Modify `src/lib/trpc/routers/contract.ts` — no mutation `create`, após inserir o contrato, enviar evento para o Inngest:
```typescript
import { inngest } from '@/lib/inngest/client'

// ... dentro do create mutation, após inserir:
if (contract.originalFileUrl) {
  await inngest.send({
    name: 'contract/uploaded',
    data: { contractId: contract.id, fileUrl: contract.originalFileUrl },
  })
}
```

**Step 8: Run tests + verify build**

```bash
npx vitest run && npm run build
```

**Step 9: Commit**

```bash
git add .
git commit -m "feat: add contract processing engine with Inngest and OpenAI"
```

---

## Task 10: Contract Detail Page

**Context:** Criar a página de detalhe de um contrato com todas as informações extraídas, cláusulas com destaque de risco, e ações (editar, deletar, gerar pacote de renegociação).

**Files:**
- Create: `src/app/(dashboard)/dashboard/contracts/[contractId]/page.tsx`
- Create: `src/components/contracts/contract-detail.tsx`
- Create: `src/components/contracts/clause-list.tsx`
- Create: `src/components/contracts/risk-badge.tsx`
- Create: `src/components/contracts/contract-status-badge.tsx`

**Step 1: Create risk badge component**

Create `src/components/contracts/risk-badge.tsx` — badge colorido baseado no risk score:
- 0-25: verde (Low Risk)
- 26-50: amarelo (Medium Risk)
- 51-75: laranja (High Risk)
- 76-100: vermelho (Critical Risk)

**Step 2: Create clause list component**

Create `src/components/contracts/clause-list.tsx` — lista de cláusulas com ícone de risco, tipo, e texto. Cláusulas de alto risco destacadas com border vermelha.

**Step 3: Create contract detail component**

Create `src/components/contracts/contract-detail.tsx` — card com:
- Header: título, status badge, risk score badge
- Grid de informações: contraparte, datas, valores, auto-renovação, notice period
- Seção de cláusulas (ClauseList)
- Seção de alertas agendados
- Botões de ação: Edit, Delete, Generate Renegotiation Package

**Step 4: Create detail page**

Create `src/app/(dashboard)/dashboard/contracts/[contractId]/page.tsx` — busca contrato via `trpc.contract.getById`, renderiza ContractDetail. Loading state com skeleton. 404 se não encontrar.

**Step 5: Verify page**

```bash
npm run dev
```
Navegar para detalhe de um contrato, verificar exibição.

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add contract detail page with risk analysis and clauses"
```

---

## Task 11: Alert System

**Context:** Criar o sistema de alertas com cron job diário (Inngest), notificações in-app, e envio de emails via Resend.

**Files:**
- Create: `src/lib/inngest/functions/check-alerts.ts`
- Create: `src/lib/email/templates/alert-notification.ts`
- Create: `src/lib/email/resend.ts`
- Create: `src/app/(dashboard)/dashboard/alerts/page.tsx`
- Create: `src/components/alerts/alert-list.tsx`
- Create: `src/lib/trpc/routers/alert.ts`
- Modify: `src/app/api/inngest/route.ts` — registrar nova função
- Modify: `src/lib/trpc/routers/_app.ts` — adicionar alert router

**Step 1: Create Resend email client**

Create `src/lib/email/resend.ts` — wrapper do Resend com função `sendEmail(to, subject, html)`.

**Step 2: Create alert email template**

Create `src/lib/email/templates/alert-notification.ts` — template HTML para email de alerta de renovação. Inclui: nome do contrato, data de renovação, dias restantes, link para o dashboard.

**Step 3: Create check-alerts cron function**

Create `src/lib/inngest/functions/check-alerts.ts` — cron job que roda diariamente:
1. Busca todos os alertas com `triggerDate <= hoje` e `sentAt IS NULL`
2. Para cada alerta, envia email via Resend
3. Marca alerta como enviado (`sentAt = now()`)

**Step 4: Register cron in Inngest route**

Modify `src/app/api/inngest/route.ts` — adicionar checkAlerts às functions.

**Step 5: Create alert tRPC router**

Create `src/lib/trpc/routers/alert.ts` — procedures:
- `list`: lista alertas da organização (com dados do contrato)
- `dismiss`: marca alerta como dispensado
- `upcoming`: retorna alertas dos próximos 30 dias

**Step 6: Create alerts page**

Create `src/app/(dashboard)/dashboard/alerts/page.tsx` — lista de alertas com filtros (todos, pendentes, enviados), ordenados por data. Cada alerta mostra: contrato, tipo, data, status, ação (dismiss/view contract).

**Step 7: Verify build + tests**

```bash
npx vitest run && npm run build
```

**Step 8: Commit**

```bash
git add .
git commit -m "feat: add alert system with daily cron and email notifications"
```

---

## Task 12: Benchmarks Engine

**Context:** Criar o motor de benchmarks que compara os termos do contrato do usuário com dados agregados anônimos de outros contratos na plataforma.

**Files:**
- Create: `src/lib/ai/benchmark-engine.ts`
- Create: `src/lib/trpc/routers/benchmark.ts`
- Create: `src/app/(dashboard)/dashboard/benchmarks/page.tsx`
- Create: `src/components/benchmarks/benchmark-card.tsx`
- Create: `src/components/benchmarks/benchmark-chart.tsx`
- Modify: `src/lib/trpc/routers/_app.ts`
- Test: `src/lib/ai/__tests__/benchmark-engine.test.ts`

**Step 1: Write benchmark engine test**

Create `src/lib/ai/__tests__/benchmark-engine.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { calculatePercentile, generateBenchmarkInsight } from '../benchmark-engine'

describe('Benchmark Engine', () => {
  it('deve calcular percentil corretamente', () => {
    const values = [10, 20, 30, 40, 50]
    expect(calculatePercentile(30, values)).toBe(50)
    expect(calculatePercentile(10, values)).toBe(10)
    expect(calculatePercentile(50, values)).toBe(90)
  })

  it('deve gerar insight quando valor está acima da média', () => {
    const insight = generateBenchmarkInsight({
      metric: 'monthly_cost',
      yourValue: 150,
      marketAvg: 100,
      percentile: 80,
    })
    expect(insight).toContain('above')
  })

  it('deve gerar insight quando valor está abaixo da média', () => {
    const insight = generateBenchmarkInsight({
      metric: 'monthly_cost',
      yourValue: 50,
      marketAvg: 100,
      percentile: 20,
    })
    expect(insight).toContain('below')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/ai/__tests__/benchmark-engine.test.ts
```

**Step 3: Implement benchmark engine**

Create `src/lib/ai/benchmark-engine.ts` — funções:
- `calculatePercentile(value, allValues)`: calcula em que percentil o valor está
- `generateBenchmarkInsight(data)`: gera texto descritivo do benchmark
- `getBenchmarksForContract(contractId, db)`: busca contratos similares (mesma categoria), calcula benchmarks de preço/termos, salva resultados

**Step 4: Run tests**

```bash
npx vitest run src/lib/ai/__tests__/benchmark-engine.test.ts
```
Expected: PASS

**Step 5: Create benchmark tRPC router**

Create `src/lib/trpc/routers/benchmark.ts` — procedures:
- `getForContract`: retorna benchmarks de um contrato específico
- `summary`: retorna resumo geral dos benchmarks da organização

**Step 6: Create benchmarks page**

Create `src/app/(dashboard)/dashboard/benchmarks/page.tsx` — grid de cards com benchmarks por contrato. Cada card mostra: métrica, seu valor, média do mercado, percentil, insight textual. Gráfico de barras comparativo.

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add market benchmarks engine with comparison analytics"
```

---

## Task 13: Renegotiation Package

**Context:** Criar o gerador de pacotes de renegociação usando IA. O pacote inclui pontos de renegociação priorizados, argumentos baseados em benchmarks, e draft de email.

**Files:**
- Create: `src/lib/ai/renegotiation-generator.ts`
- Create: `src/lib/trpc/routers/renegotiation.ts`
- Create: `src/app/(dashboard)/dashboard/contracts/[contractId]/renegotiate/page.tsx`
- Create: `src/components/contracts/renegotiation-package.tsx`
- Modify: `src/lib/trpc/routers/_app.ts`

**Step 1: Create renegotiation generator**

Create `src/lib/ai/renegotiation-generator.ts` — função que:
1. Recebe contrato + cláusulas + benchmarks
2. Envia para GPT-4o com prompt específico para renegociação
3. Retorna: pontos de renegociação priorizados, argumentos sugeridos, draft de email, estimativa de economia

**Step 2: Create renegotiation tRPC router**

Create `src/lib/trpc/routers/renegotiation.ts` — procedures:
- `generate`: gera novo pacote de renegociação para um contrato
- `getForContract`: retorna pacote existente
- `updateDraft`: permite editar o draft de email

**Step 3: Create renegotiation page**

Create `src/app/(dashboard)/dashboard/contracts/[contractId]/renegotiate/page.tsx` — página com:
- Resumo do contrato atual
- Lista de pontos de renegociação priorizados (drag to reorder)
- Argumentos para cada ponto
- Draft de email editável
- Estimativa de economia
- Botão "Copy Email" e "Download PDF"

**Step 4: Verify flow**

```bash
npm run dev
```
Navegar para contrato → "Generate Renegotiation Package" → verificar geração.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add AI-powered renegotiation package generator"
```

---

## Task 14: Stripe Billing

**Context:** Integrar Stripe para gerenciar assinaturas (Starter/Professional/Business), checkout, portal de billing, e webhooks.

**Files:**
- Create: `src/lib/stripe/config.ts`
- Create: `src/lib/stripe/checkout.ts`
- Create: `src/app/api/stripe/checkout/route.ts`
- Create: `src/app/api/stripe/portal/route.ts`
- Create: `src/app/api/webhooks/stripe/route.ts`
- Create: `src/app/(dashboard)/dashboard/billing/page.tsx`
- Create: `src/components/billing/plan-card.tsx`
- Create: `src/components/billing/current-plan.tsx`
- Test: `src/lib/stripe/__tests__/config.test.ts`

**Step 1: Create Stripe config**

Create `src/lib/stripe/config.ts` — inicializar Stripe SDK, definir constantes de planos:
```typescript
export const PLANS = {
  starter: { name: 'Starter', price: 2900, contracts: 25, priceId: process.env.STRIPE_STARTER_PRICE_ID! },
  professional: { name: 'Professional', price: 5900, contracts: 100, priceId: process.env.STRIPE_PRO_PRICE_ID! },
  business: { name: 'Business', price: 9900, contracts: 500, priceId: process.env.STRIPE_BIZ_PRICE_ID! },
} as const
```

**Step 2: Create checkout session handler**

Create `src/app/api/stripe/checkout/route.ts` — cria sessão de checkout Stripe com o plano selecionado, redirect para dashboard após sucesso.

**Step 3: Create customer portal handler**

Create `src/app/api/stripe/portal/route.ts` — cria sessão do portal Stripe para gerenciar assinatura existente.

**Step 4: Create Stripe webhook**

Create `src/app/api/webhooks/stripe/route.ts` — processa eventos:
- `checkout.session.completed`: ativa plano, salva stripe_customer_id e stripe_subscription_id
- `customer.subscription.updated`: atualiza plano
- `customer.subscription.deleted`: downgrade para starter

**Step 5: Create billing page**

Create `src/app/(dashboard)/dashboard/billing/page.tsx` — mostra plano atual, cards dos planos disponíveis para upgrade, botão "Manage Subscription" (portal Stripe).

**Step 6: Write config test**

```typescript
import { describe, it, expect } from 'vitest'
import { PLANS } from '../config'

describe('Stripe Config', () => {
  it('deve ter 3 planos configurados', () => {
    expect(Object.keys(PLANS)).toHaveLength(3)
  })

  it('deve ter preços corretos em centavos', () => {
    expect(PLANS.starter.price).toBe(2900)
    expect(PLANS.professional.price).toBe(5900)
    expect(PLANS.business.price).toBe(9900)
  })

  it('deve ter limites de contratos corretos', () => {
    expect(PLANS.starter.contracts).toBe(25)
    expect(PLANS.professional.contracts).toBe(100)
    expect(PLANS.business.contracts).toBe(500)
  })
})
```

**Step 7: Run tests + verify build**

```bash
npx vitest run && npm run build
```

**Step 8: Commit**

```bash
git add .
git commit -m "feat: add Stripe billing with subscriptions and webhook processing"
```

---

## Task 15: Settings + Audit Log

**Context:** Criar páginas de configuração da organização e visualização do audit log.

**Files:**
- Create: `src/app/(dashboard)/dashboard/settings/page.tsx`
- Create: `src/app/(dashboard)/dashboard/settings/organization/page.tsx`
- Create: `src/components/settings/organization-form.tsx`
- Create: `src/lib/trpc/routers/organization.ts`
- Create: `src/lib/trpc/routers/audit.ts`
- Modify: `src/lib/trpc/routers/_app.ts`

**Step 1: Create organization tRPC router**

Procedures: `get` (dados da org), `update` (nome, configurações de alerta).

**Step 2: Create audit log tRPC router**

Procedures: `list` (paginado, filtros por tipo de ação e período).

**Step 3: Create settings page**

Tabs: General (nome da org), Alerts (configurar dias de alerta padrão), Billing (link para página de billing).

**Step 4: Create organization form**

Form para editar nome da organização e preferências de alerta.

**Step 5: Add audit log helper**

Create helper `logAuditAction(db, orgId, userId, action, details)` e adicionar chamadas nos mutations existentes (create/update/delete contract, generate renegotiation).

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add settings pages and audit log tracking"
```

---

## Task 16: SEO + Polish

**Context:** Adicionar metadata SEO, sitemap, robots.txt, e polir a UI final.

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Modify: `src/app/layout.tsx` — metadata completo
- Modify: `src/app/(marketing)/page.tsx` — metadata específico

**Step 1: Add SEO metadata**

Adicionar Open Graph, Twitter cards, e metadata descritivos em todas as páginas públicas.

**Step 2: Create sitemap**

Create `src/app/sitemap.ts` — retorna URLs públicas (/, /pricing).

**Step 3: Create robots.txt**

Create `src/app/robots.ts` — permitir crawling das páginas públicas, bloquear /dashboard e /api.

**Step 4: Polish UI**

- Verificar responsividade em mobile
- Verificar dark mode (se habilitado)
- Verificar loading states e error states
- Verificar acessibilidade básica (alt texts, aria labels)

**Step 5: Run full test suite**

```bash
npx vitest run
npm run build
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add SEO metadata, sitemap, and robots.txt"
```

---

## Task 17: Final Testing + Documentation

**Context:** Rodar todos os testes, verificar que tudo funciona end-to-end, e atualizar documentação.

**Files:**
- Modify: `docs/plans/2026-02-26-clausent-design.md` — marcar como implementado
- Create: `.env.example` — atualizar com todas as variáveis necessárias

**Step 1: Run full test suite**

```bash
npx vitest run
```
Expected: todos os testes passam

**Step 2: Verify build**

```bash
npm run build
```
Expected: build sem erros

**Step 3: Run dev server and test manually**

```bash
npm run dev
```

Testar fluxo completo:
1. Landing page renderiza corretamente
2. Sign up / Sign in funciona
3. Dashboard carrega com dados
4. Upload de contrato funciona
5. Processamento de contrato (Inngest) executa
6. Detalhe do contrato mostra análise
7. Alertas são exibidos
8. Benchmarks são calculados
9. Pacote de renegociação é gerado
10. Billing funciona (Stripe test mode)
11. Settings podem ser editados

**Step 4: Final commit**

```bash
git add .
git commit -m "chore: finalize MVP with testing and documentation updates"
```

---

## Resumo das Tasks

| # | Task | Arquivos Principais |
|---|---|---|
| 1 | Project Scaffolding | package.json, tsconfig, configs |
| 2 | Database Schema | src/lib/db/schema/*.ts |
| 3 | Authentication (Clerk) | middleware.ts, webhook, auth pages |
| 4 | tRPC Setup | src/lib/trpc/*.ts, providers |
| 5 | Landing Page | src/app/(marketing)/*, components |
| 6 | Dashboard Layout | src/app/(dashboard)/*, sidebar, header |
| 7 | Contract Router + Dashboard Data | tRPC routers, validators |
| 8 | Contract Upload + Storage | upload API, drag-drop, Vercel Blob |
| 9 | Processing Engine (Inngest + AI) | Inngest functions, AI analyzers |
| 10 | Contract Detail Page | detail page, clauses, risk badges |
| 11 | Alert System | cron job, email, alert pages |
| 12 | Benchmarks Engine | benchmark calculator, analytics |
| 13 | Renegotiation Package | AI generator, editable draft |
| 14 | Stripe Billing | checkout, portal, webhooks |
| 15 | Settings + Audit Log | org settings, audit trail |
| 16 | SEO + Polish | sitemap, robots, metadata |
| 17 | Final Testing + Docs | full test suite, verification |

**Dependências entre tasks:**
- Tasks 1-4: sequenciais (fundação)
- Tasks 5-6: podem ser paralelas (UI independente)
- Tasks 7-10: sequenciais (contrato → upload → processamento → detalhe)
- Tasks 11-13: podem ser paralelas (features independentes, dependem de 7-10)
- Task 14: independente (pode rodar em paralelo com 11-13)
- Tasks 15-17: finais, dependem de todas as anteriores
