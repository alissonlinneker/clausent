// @ts-nocheck
/**
 * Módulo de integração com Perplexity Sonar Pro para pesquisa de mercado.
 *
 * Utiliza a API do Perplexity (compatível com OpenAI) para realizar
 * pesquisas em tempo real na internet, fornecendo dados atualizados
 * sobre fornecedores, benchmarks de mercado e insights relevantes.
 *
 * O modelo Sonar Pro combina LLM com busca web, retornando
 * respostas fundamentadas com citações de fontes verificáveis.
 *
 * Custo estimado: ~$3-5/1000 queries (sonar-pro)
 *
 * @module perplexity
 */

/** URL base da API do Perplexity (compatível com OpenAI) */
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'

/** Modelo padrão — Sonar Pro para pesquisas com citações */
const DEFAULT_MODEL = 'sonar-pro'

/**
 * Interface para mensagem do chat (formato OpenAI).
 */
interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Citação retornada pela API do Perplexity.
 * Cada citação referencia uma fonte web utilizada na resposta.
 */
interface PerplexityCitation {
  /** URL da fonte citada */
  url: string
  /** Título da página */
  title?: string
  /** Trecho relevante da fonte */
  snippet?: string
}

/**
 * Resposta da API do Perplexity.
 * Segue o formato OpenAI com campos adicionais de citações.
 */
interface PerplexityResponse {
  /** Identificador único da resposta */
  id: string
  /** Opções de resposta geradas */
  choices: {
    message: {
      content: string
      role: string
    }
    finish_reason: string
  }[]
  /** Citações das fontes utilizadas na resposta */
  citations?: PerplexityCitation[] | string[]
  /** Métricas de uso de tokens */
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * Envia uma requisição para a API do Perplexity.
 *
 * A API do Perplexity é compatível com o formato OpenAI,
 * mas inclui funcionalidade de busca web integrada.
 * O modelo Sonar Pro retorna respostas com citações
 * de fontes da internet em tempo real.
 *
 * @param messages - Lista de mensagens do chat
 * @param options - Opções adicionais (modelo, temperatura, etc.)
 * @returns Resposta da API com conteúdo e citações
 * @throws Error se a chave de API não estiver configurada
 * @throws Error se a requisição falhar
 */
export async function callPerplexity(
  messages: ChatMessage[],
  options?: {
    /** Modelo a utilizar (padrão: sonar-pro) */
    model?: string
    /** Temperatura para geração (0 = determinístico, 1 = criativo) */
    temperature?: number
    /** Número máximo de tokens na resposta */
    maxTokens?: number
  }
): Promise<PerplexityResponse> {
  /** Verifica se a chave de API está configurada */
  const apiKey = process.env.PERPLEXITY_API_KEY
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY não configurada')
  }

  /** Realiza a chamada à API */
  const response = await fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options?.model || DEFAULT_MODEL,
      messages,
      temperature: options?.temperature ?? 0.2,
      max_tokens: options?.maxTokens ?? 4096,
    }),
  })

  /** Verifica se a resposta foi bem-sucedida */
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Perplexity API error (${response.status}): ${error}`)
  }

  return response.json()
}

/**
 * Extrai citações da resposta do Perplexity.
 *
 * A API pode retornar citações em diferentes formatos:
 * - Array de objetos PerplexityCitation (com url, title, snippet)
 * - Array de strings (apenas URLs)
 *
 * Este helper normaliza ambos os formatos para PerplexityCitation[].
 *
 * @param response - Resposta da API do Perplexity
 * @returns Lista normalizada de citações
 */
export function extractCitations(response: PerplexityResponse): PerplexityCitation[] {
  if (!response.citations || response.citations.length === 0) {
    return []
  }

  /** Normaliza citações — podem ser strings (URLs) ou objetos completos */
  return response.citations.map((citation) => {
    if (typeof citation === 'string') {
      return { url: citation }
    }
    return citation as PerplexityCitation
  })
}

/** Exportar modelo disponível para uso em outros módulos */
export const PERPLEXITY_MODELS = {
  SONAR_PRO: DEFAULT_MODEL,
} as const

/** Re-exportar tipos para consumo externo */
export type { ChatMessage as PerplexityChatMessage, PerplexityCitation, PerplexityResponse }
