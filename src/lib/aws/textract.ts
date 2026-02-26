/**
 * Módulo de integração com Amazon Textract para o Clausent.
 *
 * Responsável por extrair texto de documentos (PDFs e imagens)
 * armazenados no S3 usando OCR do Textract.
 *
 * Usa a operação DetectDocumentText para documentos simples,
 * retornando o texto extraído concatenado em uma única string.
 */

import {
  TextractClient,
  DetectDocumentTextCommand,
  type Block,
} from '@aws-sdk/client-textract';
import { getAwsClientConfig } from './config';

// ==================== Cliente Textract (lazy init) ====================

/** Instância singleton do TextractClient — inicializada sob demanda */
let _textractClient: TextractClient | null = null;

/**
 * Retorna a instância do TextractClient, criando-a se necessário.
 * Usa lazy initialization para evitar erros em tempo de build.
 */
export function getTextractClient(): TextractClient {
  if (!_textractClient) {
    _textractClient = new TextractClient(getAwsClientConfig());
  }
  return _textractClient;
}

// ==================== Funções ====================

/**
 * Extrai texto de um documento (PDF ou imagem) armazenado no S3.
 *
 * Usa DetectDocumentText do Textract, que identifica e extrai texto
 * impresso de documentos. Ideal para contratos, recibos e documentos
 * que não possuem formulários complexos.
 *
 * IMPORTANTE: DetectDocumentText suporta apenas documentos de 1 página
 * para imagens. Para PDFs multi-página, considerar usar
 * StartDocumentTextDetection (operação assíncrona) no futuro.
 *
 * @param bucket - Nome do bucket S3 onde o documento está armazenado
 * @param key - Key do objeto no S3
 * @returns Texto extraído concatenado (linhas separadas por quebra de linha)
 * @throws Error se o Textract não retornar blocos de texto
 */
export async function extractTextFromS3(
  bucket: string,
  key: string
): Promise<string> {
  const textract = getTextractClient();

  const command = new DetectDocumentTextCommand({
    Document: {
      S3Object: {
        Bucket: bucket,
        Name: key,
      },
    },
  });

  const response = await textract.send(command);

  if (!response.Blocks || response.Blocks.length === 0) {
    throw new Error(
      `[Textract] Nenhum texto detectado no documento: s3://${bucket}/${key}`
    );
  }

  /**
   * Filtra apenas blocos do tipo LINE (linhas de texto).
   * O Textract retorna blocos de vários tipos (PAGE, LINE, WORD, etc.).
   * Linhas já representam o texto organizado de forma legível.
   */
  const lines = response.Blocks
    .filter((block: Block) => block.BlockType === 'LINE')
    .map((block: Block) => block.Text || '')
    .filter((text: string) => text.length > 0);

  if (lines.length === 0) {
    throw new Error(
      `[Textract] Documento processado, mas nenhuma linha de texto encontrada: s3://${bucket}/${key}`
    );
  }

  /** Concatena todas as linhas com quebra de linha */
  return lines.join('\n');
}
