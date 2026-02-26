import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

/**
 * Componentes de navegação com suporte a i18n.
 *
 * Exporta versões localizadas de Link, redirect, usePathname e useRouter.
 * Usar ESTES em vez dos equivalentes do Next.js para garantir
 * que o locale seja preservado nas navegações.
 */
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing)
