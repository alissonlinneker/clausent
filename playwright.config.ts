/**
 * Configuração do Playwright para testes E2E headless.
 *
 * Usa o dev server do Next.js na porta 3939 para evitar
 * conflito com instâncias de desenvolvimento em andamento.
 */

import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3939',
    headless: true,
    viewport: { width: 1280, height: 720 },
    locale: 'en',
  },
  webServer: {
    command: 'npx next dev -p 3939',
    port: 3939,
    timeout: 60000,
    reuseExistingServer: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
})
