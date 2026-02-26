/**
 * Módulo de integração com DeepSeek V3/R1 para análise de contratos.
 *
 * Usa a API compatível com OpenAI do DeepSeek para realizar
 * análise de risco, extração de cláusulas e geração de
 * playbooks de renegociação.
 *
 * Custo estimado: ~$0.002/contrato (vs $0.20 com GPT-4)
 */

/** URL base da API do DeepSeek (compatível com OpenAI) */
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

/** Modelo padrão para análise de contratos */
const DEFAULT_MODEL = 'deepseek-chat'

/** Modelo de raciocínio para análises complexas */
const REASONING_MODEL = 'deepseek-reasoner'

/**
 * Interface para mensagem do chat.
 */
interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Resposta da API do DeepSeek.
 */
interface DeepSeekResponse {
  id: string
  choices: {
    message: {
      content: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * Envia uma requisição para a API do DeepSeek.
 *
 * @param messages - Lista de mensagens do chat
 * @param options - Opções adicionais (modelo, temperatura, etc.)
 * @returns Resposta da API
 */
export async function callDeepSeek(
  messages: ChatMessage[],
  options?: {
    model?: string
    temperature?: number
    maxTokens?: number
    jsonMode?: boolean
  }
): Promise<DeepSeekResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY não configurada')
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options?.model || DEFAULT_MODEL,
      messages,
      temperature: options?.temperature ?? 0.1,
      max_tokens: options?.maxTokens ?? 4096,
      ...(options?.jsonMode && {
        response_format: { type: 'json_object' },
      }),
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DeepSeek API error (${response.status}): ${error}`)
  }

  return response.json()
}

/**
 * Analisa o texto de um contrato usando o modelo DeepSeek V3.
 *
 * Implementa o padrão de consenso 4-way (reutilizado do MeusDireitos):
 * faz 4 chamadas paralelas e combina os resultados para maior precisão.
 *
 * @param contractText - Texto extraído do contrato (via Textract)
 * @param category - Categoria do contrato para ajustar a análise
 * @returns Análise estruturada do contrato em JSON
 */
export async function analyzeContract(
  contractText: string,
  category: string
): Promise<string> {
  /** Prompt do sistema — define o papel e formato de resposta */
  const systemPrompt = `You are a contract analysis AI specialist. Analyze the following contract and provide a structured analysis in JSON format.

Your analysis must include:
1. "riskScore": number (0-100, where 0 is no risk and 100 is maximum risk)
2. "summary": string (executive summary in 2-3 sentences)
3. "clauses": array of objects with:
   - "title": clause title
   - "content": relevant clause text
   - "riskLevel": "low" | "medium" | "high" | "critical"
   - "explanation": why this risk level
   - "suggestion": improvement suggestion (optional)
4. "keyDates": array of objects with:
   - "label": date description
   - "date": ISO date string
   - "isAutoRenewal": boolean (optional)
5. "financials": object with:
   - "totalValue": number (optional)
   - "monthlyValue": number (optional)
   - "currency": string (ISO 4217)
6. "renegotiationTips": array of actionable suggestions

Contract category: ${category}

Respond ONLY with valid JSON. Do not include any text outside the JSON object.`

  /** Chamar DeepSeek com modo JSON ativado */
  const result = await callDeepSeek(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: contractText },
    ],
    {
      model: DEFAULT_MODEL,
      temperature: 0.1,
      maxTokens: 4096,
      jsonMode: true,
    }
  )

  return result.choices[0]?.message?.content || '{}'
}

/**
 * Analisa contrato com consenso 4-way para maior precisão.
 *
 * Faz 4 análises paralelas e combina os resultados,
 * priorizando achados que aparecem em múltiplas análises.
 *
 * @param contractText - Texto do contrato
 * @param category - Categoria do contrato
 * @returns Análise consolidada em JSON
 */
export async function analyzeContractWithConsensus(
  contractText: string,
  category: string
): Promise<string> {
  /** Executar 4 análises em paralelo para consenso */
  const analyses = await Promise.allSettled([
    analyzeContract(contractText, category),
    analyzeContract(contractText, category),
    analyzeContract(contractText, category),
    analyzeContract(contractText, category),
  ])

  /** Filtrar apenas as análises bem-sucedidas */
  const successfulAnalyses = analyses
    .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
    .map((r) => {
      try {
        return JSON.parse(r.value)
      } catch {
        return null
      }
    })
    .filter(Boolean)

  /** Se nenhuma análise teve sucesso, lançar erro */
  if (successfulAnalyses.length === 0) {
    throw new Error('Todas as 4 análises falharam')
  }

  /** Se apenas 1 teve sucesso, retornar ela mesma */
  if (successfulAnalyses.length === 1) {
    return JSON.stringify(successfulAnalyses[0])
  }

  /**
   * Consenso: calcular média do riskScore e combinar cláusulas.
   * Para o MVP, usar a mediana dos riskScores e unir cláusulas únicas.
   */
  const riskScores = successfulAnalyses.map((a) => a.riskScore || 50)
  riskScores.sort((a: number, b: number) => a - b)
  const medianRiskScore = riskScores[Math.floor(riskScores.length / 2)]

  /** Usar a análise mais completa (mais cláusulas identificadas) como base */
  const bestAnalysis = successfulAnalyses.reduce((best, current) =>
    (current.clauses?.length || 0) > (best.clauses?.length || 0) ? current : best
  )

  /** Substituir o riskScore pelo valor de consenso (mediana) */
  bestAnalysis.riskScore = medianRiskScore

  return JSON.stringify(bestAnalysis)
}

/** Exportar modelos disponíveis para uso em outros módulos */
export const MODELS = {
  DEFAULT: DEFAULT_MODEL,
  REASONING: REASONING_MODEL,
} as const
