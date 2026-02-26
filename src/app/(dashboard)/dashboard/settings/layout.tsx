/**
 * Layout wrapper para a seção de configurações.
 *
 * Renderiza os children diretamente sem adicionar
 * estrutura extra, já que o layout do dashboard
 * já fornece sidebar, header e padding.
 *
 * Existe para permitir extensões futuras (ex: sub-navegação
 * lateral entre General, Billing, Team, etc.).
 */
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
