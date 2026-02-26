import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

/**
 * Configuração de request do next-intl.
 *
 * Carrega os arquivos de tradução do locale ativo.
 * É chamado em cada requisição do servidor para
 * determinar qual arquivo de mensagens carregar.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  /** Obtém o locale da requisição (definido pelo middleware) */
  let locale = await requestLocale

  /** Valida se o locale é suportado; caso contrário, usa o padrão */
  if (!locale || !routing.locales.includes(locale as typeof routing.locales[number])) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    /** Carrega o arquivo de tradução do locale ativo */
    messages: (await import(`@/messages/${locale}.json`)).default,
  }
})
