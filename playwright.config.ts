/**
 * Configuração do Playwright para testes E2E headless.
 *
 * Usa o dev server do Next.js na porta 11001 para evitar
 * conflito com a instância de desenvolvimento (porta 11000).
 */

import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:11001',
    headless: true,
    viewport: { width: 1280, height: 720 },
    locale: 'en',
  },
  webServer: {
    command: 'npx next dev -p 11001',
    port: 11001,
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
