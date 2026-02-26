/**
 * Configuração base do AWS SDK para o projeto Clausent.
 *
 * Centraliza região, credenciais e constantes de recursos AWS.
 * Todas as variáveis sensíveis são lidas de variáveis de ambiente —
 * NUNCA hardcodar credenciais neste arquivo.
 */

// ==================== Região ====================

/** Região AWS configurada via variável de ambiente (padrão: us-east-1) */
export const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

// ==================== Credenciais ====================

/**
 * Retorna o objeto de credenciais para os clientes AWS.
 * As chaves são lidas das variáveis de ambiente padrão da AWS.
 */
export function getAwsCredentials() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      '[AWS] Credenciais não configuradas. ' +
      'Defina AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY nas variáveis de ambiente.'
    );
  }

  return { accessKeyId, secretAccessKey };
}

// ==================== Recursos ====================

/** Nome do bucket S3 para uploads do Clausent */
export const S3_BUCKET = process.env.AWS_S3_BUCKET || 'clausent-uploads';

/** URL da fila SQS para análise de contratos */
export const SQS_QUEUE_URL =
  process.env.AWS_SQS_ANALYSIS_QUEUE_URL ||
  `https://sqs.${AWS_REGION}.amazonaws.com/000000000000/clausent-analysis-queue`;

// ==================== Configuração base ====================

/**
 * Configuração base compartilhada por todos os clientes AWS.
 * Inclui região e credenciais.
 */
export function getAwsClientConfig() {
  return {
    region: AWS_REGION,
    credentials: getAwsCredentials(),
  };
}
