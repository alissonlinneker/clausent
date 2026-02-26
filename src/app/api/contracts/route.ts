import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Schema de validação para criação de contrato via API.
 */
const createContractSchema = z.object({
  /** Título descritivo do contrato */
  title: z.string().min(1).max(500),
  /** Categoria do contrato */
  category: z.enum(['saas', 'vendor', 'lease', 'insurance', 'employment', 'nda', 'other']),
  /** Nome do fornecedor/contraparte */
  vendor: z.string().max(255).optional(),
  /** Key do arquivo no S3 (gerada no upload) */
  s3Key: z.string().min(1),
  /** Nome original do arquivo */
  originalFilename: z.string().min(1).max(255),
  /** Tamanho do arquivo em bytes */
  fileSize: z.number().int().positive(),
  /** Tipo MIME do arquivo */
  mimeType: z.enum([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]),
})

/**
 * POST /api/contracts — Criar novo contrato.
 *
 * Fluxo:
 * 1. Verificar autenticação
 * 2. Verificar limite de contratos do plano
 * 3. Validar dados do contrato
 * 4. Salvar no banco de dados
 * 5. Enviar mensagem SQS para análise pela IA
 * 6. Retornar contrato criado
 */
export async function POST(req: Request) {
  try {
    /** TODO: Verificar sessão via Better Auth */
    // const session = await getSession(req)
    // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    /** Validar body da requisição */
    const body = await req.json()
    const result = createContractSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const data = result.data

    /**
     * TODO: Implementar quando o schema do banco estiver pronto:
     * 1. Verificar limite de contratos do plano do usuário
     * 2. Inserir contrato no banco (status: 'pending')
     * 3. Enviar mensagem SQS para fila de análise
     * 4. Incrementar contador de contratos usados
     */

    return NextResponse.json({
      success: true,
      data: {
        id: 'temp-id',
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[Contracts] Erro ao criar contrato:', error)
    return NextResponse.json(
      { error: 'Failed to create contract' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/contracts — Listar contratos do usuário.
 *
 * Suporta paginação e filtros:
 * - page: número da página (default: 1)
 * - pageSize: itens por página (default: 20, max: 100)
 * - status: filtrar por status
 * - category: filtrar por categoria
 * - search: busca por título ou vendor
 * - sortBy: campo para ordenar (default: createdAt)
 * - sortOrder: asc ou desc (default: desc)
 */
export async function GET(req: Request) {
  try {
    /** TODO: Verificar sessão via Better Auth */
    // const session = await getSession(req)
    // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    /** Extrair parâmetros de query */
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize')) || 20))

    /**
     * TODO: Implementar query ao banco quando o schema estiver pronto:
     * 1. Filtrar contratos do usuário
     * 2. Aplicar filtros de status, categoria, search
     * 3. Ordenar e paginar
     */

    return NextResponse.json({
      success: true,
      data: {
        items: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      },
    })
  } catch (error) {
    console.error('[Contracts] Erro ao listar contratos:', error)
    return NextResponse.json(
      { error: 'Failed to list contracts' },
      { status: 500 }
    )
  }
}
