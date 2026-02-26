/**
 * Módulo de Segurança contra Prompt Injection
 *
 * Proteção multi-camada contra ataques de injeção de prompt quando
 * conteúdo fornecido pelo usuário é enviado a APIs de LLM (OpenAI, etc.).
 *
 * Camadas de proteção:
 * 1. Sanitização de entrada — Escapa/remove caracteres e sequências perigosas
 * 2. Delimitadores seguros — Fronteiras claras entre instruções do sistema e conteúdo do usuário
 * 3. Detecção de padrões — Identifica e sinaliza tentativas comuns de injection
 * 4. Limites de tamanho — Previne abuso por inputs excessivamente grandes
 *
 * Referência de ameaças:
 * - OWASP LLM Top 10: LLM01 (Prompt Injection)
 * - https://llmtop10.com/
 */

// ==================== CONFIGURAÇÃO ====================

/**
 * Comprimento máximo permitido para inputs de texto do usuário (caracteres).
 * Suficiente para a maioria dos use cases de agentes AI, mas previne abuso.
 * ~100 páginas de texto.
 */
export const MAX_INPUT_LENGTH = 300_000;

/**
 * Comprimento mínimo esperado para inputs válidos.
 * Previne inputs vazios ou suspeitosamente curtos.
 */
export const MIN_INPUT_LENGTH = 1;

/**
 * Delimitadores usados para separar instruções do sistema e conteúdo do usuário.
 * Usa strings únicas e difíceis de adivinhar que não devem aparecer em conteúdo legítimo.
 */
export const DELIMITERS = {
  /** Marca o início do conteúdo fornecido pelo usuário */
  CONTENT_START: '<<<ORBIT_USER_CONTENT_START_x9k4m7p2>>>',
  /** Marca o fim do conteúdo fornecido pelo usuário */
  CONTENT_END: '<<<ORBIT_USER_CONTENT_END_x9k4m7p2>>>',
  /** Marcador de fronteira de instruções do sistema */
  INSTRUCTION_BOUNDARY: '###ORBIT_SYSTEM_INSTRUCTION_BOUNDARY###',
} as const;

// ==================== PADRÕES DE INJECTION ====================

/**
 * Definição de um padrão de injection com nível de risco.
 * Cada padrão detecta uma técnica específica de ataque.
 */
interface InjectionPattern {
  /** Regex para detecção */
  pattern: RegExp;
  /** Gravidade da ameaça */
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  /** Descrição legível da ameaça */
  description: string;
}

/**
 * Catálogo de padrões de prompt injection conhecidos.
 *
 * Organizado por nível de risco:
 * - critical: Tentativas diretas de manipulação de instruções
 * - high: Manipulação de papel/role e jailbreaks
 * - medium: Manipulação de fronteiras e extração de informações
 * - low: Padrões suspeitos que podem ser legítimos
 */
const INJECTION_PATTERNS: InjectionPattern[] = [
  // ===== CRÍTICO — Manipulação direta de instruções =====
  {
    pattern: /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/gi,
    riskLevel: 'critical',
    description: 'Tentativa de ignorar instruções anteriores',
  },
  {
    pattern: /disregard\s+(all\s+)?(previous|above|prior|your)\s+(instructions?|prompts?|rules?|guidelines?)/gi,
    riskLevel: 'critical',
    description: 'Tentativa de desconsiderar instruções',
  },
  {
    pattern: /forget\s+(everything|all|what)\s+(you\s+)?(know|learned|were\s+told)/gi,
    riskLevel: 'critical',
    description: 'Tentativa de resetar memória/instruções da IA',
  },
  {
    pattern: /override\s+(system|your|these)\s+(instructions?|rules?|prompts?)/gi,
    riskLevel: 'critical',
    description: 'Tentativa de sobrescrever instruções do sistema',
  },

  // ===== ALTO — Manipulação de papel (role) =====
  {
    pattern: /new\s+(system\s+)?prompt/gi,
    riskLevel: 'high',
    description: 'Tentativa de injetar novo system prompt',
  },
  {
    pattern: /you\s+are\s+(now|actually|really)\s+(a|an|the)\s+/gi,
    riskLevel: 'high',
    description: 'Tentativa de mudar o papel da IA',
  },
  {
    pattern: /pretend\s+(you\s+are|to\s+be)\s+/gi,
    riskLevel: 'high',
    description: 'Tentativa de fazer a IA fingir ser outra coisa',
  },
  {
    pattern: /act\s+as\s+(if|a|an|the)\s+/gi,
    riskLevel: 'high',
    description: 'Tentativa de alterar comportamento da IA',
  },

  // ===== ALTO — Manipulação de output =====
  {
    pattern: /output\s+(only|just|exactly)\s*[:\-]?\s*(true|false|yes|no|null|undefined)/gi,
    riskLevel: 'high',
    description: 'Tentativa de forçar saída específica',
  },
  {
    pattern: /return\s+(exactly|only)\s*[:\-]?\s*\{/gi,
    riskLevel: 'high',
    description: 'Tentativa de controlar saída JSON',
  },
  {
    pattern: /respond\s+(with|using)\s+(only|exactly|just)\s*:/gi,
    riskLevel: 'high',
    description: 'Tentativa de forçar formato de resposta',
  },

  // ===== ALTO — Técnicas de jailbreak =====
  {
    pattern: /DAN\s*(mode|prompt)?/gi,
    riskLevel: 'high',
    description: 'Tentativa de jailbreak DAN',
  },
  {
    pattern: /jailbreak/gi,
    riskLevel: 'high',
    description: 'Menção explícita de jailbreak',
  },
  {
    pattern: /developer\s+mode\s+(enabled|on|active)/gi,
    riskLevel: 'high',
    description: 'Tentativa de jailbreak via developer mode',
  },

  // ===== MÉDIO — Manipulação de fronteiras de instrução =====
  {
    pattern: /```\s*(system|assistant|user)\s*\n/gi,
    riskLevel: 'medium',
    description: 'Tentativa de injetar role markers em code blocks',
  },
  {
    pattern: /<\|?(system|assistant|user|im_start|im_end)\|?>/gi,
    riskLevel: 'high',
    description: 'Tentativa de injetar tokens de chat markup',
  },
  {
    pattern: /\[\[(system|assistant|user)\]\]/gi,
    riskLevel: 'medium',
    description: 'Tentativa de injetar role markers com colchetes',
  },

  // ===== MÉDIO — Tentativas de extração de informações =====
  {
    pattern: /reveal\s+(your|the)\s+(system\s+)?(prompt|instructions?|rules?)/gi,
    riskLevel: 'medium',
    description: 'Tentativa de extrair system prompt',
  },
  {
    pattern: /show\s+(me\s+)?(your|the)\s+(system\s+)?(prompt|instructions?)/gi,
    riskLevel: 'medium',
    description: 'Tentativa de revelar instruções',
  },
  {
    pattern: /what\s+(are|were)\s+your\s+(initial|original|system)\s+(instructions?|prompts?)/gi,
    riskLevel: 'medium',
    description: 'Tentativa de consultar instruções do sistema',
  },

  // ===== MÉDIO — Marcadores de protocolo Anthropic/OpenAI =====
  {
    pattern: /Human:/gi,
    riskLevel: 'medium',
    description: 'Marcador de protocolo Anthropic (Human:)',
  },
  {
    pattern: /Assistant:/gi,
    riskLevel: 'medium',
    description: 'Marcador de protocolo Anthropic (Assistant:)',
  },

  // ===== BAIXO — Padrões suspeitos (podem ser legítimos) =====
  {
    pattern: /\bAPI_KEY\b|\bSECRET\b|\bPASSWORD\b|\bTOKEN\b/gi,
    riskLevel: 'low',
    description: 'Contém palavras-chave de dados sensíveis',
  },
];

// ==================== SEQUÊNCIAS DE ESCAPE ====================

/**
 * Caracteres e sequências perigosas que são escapados/removidos do input.
 * Cada regra tem um padrão de busca, substituição e descrição.
 */
const ESCAPE_SEQUENCES: Array<{ find: RegExp; replace: string; description: string }> = [
  // Bytes nulos e caracteres de controle (exceto newlines e tabs)
  { find: /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, replace: '', description: 'Caracteres de controle' },

  // Delimitadores comuns de prompt injection
  { find: /```/g, replace: '`\u200B`\u200B`', description: 'Triple backticks' },
  { find: /<\|/g, replace: '<\u200B|', description: 'Token de início OpenAI' },
  { find: /\|>/g, replace: '|\u200B>', description: 'Token de fim OpenAI' },

  // Marcadores de role em potencial
  { find: /\[\[SYSTEM\]\]/gi, replace: '[SYSTEM]', description: 'Marcador de role SYSTEM' },
  { find: /\[\[USER\]\]/gi, replace: '[USER]', description: 'Marcador de role USER' },
  { find: /\[\[ASSISTANT\]\]/gi, replace: '[ASSISTANT]', description: 'Marcador de role ASSISTANT' },

  // Tags XML que podem confundir o modelo
  { find: /<system>/gi, replace: '&lt;system&gt;', description: 'Tag XML system' },
  { find: /<\/system>/gi, replace: '&lt;/system&gt;', description: 'Tag XML /system' },
  { find: /<user>/gi, replace: '&lt;user&gt;', description: 'Tag XML user' },
  { find: /<\/user>/gi, replace: '&lt;/user&gt;', description: 'Tag XML /user' },
  { find: /<assistant>/gi, replace: '&lt;assistant&gt;', description: 'Tag XML assistant' },
  { find: /<\/assistant>/gi, replace: '&lt;/assistant&gt;', description: 'Tag XML /assistant' },

  // Marcadores de protocolo Anthropic
  { find: /Human:/gi, replace: 'Human\u200B:', description: 'Marcador Anthropic Human' },
  { find: /Assistant:/gi, replace: 'Assistant\u200B:', description: 'Marcador Anthropic Assistant' },

  // Keyword system isolada em linha
  { find: /^system$/gim, replace: 'system\u200B', description: 'Keyword system isolada' },

  // Newlines excessivos (potencial injeção de delimitadores)
  { find: /\n{5,}/g, replace: '\n\n\n\n', description: 'Newlines excessivos' },

  // Espaços excessivos (potencial ofuscação)
  { find: / {10,}/g, replace: '          ', description: 'Espaços excessivos' },
];

// ==================== FUNÇÕES PÚBLICAS ====================

/**
 * Sanitiza o input do usuário escapando caracteres perigosos e
 * removendo padrões de prompt injection.
 *
 * Esta função aplica múltiplas camadas de sanitização:
 * 1. Trunca inputs que excedem o limite máximo
 * 2. Detecta e neutraliza padrões de injection conhecidos (zero-width spaces)
 * 3. Escapa sequências perigosas (tokens de chat, tags XML, etc.)
 * 4. Remove delimitadores internos do Orbit se presentes no input
 *
 * @param input - Texto bruto fornecido pelo usuário
 * @returns Texto sanitizado pronto para uso com LLMs
 */
export function sanitizePromptInput(input: string): string {
  let sanitized = input;

  // Passo 1: Truncar se exceder limite máximo
  if (sanitized.length > MAX_INPUT_LENGTH) {
    sanitized = sanitized.substring(0, MAX_INPUT_LENGTH);
  }

  // Passo 2: Neutralizar padrões de injection com zero-width spaces
  for (const injectionPattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(injectionPattern.pattern, (match) => {
      // Inserir zero-width space entre caracteres para quebrar o padrão
      // sem alterar o texto visível
      return match.split('').join('\u200B');
    });
  }

  // Passo 3: Aplicar sequências de escape
  for (const escape of ESCAPE_SEQUENCES) {
    sanitized = sanitized.replace(escape.find, escape.replace);
  }

  // Passo 4: Remover delimitadores do Orbit se aparecerem no input do usuário
  // Isso previne que o usuário feche nossos delimitadores prematuramente
  for (const delimiter of Object.values(DELIMITERS)) {
    if (sanitized.includes(delimiter)) {
      sanitized = sanitized.split(delimiter).join('');
    }
  }

  return sanitized;
}

/**
 * Detecta tentativas de prompt injection no input do usuário.
 *
 * Faz varredura do texto contra o catálogo de padrões conhecidos e
 * retorna um relatório detalhado de ameaças encontradas.
 *
 * @param input - Texto a ser analisado
 * @returns Objeto com status de segurança e lista de ameaças detectadas
 *
 * @example
 * ```ts
 * const result = detectPromptInjection(userInput);
 * if (!result.safe) {
 *   console.warn('Ameaças detectadas:', result.threats);
 *   // Decidir se rejeita ou sanitiza antes de enviar ao LLM
 * }
 * ```
 */
export function detectPromptInjection(input: string): {
  safe: boolean;
  threats: string[];
} {
  const threats: string[] = [];

  for (const injectionPattern of INJECTION_PATTERNS) {
    // Resetar lastIndex para regex globais (necessário para reutilização)
    injectionPattern.pattern.lastIndex = 0;

    if (injectionPattern.pattern.test(input)) {
      threats.push(`[${injectionPattern.riskLevel.toUpperCase()}] ${injectionPattern.description}`);
    }
  }

  return {
    safe: threats.length === 0,
    threats,
  };
}

/**
 * Envolve conteúdo do usuário em delimitadores seguros para separação
 * clara entre instruções do sistema e dados do usuário.
 *
 * Os delimitadores usam strings únicas e aleatórias que são praticamente
 * impossíveis de aparecer em conteúdo legítimo, criando uma fronteira
 * robusta que dificulta ataques de escape.
 *
 * Recomenda-se usar em conjunto com sanitizePromptInput() para proteção
 * completa:
 *
 * @example
 * ```ts
 * const sanitized = sanitizePromptInput(rawUserInput);
 * const wrapped = wrapUserContent(sanitized);
 * // Usar wrapped no prompt enviado ao LLM
 * ```
 *
 * @param content - Conteúdo do usuário (idealmente já sanitizado)
 * @returns Conteúdo envolvido com delimitadores seguros
 */
export function wrapUserContent(content: string): string {
  return `${DELIMITERS.CONTENT_START}\n${content}\n${DELIMITERS.CONTENT_END}`;
}
