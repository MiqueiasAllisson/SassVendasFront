import type { ReactNode } from 'react';

import { Logo } from '@/components/ui/Logo';
import { brand } from '@/config/brand';

interface AuthLayoutProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Logo da empresa selecionada — substitui a marca do produto no topo. */
  logoOverride?: string | null;
  logoLabel?: string;
}

/**
 * Moldura das telas de autenticação.
 *
 * Duas colunas no desktop (marca à esquerda, formulário à direita) e uma só no
 * celular — onde o painel de marca vira um cabeçalho curto, para o formulário
 * aparecer sem rolagem.
 */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  logoOverride,
  logoLabel,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface lg:flex-row">
      <BrandPanel />

      <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[400px] animate-fade-in-up">
          <div className="mb-8">
            <Logo
              src={logoOverride}
              label={logoLabel}
              height={40}
              className="mb-7 lg:hidden"
            />
            <h1 className="text-2xl font-bold tracking-tight text-content">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-content-muted">{subtitle}</p>}
          </div>

          {children}

          {footer && <div className="mt-8 border-t border-line pt-6">{footer}</div>}
        </div>
      </main>
    </div>
  );
}

function BrandPanel() {
  const background = brand.loginBackgroundUrl;

  return (
    <aside
      className="relative hidden overflow-hidden bg-brand-700 lg:flex lg:w-[46%] lg:max-w-[620px] lg:flex-col lg:justify-between lg:p-12"
      style={
        background
          ? { backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : undefined
      }
    >
      {/* Camadas decorativas: gradiente + malha sutil. Ficam atrás do texto e
          garantem contraste mesmo com uma imagem de fundo clara. */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 opacity-95" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      <div className="relative">
        <Logo height={40} className="[&_span]:text-white" />
      </div>

      <div className="relative max-w-md">
        <h2 className="text-3xl font-bold leading-tight tracking-tight text-white">
          {brand.tagline}
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-white/75">
          Carteira de clientes, follow-up de contatos, parque de máquinas e orçamentos —
          tudo em um lugar só, com histórico que não se perde.
        </p>

        <ul className="mt-8 space-y-3">
          {[
            'Contatos do dia e atrasados na primeira tela',
            'Parque de máquinas vinculado a cada cliente',
            'Orçamentos em kanban, do aberto ao fechado',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-white/85">
              <CheckIcon />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-white/50">
        © {new Date().getFullYear()} {brand.name}
      </p>
    </aside>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 size-4 shrink-0 text-white/70" fill="currentColor" aria-hidden>
      <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm3.7 6.1-4.2 4.6a.75.75 0 0 1-1.1 0L6.3 10.6a.75.75 0 1 1 1.1-1l1.6 1.7 3.6-4a.75.75 0 1 1 1.1 1Z" />
    </svg>
  );
}
