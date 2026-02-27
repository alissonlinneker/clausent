// @ts-nocheck
/**
 * Módulo de integração com Amazon Textract para o Orbit.
 *
 * Responsável por extrair texto e dados estruturados (tabelas) de
 * documentos armazenados no S3 usando OCR do Textract.
 *
 * Suporta operações assíncronas para documentos multi-página:
 * - StartDocumentTextDetection: inicia análise e retorna jobId
 * - GetDocumentTextDetection: busca resultado quando pronto
 *
 * Pipeline de alto nível:
 *   processDocument() → extractText() + getTextractResult() → texto + tabelas
 *
 * @module aws/textract
 */

import {
  StartDocumentTextDetectionCommand,
  GetDocumentTextDetectionCommand,
  type Block,
} from '@aws-sdk/client-textract';
import { getTextractClient, S3_BUCKET } from './config';

// ==================== Tipos ====================

/**
 * Representa uma célula individual de uma tabela extraída.
 * Contém o texto da célula e suas coordenadas na tabela.
 */
export interface TableCell {
  /** Texto contido na célula */
  text: string;
  /** Índice da linha (1-based, conforme retornado pelo Textract) */
  rowIndex: number;
  /** Índice da coluna (1-based, conforme retornado pelo Textract) */
  columnIndex: number;
  /** Nível de confiança do Textract na extração (0-100) */
  confidence: number;
}

/**
 * Representa uma tabela completa extraída do documento.
 * Contém as células organizadas e metadados da extração.
 */
export interface Table {
  /** Índice sequencial da tabela no documento (0-based) */
  tableIndex: number;
  /** Número total de linhas detectadas */
  rowCount: number;
  /** Número total de colunas detectadas */
  columnCount: number;
  /** Lista de todas as células da tabela */
  cells: TableCell[];
}

/**
 * Bloco de texto processado do Textract.
 * Versão simplificada do Block da AWS com apenas os campos relevantes.
 */
export interface TextractBlock {
  /** Tipo do bloco (PAGE, LINE, WORD, TABLE, CELL) */
  blockType: string;
  /** Texto contido no bloco (disponível em LINE e WORD) */
  text: string;
  /** Nível de confiança da extração (0-100) */
  confidence: number;
  /** ID único do bloco no documento */
  id: string;
}

/**
 * Resultado completo de uma extração Textract.
 * Contém o jobId para rastreamento, status e dados extraídos.
 */
export interface TextractResult {
  /** ID do job no Textract (para operações assíncronas) */
  jobId: string;
  /** Status atual do job (IN_PROGRESS, SUCCEEDED, FAILED) */
  status: 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED';
  /** Blocos de texto processados (disponível quando SUCCEEDED) */
  blocks: TextractBlock[];
  /** Texto corrido extraído do documento (disponível quando SUCCEEDED) */
  text: string;
  /** Tabelas extraídas do documento (disponível quando SUCCEEDED) */
  tables: Table[];
  /** Confiança média geral da extração (0-100) */
  confidence: number;
}

// ==================== Constantes ====================

/** Intervalo entre polling do status do job (3 segundos) */
const POLLING_INTERVAL_MS = 3000;

/** Tempo máximo de espera pelo resultado do job (5 minutos) */
const MAX_WAIT_TIME_MS = 5 * 60 * 1000;

// ==================== Funções ====================

/**
 * Inicia uma análise assíncrona de extração de texto no Textract.
 *
 * Usa StartDocumentTextDetection, que suporta documentos multi-página
 * e processa em background. O jobId retornado pode ser usado para
 * buscar o resultado posteriormente via getTextractResult().
 *
 * @param fileKey - Key do arquivo no S3 (ex: contracts/user123/uuid/doc.pdf)
 * @returns Resultado parcial com jobId e status IN_PROGRESS
 * @throws Error se o Textract não retornar um JobId
 */
export async function extractText(fileKey: string): Promise<TextractResult> {
  const textract = getTextractClient();

  const command = new StartDocumentTextDetectionCommand({
    DocumentLocation: {
      S3Object: {
        Bucket: S3_BUCKET,
        Name: fileKey,
      },
    },
  });

  const response = await textract.send(command);

  if (!response.JobId) {
    throw new Error(
      `[Textract] Falha ao iniciar análise — JobId não retornado para: ${fileKey}`
    );
  }

  return {
    jobId: response.JobId,
    status: 'IN_PROGRESS',
    blocks: [],
    text: '',
    tables: [],
    confidence: 0,
  };
}

/**
 * Busca o resultado de uma análise assíncrona do Textract.
 *
 * Consulta o status do job via GetDocumentTextDetection.
 * Se o job ainda estiver em andamento, retorna status IN_PROGRESS.
 * Se finalizado, processa os blocos em texto corrido e extrai tabelas.
 *
 * @param jobId - ID do job retornado por extractText()
 * @returns Resultado completo com texto, tabelas e confiança
 * @throws Error se o job falhar no Textract
 */
export async function getTextractResult(jobId: string): Promise<TextractResult> {
  const textract = getTextractClient();

  const command = new GetDocumentTextDetectionCommand({
    JobId: jobId,
  });

  const response = await textract.send(command);
  const status = response.JobStatus as 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED';

  /** Se o job falhou, lançar erro com a mensagem do Textract */
  if (status === 'FAILED') {
    throw new Error(
      `[Textract] Job ${jobId} falhou: ${response.StatusMessage || 'Motivo desconhecido'}`
    );
  }

  /** Se ainda está processando, retornar status parcial */
  if (status === 'IN_PROGRESS') {
    return {
      jobId,
      status: 'IN_PROGRESS',
      blocks: [],
      text: '',
      tables: [],
      confidence: 0,
    };
  }

  /** Job concluído — processar blocos */
  const rawBlocks = response.Blocks || [];

  /** Converter blocos da AWS para formato simplificado */
  const blocks: TextractBlock[] = rawBlocks.map((block: Block) => ({
    blockType: block.BlockType || 'UNKNOWN',
    text: block.Text || '',
    confidence: block.Confidence || 0,
    id: block.Id || '',
  }));

  /**
   * Extrair texto corrido a partir dos blocos do tipo LINE.
   * Linhas representam o texto organizado de forma legível,
   * diferente de WORD que retorna palavras individuais.
   */
  const lines = rawBlocks
    .filter((block: Block) => block.BlockType === 'LINE')
    .map((block: Block) => block.Text || '')
    .filter((text: string) => text.length > 0);

  const text = lines.join('\n');

  /** Extrair tabelas dos blocos TABLE e CELL */
  const tables = extractTablesFromBlocks(rawBlocks);

  /**
   * Calcular confiança média geral.
   * Usa apenas blocos LINE para uma medida mais representativa,
   * já que blocos PAGE não possuem confiança individual.
   */
  const lineBlocks = rawBlocks.filter(
    (block: Block) => block.BlockType === 'LINE' && block.Confidence
  );
  const confidence =
    lineBlocks.length > 0
      ? lineBlocks.reduce((sum: number, block: Block) => sum + (block.Confidence || 0), 0) /
        lineBlocks.length
      : 0;

  return {
    jobId,
    status: 'SUCCEEDED',
    blocks,
    text,
    tables,
    confidence,
  };
}

/**
 * Extrai tabelas estruturadas a partir dos blocos do Textract.
 *
 * Identifica blocos do tipo TABLE e mapeia seus blocos CELL filhos
 * para construir uma representação estruturada de cada tabela.
 *
 * @param rawBlocks - Array de blocos retornados pelo Textract
 * @returns Lista de tabelas com células organizadas por linha e coluna
 */
function extractTablesFromBlocks(rawBlocks: Block[]): Table[] {
  /** Criar mapa de blocos por ID para lookup rápido */
  const blockMap = new Map<string, Block>();
  for (const block of rawBlocks) {
    if (block.Id) {
      blockMap.set(block.Id, block);
    }
  }

  /** Filtrar apenas blocos do tipo TABLE */
  const tableBlocks = rawBlocks.filter(
    (block: Block) => block.BlockType === 'TABLE'
  );

  return tableBlocks.map((tableBlock: Block, index: number) => {
    const cells: TableCell[] = [];
    let maxRow = 0;
    let maxCol = 0;

    /**
     * Percorrer relacionamentos do tipo CHILD do bloco TABLE
     * para encontrar os blocos CELL associados.
     */
    const childRelationships = tableBlock.Relationships?.filter(
      (rel) => rel.Type === 'CHILD'
    );

    if (childRelationships) {
      for (const rel of childRelationships) {
        for (const childId of rel.Ids || []) {
          const cellBlock = blockMap.get(childId);

          if (cellBlock && cellBlock.BlockType === 'CELL') {
            const rowIndex = cellBlock.RowIndex || 0;
            const columnIndex = cellBlock.ColumnIndex || 0;

            /** Extrair texto da célula a partir dos blocos WORD filhos */
            const cellText = extractCellText(cellBlock, blockMap);

            cells.push({
              text: cellText,
              rowIndex,
              columnIndex,
              confidence: cellBlock.Confidence || 0,
            });

            /** Rastrear dimensões máximas da tabela */
            if (rowIndex > maxRow) maxRow = rowIndex;
            if (columnIndex > maxCol) maxCol = columnIndex;
          }
        }
      }
    }

    return {
      tableIndex: index,
      rowCount: maxRow,
      columnCount: maxCol,
      cells,
    };
  });
}

/**
 * Extrai o texto de uma célula da tabela.
 *
 * Percorre os blocos WORD filhos da célula e concatena seus textos,
 * separados por espaço, para formar o conteúdo completo da célula.
 *
 * @param cellBlock - Bloco CELL do Textract
 * @param blockMap - Mapa de todos os blocos indexados por ID
 * @returns Texto concatenado da célula
 */
function extractCellText(cellBlock: Block, blockMap: Map<string, Block>): string {
  const words: string[] = [];

  const childRelationships = cellBlock.Relationships?.filter(
    (rel) => rel.Type === 'CHILD'
  );

  if (childRelationships) {
    for (const rel of childRelationships) {
      for (const childId of rel.Ids || []) {
        const wordBlock = blockMap.get(childId);
        if (wordBlock && wordBlock.BlockType === 'WORD' && wordBlock.Text) {
          words.push(wordBlock.Text);
        }
      }
    }
  }

  return words.join(' ');
}

/**
 * Função de alto nível que combina extração e processamento de texto.
 *
 * Pipeline completo:
 * 1. Inicia extração assíncrona via StartDocumentTextDetection
 * 2. Faz polling do status até conclusão (ou timeout de 5 min)
 * 3. Processa os blocos em texto corrido e tabelas estruturadas
 *
 * Esta função é bloqueante — aguarda o processamento completo antes de retornar.
 * Para fluxos assíncronos, usar extractText() + getTextractResult() separadamente.
 *
 * @param fileKey - Key do arquivo no S3
 * @returns Objeto com texto extraído, tabelas e confiança geral
 * @throws Error se o processamento falhar ou exceder o timeout
 */
export async function processDocument(
  fileKey: string
): Promise<{ text: string; tables: Table[]; confidence: number }> {
  /** Etapa 1: Iniciar extração assíncrona */
  const initialResult = await extractText(fileKey);
  const { jobId } = initialResult;

  /** Etapa 2: Polling do resultado até conclusão ou timeout */
  const startTime = Date.now();

  while (true) {
    /** Verificar timeout para evitar espera infinita */
    if (Date.now() - startTime > MAX_WAIT_TIME_MS) {
      throw new Error(
        `[Textract] Timeout ao processar documento ${fileKey}. ` +
        `Job ${jobId} não concluiu em ${MAX_WAIT_TIME_MS / 1000}s.`
      );
    }

    /** Aguardar intervalo antes de consultar novamente */
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));

    const result = await getTextractResult(jobId);

    /** Se ainda está processando, continuar polling */
    if (result.status === 'IN_PROGRESS') {
      continue;
    }

    /** Etapa 3: Retornar dados processados */
    return {
      text: result.text,
      tables: result.tables,
      confidence: result.confidence,
    };
  }
}
