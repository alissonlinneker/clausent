// @ts-nocheck
/**
 * Motor de análise de contratos baseado em DeepSeek V3.
 *
 * Fornece análise profunda de contratos através de:
 * - Avaliação de risco com score granular (0-100)
 * - Identificação e categorização de cláusulas
 * - Geração de resumo executivo
 * - Avaliação de risco baseada em fatores ponderados
 *
 * Utiliza a API do DeepSeek (compatível com OpenAI) para
 * processamento de linguagem natural dos documentos contratuais.
 *
 * @module analysis-engine
 */

import { callDeepSeek } from './deepseek'

/* ========================================================================
 * TIPOS EXPORTADOS
 * ====================================================================== */

/**
 * Metadados do contrato fornecidos pelo usuário no upload.
 * Usados para contextualizar a análise do modelo.
 */
export interface ContractMetadata {
  /** Título ou nome identificador do contrato */
  title: string
  /** Nome do fornecedor ou contraparte */
  vendor: string
  /** Categoria do contrato (saas, vendor, lease, insurance, etc.) */
  category: string
  /** Tamanho do arquivo original em bytes */
  fileSize: number
}

/**
 * Resultado completo da análise de um contrato.
 * Retornado pelo método principal analyzeContract().
 */
export interface AnalysisResult {
  /** Pontuação de risco do contrato (0 = sem risco, 100 = risco máximo) */
  riskScore: number
  /** Nível de risco categorizado com base no score */
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  /** Resumo executivo do contrato em 2-3 frases */
  summary: string
  /** Lista de cláusulas identificadas no contrato */
  clauses: Clause[]
  /** Sugestões de melhoria e pontos de atenção */
  suggestions: string[]
  /** Benchmarks comparativos com padrões de mercado */
  benchmarks: {
    /** Métrica avaliada */
    metric: string
    /** Valor encontrado no contrato */
    contractValue: string
    /** Valor típico de mercado */
    marketAverage: string
    /** Avaliação da comparação */
    assessment: 'favorable' | 'neutral' | 'unfavorable'
  }[]
}

/**
 * Cláusula individual identificada no contrato.
 * Cada cláusula possui localização, tipo, risco e sugestão.
 */
export interface Clause {
  /** Texto exato da cláusula extraído do contrato */
  text: string
  /** Tipo/categoria da cláusula */
  type:
    | 'penalty'
    | 'auto-renewal'
    | 'liability'
    | 'termination'
    | 'indemnification'
    | 'escalation'
    | 'lock-in'
    | 'data-privacy'
    | 'sla'
    | 'confidentiality'
    | 'force-majeure'
    | 'other'
  /** Nível de risco da cláusula */
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  /** Sugestão de melhoria ou alternativa para a cláusula */
  suggestion: string
  /** Índice inicial da cláusula no texto original */
  startIndex: number
  /** Índice final da cláusula no texto original */
  endIndex: number
}

/**
 * Resultado da avaliação de risco agregada.
 * Calculado a partir das cláusulas identificadas.
 */
export interface RiskAssessment {
  /** Pontuação final de risco (0-100) */
  score: number
  /** Nível de risco derivado do score */
  level: 'low' | 'medium' | 'high' | 'critical'
  /** Fatores que contribuíram para a pontuação */
  factors: {
    /** Descrição do fator de risco */
    description: string
    /** Peso/impacto deste fator no score total */
    weight: number
    /** Cláusula(s) associada(s) a este fator */
    clauseTypes: string[]
  }[]
  /** Recomendações priorizadas para mitigação de riscos */
  recommendations: string[]
}

/* ========================================================================
 * PROMPTS DO SISTEMA
 * ====================================================================== */

/**
 * Prompt para análise completa do contrato.
 * Instrui o modelo a retornar JSON estruturado com todos os campos esperados.
 */
const FULL_ANALYSIS_PROMPT = `You are an expert contract analyst working for a SaaS platform that helps businesses manage vendor contracts. Analyze the provided contract text thoroughly and return a structured JSON analysis.

You MUST return a valid JSON object with exactly this structure:
{
  "riskScore": <number 0-100>,
  "riskLevel": "low" | "medium" | "high" | "critical",
  "summary": "<2-3 sentence executive summary>",
  "clauses": [
    {
      "text": "<exact clause text from contract>",
      "type": "penalty" | "auto-renewal" | "liability" | "termination" | "indemnification" | "escalation" | "lock-in" | "data-privacy" | "sla" | "confidentiality" | "force-majeure" | "other",
      "riskLevel": "low" | "medium" | "high" | "critical",
      "suggestion": "<improvement suggestion>",
      "startIndex": <number>,
      "endIndex": <number>
    }
  ],
  "suggestions": ["<actionable suggestion 1>", "<actionable suggestion 2>"],
  "benchmarks": [
    {
      "metric": "<metric name>",
      "contractValue": "<value from contract>",
      "marketAverage": "<typical market value>",
      "assessment": "favorable" | "neutral" | "unfavorable"
    }
  ]
}

Risk scoring guidelines:
- Auto-renewal without easy opt-out: +15 points
- Price escalation clauses: +10 points
- High early termination penalties: +20 points
- Lock-in periods > 24 months: +15 points
- Unlimited or uncapped liability: +25 points
- Missing SLA definitions: +10 points
- Weak data privacy protections: +10 points
- Missing force majeure clause: +5 points
- Base score starts at 0, cap at 100

Risk levels:
- 0-25: "low"
- 26-50: "medium"
- 51-75: "high"
- 76-100: "critical"

Be thorough — identify every clause that could affect the business financially or legally.
Respond ONLY with valid JSON. No text outside the JSON object.`

/**
 * Prompt para identificação e categorização de cláusulas individuais.
 * Foca exclusivamente na extração detalhada de cláusulas.
 */
const CLAUSE_IDENTIFICATION_PROMPT = `You are a legal clause identification specialist. Your task is to identify and categorize every significant clause in the provided contract text.

For each clause found, return a JSON array with objects in this format:
{
  "clauses": [
    {
      "text": "<exact clause text>",
      "type": "penalty" | "auto-renewal" | "liability" | "termination" | "indemnification" | "escalation" | "lock-in" | "data-privacy" | "sla" | "confidentiality" | "force-majeure" | "other",
      "riskLevel": "low" | "medium" | "high" | "critical",
      "suggestion": "<specific improvement suggestion or alternative language>",
      "startIndex": <approximate character index where clause starts>,
      "endIndex": <approximate character index where clause ends>
    }
  ]
}

Classification rules:
- "penalty": Financial penalties, liquidated damages, late fees
- "auto-renewal": Automatic renewal clauses, evergreen provisions
- "liability": Liability caps, limitations, exclusions
- "termination": Termination rights, notice periods, exit clauses
- "indemnification": Indemnity obligations, hold harmless clauses
- "escalation": Price increases, CPI adjustments, rate changes
- "lock-in": Minimum commitment periods, exclusivity clauses
- "data-privacy": Data handling, GDPR/CCPA compliance, data ownership
- "sla": Service level agreements, uptime guarantees, response times
- "confidentiality": NDA terms, trade secrets, information restrictions
- "force-majeure": Force majeure, acts of God, unforeseeable events
- "other": Any other significant clause

Risk assessment per clause:
- "low": Standard market terms, favorable to the subscriber
- "medium": Slightly unfavorable but common, worth noting
- "high": Significantly unfavorable, should be renegotiated
- "critical": Extremely risky, potential for major financial/legal impact

Be exhaustive — extract every meaningful clause. Respond ONLY with valid JSON.`

/**
 * Prompt para geração de resumo executivo.
 * Foca em concisão e clareza para decisores.
 */
const SUMMARY_PROMPT = `You are a contract summarization expert. Generate a concise executive summary of the provided contract.

The summary should:
1. Be 3-5 sentences maximum
2. Cover the key terms: parties involved, duration, financial terms, key obligations
3. Highlight any unusual or noteworthy provisions
4. Be written for a business executive audience (clear, no legal jargon)
5. Mention the most significant risk factors if any

Return ONLY the summary text as a plain string (not JSON). Do not include any prefixes like "Summary:" or "Executive Summary:".`

/* ========================================================================
 * PESOS DE RISCO POR TIPO DE CLÁUSULA
 * ====================================================================== */

/**
 * Tabela de pesos de risco por tipo de cláusula.
 * Usada no cálculo agregado de risco (assessRisk).
 * Valores representam a contribuição máxima de cada tipo ao score total.
 */
const CLAUSE_RISK_WEIGHTS: Record<string, number> = {
  'penalty': 20,
  'auto-renewal': 15,
  'liability': 25,
  'termination': 10,
  'indemnification': 15,
  'escalation': 10,
  'lock-in': 15,
  'data-privacy': 10,
  'sla': 10,
  'confidentiality': 5,
  'force-majeure': 5,
  'other': 5,
}

/**
 * Multiplicadores de severidade por nível de risco.
 * Aplicados sobre o peso base da cláusula.
 */
const RISK_LEVEL_MULTIPLIERS: Record<string, number> = {
  'low': 0.25,
  'medium': 0.5,
  'high': 0.75,
  'critical': 1.0,
}

/* ========================================================================
 * CLASSE PRINCIPAL
 * ====================================================================== */

/**
 * Motor de análise de contratos baseado em DeepSeek V3.
 *
 * Oferece análise completa de documentos contratuais incluindo:
 * - Análise de risco com score de 0 a 100
 * - Identificação e categorização de cláusulas
 * - Geração de resumo executivo
 * - Avaliação de risco ponderada por tipo de cláusula
 *
 * @example
 * ```typescript
 * const engine = new ContractAnalysisEngine()
 * const resultado = await engine.analyzeContract(textoContrato, {
 *   title: 'Contrato SaaS',
 *   vendor: 'Acme Corp',
 *   category: 'saas',
 *   fileSize: 102400,
 * })
 * console.log(resultado.riskScore) // 42
 * console.log(resultado.riskLevel) // 'medium'
 * ```
 */
export class ContractAnalysisEngine {
  /**
   * Realiza análise completa de um contrato.
   *
   * Envia o texto do contrato para o DeepSeek V3 com um prompt
   * especializado que instrui a extração de risco, cláusulas,
   * sugestões e benchmarks de mercado.
   *
   * @param text - Texto completo do contrato extraído do documento
   * @param metadata - Metadados do contrato (título, fornecedor, categoria, tamanho)
   * @returns Resultado estruturado da análise com score, cláusulas e sugestões
   * @throws Error se a resposta do modelo for vazia ou o JSON inválido
   */
  async analyzeContract(
    text: string,
    metadata: ContractMetadata
  ): Promise<AnalysisResult> {
    /** Monta contexto adicional com metadados para o modelo */
    const contextPrefix = `Contract metadata:
- Title: ${metadata.title}
- Vendor: ${metadata.vendor}
- Category: ${metadata.category}
- File size: ${metadata.fileSize} bytes

Contract text:
`

    /** Envia para o DeepSeek com modo JSON ativado */
    const response = await callDeepSeek(
      [
        { role: 'system', content: FULL_ANALYSIS_PROMPT },
        { role: 'user', content: contextPrefix + text },
      ],
      {
        temperature: 0.1,
        maxTokens: 8192,
        jsonMode: true,
      }
    )

    /** Extrai conteúdo da resposta */
    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Resposta vazia do modelo na análise do contrato')
    }

    /** Faz parse e valida a estrutura básica */
    const parsed = JSON.parse(content) as AnalysisResult

    /** Garante que o riskLevel está consistente com o score */
    parsed.riskLevel = this.scoreToLevel(parsed.riskScore)

    return parsed
  }

  /**
   * Identifica e categoriza todas as cláusulas de um contrato.
   *
   * Utiliza um prompt especializado que instrui o modelo a
   * extrair cada cláusula significativa, classificar seu tipo
   * (penalty, auto-renewal, liability, etc.) e avaliar o nível
   * de risco individual.
   *
   * @param text - Texto completo do contrato
   * @returns Lista de cláusulas identificadas com tipo, risco e sugestão
   * @throws Error se a resposta do modelo for vazia ou o JSON inválido
   */
  async identifyClauses(text: string): Promise<Clause[]> {
    /** Envia texto para o DeepSeek com prompt de identificação de cláusulas */
    const response = await callDeepSeek(
      [
        { role: 'system', content: CLAUSE_IDENTIFICATION_PROMPT },
        { role: 'user', content: text },
      ],
      {
        temperature: 0.1,
        maxTokens: 8192,
        jsonMode: true,
      }
    )

    /** Extrai conteúdo da resposta */
    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Resposta vazia do modelo na identificação de cláusulas')
    }

    /** Faz parse e extrai o array de cláusulas */
    const parsed = JSON.parse(content)

    /** Aceita tanto { clauses: [...] } quanto [...] diretamente */
    const clauses: Clause[] = Array.isArray(parsed) ? parsed : parsed.clauses || []

    return clauses
  }

  /**
   * Gera um resumo executivo do contrato.
   *
   * O resumo é destinado a decisores de negócio e cobre:
   * partes envolvidas, duração, termos financeiros, obrigações
   * principais e fatores de risco notáveis.
   *
   * @param text - Texto completo do contrato
   * @returns Resumo executivo em texto plano (3-5 frases)
   * @throws Error se a resposta do modelo for vazia
   */
  async generateSummary(text: string): Promise<string> {
    /** Envia texto para o DeepSeek com prompt de sumarização */
    const response = await callDeepSeek(
      [
        { role: 'system', content: SUMMARY_PROMPT },
        { role: 'user', content: text },
      ],
      {
        temperature: 0.3,
        maxTokens: 1024,
      }
    )

    /** Extrai conteúdo da resposta */
    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Resposta vazia do modelo na geração do resumo')
    }

    return content.trim()
  }

  /**
   * Avalia o risco agregado com base nas cláusulas identificadas.
   *
   * O cálculo segue esta lógica:
   * 1. Para cada cláusula, obtém o peso base do tipo (CLAUSE_RISK_WEIGHTS)
   * 2. Multiplica pelo fator de severidade do nível de risco (RISK_LEVEL_MULTIPLIERS)
   * 3. Soma todas as contribuições, limitando a 100
   * 4. Gera fatores descritivos e recomendações de mitigação
   *
   * Este método é síncrono — não faz chamadas à API.
   *
   * @param clauses - Lista de cláusulas previamente identificadas
   * @returns Avaliação de risco com score, fatores e recomendações
   */
  assessRisk(clauses: Clause[]): RiskAssessment {
    /** Agrupa cláusulas por tipo para cálculo de peso */
    const clausesByType = new Map<string, Clause[]>()
    for (const clause of clauses) {
      const existing = clausesByType.get(clause.type) || []
      existing.push(clause)
      clausesByType.set(clause.type, existing)
    }

    /** Calcula a contribuição de cada tipo de cláusula ao score */
    const factors: RiskAssessment['factors'] = []
    let totalScore = 0

    for (const [type, typeClauses] of clausesByType) {
      /** Peso base do tipo de cláusula */
      const baseWeight = CLAUSE_RISK_WEIGHTS[type] || 5

      /**
       * Pega o nível de risco mais alto entre as cláusulas do mesmo tipo.
       * Usa a cláusula mais arriscada para definir o multiplicador.
       */
      const maxRiskLevel = this.getMaxRiskLevel(typeClauses)
      const multiplier = RISK_LEVEL_MULTIPLIERS[maxRiskLevel] || 0.5

      /** Calcula contribuição deste tipo ao score total */
      const contribution = baseWeight * multiplier

      totalScore += contribution

      /** Monta descrição do fator de risco */
      factors.push({
        description: `${typeClauses.length} cláusula(s) do tipo "${type}" com risco ${maxRiskLevel}`,
        weight: Math.round(contribution),
        clauseTypes: [type],
      })
    }

    /** Limita o score a 100 */
    const finalScore = Math.min(Math.round(totalScore), 100)
    const level = this.scoreToLevel(finalScore)

    /** Gera recomendações baseadas nos fatores identificados */
    const recommendations = this.generateRecommendations(clausesByType)

    return {
      score: finalScore,
      level,
      factors,
      recommendations,
    }
  }

  /* ======================================================================
   * MÉTODOS PRIVADOS
   * ==================================================================== */

  /**
   * Converte um score numérico (0-100) para nível de risco textual.
   *
   * @param score - Pontuação de risco (0-100)
   * @returns Nível de risco correspondente
   */
  private scoreToLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score <= 25) return 'low'
    if (score <= 50) return 'medium'
    if (score <= 75) return 'high'
    return 'critical'
  }

  /**
   * Retorna o nível de risco mais alto de uma lista de cláusulas.
   *
   * @param clauses - Lista de cláusulas do mesmo tipo
   * @returns Nível de risco mais alto encontrado
   */
  private getMaxRiskLevel(clauses: Clause[]): string {
    /** Ordem de severidade para comparação */
    const severityOrder = ['low', 'medium', 'high', 'critical']

    let maxIndex = 0
    for (const clause of clauses) {
      const index = severityOrder.indexOf(clause.riskLevel)
      if (index > maxIndex) {
        maxIndex = index
      }
    }

    return severityOrder[maxIndex]
  }

  /**
   * Gera recomendações de mitigação baseadas nos tipos de cláusula encontrados.
   * Prioriza cláusulas de alto risco e fornece ações específicas.
   *
   * @param clausesByType - Mapa de cláusulas agrupadas por tipo
   * @returns Lista de recomendações priorizadas
   */
  private generateRecommendations(
    clausesByType: Map<string, Clause[]>
  ): string[] {
    const recommendations: string[] = []

    /** Recomendações específicas por tipo de cláusula */
    if (clausesByType.has('liability')) {
      const liabilityClauses = clausesByType.get('liability')!
      const hasCritical = liabilityClauses.some((c) => c.riskLevel === 'critical')
      if (hasCritical) {
        recommendations.push(
          'Negociar limite de responsabilidade (liability cap) proporcional ao valor do contrato'
        )
      }
    }

    if (clausesByType.has('auto-renewal')) {
      recommendations.push(
        'Solicitar cláusula de aviso prévio para renovação automática com prazo mínimo de 60 dias'
      )
    }

    if (clausesByType.has('penalty')) {
      const penaltyClauses = clausesByType.get('penalty')!
      const hasHigh = penaltyClauses.some(
        (c) => c.riskLevel === 'high' || c.riskLevel === 'critical'
      )
      if (hasHigh) {
        recommendations.push(
          'Renegociar penalidades para valores proporcionais ao período restante do contrato'
        )
      }
    }

    if (clausesByType.has('escalation')) {
      recommendations.push(
        'Incluir teto máximo para reajustes anuais (cap) e vincular a índice oficial (CPI)'
      )
    }

    if (clausesByType.has('lock-in')) {
      recommendations.push(
        'Negociar redução do período de lock-in ou inclusão de cláusula de saída antecipada'
      )
    }

    if (!clausesByType.has('sla')) {
      recommendations.push(
        'Solicitar inclusão de SLA com métricas claras de uptime, tempo de resposta e penalidades'
      )
    }

    if (!clausesByType.has('data-privacy')) {
      recommendations.push(
        'Incluir cláusulas de proteção de dados alinhadas com LGPD/GDPR/CCPA'
      )
    }

    if (!clausesByType.has('force-majeure')) {
      recommendations.push(
        'Incluir cláusula de força maior para proteção contra eventos imprevisíveis'
      )
    }

    return recommendations
  }
}
