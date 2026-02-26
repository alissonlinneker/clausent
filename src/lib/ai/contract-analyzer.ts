import { analyzeContractWithConsensus } from './deepseek'
import { CONTRACT_ANALYSIS_PROMPT, type ContractAnalysisResult } from './prompts'

/**
 * Analisa o texto de um contrato usando DeepSeek V3 com consenso 4-way.
 *
 * Envia o texto extraído do contrato para o DeepSeek com um prompt
 * especializado que instrui a extração estruturada de:
 * - Informações gerais (título, partes, categoria)
 * - Datas e valores financeiros
 * - Cláusulas com classificação de risco
 * - Pontuação de risco geral (0-100)
 *
 * Utiliza análise de consenso (4 chamadas paralelas)
 * para maior precisão e confiabilidade dos resultados.
 *
 * @param extractedText - Texto bruto extraído do documento contratual
 * @param category - Categoria do contrato (saas, vendor, lease, etc.)
 * @returns Dados estruturados da análise do contrato
 * @throws Error se nenhuma das 4 análises paralelas tiver sucesso
 */
export async function analyzeContract(
  extractedText: string,
  category: string = 'other'
): Promise<ContractAnalysisResult> {
  /** Executar análise com consenso 4-way via DeepSeek */
  const result = await analyzeContractWithConsensus(extractedText, category)

  /** Fazer parse do JSON retornado para o tipo esperado */
  const parsed = JSON.parse(result)

  return parsed as ContractAnalysisResult
}

/**
 * Verifica se o prompt do sistema está acessível.
 * Útil para health checks.
 */
export function getAnalysisPrompt(): string {
  return CONTRACT_ANALYSIS_PROMPT
}
