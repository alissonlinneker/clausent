// @ts-nocheck
/**
 * Barrel file do módulo de inteligência artificial.
 *
 * Centraliza todas as exportações dos sub-módulos de IA,
 * facilitando importações em outros pontos da aplicação.
 *
 * Sub-módulos disponíveis:
 * - deepseek: Cliente e funções de chamada à API DeepSeek V3/R1
 * - analysis-engine: Motor de análise profunda de contratos (ContractAnalysisEngine)
 * - perplexity: Cliente e funções de chamada à API Perplexity Sonar Pro
 * - market-research: Motor de pesquisa de mercado (MarketResearchEngine)
 * - prompts: Prompts do sistema e tipos de resultado de análise
 * - benchmark-engine: Cálculo de percentis e insights comparativos
 * - contract-analyzer: Análise de contrato com consenso 4-way
 * - renegotiation-generator: Geração de pacotes de renegociação
 * - text-extractor: Extração de texto de documentos (PDF, DOCX, imagens)
 *
 * @module ai
 */

/* ========================================================================
 * DEEPSEEK — Cliente da API DeepSeek (compatível com OpenAI)
 * ====================================================================== */

export {
  callDeepSeek,
  analyzeContract as analyzeContractRaw,
  analyzeContractWithConsensus,
  MODELS,
} from './deepseek'

/* ========================================================================
 * ANALYSIS ENGINE — Motor de análise profunda de contratos
 * ====================================================================== */

export {
  ContractAnalysisEngine,
} from './analysis-engine'

export type {
  ContractMetadata,
  AnalysisResult,
  Clause,
  RiskAssessment,
} from './analysis-engine'

/* ========================================================================
 * PERPLEXITY — Cliente da API Perplexity Sonar Pro
 * ====================================================================== */

export {
  callPerplexity,
  extractCitations,
  PERPLEXITY_MODELS,
} from './perplexity'

export type {
  PerplexityChatMessage,
  PerplexityCitation,
  PerplexityResponse,
} from './perplexity'

/* ========================================================================
 * MARKET RESEARCH — Motor de pesquisa de mercado
 * ====================================================================== */

export {
  MarketResearchEngine,
} from './market-research'

export type {
  VendorReport,
  Benchmark,
  MarketInsight,
  ContractSummary,
} from './market-research'

/* ========================================================================
 * PROMPTS — Prompts do sistema e tipos de resultado
 * ====================================================================== */

export {
  CONTRACT_ANALYSIS_PROMPT,
} from './prompts'

export type {
  ContractAnalysisResult,
} from './prompts'

/* ========================================================================
 * BENCHMARK ENGINE — Cálculo de percentis e insights comparativos
 * ====================================================================== */

export {
  calculatePercentile,
  generateBenchmarkInsight,
} from './benchmark-engine'

export type {
  BenchmarkInsightInput,
} from './benchmark-engine'

/* ========================================================================
 * CONTRACT ANALYZER — Análise com consenso 4-way
 * ====================================================================== */

export {
  analyzeContract,
  getAnalysisPrompt,
} from './contract-analyzer'

/* ========================================================================
 * RENEGOTIATION GENERATOR — Geração de pacotes de renegociação
 * ====================================================================== */

export {
  generateRenegotiationPackage,
} from './renegotiation-generator'

export type {
  RenegotiationPoint,
  RenegotiationResult,
  RenegotiationInput,
} from './renegotiation-generator'

/* ========================================================================
 * TEXT EXTRACTOR — Extração de texto de documentos
 * ====================================================================== */

export {
  extractText,
} from './text-extractor'
