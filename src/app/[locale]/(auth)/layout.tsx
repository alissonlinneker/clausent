import { BracketClauseLogo } from '@/components/shared/bracket-clause-logo'
import Link from 'next/link'

/**
 * Layout centralizado para páginas de autenticação.
 *
 * Design:
 * - Fundo off-white suave (#FFFDF5) consistente com o marketing
 * - Logo Clausent no topo para branding
 * - Conteúdo centralizado verticalmente
 * - Light Neobrutalism sutil
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFFDF5] px-4">
      {/* Logo da marca */}
      <Link href="/" className="mb-8 flex items-center gap-2 group">
        <BracketClauseLogo
          className="h-8 w-8 text-teal-600 group-hover:text-emerald-500 transition-colors"
          strokeWidth={2.2}
        />
        <span className="text-2xl font-bold tracking-tight text-slate-900">
          Clausent
        </span>
      </Link>

      {/* Conteúdo da página de auth */}
      <div className="w-full max-w-md">
        {children}
      </div>

      {/* Footer mínimo */}
      <p className="mt-8 text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Clausent. All rights reserved.
      </p>
    </div>
  )
}
