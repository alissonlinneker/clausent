/**
 * Prompt de sistema para análise estruturada de contratos.
 * Instrui o modelo a retornar JSON com campos específicos.
 *
 * O prompt detalha:
 * - Campos obrigatórios a extrair (título, partes, datas, valores, etc.)
 * - Categorias de contrato aceitas
 * - Tipos de cláusulas a identificar
 * - Diretrizes de pontuação de risco (0-100)
 */
export const CONTRACT_ANALYSIS_PROMPT = `You are a contract analysis expert. Analyze the following contract text and extract structured information.

Return a JSON object with exactly these fields:
{
  "title": "contract title",
  "counterparty": "other party name",
  "category": "saas" | "vendor" | "lease" | "insurance" | "other",
  "startDate": "ISO date string or null",
  "endDate": "ISO date string or null",
  "totalValue": "string number or null",
  "monthlyValue": "string number or null",
  "currency": "USD" (3-letter code),
  "autoRenew": boolean,
  "noticePeriodDays": number or null,
  "renewalTerms": "renewal conditions text or null",
  "riskScore": 0-100 (integer, higher = more risky),
  "summary": "2-3 sentence summary of key terms",
  "clauses": [
    {
      "type": "auto_renewal" | "termination" | "liability" | "indemnification" | "penalty" | "escalation" | "lock_in" | "data_privacy" | "sla" | "other",
      "text": "exact clause text from contract",
      "riskLevel": "low" | "medium" | "high" | "critical"
    }
  ]
}

Risk scoring guidelines:
- Auto-renewal without easy cancellation: +15 points
- Escalation clauses (price increases): +10 points
- High penalties for early termination: +20 points
- Long lock-in periods (>24 months): +15 points
- Unlimited liability: +25 points
- No SLA defined: +10 points
- Weak data privacy terms: +10 points
- Base score starts at 0, cap at 100

Be thorough in clause extraction. Flag every clause that could affect the business financially or legally.`

/** Tipo do resultado da análise retornada pelo modelo */
export interface ContractAnalysisResult {
  /** Título do contrato identificado */
  title: string
  /** Nome da contraparte (outra parte contratante) */
  counterparty: string
  /** Categoria do contrato */
  category: 'saas' | 'vendor' | 'lease' | 'insurance' | 'other'
  /** Data de início em formato ISO ou null se não encontrada */
  startDate: string | null
  /** Data de término em formato ISO ou null se não encontrada */
  endDate: string | null
  /** Valor total do contrato ou null */
  totalValue: string | null
  /** Valor mensal do contrato ou null */
  monthlyValue: string | null
  /** Código da moeda (3 letras, ex: USD) */
  currency: string
  /** Se o contrato possui renovação automática */
  autoRenew: boolean
  /** Prazo de aviso prévio para cancelamento em dias */
  noticePeriodDays: number | null
  /** Termos e condições de renovação */
  renewalTerms: string | null
  /** Pontuação de risco (0-100, quanto maior, mais arriscado) */
  riskScore: number
  /** Resumo executivo de 2-3 frases */
  summary: string
  /** Lista de cláusulas identificadas com tipo e nível de risco */
  clauses: Array<{
    /** Tipo da cláusula (auto_renewal, termination, liability, etc.) */
    type: string
    /** Texto exato da cláusula extraído do contrato */
    text: string
    /** Nível de risco da cláusula */
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
  }>
}
