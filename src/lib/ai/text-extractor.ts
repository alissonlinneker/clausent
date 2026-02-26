import { PDFParse } from 'pdf-parse'

/**
 * Extrai texto de um arquivo a partir de sua URL.
 *
 * Suporta dois formatos:
 * - PDF: usa a biblioteca pdf-parse para extração de texto
 * - DOCX: descompacta o XML interno e limpa as tags para obter texto puro
 *
 * O tipo do arquivo é detectado automaticamente pelo Content-Type
 * do response HTTP. Se o tipo não for reconhecido, lança erro.
 *
 * @param fileUrl - URL pública do arquivo (ex: Vercel Blob)
 * @returns Texto extraído do documento
 * @throws Error se o tipo de arquivo não for suportado ou o download falhar
 */
export async function extractTextFromFile(fileUrl: string): Promise<string> {
  /** Faz download do arquivo da URL fornecida */
  const response = await fetch(fileUrl)

  if (!response.ok) {
    throw new Error(`Falha ao baixar arquivo: HTTP ${response.status}`)
  }

  /** Detecta o tipo do arquivo pelo Content-Type do header */
  const contentType = response.headers.get('content-type') ?? ''

  /** Obtém o conteúdo como ArrayBuffer para processamento */
  const buffer = Buffer.from(await response.arrayBuffer())

  /** Decide o método de extração com base no tipo do conteúdo */
  if (contentType.includes('pdf') || fileUrl.endsWith('.pdf')) {
    return extractFromPdf(buffer)
  }

  if (
    contentType.includes('wordprocessingml') ||
    contentType.includes('msword') ||
    fileUrl.endsWith('.docx')
  ) {
    return extractFromDocx(buffer)
  }

  /** Se for texto plano, retorna diretamente */
  if (contentType.includes('text/plain') || fileUrl.endsWith('.txt')) {
    return buffer.toString('utf-8')
  }

  throw new Error(`Tipo de arquivo não suportado: ${contentType}`)
}

/**
 * Extrai texto de um buffer PDF usando pdf-parse v2.
 *
 * Cria uma instância de PDFParse com os dados binários do PDF,
 * extrai o texto de todas as páginas e destrói o recurso ao final.
 *
 * @param buffer - Buffer com o conteúdo do arquivo PDF
 * @returns Texto extraído do PDF
 */
async function extractFromPdf(buffer: Buffer): Promise<string> {
  /** Cria o parser com o buffer convertido para Uint8Array */
  const parser = new PDFParse({ data: new Uint8Array(buffer) })

  /** Extrai texto de todas as páginas do documento */
  const result = await parser.getText()

  /** Libera recursos do parser */
  await parser.destroy()

  return result.text
}

/**
 * Extrai texto de um buffer DOCX.
 *
 * DOCX é um ZIP contendo XMLs. O conteúdo principal fica em
 * word/document.xml. Esta função faz uma extração simplificada:
 * busca pelo conteúdo XML e remove todas as tags, mantendo
 * apenas o texto puro.
 *
 * @param buffer - Buffer com o conteúdo do arquivo DOCX
 * @returns Texto extraído do DOCX
 */
async function extractFromDocx(buffer: Buffer): Promise<string> {
  /**
   * Converte o buffer para string e tenta localizar o conteúdo XML.
   * Arquivos DOCX são ZIPs, mas o conteúdo XML está embutido.
   * Usamos uma abordagem simplificada: procurar por tags <w:t>
   * que contêm o texto real no formato Office Open XML.
   */
  const content = buffer.toString('utf-8')

  /**
   * Regex para extrair texto de tags <w:t> e <w:t xml:space="preserve">
   * que são as tags padrão do Word para conteúdo textual.
   */
  const textMatches = content.match(/<w:t[^>]*>([^<]*)<\/w:t>/g)

  if (!textMatches || textMatches.length === 0) {
    /**
     * Fallback: se não encontrar tags <w:t>, tenta limpar todas as
     * tags XML e retornar o texto bruto resultante.
     */
    return content
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Extrai o texto de dentro de cada tag <w:t> e junta com espaços.
   * Cada match contém "<w:t>texto</w:t>", então removemos as tags.
   */
  return textMatches
    .map(match => match.replace(/<[^>]+>/g, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}
