import { defineRouting } from 'next-intl/routing'

/**
 * Configuração de roteamento i18n.
 *
 * Define os idiomas suportados e o idioma padrão.
 * O next-intl usa esta configuração para:
 * - Gerar rotas /[locale]/... automaticamente
 * - Detectar o idioma via Accept-Language header
 * - Redirecionar para o locale correto
 */
export const routing = defineRouting({
  /** Idiomas suportados pela aplicação */
  locales: ['en', 'pt', 'es', 'fr', 'it', 'de'],

  /** Idioma padrão quando não é possível detectar */
  defaultLocale: 'en',

  /**
   * Estratégia de prefixo do locale na URL.
   * 'as-needed' = não adiciona /en/ para o idioma padrão,
   * mas adiciona /pt/, /es/, etc. para os demais.
   */
  localePrefix: 'as-needed',
})

/** Tipo auxiliar — lista de locales suportados */
export type Locale = (typeof routing.locales)[number]
