import { forwardRef, useId, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  /** Ícone à esquerda, dentro do campo. */
  icon?: ReactNode;
  /** Ação à direita (ex.: botão de mostrar senha). */
  trailing?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, icon, trailing, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div>
      <label htmlFor={inputId} className="field-label">
        {label}
      </label>

      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border bg-surface px-3',
          'transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/25',
          error ? 'border-danger focus-within:border-danger focus-within:ring-danger/25' : 'border-line',
        )}
      >
        {icon && <span className="shrink-0 text-content-subtle">{icon}</span>}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-11 w-full bg-transparent text-sm text-content outline-none',
            'placeholder:text-content-subtle disabled:cursor-not-allowed disabled:opacity-60',
            className,
          )}
          {...props}
        />

        {trailing && <span className="shrink-0">{trailing}</span>}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="field-error" role="alert">
          <WarningIcon />
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

/** Campo de senha com alternância de visibilidade. */
export const PasswordField = forwardRef<HTMLInputElement, Omit<TextFieldProps, 'trailing' | 'type'>>(
  function PasswordField(props, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <TextField
        ref={ref}
        type={visible ? 'text' : 'password'}
        trailing={
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            // tabIndex -1: o Tab vai do campo direto para o botão de entrar,
            // que é o caminho que o usuário quer.
            tabIndex={-1}
            aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
            className="rounded p-1 text-content-subtle transition-colors hover:text-content"
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        }
        {...props}
      />
    );
  },
);

function WarningIcon() {
  return (
    <svg viewBox="0 0 20 20" className="mt-px size-3.5 shrink-0" fill="currentColor" aria-hidden>
      <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 4.25c.41 0 .75.34.75.75v4a.75.75 0 0 1-1.5 0V7c0-.41.34-.75.75-.75Zm0 8.25a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M1.8 10S4.9 4.6 10 4.6 18.2 10 18.2 10 15.1 15.4 10 15.4 1.8 10 1.8 10Z" />
      <circle cx="10" cy="10" r="2.6" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M8.2 4.8A7.6 7.6 0 0 1 10 4.6c5.1 0 8.2 5.4 8.2 5.4a15 15 0 0 1-2.4 3M4.4 6.6A15.2 15.2 0 0 0 1.8 10s3.1 5.4 8.2 5.4c1 0 1.9-.2 2.7-.5" />
      <path d="m3 3 14 14" strokeLinecap="round" />
    </svg>
  );
}
