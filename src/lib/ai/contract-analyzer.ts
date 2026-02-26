import OpenAI from 'openai'
import { CONTRACT_ANALYSIS_PROMPT, type ContractAnalysisResult } from './prompts'

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
 * Analisa o texto de um contrato usando o modelo de linguagem.
 *
 * Envia o texto extraído do contrato para o modelo com um prompt
 * especializado que instrui a extração estruturada de:
 * - Informações gerais (título, partes, categoria)
 * - Datas e valores financeiros
 * - Cláusulas com classificação de risco
 * - Pontuação de risco geral (0-100)
 *
 * Usa response_format json_object para garantir que o modelo
 * retorne JSON válido, e temperature baixa (0.1) para respostas
 * mais determinísticas e precisas.
 *
 * @param extractedText - Texto bruto extraído do documento contratual
 * @returns Dados estruturados da análise do contrato
 * @throws Error se a resposta do modelo for vazia
 */
export async function analyzeContract(extractedText: string): Promise<ContractAnalysisResult> {
  const openai = getOpenAI()
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: CONTRACT_ANALYSIS_PROMPT },
      { role: 'user', content: extractedText },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  })

  /** Extrai o conteúdo da primeira escolha do modelo */
  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Resposta vazia do modelo')

  /** Faz o parse do JSON retornado para o tipo esperado */
  return JSON.parse(content) as ContractAnalysisResult
}
