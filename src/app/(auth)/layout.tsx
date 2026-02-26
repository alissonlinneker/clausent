/**
 * Layout centralizado para páginas de autenticação (sign-in, sign-up).
 * Exibe o conteúdo no centro da tela com fundo cinza claro,
 * criando uma experiência limpa e focada.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      {children}
    </div>
  )
}
