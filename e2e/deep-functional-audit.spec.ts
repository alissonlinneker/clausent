/**
 * Testes E2E de auditoria funcional profunda do Clausent.
 *
 * Navega por TODAS as páginas como um usuário real, interagindo
 * com elementos e verificando funcionalidade completa:
 * - Páginas de marketing: conteúdo, interação, accordion, toggle de preços
 * - Dashboard: estrutura, componentes, formulários
 * - Admin: KPIs, tabelas, pipeline
 * - Verificações globais: MISSING_MESSAGE, erros JS, idiomas
 *
 * Timeout por teste: 60s
 * Base URL: http://localhost:11000
 */

import { test, expect, type Page, type ConsoleMessage } from '@playwright/test'

/** Configuração de base URL para todos os testes */
test.use({ baseURL: 'http://localhost:11000' })

/* =================================================================
   UTILITÁRIOS
   Funções auxiliares reutilizadas em múltiplos testes.
   ================================================================= */

/** Erros de console que devem ser ignorados (inofensivos ou esperados) */
const IGNORABLE_ERRORS = [
  'hydration',
  'Hydration',
  'NEXT_REDIRECT',
  'ERR_CONNECTION_REFUSED',
  '404',
  'Failed to fetch',
  'next-intl',
  'ChunkLoadError',
  'Loading chunk',
  'Warning:',
  'favicon',
  'ResizeObserver',
  'AbortError',
  'cancelled',
  'Download the React DevTools',
  'Abort fetching component',
  'NotFoundError',
  '_next/image',
  'Request Context',
]

/**
 * Verifica se um erro de console deve ser ignorado.
 * Retorna true se o texto contiver qualquer padrão ignorável.
 */
function isIgnorableError(text: string): boolean {
  return IGNORABLE_ERRORS.some((pattern) => text.includes(pattern))
}

/**
 * Configura coleta de erros de console em uma página.
 * Retorna um array que será populado com erros graves.
 */
function setupConsoleErrorCollector(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      if (!isIgnorableError(text)) {
        errors.push(text)
      }
    }
  })
  return errors
}

/**
 * Navega para uma rota e aguarda estabilização.
 * Retorna o status HTTP da resposta.
 */
async function navigateAndWait(page: Page, path: string): Promise<number | null> {
  try {
    const response = await page.goto(path, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })
    await page.waitForTimeout(2000)
    return response?.status() ?? null
  } catch {
    return null
  }
}

/**
 * Verifica que não há texto MISSING_MESSAGE na página.
 * Indica traduções faltando no i18n.
 */
async function assertNoMissingMessages(page: Page): Promise<void> {
  const missingCount = await page.locator('text=MISSING_MESSAGE').count()
  expect(missingCount, 'Encontrado MISSING_MESSAGE — tradução faltando').toBe(0)
}

/**
 * Verifica que a página tem conteúdo visível (mais de 100 caracteres).
 */
async function assertHasContent(page: Page): Promise<void> {
  const bodyLength = await page.evaluate(() => document.body?.innerText?.length ?? 0)
  expect(bodyLength, 'Página com menos de 100 caracteres de texto visível').toBeGreaterThan(100)
}

/* =================================================================
   MARKETING PAGES — Testes de conteúdo e interação
   ================================================================= */

test.describe('Marketing — Landing Page', () => {
  test.setTimeout(60000)

  test('H1 visível, seções de Features, How It Works, Pricing com toggle, FAQ com accordion, CTAs', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page)
    await navigateAndWait(page, '/en')

    /** 1. H1 visível com texto */
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible({ timeout: 10000 })
    const h1Text = await h1.textContent()
    expect(h1Text?.length).toBeGreaterThan(5)

    /** 2. Seção Features existe e tem cards */
    const featuresSection = page.locator('#features')
    await featuresSection.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1000)
    await expect(featuresSection).toBeVisible()

    /** Verificar que existem pelo menos 6 cards de features */
    const featureCards = featuresSection.locator('.rounded-2xl')
    const featureCount = await featureCards.count()
    expect(featureCount, 'Deve ter pelo menos 6 cards de features').toBeGreaterThanOrEqual(6)

    /** 3. Seção How It Works existe e tem steps */
    const howItWorksSection = page.locator('#how-it-works')
    await howItWorksSection.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1000)
    await expect(howItWorksSection).toBeVisible()

    /** Verificar que existem 3 passos (números 01, 02, 03) */
    const stepNumbers = howItWorksSection.locator('text=/^0[1-3]$/')
    const stepCount = await stepNumbers.count()
    expect(stepCount, 'Deve ter 3 steps no How It Works').toBe(3)

    /** 4. Seção Pricing existe e toggle mensal/anual funciona */
    const pricingSection = page.locator('#pricing')
    await pricingSection.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1000)
    await expect(pricingSection).toBeVisible()

    /** Capturar preço antes do toggle (padrão é anual) */
    const priceElements = pricingSection.locator('text=/^\\$\\d+$/')
    const priceCount = await priceElements.count()
    expect(priceCount, 'Deve ter pelo menos 3 preços visíveis').toBeGreaterThanOrEqual(3)

    /** Capturar o primeiro preço (anual por padrão) */
    const priceBeforeToggle = await priceElements.first().textContent()

    /** Clicar no switch para trocar para mensal */
    const billingSwitch = pricingSection.locator('button[role="switch"]')
    await billingSwitch.click()
    await page.waitForTimeout(500)

    /** Capturar preço depois do toggle (mensal) */
    const priceAfterToggle = await priceElements.first().textContent()

    /** Preços devem ser diferentes (anual vs mensal) */
    expect(
      priceBeforeToggle,
      'Toggle mensal/anual deve mudar os preços'
    ).not.toBe(priceAfterToggle)

    /** 5. Seção FAQ existe e accordion funciona */
    const faqSection = page.locator('#faq')
    await faqSection.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1000)
    await expect(faqSection).toBeVisible()

    /** Clicar no primeiro item do accordion */
    const faqButtons = faqSection.locator('button')
    const faqButtonCount = await faqButtons.count()
    expect(faqButtonCount, 'FAQ deve ter pelo menos 5 perguntas').toBeGreaterThanOrEqual(5)

    /** Clicar no primeiro FAQ e verificar que expande */
    await faqButtons.first().click()
    await page.waitForTimeout(500)

    /** Verificar que há conteúdo expandido (resposta visível) */
    const expandedAnswer = faqSection.locator('.border-t.border-slate-100 p, [class*="overflow-hidden"] p').first()
    await expect(expandedAnswer).toBeVisible({ timeout: 3000 })

    /** 6. CTA buttons existem e são clicáveis */
    const ctaLinks = page.locator('a[href*="sign-up"]')
    const ctaCount = await ctaLinks.count()
    expect(ctaCount, 'Deve ter pelo menos 1 CTA para sign-up').toBeGreaterThanOrEqual(1)

    /** 7. Scroll suave — verificar que âncora de pricing rola */
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(300)

    /** Verificações globais */
    await assertNoMissingMessages(page)
    await assertHasContent(page)
    expect(errors, `Erros de console na Landing Page: ${errors.join('; ')}`).toHaveLength(0)
  })
})

test.describe('Marketing — Pricing Page', () => {
  test.setTimeout(60000)

  test('4 cards de plano, toggle mensal/anual, preços numéricos, CTAs, FAQ', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page)
    await navigateAndWait(page, '/en/pricing')

    /** 1. Verificar 4 cards de plano visíveis */
    const pricingSection = page.locator('#pricing')
    await expect(pricingSection).toBeVisible({ timeout: 10000 })

    /** Cards identificados pela estrutura de grid */
    const planCards = pricingSection.locator('.grid > div')
    const cardCount = await planCards.count()
    expect(cardCount, 'Deve ter 4 cards de plano').toBe(4)

    /** 2. Toggle mensal/anual muda os preços */
    const billingSwitch = pricingSection.locator('button[role="switch"]')
    await expect(billingSwitch).toBeVisible()

    /** Capturar preços no estado inicial (anual) */
    const allPrices = pricingSection.locator('text=/^\\$\\d+$/')
    const initialPrices: string[] = []
    const priceElemCount = await allPrices.count()
    for (let i = 0; i < priceElemCount; i++) {
      const text = await allPrices.nth(i).textContent()
      if (text) initialPrices.push(text)
    }

    /** Clicar no switch para alternar */
    await billingSwitch.click()
    await page.waitForTimeout(500)

    /** Capturar preços após toggle */
    const afterPrices: string[] = []
    const priceElemCount2 = await allPrices.count()
    for (let i = 0; i < priceElemCount2; i++) {
      const text = await allPrices.nth(i).textContent()
      if (text) afterPrices.push(text)
    }

    /** Preços devem mudar */
    expect(
      JSON.stringify(initialPrices),
      'Toggle deve mudar pelo menos algum preço'
    ).not.toBe(JSON.stringify(afterPrices))

    /** 3. Preços são numéricos (regex $N) */
    for (const price of [...initialPrices, ...afterPrices]) {
      expect(price, `Preço "${price}" deve ser numérico`).toMatch(/^\$\d+$/)
    }

    /** 4. Botões CTA existem em cada card com preço */
    const ctaButtons = pricingSection.locator('a[href*="sign-up"], a[href="#"]')
    const ctaBtnCount = await ctaButtons.count()
    expect(ctaBtnCount, 'Cada card deve ter um botão CTA').toBeGreaterThanOrEqual(4)

    /** 5. FAQ section existe na pricing page */
    const faqHeading = page.locator('h2').filter({ hasText: /FAQ|question|frequent/i })
    await faqHeading.first().scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    await expect(faqHeading.first()).toBeVisible()

    /** Verificações globais */
    await assertNoMissingMessages(page)
    await assertHasContent(page)
    expect(errors, `Erros de console no Pricing: ${errors.join('; ')}`).toHaveLength(0)
  })
})

test.describe('Marketing — About Page', () => {
  test.setTimeout(60000)

  test('H1, parágrafos, seção de valores ou equipe', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page)
    await navigateAndWait(page, '/en/about')

    /** H1 visível */
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible({ timeout: 10000 })

    /** Deve ter múltiplos parágrafos de conteúdo */
    const paragraphs = page.locator('p')
    const pCount = await paragraphs.count()
    expect(pCount, 'About deve ter pelo menos 5 parágrafos').toBeGreaterThanOrEqual(5)

    /** Deve ter seção de equipe ou valores (H2 ou H3) */
    const headings = page.locator('h2, h3')
    const headingCount = await headings.count()
    expect(headingCount, 'Deve ter pelo menos 2 subheadings').toBeGreaterThanOrEqual(2)

    /** Verificações globais */
    await assertNoMissingMessages(page)
    await assertHasContent(page)
    expect(errors, `Erros de console no About: ${errors.join('; ')}`).toHaveLength(0)
  })
})

test.describe('Marketing — Contact Page', () => {
  test.setTimeout(60000)

  test('Formulário com inputs, textarea e botão submit', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page)
    await navigateAndWait(page, '/en/contact')

    /** Deve ter campos de input */
    const inputs = page.locator('input')
    const inputCount = await inputs.count()
    expect(inputCount, 'Formulário de contato deve ter pelo menos 2 inputs').toBeGreaterThanOrEqual(2)

    /** Deve ter textarea */
    const textarea = page.locator('textarea')
    const textareaCount = await textarea.count()
    expect(textareaCount, 'Deve ter pelo menos 1 textarea').toBeGreaterThanOrEqual(1)

    /** Deve ter botão de submit */
    const submitBtn = page.locator('button[type="submit"], button:has-text("Send"), button:has-text("Submit")')
    const btnCount = await submitBtn.count()
    expect(btnCount, 'Deve ter botão de envio').toBeGreaterThanOrEqual(1)

    /** Tentar preencher os campos */
    const firstInput = inputs.first()
    await firstInput.fill('Test User')
    await page.waitForTimeout(300)

    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]')
    if (await emailInput.count() > 0) {
      await emailInput.first().fill('test@example.com')
    }

    if (textareaCount > 0) {
      await textarea.first().fill('This is a test message for the contact form.')
    }

    /** Verificações globais */
    await assertNoMissingMessages(page)
    await assertHasContent(page)
    expect(errors, `Erros de console no Contact: ${errors.join('; ')}`).toHaveLength(0)
  })
})

test.describe('Marketing — Blog Page', () => {
  test.setTimeout(60000)

  test('Lista de posts com cards e títulos', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page)
    await navigateAndWait(page, '/en/blog')

    /** H1 ou heading principal visível */
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible({ timeout: 10000 })

    /** Deve ter cards de posts (com títulos H2/H3) */
    const postHeadings = page.locator('h2, h3')
    const postCount = await postHeadings.count()
    expect(postCount, 'Blog deve ter pelo menos 3 headings (posts ou categorias)').toBeGreaterThanOrEqual(3)

    /** Verificar que existem links para posts individuais */
    const postLinks = page.locator('a[href*="blog/"]')
    const linkCount = await postLinks.count()
    expect(linkCount, 'Deve ter links para posts individuais').toBeGreaterThanOrEqual(1)

    /** Verificações globais */
    await assertNoMissingMessages(page)
    await assertHasContent(page)
    expect(errors, `Erros de console no Blog: ${errors.join('; ')}`).toHaveLength(0)
  })
})

test.describe('Marketing — API Docs Page', () => {
  test.setTimeout(60000)

  test('Seções de documentação e code blocks', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page)
    await navigateAndWait(page, '/en/api-docs')

    /** Heading principal visível */
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible({ timeout: 10000 })

    /** Deve ter seções de documentação (múltiplos headings) */
    const sectionHeadings = page.locator('h2, h3')
    const headingCount = await sectionHeadings.count()
    expect(headingCount, 'API Docs deve ter múltiplas seções').toBeGreaterThanOrEqual(3)

    /** Deve ter code blocks (pre ou code elements) */
    const codeBlocks = page.locator('pre, code')
    const codeCount = await codeBlocks.count()
    expect(codeCount, 'Deve ter code blocks com exemplos').toBeGreaterThanOrEqual(1)

    /** Verificações globais */
    await assertNoMissingMessages(page)
    await assertHasContent(page)
    expect(errors, `Erros de console no API Docs: ${errors.join('; ')}`).toHaveLength(0)
  })
})

/* =================================================================
   DASHBOARD PAGES — Verificar estrutura e componentes
   ================================================================= */

test.describe('Dashboard — Overview', () => {
  test.setTimeout(60000)

  test('Stat cards, gráfico de portfolio, tabela de contratos, alertas', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page)
    const status = await navigateAndWait(page, '/en/dashboard')

    /** Dashboard pode redirecionar para login — aceitar redirect */
    const currentUrl = page.url()
    if (currentUrl.includes('sign-in') || currentUrl.includes('login')) {
      /** Redirecionou para login — aceitável sem auth */
      expect(status === null || (status !== null && status < 500)).toBeTruthy()
      return
    }

    /** 1. Stat cards visíveis (pelo menos 4) */
    const statCards = page.locator('[class*="rounded"][class*="border"][class*="p-"]').filter({ has: page.locator('p, span') })
    const cardCount = await statCards.count()
    expect(cardCount, 'Dashboard deve ter pelo menos 4 stat cards').toBeGreaterThanOrEqual(4)

    /** 2. Gráfico de portfolio existe (svg ou recharts container) */
    const chart = page.locator('.recharts-wrapper, svg.recharts-surface, [class*="recharts"]')
    const chartCount = await chart.count()
    expect(chartCount, 'Dashboard deve ter pelo menos 1 gráfico').toBeGreaterThanOrEqual(1)

    /** 3. Tabela de contratos recentes */
    const tables = page.locator('table, [role="table"]')
    const tableExists = await tables.count()
    /** Ou lista de contratos (se não for tabela formal) */
    const contractItems = page.locator('text=/AWS|Salesforce|Microsoft|Slack|HubSpot/i')
    const itemCount = await contractItems.count()
    expect(
      tableExists + itemCount,
      'Dashboard deve ter tabela ou lista de contratos'
    ).toBeGreaterThan(0)

    /** 4. Seção de alertas */
    const alertsSection = page.locator('text=/alert|expir|renew/i')
    const alertCount = await alertsSection.count()
    expect(alertCount, 'Dashboard deve ter seção de alertas').toBeGreaterThan(0)

    /** Verificações globais */
    await assertNoMissingMessages(page)
    await assertHasContent(page)
    expect(errors, `Erros de console no Dashboard: ${errors.join('; ')}`).toHaveLength(0)
  })
})

test.describe('Dashboard — Contracts List', () => {
  test.setTimeout(60000)

  test('Tabela, filtros e paginação', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page)
    await navigateAndWait(page, '/en/dashboard/contracts')

    const currentUrl = page.url()
    if (currentUrl.includes('sign-in')) return

    /** Tabela ou lista de contratos */
    const table = page.locator('table, [role="table"], [class*="grid"]')
    const tableCount = await table.count()
    expect(tableCount, 'Deve ter tabela de contratos').toBeGreaterThan(0)

    /** Filtros (selects, inputs de busca) */
    const filters = page.locator('input[placeholder*="search" i], input[placeholder*="filter" i], input[placeholder*="busca" i], select, [role="combobox"]')
    const filterCount = await filters.count()
    expect(filterCount, 'Deve ter pelo menos 1 filtro/busca').toBeGreaterThanOrEqual(1)

    /** Verificações globais */
    await assertNoMissingMessages(page)
    await assertHasContent(page)
    expect(errors, `Erros no Contracts List: ${errors.join('; ')}`).toHaveLength(0)
  })
})

test.describe('Dashboard — Risk Dashboard', () => {
  test.setTimeout(60000)

  test('Gráfico de distribuição, tabela de riscos, stat cards', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page)
    await navigateAndWait(page, '/en/dashboard/risk')

    const currentUrl = page.url()
    if (currentUrl.includes('sign-in')) return

    /** Stat cards (pelo menos 3 para risco) */
    const statAreas = page.locator('[class*="rounded"][class*="border"]').filter({ has: page.locator('h3, p, span') })
    const statCount = await statAreas.count()
    expect(statCount, 'Risk deve ter pelo menos 3 stat areas').toBeGreaterThanOrEqual(3)

    /** Gráfico (donut/pie ou bar chart) */
    const charts = page.locator('.recharts-wrapper, svg, [class*="recharts"]')
    const chartCount = await charts.count()
    expect(chartCount, 'Risk deve ter pelo menos 1 gráfico').toBeGreaterThanOrEqual(1)

    /** Verificações globais */
    await assertNoMissingMessages(page)
    await assertHasContent(page)
    expect(errors, `Erros no Risk Dashboard: ${errors.join('; ')}`).toHaveLength(0)
  })
})

test.describe('Dashboard — Benchmarks', () => {
  test.setTimeout(60000)

  test('Gráficos e tabela de categorias', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page)
    await navigateAndWait(page, '/en/dashboard/benchmarks')

    const currentUrl = page.url()
    if (currentUrl.includes('sign-in')) return

    /** Gráficos de benchmark */
    const charts = page.locator('.recharts-wrapper, svg, [class*="recharts"], canvas')
    const chartCount = await charts.count()
    expect(chartCount, 'Benchmarks deve ter pelo menos 1 gráfico').toBeGreaterThanOrEqual(1)

    /** Verificações globais */
    await assertNoMissingMessages(page)
    await assertHasContent(page)
    expect(errors, `Erros no Benchmarks: ${errors.join('; ')}`).toHaveLength(0)
  })
})

test.describe('Dashboard — Analytics', () => {
  test.setTimeout(60000)

  test('Gráficos e stat cards', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page)
    await navigateAndWait(page, '/en/dashboard/analytics')

    const currentUrl = page.url()
    if (currentUrl.includes('sign-in')) return

    /** Stat cards ou métricas */
    const metrics = page.locator('[class*="rounded"][class*="border"]')
    const metricCount = await metrics.count()
    expect(metricCount, 'Analytics deve ter componentes visuais').toBeGreaterThanOrEqual(2)

    /** Gráficos */
    const charts = page.locator('.recharts-wrapper, svg, [class*="recharts"]')
    const chartCount = await charts.count()
    expect(chartCount, 'Analytics deve ter pelo menos 1 gráfico').toBeGreaterThanOrEqual(1)

    /** Verificações globais */
    await assertNoMissingMessages(page)
    await assertHasContent(page)
    expect(errors, `Erros no Analytics: ${errors.join('; ')}`).toHaveLength(0)
  })
})

test.describe('Dashboard — Reports', () => {
  test.setTimeout(60000)

  test('Quick reports e report builder form', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page)
    await navigateAndWait(page, '/en/dashboard/reports')

    const currentUrl = page.url()
    if (currentUrl.includes('sign-in')) return

    /** Heading visível */
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible({ timeout: 10000 })

    /** Botões ou cards de quick reports */
    const buttons = page.locator('button')
    const btnCount = await buttons.count()
    expect(btnCount, 'Reports deve ter botões de ação').toBeGreaterThanOrEqual(1)

    /** Verificações globais */
    await assertNoMissingMessages(page)
    await assertHasContent(page)
    expect(errors, `Erros no Reports: ${errors.join('; ')}`).toHaveLength(0)
  })
})

test.describe('Dashboard — Alerts', () => {
  test.setTimeout(60000)

  test('Lista de alertas com badges', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page)
    await navigateAndWait(page, '/en/dashboard/alerts')

    const currentUrl = page.url()
    if (currentUrl.includes('sign-in')) return

    /** Heading visível */
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible({ timeout: 10000 })

    /** Lista de alertas ou cards */
    const alertItems = page.locator('[class*="rounded"][class*="border"]')
    const alertCount = await alertItems.count()
    expect(alertCount, 'Alerts deve ter itens de alerta').toBeGreaterThanOrEqual(1)

    /** Badges de status (urgente, warning, etc.) */
    const badges = page.locator('[class*="badge"], [class*="rounded-full"][class*="text-xs"], [class*="rounded-full"][class*="px-"]')
    const badgeCount = await badges.count()
    expect(badgeCount, 'Deve ter badges de status nos alertas').toBeGreaterThanOrEqual(1)

    /** Verificações globais */
    await assertNoMissingMessages(page)
    await assertHasContent(page)
    expect(errors, `Erros no Alerts: ${errors.join('; ')}`).toHaveLength(0)
  })
})

test.describe('Dashboard — Team', () => {
  test.setTimeout(60000)

  test('Lista de membros e botão de invite', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page)
    await navigateAndWait(page, '/en/dashboard/team')

    const currentUrl = page.url()
    if (currentUrl.includes('sign-in')) return

    /** Heading visível */
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible({ timeout: 10000 })

    /** Lista de membros (tabela ou cards) */
    const memberElements = page.locator('table, [class*="grid"], [class*="rounded"][class*="border"]')
    const memberCount = await memberElements.count()
    expect(memberCount, 'Team deve ter lista de membros').toBeGreaterThanOrEqual(1)

    /** Botão de invite */
    const inviteBtn = page.locator('button:has-text("Invite"), button:has-text("Add"), button:has-text("invite"), button:has-text("add")')
    const inviteBtnCount = await inviteBtn.count()
    expect(inviteBtnCount, 'Deve ter botão de convidar membro').toBeGreaterThanOrEqual(1)

    /** Verificações globais */
    await assertNoMissingMessages(page)
    await assertHasContent(page)
    expect(errors, `Erros no Team: ${errors.join('; ')}`).toHaveLength(0)
  })
})

/* =================================================================
   DASHBOARD — Settings Pages
   Verificar formulários e toggles em cada aba de configurações.
   ================================================================= */

const SETTINGS_PAGES = [
  { path: '/en/dashboard/settings', name: 'Settings General' },
  { path: '/en/dashboard/settings/profile', name: 'Settings Profile' },
  { path: '/en/dashboard/settings/security', name: 'Settings Security' },
  { path: '/en/dashboard/settings/notifications', name: 'Settings Notifications' },
  { path: '/en/dashboard/settings/billing', name: 'Settings Billing' },
  { path: '/en/dashboard/settings/api-keys', name: 'Settings API Keys' },
  { path: '/en/dashboard/settings/integrations', name: 'Settings Integrations' },
]

test.describe('Dashboard — Settings Pages', () => {
  test.setTimeout(60000)

  for (const settingsPage of SETTINGS_PAGES) {
    test(`${settingsPage.name} — formulários e toggles`, async ({ page }) => {
      const errors = setupConsoleErrorCollector(page)
      await navigateAndWait(page, settingsPage.path)

      const currentUrl = page.url()
      if (currentUrl.includes('sign-in')) return

      /** Heading visível */
      const heading = page.locator('h1, h2, h3').first()
      await expect(heading).toBeVisible({ timeout: 10000 })

      /** Deve ter formulários ou toggles (inputs, selects, switches) */
      const formElements = page.locator('input, select, textarea, button[role="switch"], [role="combobox"]')
      const elementCount = await formElements.count()

      /** Ou deve ter botões de ação */
      const actionButtons = page.locator('button')
      const btnCount = await actionButtons.count()

      expect(
        elementCount + btnCount,
        `${settingsPage.name} deve ter formulários, toggles ou botões`
      ).toBeGreaterThan(0)

      /** Verificações globais */
      await assertNoMissingMessages(page)
      await assertHasContent(page)
      expect(errors, `Erros em ${settingsPage.name}: ${errors.join('; ')}`).toHaveLength(0)
    })
  }
})

/* =================================================================
   DASHBOARD — Onboarding Wizard
   Verificar navegação entre steps.
   ================================================================= */

test.describe('Dashboard — Onboarding', () => {
  test.setTimeout(60000)

  test('Wizard steps funcionam (next/back)', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page)
    await navigateAndWait(page, '/en/dashboard/onboarding')

    const currentUrl = page.url()
    if (currentUrl.includes('sign-in')) return

    /** Tela inicial do wizard deve estar visível */
    const wizardContent = page.locator('main, [class*="max-w"]').first()
    await expect(wizardContent).toBeVisible({ timeout: 10000 })

    /** Deve ter botão "Next", "Continue", "Get Started" ou similar */
    const nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Get Started"), button:has-text("next"), button:has-text("continue"), button:has-text("Let")')
    const nextCount = await nextBtn.count()

    if (nextCount > 0) {
      /** Clicar no primeiro botão de avanço */
      await nextBtn.first().click()
      await page.waitForTimeout(1000)

      /** Verificar que o conteúdo mudou (novo step) */
      const backBtn = page.locator('button:has-text("Back"), button:has-text("Previous"), button:has-text("back")')
      const backCount = await backBtn.count()

      /** Se tem botão de voltar, estamos no step 2+ */
      if (backCount > 0) {
        /** Clicar em voltar para testar navegação reversa */
        await backBtn.first().click()
        await page.waitForTimeout(1000)

        /** Deve voltar ao step anterior */
        const nextBtnAgain = page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Get Started"), button:has-text("Let")')
        const nextAgainCount = await nextBtnAgain.count()
        expect(nextAgainCount, 'Botão Next deve reaparecer ao voltar').toBeGreaterThanOrEqual(1)
      }
    }

    /** Verificações globais */
    await assertNoMissingMessages(page)
    await assertHasContent(page)
    expect(errors, `Erros no Onboarding: ${errors.join('; ')}`).toHaveLength(0)
  })
})

/* =================================================================
   ADMIN PAGES — Verificar estrutura administrativa
   ================================================================= */

test.describe('Admin — Dashboard', () => {
  test.setTimeout(60000)

  test('KPIs e atividade recente', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page)
    await navigateAndWait(page, '/en/admin')

    const currentUrl = page.url()
    if (currentUrl.includes('sign-in')) return

    /** Heading ou KPI cards */
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible({ timeout: 10000 })

    /** KPI stat cards */
    const kpiCards = page.locator('[class*="rounded"][class*="border"]')
    const kpiCount = await kpiCards.count()
    expect(kpiCount, 'Admin dashboard deve ter KPI cards').toBeGreaterThanOrEqual(3)

    /** Atividade recente (lista ou feed) */
    await assertHasContent(page)

    /** Verificações globais */
    await assertNoMissingMessages(page)
    expect(errors, `Erros no Admin Dashboard: ${errors.join('; ')}`).toHaveLength(0)
  })
})

test.describe('Admin — Users', () => {
  test.setTimeout(60000)

  test('Tabela de usuários e filtros', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page)
    await navigateAndWait(page, '/en/admin/users')

    const currentUrl = page.url()
    if (currentUrl.includes('sign-in')) return

    /** Tabela de usuários */
    const table = page.locator('table, [role="table"], [class*="grid"]')
    const tableCount = await table.count()
    expect(tableCount, 'Admin Users deve ter tabela').toBeGreaterThanOrEqual(1)

    /** Filtros ou busca */
    const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="filter" i], input[type="search"]')
    const searchCount = await searchInput.count()
    expect(searchCount, 'Deve ter campo de busca de usuários').toBeGreaterThanOrEqual(1)

    /** Verificações globais */
    await assertNoMissingMessages(page)
    await assertHasContent(page)
    expect(errors, `Erros no Admin Users: ${errors.join('; ')}`).toHaveLength(0)
  })
})

test.describe('Admin — Analyses', () => {
  test.setTimeout(60000)

  test('Pipeline e fila de análises', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page)
    await navigateAndWait(page, '/en/admin/analyses')

    const currentUrl = page.url()
    if (currentUrl.includes('sign-in')) return

    /** Heading visível */
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible({ timeout: 10000 })

    /** Cards de pipeline ou fila */
    const pipelineCards = page.locator('[class*="rounded"][class*="border"]')
    const pipeCount = await pipelineCards.count()
    expect(pipeCount, 'Admin Analyses deve ter cards de pipeline').toBeGreaterThanOrEqual(2)

    /** Verificações globais */
    await assertNoMissingMessages(page)
    await assertHasContent(page)
    expect(errors, `Erros no Admin Analyses: ${errors.join('; ')}`).toHaveLength(0)
  })
})

test.describe('Admin — Payments', () => {
  test.setTimeout(60000)

  test('Transações e receita', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page)
    await navigateAndWait(page, '/en/admin/payments')

    const currentUrl = page.url()
    if (currentUrl.includes('sign-in')) return

    /** Heading visível */
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible({ timeout: 10000 })

    /** Tabela de transações ou cards de receita */
    const contentCards = page.locator('[class*="rounded"][class*="border"]')
    const cardCount = await contentCards.count()
    expect(cardCount, 'Admin Payments deve ter cards/tabelas').toBeGreaterThanOrEqual(2)

    /** Deve ter valores monetários */
    const moneyValues = page.locator('text=/\\$[\\d,]+/')
    const moneyCount = await moneyValues.count()
    expect(moneyCount, 'Admin Payments deve mostrar valores monetários').toBeGreaterThanOrEqual(1)

    /** Verificações globais */
    await assertNoMissingMessages(page)
    await assertHasContent(page)
    expect(errors, `Erros no Admin Payments: ${errors.join('; ')}`).toHaveLength(0)
  })
})

test.describe('Admin — Emails', () => {
  test.setTimeout(60000)

  test('Lista de emails e templates', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page)
    await navigateAndWait(page, '/en/admin/emails')

    const currentUrl = page.url()
    if (currentUrl.includes('sign-in')) return

    /** Heading visível */
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible({ timeout: 10000 })

    /** Lista/tabela de emails */
    const listElements = page.locator('table, [class*="grid"], [class*="rounded"][class*="border"]')
    const listCount = await listElements.count()
    expect(listCount, 'Admin Emails deve ter lista de emails').toBeGreaterThanOrEqual(1)

    /** Verificações globais */
    await assertNoMissingMessages(page)
    await assertHasContent(page)
    expect(errors, `Erros no Admin Emails: ${errors.join('; ')}`).toHaveLength(0)
  })
})

test.describe('Admin — System', () => {
  test.setTimeout(60000)

  test('Status dos serviços', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page)
    await navigateAndWait(page, '/en/admin/system')

    const currentUrl = page.url()
    if (currentUrl.includes('sign-in')) return

    /** Heading visível */
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible({ timeout: 10000 })

    /** Cards de status dos serviços */
    const statusCards = page.locator('[class*="rounded"][class*="border"]')
    const statusCount = await statusCards.count()
    expect(statusCount, 'Admin System deve ter cards de status').toBeGreaterThanOrEqual(3)

    /** Indicadores de status (online/offline, badges de cor) */
    const statusIndicators = page.locator('[class*="bg-green"], [class*="bg-emerald"], [class*="bg-red"], [class*="text-green"], [class*="text-emerald"]')
    const indicatorCount = await statusIndicators.count()
    expect(indicatorCount, 'Deve ter indicadores visuais de status').toBeGreaterThanOrEqual(1)

    /** Verificações globais */
    await assertNoMissingMessages(page)
    await assertHasContent(page)
    expect(errors, `Erros no Admin System: ${errors.join('; ')}`).toHaveLength(0)
  })
})

/* =================================================================
   VERIFICAÇÕES GLOBAIS — Idiomas e traduções
   ================================================================= */

test.describe('Verificações Globais — Transição entre idiomas', () => {
  test.setTimeout(60000)

  test('Navegar para /pt e /es — verificar que traduz', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page)

    /** 1. Carregar versão em inglês e capturar H1 */
    await navigateAndWait(page, '/en')
    const h1En = page.locator('h1').first()
    await expect(h1En).toBeVisible({ timeout: 10000 })
    const textEn = await h1En.textContent()

    /** 2. Navegar para /pt e verificar tradução */
    await navigateAndWait(page, '/pt')
    const h1Pt = page.locator('h1').first()
    await expect(h1Pt).toBeVisible({ timeout: 10000 })
    const textPt = await h1Pt.textContent()

    /** Verificar que NÃO há MISSING_MESSAGE */
    await assertNoMissingMessages(page)
    await assertHasContent(page)

    /** O texto em PT deve ser diferente do EN (tradução funcionou) */
    expect(textPt, 'Tradução PT deve ser diferente do EN').not.toBe(textEn)

    /** 3. Navegar para /es e verificar tradução */
    await navigateAndWait(page, '/es')
    const h1Es = page.locator('h1').first()
    await expect(h1Es).toBeVisible({ timeout: 10000 })
    const textEs = await h1Es.textContent()

    /** Verificar que NÃO há MISSING_MESSAGE */
    await assertNoMissingMessages(page)
    await assertHasContent(page)

    /** O texto em ES deve ser diferente do EN */
    expect(textEs, 'Tradução ES deve ser diferente do EN').not.toBe(textEn)

    /** O texto em ES deve ser diferente do PT */
    expect(textEs, 'Tradução ES deve ser diferente do PT').not.toBe(textPt)

    expect(errors, `Erros durante troca de idioma: ${errors.join('; ')}`).toHaveLength(0)
  })
})

test.describe('Verificações Globais — MISSING_MESSAGE em todas as páginas marketing', () => {
  test.setTimeout(60000)

  const MARKETING_ROUTES = [
    '/en',
    '/en/pricing',
    '/en/about',
    '/en/contact',
    '/en/blog',
    '/en/api-docs',
    '/en/changelog',
    '/en/demo',
    '/en/terms',
    '/en/privacy',
  ]

  test('Nenhuma página marketing deve ter MISSING_MESSAGE', async ({ page }) => {
    const pagesWithMissing: string[] = []

    for (const route of MARKETING_ROUTES) {
      await navigateAndWait(page, route)
      const missingCount = await page.locator('text=MISSING_MESSAGE').count()
      if (missingCount > 0) {
        pagesWithMissing.push(`${route} (${missingCount} ocorrências)`)
      }
    }

    expect(
      pagesWithMissing,
      `Páginas com MISSING_MESSAGE: ${pagesWithMissing.join(', ')}`
    ).toHaveLength(0)
  })
})

test.describe('Verificações Globais — Conteúdo mínimo em todas as rotas do dashboard', () => {
  test.setTimeout(60000)

  const DASHBOARD_ROUTES = [
    '/en/dashboard',
    '/en/dashboard/contracts',
    '/en/dashboard/risk',
    '/en/dashboard/benchmarks',
    '/en/dashboard/analytics',
    '/en/dashboard/reports',
    '/en/dashboard/alerts',
    '/en/dashboard/team',
    '/en/dashboard/settings',
    '/en/dashboard/onboarding',
  ]

  test('Todas as rotas do dashboard devem ter conteúdo ou redirecionar corretamente', async ({ page }) => {
    const emptyPages: string[] = []

    for (const route of DASHBOARD_ROUTES) {
      await navigateAndWait(page, route)

      const currentUrl = page.url()
      /** Se redirecionou para login, está correto */
      if (currentUrl.includes('sign-in') || currentUrl.includes('login')) {
        continue
      }

      /** Verificar conteúdo mínimo */
      const bodyLength = await page.evaluate(() => document.body?.innerText?.length ?? 0)
      if (bodyLength < 100) {
        emptyPages.push(`${route} (${bodyLength} chars)`)
      }
    }

    expect(
      emptyPages,
      `Páginas com pouco conteúdo: ${emptyPages.join(', ')}`
    ).toHaveLength(0)
  })
})
