import { useQuery } from '@tanstack/react-query';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { Spinner } from '@/components/ui/Spinner';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { cn } from '@/lib/cn';
import { maskCnpj, stripCnpj } from '@/lib/cnpj';

import { authApi } from './auth.api';
import type { PublicCompany } from './auth.types';
import { getRecentCompanies } from './recentCompanies';

interface CompanySelectProps {
  value: PublicCompany | null;
  onChange: (company: PublicCompany | null) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * Seletor de empresa da tela de login.
 *
 * É um combobox, não um `<select>`: a base pode ter centenas de empresas e o
 * usuário pensa em "CNPJ" ou em "nome da loja", não em posição numa lista.
 * Digitou dígitos → busca por CNPJ; digitou letras → busca por nome fantasia.
 */
export function CompanySelect({ value, onChange, error, disabled }: CompanySelectProps) {
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const debouncedTerm = useDebouncedValue(term, 300);
  const recents = useMemo(() => getRecentCompanies(), []);

  // Só digitou números? Trata como CNPJ e aplica a máscara na exibição.
  const digitsOnly = /^[\d.\-/\s]+$/.test(term) && term.trim() !== '';
  const searchable = debouncedTerm.trim().length >= 2;

  const { data, isFetching } = useQuery({
    queryKey: ['companies', debouncedTerm],
    queryFn: () => authApi.searchCompanies(debouncedTerm),
    enabled: open && searchable && !value,
    staleTime: 60_000,
    retry: false,
  });

  // Sem busca ativa, o menu mostra os atalhos das empresas usadas recentemente.
  const options: PublicCompany[] = searchable ? (data ?? []) : recents;

  useEffect(() => {
    setHighlighted(0);
  }, [options.length]);

  // Clique fora fecha o menu.
  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const select = (company: PublicCompany) => {
    onChange(company);
    setTerm('');
    setOpen(false);
    // Depois de escolher a empresa, o cursor vai para o e-mail: o fluxo
    // natural da tela continua sem o usuário precisar do mouse.
    requestAnimationFrame(() => {
      document.getElementById('login-email')?.focus();
    });
  };

  const clear = () => {
    onChange(null);
    setTerm('');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) return setOpen(true);
      setHighlighted((current) => {
        const next = event.key === 'ArrowDown' ? current + 1 : current - 1;
        return (next + options.length) % Math.max(options.length, 1);
      });
      return;
    }

    if (event.key === 'Enter' && open && options[highlighted]) {
      event.preventDefault();
      select(options[highlighted]);
      return;
    }

    if (event.key === 'Escape') setOpen(false);
  };

  // ---------------------------------------------------- empresa escolhida
  if (value) {
    return (
      <div>
        <span className="field-label">Empresa</span>
        <div className="flex items-center gap-3 rounded-lg border border-brand-500/40 bg-brand-50/60 px-3 py-2.5">
          <CompanyAvatar company={value} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-content">{value.tradeName}</p>
            <p className="truncate font-mono text-xs text-content-muted">{value.cnpjFormatted}</p>
          </div>
          <button
            type="button"
            onClick={clear}
            disabled={disabled}
            className="rounded px-2 py-1 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100 disabled:opacity-50"
          >
            Trocar
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------ combobox
  return (
    <div ref={containerRef} className="relative">
      <label htmlFor="login-company" className="field-label">
        Empresa <span className="font-normal text-content-subtle">(CNPJ ou nome)</span>
      </label>

      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border bg-surface px-3',
          'transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/25',
          error ? 'border-danger' : 'border-line',
        )}
      >
        <BuildingIcon />
        <input
          ref={inputRef}
          id="login-company"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={error ? true : undefined}
          autoComplete="off"
          disabled={disabled}
          placeholder="00.000.000/0001-00 ou nome da empresa"
          value={digitsOnly ? maskCnpj(term) : term}
          onChange={(event) => {
            const next = event.target.value;
            // Mantém só os dígitos no estado quando é CNPJ: a máscara é
            // apresentação, não dado.
            setTerm(/^[\d.\-/\s]+$/.test(next) && next !== '' ? stripCnpj(next) : next);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="h-11 w-full bg-transparent text-sm text-content outline-none placeholder:text-content-subtle"
        />
        {isFetching && <Spinner className="size-4 text-content-subtle" />}
      </div>

      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1.5 max-h-72 w-full overflow-auto rounded-lg border border-line bg-surface py-1 shadow-float animate-fade-in-up"
        >
          {!searchable && recents.length > 0 && (
            <li className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-content-subtle">
              Usadas recentemente
            </li>
          )}

          {options.map((company, index) => (
            <li key={company.id}>
              <button
                type="button"
                role="option"
                aria-selected={index === highlighted}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => select(company)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
                  index === highlighted ? 'bg-brand-50' : 'hover:bg-surface-muted',
                )}
              >
                <CompanyAvatar company={company} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-content">
                    {company.tradeName}
                  </span>
                  <span className="block truncate font-mono text-xs text-content-muted">
                    {company.cnpjFormatted}
                  </span>
                </span>
              </button>
            </li>
          ))}

          {options.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-content-muted">
              {!searchable
                ? 'Digite ao menos 2 caracteres do CNPJ ou do nome.'
                : isFetching
                  ? 'Buscando…'
                  : 'Nenhuma empresa encontrada.'}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function CompanyAvatar({ company }: { company: PublicCompany }) {
  if (company.logoUrl) {
    return (
      <img
        src={company.logoUrl}
        alt=""
        className="size-9 shrink-0 rounded-md border border-line bg-white object-contain p-0.5"
      />
    );
  }

  return (
    <span
      aria-hidden
      className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-100 text-sm font-bold text-brand-700"
    >
      {company.tradeName.trim().charAt(0).toUpperCase()}
    </span>
  );
}

function BuildingIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="size-5 shrink-0 text-content-subtle"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M3 17h14M4.5 17V4.5A1.5 1.5 0 0 1 6 3h5a1.5 1.5 0 0 1 1.5 1.5V17M12.5 8H15a1.5 1.5 0 0 1 1.5 1.5V17" />
      <path d="M7 6.5h2.5M7 9.5h2.5M7 12.5h2.5" strokeLinecap="round" />
    </svg>
  );
}
