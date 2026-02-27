// @ts-nocheck
/**
 * Motor de pesquisa de mercado baseado em Perplexity Sonar Pro.
 *
 * Utiliza a capacidade de busca web em tempo real do Perplexity
 * para fornecer dados atualizados sobre:
 * - Reputação e histórico de fornecedores
 * - Benchmarks de mercado para comparação contratual
 * - Insights e tendências relevantes para negociações
 *
 * Todos os dados retornados incluem citações de fontes
 * verificáveis, garantindo rastreabilidade das informações.
 *
 * @module market-research
 */

import { callPerplexity, extractCitations } from './perplexity'

/* ========================================================================
 * TIPOS EXPORTADOS
 * ====================================================================== */

/**
 * Relatório completo sobre um fornecedor/vendor.
 * Inclui reputação, riscos, notícias e citações das fontes.
 */
export interface VendorReport {
  /** Nome do fornecedor pesquisado */
  name: string
  /** Avaliação geral de reputação */
  reputation: {
    /** Score de reputação (0-100, quanto maior, melhor) */
    score: number
    /** Nível categorizado */
    level: 'excellent' | 'good' | 'average' | 'poor' | 'unknown'
    /** Resumo da reputação em 2-3 frases */
    summary: string
  }
  /** Riscos identificados sobre o fornecedor */
  risks: {
    /** Título do risco */
    title: string
    /** Descrição detalhada */
    description: string
    /** Severidade do risco */
    severity: 'low' | 'medium' | 'high'
  }[]
  /** Notícias recentes relevantes sobre o fornecedor */
  newsItems: {
    /** Título da notícia */
    title: string
    /** Resumo da notícia */
    summary: string
    /** Data aproximada (ISO string ou descrição) */
    date: string
    /** Sentimento da notícia */
    sentiment: 'positive' | 'neutral' | 'negative'
  }[]
  /** Citações das fontes utilizadas na pesquisa */
  citations: {
    /** URL da fonte */
    url: string
    /** Título da fonte (quando disponível) */
    title?: string
  }[]
}

/**
 * Benchmark de mercado para uma métrica contratual específica.
 * Permite comparar valores do contrato com padrões da indústria.
 */
export interface Benchmark {
  /** Nome da métrica (ex: "SaaS Contract Duration", "Monthly Cost per Seat") */
  metric: string
  /** Valor médio de mercado para esta métrica */
  marketAverage: string
  /** Percentil em que o valor do contrato se encontra (0-100) */
  percentile: number
  /** Fonte da informação do benchmark */
  source: string
}

/**
 * Insight de mercado relevante para o contrato em análise.
 * Informações contextuais que podem influenciar a negociação.
 */
export interface MarketInsight {
  /** Título descritivo do insight */
  title: string
  /** Descrição detalhada com dados de suporte */
  description: string
  /** Nível de relevância para o contrato específico */
  relevance: 'high' | 'medium' | 'low'
  /** Fonte da informação */
  source: string
}

/**
 * Resumo dos dados do contrato fornecido como contexto
 * para a pesquisa de mercado.
 */
export interface ContractSummary {
  /** Título do contrato */
  title: string
  /** Nome do fornecedor/contraparte */
  vendor: string
  /** Categoria do contrato */
  category: string
  /** Valor total do contrato (string para preservar formatação) */
  value: string | null
  /** Duração do contrato em meses */
  duration: number | null
}

/* ========================================================================
 * PROMPTS DO SISTEMA
 * ====================================================================== */

/**
 * Prompt para pesquisa de fornecedor.
 * Instrui o Perplexity a buscar informações abrangentes sobre a empresa.
 */
const VENDOR_RESEARCH_PROMPT = `You are a vendor due diligence research analyst. Your job is to research companies and provide comprehensive reports about their reputation, reliability, and any potential risks.

Search for and compile information about the specified vendor including:
1. Company reputation and market standing
2. Financial stability indicators
3. Customer satisfaction and reviews
4. Any legal issues, lawsuits, or regulatory actions
5. Recent news (positive and negative)
6. Industry positioning

Return a JSON object with exactly this structure:
{
  "name": "<vendor name>",
  "reputation": {
    "score": <0-100>,
    "level": "excellent" | "good" | "average" | "poor" | "unknown",
    "summary": "<2-3 sentence reputation summary>"
  },
  "risks": [
    {
      "title": "<risk title>",
      "description": "<detailed description>",
      "severity": "low" | "medium" | "high"
    }
  ],
  "newsItems": [
    {
      "title": "<news headline>",
      "summary": "<brief summary>",
      "date": "<approximate date or description>",
      "sentiment": "positive" | "neutral" | "negative"
    }
  ]
}

Reputation scoring:
- 80-100: "excellent" - Strong market leader, excellent reviews, no significant issues
- 60-79: "good" - Well-regarded, minor issues but generally reliable
- 40-59: "average" - Mixed reviews, some concerns worth noting
- 20-39: "poor" - Significant issues, customer complaints, legal problems
- 0-19: "unknown" - Insufficient information available

Be factual and cite specific sources. If information is not available, say so rather than speculating.
Respond ONLY with valid JSON.`

/**
 * Prompt para busca de benchmarks de mercado.
 * Instrui o Perplexity a encontrar dados comparativos da indústria.
 */
const BENCHMARKS_PROMPT = `You are a market research analyst specializing in contract benchmarking. Your task is to find current market benchmarks for specific contract metrics.

Search for and provide benchmark data relevant to the specified contract category and clause type. Include:
1. Industry-standard values and ranges
2. Market averages from reputable sources
3. Best practices and typical terms
4. Recent trends affecting these benchmarks

Return a JSON object with this structure:
{
  "benchmarks": [
    {
      "metric": "<specific metric name>",
      "marketAverage": "<average value with units>",
      "percentile": <estimated percentile 0-100>,
      "source": "<source name or URL>"
    }
  ]
}

Focus on recent data (last 2 years). Be specific with numbers and always cite sources.
If specific data is unavailable, provide the closest available benchmark with a note.
Respond ONLY with valid JSON.`

/**
 * Prompt para insights de mercado.
 * Instrui o Perplexity a buscar tendências e informações contextuais.
 */
const MARKET_INSIGHTS_PROMPT = `You are a strategic market analyst providing insights for contract negotiations. Based on the contract details provided, search for relevant market trends, industry news, and strategic insights.

Focus on:
1. Industry trends affecting this type of contract
2. Pricing trends in this category
3. Regulatory changes that might impact the agreement
4. Competitive landscape information
5. Negotiation leverage points based on market conditions

Return a JSON object with this structure:
{
  "insights": [
    {
      "title": "<concise insight title>",
      "description": "<detailed description with supporting data>",
      "relevance": "high" | "medium" | "low",
      "source": "<source name or URL>"
    }
  ]
}

Prioritize insights by relevance to the specific contract. Include 3-7 insights.
Be factual, cite sources, and focus on actionable information.
Respond ONLY with valid JSON.`

/* ========================================================================
 * CLASSE PRINCIPAL
 * ====================================================================== */

/**
 * Motor de pesquisa de mercado baseado em Perplexity Sonar Pro.
 *
 * Fornece dados em tempo real da internet para enriquecer
 * a análise de contratos com informações contextuais:
 * - Relatórios de due diligence de fornecedores
 * - Benchmarks comparativos de mercado
 * - Insights estratégicos para negociação
 *
 * Todas as respostas incluem citações de fontes verificáveis.
 *
 * @example
 * ```typescript
 * const engine = new MarketResearchEngine()
 *
 * // Pesquisar fornecedor
 * const report = await engine.researchVendor('Salesforce', 'SaaS')
 * console.log(report.reputation.score) // 85
 * console.log(report.risks.length)     // 2
 *
 * // Buscar benchmarks
 * const benchmarks = await engine.getBenchmarks('saas', 'pricing')
 * console.log(benchmarks[0].marketAverage) // "$50/user/month"
 * ```
 */
export class MarketResearchEngine {
  /**
   * Pesquisa informações detalhadas sobre um fornecedor/vendor.
   *
   * Realiza uma busca web em tempo real para compilar um relatório
   * de due diligence incluindo reputação, riscos identificados,
   * notícias recentes e citações das fontes consultadas.
   *
   * @param vendorName - Nome da empresa/fornecedor a pesquisar
   * @param industry - Indústria ou setor de atuação do fornecedor
   * @returns Relatório completo do fornecedor com citações
   * @throws Error se a resposta do modelo for vazia ou JSON inválido
   */
  async researchVendor(
    vendorName: string,
    industry: string
  ): Promise<VendorReport> {
    /** Monta query contextualizada com nome e indústria */
    const userQuery = `Research the company "${vendorName}" in the ${industry} industry. Provide a comprehensive vendor due diligence report including reputation, risks, and recent news.`

    /** Envia para o Perplexity com busca web ativa */
    const response = await callPerplexity(
      [
        { role: 'system', content: VENDOR_RESEARCH_PROMPT },
        { role: 'user', content: userQuery },
      ],
      {
        temperature: 0.2,
        maxTokens: 4096,
      }
    )

    /** Extrai conteúdo da resposta */
    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Resposta vazia do Perplexity na pesquisa de fornecedor')
    }

    /** Faz parse do JSON retornado */
    const parsed = JSON.parse(content) as Omit<VendorReport, 'citations'>

    /** Extrai citações da resposta do Perplexity */
    const citations = extractCitations(response).map((c) => ({
      url: c.url,
      title: c.title,
    }))

    /** Retorna relatório completo com citações anexadas */
    return {
      ...parsed,
      citations,
    }
  }

  /**
   * Busca benchmarks de mercado para uma categoria e tipo de cláusula.
   *
   * Pesquisa dados atualizados da internet sobre valores típicos,
   * condições padrão e melhores práticas para o tipo de contrato
   * e cláusula especificados.
   *
   * @param category - Categoria do contrato (saas, vendor, lease, etc.)
   * @param clauseType - Tipo de cláusula a benchmarkar (pricing, duration, sla, etc.)
   * @returns Lista de benchmarks com métricas, médias e fontes
   * @throws Error se a resposta do modelo for vazia ou JSON inválido
   */
  async getBenchmarks(
    category: string,
    clauseType: string
  ): Promise<Benchmark[]> {
    /** Monta query específica para a categoria e tipo */
    const userQuery = `Find current market benchmarks for "${clauseType}" clauses in "${category}" contracts. Include industry averages, typical ranges, and standard terms for ${new Date().getFullYear()}.`

    /** Envia para o Perplexity */
    const response = await callPerplexity(
      [
        { role: 'system', content: BENCHMARKS_PROMPT },
        { role: 'user', content: userQuery },
      ],
      {
        temperature: 0.2,
        maxTokens: 4096,
      }
    )

    /** Extrai conteúdo da resposta */
    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Resposta vazia do Perplexity na busca de benchmarks')
    }

    /** Faz parse e extrai array de benchmarks */
    const parsed = JSON.parse(content)

    /** Aceita tanto { benchmarks: [...] } quanto [...] diretamente */
    const benchmarks: Benchmark[] = Array.isArray(parsed)
      ? parsed
      : parsed.benchmarks || []

    return benchmarks
  }

  /**
   * Obtém insights de mercado relevantes para um contrato específico.
   *
   * Com base nos detalhes do contrato, pesquisa tendências de mercado,
   * mudanças regulatórias, condições competitivas e outros fatores
   * que podem influenciar a negociação.
   *
   * @param contractDetails - Resumo dos dados do contrato para contexto
   * @returns Lista de insights priorizados por relevância
   * @throws Error se a resposta do modelo for vazia ou JSON inválido
   */
  async getMarketInsights(
    contractDetails: ContractSummary
  ): Promise<MarketInsight[]> {
    /** Monta contexto detalhado do contrato */
    const contractContext = `Contract details:
- Title: ${contractDetails.title}
- Vendor: ${contractDetails.vendor}
- Category: ${contractDetails.category}
- Value: ${contractDetails.value || 'Not specified'}
- Duration: ${contractDetails.duration ? `${contractDetails.duration} months` : 'Not specified'}

Provide market insights relevant to this specific contract and negotiation.`

    /** Envia para o Perplexity */
    const response = await callPerplexity(
      [
        { role: 'system', content: MARKET_INSIGHTS_PROMPT },
        { role: 'user', content: contractContext },
      ],
      {
        temperature: 0.3,
        maxTokens: 4096,
      }
    )

    /** Extrai conteúdo da resposta */
    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Resposta vazia do Perplexity na busca de insights')
    }

    /** Faz parse e extrai array de insights */
    const parsed = JSON.parse(content)

    /** Aceita tanto { insights: [...] } quanto [...] diretamente */
    const insights: MarketInsight[] = Array.isArray(parsed)
      ? parsed
      : parsed.insights || []

    /** Ordena por relevância (high > medium > low) */
    const relevanceOrder = { high: 0, medium: 1, low: 2 }
    insights.sort(
      (a, b) => (relevanceOrder[a.relevance] || 2) - (relevanceOrder[b.relevance] || 2)
    )

    return insights
  }
}
