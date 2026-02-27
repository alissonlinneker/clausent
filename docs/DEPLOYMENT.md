# Clausent — Deployment Guide

Complete guide for setting up, configuring, and deploying Clausent to production.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Environment Variables](#2-environment-variables)
3. [Local Development](#3-local-development)
4. [Database Setup](#4-database-setup)
5. [Authentication](#5-authentication)
6. [Payment Setup](#6-payment-setup)
7. [Email Setup](#7-email-setup)
8. [Deployment to Vercel](#8-deployment-to-vercel)
9. [Post-Deployment Checklist](#9-post-deployment-checklist)
10. [Monitoring & Maintenance](#10-monitoring--maintenance)

---

## 1. Prerequisites

Before starting, ensure you have the following installed and configured:

### Required Software

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20+ | Runtime |
| npm | 10+ | Package manager |
| Git | 2.40+ | Version control |

### Required Accounts

| Service | Purpose | Signup |
|---------|---------|--------|
| [Neon](https://neon.tech) | PostgreSQL database (serverless) | Free tier available |
| [Stripe](https://stripe.com) | Payments & subscriptions | Test mode for development |
| [Resend](https://resend.com) | Transactional emails | Free tier (100 emails/day) |
| [Vercel](https://vercel.com) | Hosting & deployment | Free tier for hobby projects |
| [AWS](https://aws.amazon.com) | S3 (file storage), SQS (queues), Textract (OCR) | Free tier for 12 months |
| [Cloudflare](https://cloudflare.com) | Turnstile CAPTCHA | Free |

### Optional Accounts

| Service | Purpose | Notes |
|---------|---------|-------|
| [DeepSeek](https://platform.deepseek.com) | AI contract analysis | Required for analysis features |
| [Perplexity](https://docs.perplexity.ai) | Contextual search | Optional enhancement |

---

## 2. Environment Variables

Create a `.env.local` file in the project root. **Never commit this file.**

A template is available at `.env.example`.

### Complete Variable Reference

```bash
# ==============================================
# App Configuration
# ==============================================

# Public URL of the application (no trailing slash)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ==============================================
# Database (Neon PostgreSQL)
# ==============================================

# PostgreSQL connection string from Neon dashboard
# Format: postgresql://user:password@host/database?sslmode=require
DATABASE_URL=

# ==============================================
# Authentication (Better Auth)
# ==============================================

# Secret key for signing sessions/tokens (min 64 characters)
# Generate with: openssl rand -base64 64
BETTER_AUTH_SECRET=

# Base URL for auth callbacks (same as NEXT_PUBLIC_APP_URL)
BETTER_AUTH_URL=http://localhost:3000

# ==============================================
# Payments (Stripe)
# ==============================================

# Stripe API keys (use test keys for development)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Webhook signing secret (from Stripe dashboard or CLI)
STRIPE_WEBHOOK_SECRET=

# Price IDs for subscription plans (created in Stripe dashboard)
STRIPE_PRICE_STARTER_MONTHLY=
STRIPE_PRICE_STARTER_YEARLY=
STRIPE_PRICE_PROFESSIONAL_MONTHLY=
STRIPE_PRICE_PROFESSIONAL_YEARLY=
STRIPE_PRICE_BUSINESS_MONTHLY=
STRIPE_PRICE_BUSINESS_YEARLY=

# ==============================================
# AWS Services
# ==============================================

# IAM credentials with S3, SQS, and Textract permissions
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# AWS region for all services
AWS_REGION=us-east-1

# S3 bucket for contract file uploads
AWS_S3_BUCKET=clausent-uploads

# SQS queue URL for async analysis jobs
AWS_SQS_ANALYSIS_QUEUE_URL=

# ==============================================
# Email (Resend)
# ==============================================

# Resend API key
RESEND_API_KEY=

# Sender email address (must be verified domain in Resend)
EMAIL_FROM=noreply@clausent.com

# ==============================================
# AI Services
# ==============================================

# DeepSeek API key for contract analysis
DEEPSEEK_API_KEY=

# Perplexity API key for contextual search (optional)
PERPLEXITY_API_KEY=

# ==============================================
# Security (Cloudflare Turnstile)
# ==============================================

# Turnstile site key (public, used in frontend)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=

# Turnstile secret key (server-side verification)
TURNSTILE_SECRET_KEY=
```

---

## 3. Local Development

### Clone and Install

```bash
git clone <repository-url> clausent
cd clausent
npm install
```

### Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

### Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests in watch mode (Vitest) |
| `npm run test:run` | Run tests once |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:push` | Push schema directly (dev only) |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |

---

## 4. Database Setup

Clausent uses **Neon PostgreSQL** with **Drizzle ORM**.

### Create Database on Neon

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project (e.g., `clausent-prod`)
3. Copy the connection string to `DATABASE_URL` in `.env.local`

### Apply Schema

For initial setup or development:

```bash
# Push schema directly to database (quick, no migration files)
npm run db:push
```

For production deployments:

```bash
# Generate migration files from schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate
```

### Inspect Database

```bash
# Open Drizzle Studio — web-based database GUI
npm run db:studio
```

### Branching (Neon Feature)

Neon supports database branching for preview deployments:

- Create a branch per PR for isolated testing
- Branches share the same schema but have separate data
- Configure in Neon dashboard under "Branches"

---

## 5. Authentication

Clausent uses **Better Auth** for authentication.

### Configuration

Better Auth is configured in `src/lib/auth/index.ts`:

- Email/password authentication with required email verification
- Session duration: 7 days with daily renewal
- Drizzle adapter for PostgreSQL

### Required Environment Variables

```bash
# Generate a secure secret (minimum 64 characters)
openssl rand -base64 64
```

Set the generated value as `BETTER_AUTH_SECRET`.

Set `BETTER_AUTH_URL` to the full URL of your deployment (e.g., `https://app.clausent.com`).

### Email Verification Flow

1. User registers with email/password
2. Verification email is sent via Resend
3. User clicks verification link
4. Account is activated and user can log in

---

## 6. Payment Setup

Clausent uses **Stripe** for subscription management.

### Stripe Dashboard Configuration

#### 1. Create Products and Prices

Create three subscription products in Stripe:

| Product | Monthly Price | Yearly Price |
|---------|--------------|--------------|
| Starter | $29/mo | $290/yr |
| Professional | $79/mo | $790/yr |
| Business | $199/mo | $1,990/yr |

Copy each Price ID (`price_...`) to the corresponding environment variable.

#### 2. Configure Webhooks

In the Stripe Dashboard, create a webhook endpoint:

- **URL:** `https://your-domain.com/api/webhooks/stripe`
- **Events to listen for:**
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

Copy the webhook signing secret (`whsec_...`) to `STRIPE_WEBHOOK_SECRET`.

#### 3. Local Webhook Testing

Use the Stripe CLI to forward webhooks to your local server:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI will output a webhook signing secret for local testing.

### Customer Portal

Stripe Customer Portal is used for subscription management (upgrade, downgrade, cancel). Configure the portal in Stripe Dashboard under "Settings > Customer Portal":

- Enable subscription cancellation
- Enable plan switching
- Set up branding (logo, colors)

---

## 7. Email Setup

Clausent uses **Resend** for transactional emails.

### Domain Verification

1. Sign up at [resend.com](https://resend.com)
2. Go to "Domains" and add your domain (e.g., `clausent.com`)
3. Add the DNS records provided by Resend:
   - **SPF** record (TXT)
   - **DKIM** record (CNAME)
   - **DMARC** record (TXT, recommended)
4. Wait for verification (usually 5-30 minutes)

### Sender Configuration

After domain verification, update `EMAIL_FROM` to use your verified domain:

```bash
EMAIL_FROM=Clausent <noreply@clausent.com>
```

### Email Templates

Email templates are located in `src/lib/email/templates/`:

| Template | File | Trigger |
|----------|------|---------|
| Welcome | `welcome.ts` | After email verification |
| Renewal Alert | `renewal-alert.ts` | Contract renewal approaching |
| Analysis Complete | `analysis-complete.ts` | AI analysis finished |
| Weekly Digest | `weekly-digest.ts` | Weekly cron job |
| Alert Notification | `alert-notification.ts` | Generic contract alert |

### Development Mode

When `RESEND_API_KEY` is not set, the email sender logs messages to the console instead of sending. This is the default behavior in local development.

---

## 8. Deployment to Vercel

### Project Setup

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Vercel will auto-detect Next.js and configure build settings

### Build Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |
| Node.js Version | 20.x |

### Environment Variables

Add **all** environment variables from Section 2 to Vercel:

1. Go to Project Settings > Environment Variables
2. Add each variable for the appropriate environment (Production, Preview, Development)
3. For `NEXT_PUBLIC_APP_URL`, use the actual production URL (e.g., `https://app.clausent.com`)
4. For `BETTER_AUTH_URL`, use the same value as `NEXT_PUBLIC_APP_URL`

### Custom Domain

1. Go to Project Settings > Domains
2. Add your custom domain (e.g., `app.clausent.com`)
3. Configure DNS records as instructed by Vercel
4. SSL is automatically provisioned

### Preview Deployments

Vercel creates preview deployments for every PR. Consider:

- Using Neon branching for isolated database per preview
- Using Stripe test mode keys for preview environments
- Setting `NEXT_PUBLIC_APP_URL` to the preview URL dynamically

---

## 9. Post-Deployment Checklist

Run through this checklist after deploying to production:

### Core Functionality

- [ ] Landing page loads correctly
- [ ] User registration works (email sent, verification link valid)
- [ ] User login works (session created, redirected to dashboard)
- [ ] Password reset flow works end-to-end
- [ ] Protected routes redirect unauthenticated users

### Payments

- [ ] Stripe checkout flow works for each plan
- [ ] Webhook endpoint receives events (check Stripe Dashboard > Webhooks)
- [ ] Customer portal loads (manage subscription)
- [ ] Subscription limits are enforced correctly

### Email

- [ ] Verification email arrives in inbox (not spam)
- [ ] Welcome email is sent after verification
- [ ] Password reset email contains valid link
- [ ] Renewal alerts are sent on schedule
- [ ] Check SPF/DKIM/DMARC pass in email headers

### File Upload & Analysis

- [ ] Contract upload to S3 works
- [ ] SQS queue receives analysis jobs
- [ ] AI analysis completes and results are stored
- [ ] Analysis complete email is sent to user

### Security

- [ ] HTTPS is enforced (no HTTP access)
- [ ] Turnstile CAPTCHA works on registration/login
- [ ] Environment variables are not exposed in client bundle
- [ ] CORS is properly configured
- [ ] Rate limiting is active on sensitive endpoints

### Performance

- [ ] Lighthouse score > 90 on landing page
- [ ] Core Web Vitals pass (LCP, FID, CLS)
- [ ] Database queries are performant (check Neon dashboard)

---

## 10. Monitoring & Maintenance

### Vercel Analytics

Enable Vercel Analytics in project settings for:

- Real-time traffic monitoring
- Web Vitals tracking
- Error rate monitoring
- Deployment success/failure tracking

### Database Monitoring

Neon provides built-in monitoring:

- Query performance (slow query log)
- Connection count
- Storage usage
- Compute utilization

### Stripe Monitoring

Monitor in Stripe Dashboard:

- Failed payments and retry status
- Webhook delivery success rate
- Subscription churn metrics
- Revenue dashboard (MRR, ARR)

### Error Tracking

Consider adding an error tracking service:

- **Sentry** — real-time error tracking with source maps
- **LogRocket** — session replay and error context

### Backup Strategy

- **Database:** Neon provides automatic point-in-time recovery (PITR) with 7-day retention on Pro plan
- **File Storage:** Enable S3 versioning on the uploads bucket
- **Code:** GitHub serves as the source of truth

### Routine Maintenance

| Task | Frequency | Description |
|------|-----------|-------------|
| Dependency updates | Weekly | Run `npm audit` and update packages |
| Database migrations | Per release | Review and apply schema changes |
| Stripe webhook health | Weekly | Check webhook delivery in Stripe Dashboard |
| SSL certificate | Automatic | Managed by Vercel (auto-renewal) |
| Log review | Daily | Check Vercel logs for errors/anomalies |
| Cost monitoring | Monthly | Review Neon, Vercel, AWS, Stripe costs |

### Scaling Considerations

As traffic grows:

1. **Database:** Neon auto-scales compute; consider read replicas for heavy read workloads
2. **File Storage:** S3 scales automatically; monitor transfer costs
3. **Email:** Upgrade Resend plan based on volume
4. **Vercel:** Edge Functions for latency-sensitive endpoints; consider Enterprise plan for high traffic
5. **AI Analysis:** Queue-based processing (SQS) ensures consistent throughput under load
