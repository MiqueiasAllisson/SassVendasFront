import { useState } from 'react';

import { brand } from '@/config/brand';
import { cn } from '@/lib/cn';

interface LogoProps {
  /** Sobrescreve a marca do produto — usado para exibir a logo da empresa. */
  src?: string | null;
  /** Texto ao lado do símbolo quando não há imagem. */
  label?: string;
  variant?: 'full' | 'icon';
  className?: string;
  /** Altura da imagem em px (a largura acompanha a proporção). */
  height?: number;
}

/**
 * Ponto único onde a marca aparece.
 *
 * Ordem de precedência:
 *   1. `src` (logo da empresa vinda da API);
 *   2. VITE_BRAND_LOGO_URL / VITE_BRAND_ICON_URL (marca do produto);
 *   3. marca embutida em SVG (não depende de arquivo nenhum).
 *
 * Se a imagem falhar ao carregar, cai para o SVG em vez de mostrar um ícone
 * quebrado — trocar o logo nunca deixa a tela feia por acidente.
 */
export function Logo({ src, label, variant = 'full', className, height = 32 }: LogoProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const configured = variant === 'icon' ? brand.iconUrl || brand.logoUrl : brand.logoUrl;
  const source = src || configured;
  const text = label ?? brand.name;

  if (source && !imageFailed) {
    return (
      <img
        src={source}
        alt={text}
        height={height}
        style={{ height, width: 'auto' }}
        className={cn('max-w-[220px] object-contain', className)}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={height} />
      {variant === 'full' && (
        <span
          className="font-semibold tracking-tight text-content"
          style={{ fontSize: Math.round(height * 0.56) }}
        >
          {text}
        </span>
      )}
    </span>
  );
}

/** Símbolo padrão: usa a cor da marca corrente, então acompanha o tema. */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label={brand.shortName}
      className={cn('shrink-0', className)}
    >
      <rect width="32" height="32" rx="9" className="fill-brand-600" />
      <path
        d="M21 11.7A6.6 6.6 0 1 0 22.3 18H16.6"
        fill="none"
        stroke="#fff"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
