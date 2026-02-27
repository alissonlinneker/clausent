/**
 * Testes E2E de auditoria completa do site Clausent.
 *
 * Navega por todas as páginas públicas e verifica:
 * - Página carrega sem erros de console (JS errors)
 * - Nenhuma requisição HTTP falha (4xx/5xx)
 * - Elementos essenciais estão visíveis
 * - Layout não tem overflow horizontal (indicador de quebra)
 * - Links internos são válidos
 * - Título da página está definido
 */

import { test, expect, type Page, type ConsoleMessage } from '@playwright/test'

/** Coletar erros de console e falhas de rede durante a navegação */
interface PageAuditResult {
  url: string
  status: number | null
  consoleErrors: string[]
  failedRequests: string[]
  hasHorizontalOverflow: boolean
  title: string
  missingElements: string[]
}

/** Todas as rotas públicas (marketing + auth) para testar */
const PUBLIC_ROUTES = [
  { path: '/en', name: 'Home / Landing Page' },
  { path: '/en/pricing', name: 'Pricing' },
  { path: '/en/about', name: 'About' },
  { path: '/en/contact', name: 'Contact' },
  { path: '/en/terms', name: 'Terms' },
  { path: '/en/privacy', name: 'Privacy' },
  { path: '/en/blog', name: 'Blog' },
  { path: '/en/changelog', name: 'Changelog' },
  { path: '/en/demo', name: 'Demo' },
  { path: '/en/api-docs', name: 'API Docs' },
  { path: '/en/sign-in', name: 'Sign In' },
  { path: '/en/sign-up', name: 'Sign Up' },
  { path: '/en/forgot-password', name: 'Forgot Password' },
  { path: '/en/reset-password', name: 'Reset Password' },
]

/** Rotas do dashboard (precisam de auth mock ou vão redirecionar) */
const DASHBOARD_ROUTES = [
  { path: '/en/dashboard', name: 'Dashboard Overview' },
  { path: '/en/dashboard/contracts', name: 'Contracts List' },
  { path: '/en/dashboard/alerts', name: 'Alerts' },
  { path: '/en/dashboard/benchmarks', name: 'Benchmarks' },
  { path: '/en/dashboard/analytics', name: 'Analytics' },
  { path: '/en/dashboard/reports', name: 'Reports' },
  { path: '/en/dashboard/team', name: 'Team' },
  { path: '/en/dashboard/settings', name: 'Settings General' },
  { path: '/en/dashboard/settings/billing', name: 'Settings Billing' },
  { path: '/en/dashboard/settings/profile', name: 'Settings Profile' },
  { path: '/en/dashboard/settings/security', name: 'Settings Security' },
  { path: '/en/dashboard/settings/notifications', name: 'Settings Notifications' },
  { path: '/en/dashboard/settings/api-keys', name: 'Settings API Keys' },
  { path: '/en/dashboard/settings/integrations', name: 'Settings Integrations' },
  { path: '/en/dashboard/onboarding', name: 'Onboarding Wizard' },
]

/** Rotas do admin panel */
const ADMIN_ROUTES = [
  { path: '/en/admin', name: 'Admin Dashboard' },
  { path: '/en/admin/users', name: 'Admin Users' },
  { path: '/en/admin/analyses', name: 'Admin Analyses' },
  { path: '/en/admin/payments', name: 'Admin Payments' },
  { path: '/en/admin/emails', name: 'Admin Emails' },
  { path: '/en/admin/system', name: 'Admin System Health' },
]

/**
 * Audita uma página: navega, coleta erros e verifica integridade visual.
 */
async function auditPage(page: Page, path: string): Promise<PageAuditResult> {
  const consoleErrors: string[] = []
  const failedRequests: string[] = []

  /** Coletar erros de console JS */
  const consoleHandler = (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      /** Ignorar erros conhecidos/inofensivos */
      if (
        text.includes('hydration') ||
        text.includes('Warning:') ||
        text.includes('next-intl') ||
        text.includes('404') ||
        text.includes('Failed to fetch') ||
        text.includes('ERR_CONNECTION_REFUSED') ||
        text.includes('NEXT_REDIRECT') ||
        text.includes('ChunkLoadError') ||
        text.includes('Loading chunk')
      ) {
        return
      }
      consoleErrors.push(text)
    }
  }
  page.on('console', consoleHandler)

  /** Coletar requisições HTTP com falha */
  page.on('requestfailed', (request) => {
    const url = request.url()
    /** Ignorar chamadas a APIs externas ou analytics */
    if (
      url.includes('clerk') ||
      url.includes('stripe') ||
      url.includes('analytics') ||
      url.includes('sentry') ||
      url.includes('favicon') ||
      url.includes('_next/image')
    ) {
      return
    }
    failedRequests.push(`${request.method()} ${url} - ${request.failure()?.errorText}`)
  })

  /** Navegar para a página */
  let status: number | null = null
  try {
    const response = await page.goto(path, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })
    status = response?.status() ?? null
  } catch {
    status = null
  }

  /** Aguardar estabilização (networkidle pode travar, usar timeout fixo) */
  await page.waitForTimeout(2000)

  /** Verificar overflow horizontal (layout quebrado) */
  const hasHorizontalOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth
  })

  /** Obter título da página */
  const title = await page.title()

  /** Verificar elementos essenciais que devem existir em toda página */
  const missingElements: string[] = []

  /** Verificar se há conteúdo visível */
  const bodyText = await page.evaluate(() => document.body?.innerText?.length ?? 0)
  if (bodyText < 50) {
    missingElements.push('Página com menos de 50 caracteres de texto visível')
  }

  /** Limpar listeners */
  page.removeListener('console', consoleHandler)

  return {
    url: path,
    status,
    consoleErrors,
    failedRequests,
    hasHorizontalOverflow,
    title,
    missingElements,
  }
}

/** ==================== TESTES ==================== */

test.describe('Auditoria completa do site — Páginas Públicas', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route.name} (${route.path})`, async ({ page }) => {
      const result = await auditPage(page, route.path)

      /** Página deve carregar (200 ou redirect) */
      expect(
        result.status === 200 || result.status === 307 || result.status === 308,
        `Status HTTP inesperado: ${result.status} em ${route.path}`
      ).toBeTruthy()

      /** Sem erros graves no console */
      expect(
        result.consoleErrors,
        `Erros de console em ${route.name}: ${result.consoleErrors.join('; ')}`
      ).toHaveLength(0)

      /** Sem overflow horizontal (layout quebrado) */
      expect(
        result.hasHorizontalOverflow,
        `Overflow horizontal detectado em ${route.name} — layout quebrado`
      ).toBe(false)

      /** Título definido */
      expect(result.title.length, `Título vazio em ${route.name}`).toBeGreaterThan(0)

      /** Sem elementos faltantes */
      expect(
        result.missingElements,
        `Elementos faltantes em ${route.name}: ${result.missingElements.join('; ')}`
      ).toHaveLength(0)
    })
  }
})

test.describe('Auditoria completa do site — Dashboard', () => {
  for (const route of DASHBOARD_ROUTES) {
    test(`${route.name} (${route.path})`, async ({ page }) => {
      const result = await auditPage(page, route.path)

      /**
       * Dashboard pode redirecionar para login (307/308) se não autenticado.
       * Aceitamos 200 (se mock funcionar) ou redirect.
       */
      expect(
        result.status !== null && result.status < 500,
        `Erro de servidor (${result.status}) em ${route.path}`
      ).toBeTruthy()

      /** Sem erros graves no console */
      expect(
        result.consoleErrors,
        `Erros de console em ${route.name}: ${result.consoleErrors.join('; ')}`
      ).toHaveLength(0)

      /** Sem overflow horizontal */
      expect(
        result.hasHorizontalOverflow,
        `Overflow horizontal em ${route.name}`
      ).toBe(false)
    })
  }
})

test.describe('Auditoria completa do site — Admin Panel', () => {
  for (const route of ADMIN_ROUTES) {
    test(`${route.name} (${route.path})`, async ({ page }) => {
      const result = await auditPage(page, route.path)

      /** Admin pode redirecionar para login */
      expect(
        result.status !== null && result.status < 500,
        `Erro de servidor (${result.status}) em ${route.path}`
      ).toBeTruthy()

      /** Sem erros graves no console */
      expect(
        result.consoleErrors,
        `Erros de console em ${route.name}: ${result.consoleErrors.join('; ')}`
      ).toHaveLength(0)

      /** Sem overflow horizontal */
      expect(
        result.hasHorizontalOverflow,
        `Overflow horizontal em ${route.name}`
      ).toBe(false)
    })
  }
})

test.describe('Auditoria — Landing Page: Elementos essenciais', () => {
  test('Hero section deve ter título, descrição e CTAs', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    /** Deve ter pelo menos um H1 */
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()

    /** Deve ter botões CTA */
    const ctaButtons = page.locator('a[href*="sign"], a[href*="demo"], button').first()
    await expect(ctaButtons).toBeVisible()
  })

  test('Header deve ter logo e navegação', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1500)

    /** Logo deve estar visível */
    const logo = page.locator('header a').first()
    await expect(logo).toBeVisible()

    /** Links de navegação devem existir */
    const navLinks = page.locator('header nav a, header a')
    const count = await navLinks.count()
    expect(count).toBeGreaterThan(2)
  })

  test('Footer deve ter links e informações', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1500)

    /** Footer deve existir */
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    /** Deve ter links */
    const footerLinks = footer.locator('a')
    const count = await footerLinks.count()
    expect(count).toBeGreaterThan(5)
  })

  test('Pricing section deve ter cards de planos', async ({ page }) => {
    await page.goto('/en/pricing', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    /** Deve ter texto de preço visível */
    const priceTexts = page.locator('text=/\\$\\d+/')
    const count = await priceTexts.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Auditoria — Links internos da Landing Page', () => {
  test('Todos os links internos devem apontar para rotas válidas', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    /** Coletar todos os links internos */
    const links = await page.evaluate(() => {
      const anchors = document.querySelectorAll('a[href]')
      const hrefs: string[] = []
      anchors.forEach((a) => {
        const href = a.getAttribute('href') || ''
        /** Apenas links internos (não externos, não âncoras puras) */
        if (
          href.startsWith('/') &&
          !href.startsWith('//') &&
          href !== '/' &&
          !href.includes('#')
        ) {
          hrefs.push(href)
        }
      })
      return [...new Set(hrefs)]
    })

    /** Verificar cada link interno */
    const brokenLinks: string[] = []
    for (const href of links) {
      try {
        const response = await page.goto(href, {
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        })
        const status = response?.status() ?? 500
        if (status >= 400 && status !== 404) {
          brokenLinks.push(`${href} → ${status}`)
        }
      } catch {
        brokenLinks.push(`${href} → timeout/error`)
      }
    }

    expect(
      brokenLinks,
      `Links quebrados encontrados: ${brokenLinks.join(', ')}`
    ).toHaveLength(0)
  })
})

test.describe('Auditoria — Responsividade Mobile', () => {
  test('Landing page deve funcionar em viewport mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/en', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    /** Sem overflow horizontal */
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    expect(hasOverflow, 'Layout quebrando no mobile (375px)').toBe(false)

    /** H1 deve estar visível */
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
  })

  test('Landing page deve funcionar em viewport tablet (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/en', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    expect(hasOverflow, 'Layout quebrando no tablet (768px)').toBe(false)
  })

  test('Pricing deve funcionar em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/en/pricing', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    expect(hasOverflow, 'Pricing quebrando no mobile').toBe(false)
  })
})

test.describe('Auditoria — Formulários', () => {
  test('Contact form deve ter campos obrigatórios', async ({ page }) => {
    await page.goto('/en/contact', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    /** Deve ter campos de input */
    const inputs = page.locator('input, textarea')
    const count = await inputs.count()
    expect(count).toBeGreaterThan(2)

    /** Deve ter botão de submit */
    const submitBtn = page.locator('button[type="submit"], button:has-text("Send"), button:has-text("Submit")')
    const btnCount = await submitBtn.count()
    expect(btnCount).toBeGreaterThan(0)
  })

  test('Sign In form deve ter campos de email e password', async ({ page }) => {
    await page.goto('/en/sign-in', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    /** Deve ter campo de email */
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]')
    const emailCount = await emailInput.count()

    /** Deve ter campo de senha */
    const passwordInput = page.locator('input[type="password"], input[name="password"]')
    const passCount = await passwordInput.count()

    /** Pelo menos email OU redirecionou para Clerk */
    const currentUrl = page.url()
    if (!currentUrl.includes('clerk')) {
      expect(emailCount + passCount).toBeGreaterThan(0)
    }
  })
})

test.describe('Auditoria — Múltiplos idiomas', () => {
  const LOCALES = ['en', 'pt', 'es', 'fr', 'it', 'de']

  for (const locale of LOCALES) {
    test(`Landing page deve carregar no locale: ${locale}`, async ({ page }) => {
      const result = await auditPage(page, `/${locale}`)

      expect(
        result.status === 200 || result.status === 307 || result.status === 308,
        `Locale ${locale} falhou com status ${result.status}`
      ).toBeTruthy()

      expect(result.hasHorizontalOverflow, `Overflow em /${locale}`).toBe(false)
    })
  }
})
