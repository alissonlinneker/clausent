import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    /** Ambiente de teste — jsdom para componentes React, node para lógica pura */
    environment: 'jsdom',
    /** Habilita globals (describe, it, expect) sem importar explicitamente */
    globals: true,
    /** Arquivo de setup executado antes de cada suite de testes */
    setupFiles: ['./src/test/setup.ts'],
    /** Padrões de inclusão de arquivos de teste */
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    /** Excluir node_modules e build artifacts */
    exclude: ['node_modules', '.next', 'dist'],
    /** Configurações de cobertura de código */
    coverage: {
      /** Provedor de cobertura */
      provider: 'v8',
      /** Diretório de relatórios de cobertura */
      reportsDirectory: './coverage',
      /** Arquivos a incluir na análise de cobertura */
      include: ['src/**/*.{ts,tsx}'],
      /** Arquivos a excluir da análise de cobertura */
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
        'src/test/**/*',
        'src/types/**/*',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
