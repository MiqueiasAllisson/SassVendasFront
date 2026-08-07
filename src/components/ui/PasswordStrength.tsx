import { cn } from '@/lib/cn';

/** Regras espelhadas do back-end (PasswordService.assertStrong). */
export const passwordRules = [
  { label: 'Pelo menos 10 caracteres', test: (value: string) => value.length >= 10 },
  { label: 'Uma letra minúscula', test: (value: string) => /[a-z]/.test(value) },
  { label: 'Uma letra maiúscula', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'Um número', test: (value: string) => /\d/.test(value) },
];

export function isPasswordStrong(value: string): boolean {
  return passwordRules.every((rule) => rule.test(value));
}

/**
 * Checklist ao vivo em vez de "senha fraca" depois do envio: o usuário vê o
 * que falta enquanto digita, e as regras são as mesmas que a API aplica.
 */
export function PasswordStrength({ value }: { value: string }) {
  const passed = passwordRules.filter((rule) => rule.test(value)).length;

  return (
    <div className="mt-2.5">
      <div className="flex gap-1" aria-hidden>
        {passwordRules.map((rule, index) => (
          <span
            key={rule.label}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              index < passed
                ? passed === passwordRules.length
                  ? 'bg-success'
                  : 'bg-warning'
                : 'bg-line',
            )}
          />
        ))}
      </div>

      <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
        {passwordRules.map((rule) => {
          const ok = rule.test(value);
          return (
            <li
              key={rule.label}
              className={cn(
                'flex items-center gap-1.5 text-xs transition-colors',
                ok ? 'text-success' : 'text-content-subtle',
              )}
            >
              <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" fill="currentColor" aria-hidden>
                {ok ? (
                  <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm3 4.9-3.4 3.8a.6.6 0 0 1-.9 0L5 8.5a.6.6 0 1 1 .9-.8l1.3 1.4 2.9-3.3a.6.6 0 1 1 .9.8Z" />
                ) : (
                  <circle cx="8" cy="8" r="3" />
                )}
              </svg>
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
