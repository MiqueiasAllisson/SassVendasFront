import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type Tone = 'error' | 'success' | 'info' | 'warning';

const TONES: Record<Tone, string> = {
  error: 'border-danger/30 bg-danger/10 text-danger',
  success: 'border-success/30 bg-success/10 text-success',
  info: 'border-brand-500/30 bg-brand-500/10 text-brand-700',
  warning: 'border-warning/30 bg-warning/10 text-warning',
};

export function Alert({
  tone = 'info',
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      // role="alert" faz o leitor de tela anunciar o erro assim que ele aparece
      // — importante num formulário de login que falha.
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm',
        TONES[tone],
        className,
      )}
    >
      <Icon tone={tone} />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-0.5', 'opacity-90')}>{children}</div>}
      </div>
    </div>
  );
}

function Icon({ tone }: { tone: Tone }) {
  const path =
    tone === 'success'
      ? 'M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm3.7 6.1-4.2 4.6a.75.75 0 0 1-1.1 0L6.3 10.6a.75.75 0 1 1 1.1-1l1.6 1.7 3.6-4a.75.75 0 1 1 1.1 1Z'
      : 'M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 4.25c.41 0 .75.34.75.75v4a.75.75 0 0 1-1.5 0V7c0-.41.34-.75.75-.75Zm0 8.25a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Z';

  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 size-4 shrink-0" fill="currentColor" aria-hidden>
      <path d={path} />
    </svg>
  );
}
