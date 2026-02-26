import OpenAI from 'openai'

/**
 * Instância lazy do cliente OpenAI.
 * Inicializada sob demanda para evitar erros em build time
 * quando OPENAI_API_KEY não está disponível.
 */
let _openai: OpenAI | null = null

/** Retorna a instância do OpenAI, criando-a se necessário */
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _openai
}

/**
 * Ponto individual de renegociação retornado pelo modelo.
 * Cada ponto possui prioridade, argumentação e estimativa de economia.
 */
export interface RenegotiationPoint {
  /** Prioridade do ponto (1 = mais prioritário, 5 = menos) */
  priority: number
  /** Título resumido do ponto de renegociação */
  title: string
  /** Argumentação detalhada para a negociação */
  argument: string
  /** Estimativa de economia potencial em USD */
  potentialSavings: number
}

/**
 * Resultado completo da geração do pacote de renegociação.
 * Contém os pontos priorizados, draft de email e economia total estimada.
 */
export interface RenegotiationResult {
  /** Lista de pontos de renegociação ordenados por prioridade */
  points: RenegotiationPoint[]
  /** Rascunho de email profissional pronto para envio à contraparte */
  draftEmail: string
  /** Estimativa total de economia em USD */
  estimatedSavings: number
}

/**
 * Dados de entrada necessários para gerar o pacote de renegociação.
 * Reúne informações do contrato, cláusulas e benchmarks de mercado.
 */
export interface RenegotiationInput {
  /** Título do contrato */
  title: string
  /** Nome da contraparte */
  counterparty: string | null
  /** Valor total do contrato */
  totalValue: string | null
  /** Valor mensal do contrato */
  monthlyValue: string | null
  /** Moeda do contrato */
  currency: string | null
  /** Se o contrato possui renovação automática */
  autoRenew: boolean | null
  /** Prazo de aviso prévio em dias */
  noticePeriodDays: number | null
  /** Termos de renovação */
  renewalTerms: string | null
  /** Cláusulas extraídas do contrato */
  clauses: Array<{
    type: string
    text: string
    riskLevel: string
  }>
  /** Benchmarks de mercado para comparação */
  benchmarks: Array<{
    metric: string
    yourValue: string | null
    marketAvg: string | null
    percentile: number | null
  }>
}

/**
 * Prompt de sistema para geração de pacotes de renegociação.
 * Instrui o modelo a retornar JSON estruturado com pontos priorizados,
 * argumentação fundamentada, draft de email e estimativa de economia.
 */
const RENEGOTIATION_PROMPT = `You are an expert contract negotiation advisor. Based on the contract data, clauses, and market benchmarks provided, generate a comprehensive renegotiation package.

Your task:
1. Identify 1-5 key renegotiation points, prioritized from most impactful to least
2. For each point, provide a strong business argument grounded in the data
3. Draft a professional, diplomatic email to send to the counterparty
4. Estimate potential savings for each point and total

Return a JSON object with exactly this structure:
{
  "points": [
    {
      "priority": 1,
      "title": "Short descriptive title",
      "argument": "Detailed argument with data references, market comparisons, and suggested terms",
      "potentialSavings": 5000.00
    }
  ],
  "draftEmail": "Full professional email text ready to send, including subject line on the first line prefixed with 'Subject: '",
  "estimatedSavings": 15000.00
}

Guidelines:
- Priority 1 = highest impact, most likely to succeed
- Arguments should reference specific clauses, market benchmarks, and financial data
- The email should be professional, assertive but collaborative, and reference specific data points
- Savings estimates should be realistic and based on the benchmark comparisons
- If benchmarks show you're paying above market average, highlight that specifically
- Focus on win-win outcomes where possible
- If auto-renewal clauses exist with unfavorable terms, prioritize those
- High-risk clauses (liability, penalties) should be flagged for renegotiation
- Always express savings in the contract's currency`

/**
 * Gera um pacote completo de renegociação usando o modelo de linguagem.
 *
 * O processo:
 * 1. Monta o contexto com dados do contrato, cláusulas e benchmarks
 * 2. Envia para o modelo com prompt especializado em renegociação
 * 3. Recebe JSON estruturado com pontos priorizados e draft de email
 *
 * Usa temperature 0.3 para respostas criativas porém consistentes,
 * e response_format json_object para garantir JSON válido.
 *
 * @param input - Dados do contrato, cláusulas e benchmarks
 * @returns Pacote de renegociação com pontos, email e economia estimada
 * @throws Error se a resposta do modelo for vazia
 */
export async function generateRenegotiationPackage(
  input: RenegotiationInput,
): Promise<RenegotiationResult> {
  const openai = getOpenAI()

  /** Monta o contexto do contrato para enviar ao modelo */
  const contractContext = `
CONTRACT DETAILS:
- Title: ${input.title}
- Counterparty: ${input.counterparty || 'Not specified'}
- Total Value: ${input.totalValue ? `${input.currency || 'USD'} ${input.totalValue}` : 'Not specified'}
- Monthly Value: ${input.monthlyValue ? `${input.currency || 'USD'} ${input.monthlyValue}` : 'Not specified'}
- Auto-Renew: ${input.autoRenew ? 'Yes' : 'No'}
- Notice Period: ${input.noticePeriodDays ? `${input.noticePeriodDays} days` : 'Not specified'}
- Renewal Terms: ${input.renewalTerms || 'Not specified'}

CLAUSES (${input.clauses.length} identified):
${input.clauses.map((c, i) => `${i + 1}. [${c.riskLevel.toUpperCase()}] ${c.type}: "${c.text}"`).join('\n')}

MARKET BENCHMARKS (${input.benchmarks.length} metrics):
${input.benchmarks.map((b) => {
  const comparison = b.yourValue && b.marketAvg
    ? `Your value: ${b.yourValue}, Market avg: ${b.marketAvg}${b.percentile ? `, Percentile: ${b.percentile}th` : ''}`
    : 'Insufficient data'
  return `- ${b.metric}: ${comparison}`
}).join('\n')}
`.trim()

  /** Chamada ao modelo com prompt de renegociação */
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: RENEGOTIATION_PROMPT },
      { role: 'user', content: contractContext },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  /** Extrai o conteúdo da resposta */
  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Resposta vazia do modelo')

  /** Faz parse do JSON e retorna o resultado tipado */
  return JSON.parse(content) as RenegotiationResult
}
