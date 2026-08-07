import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { PasswordField, TextField } from '@/components/ui/TextField';
import { appConfig, brand } from '@/config/brand';
import { ApiError } from '@/lib/api';
import { applyBrandColor } from '@/lib/theme';

import { AuthLayout } from './AuthLayout';
import { authApi } from './auth.api';
import { useAuth } from './AuthProvider';
import type { PublicCompany } from './auth.types';
import { CompanySelect } from './CompanySelect';
import { rememberCompany } from './recentCompanies';

const schema = z.object({
  email: z
    .string()
    .min(1, 'Informe seu e-mail.')
    .email('E-mail inválido.'),
  password: z.string().min(1, 'Informe sua senha.'),
  rememberMe: z.boolean().default(false),
});

type LoginForm = z.infer<typeof schema>;

/**
 * Telas de autenticação nunca são destino pós-login.
 *
 * Sem isso acontece o seguinte: o usuário troca a senha, é deslogado, o
 * ProtectedRoute grava `from: '/trocar-senha'` ao mandá-lo para o login — e o
 * login o devolve para a tela de troca de senha, em vez do início.
 */
const AUTH_ROUTES = ['/entrar', '/login', '/esqueci-senha', '/redefinir-senha', '/trocar-senha'];

function safeRedirect(target: string | undefined): string {
  if (!target) return '/';
  // Só caminhos internos: barra dupla ou esquema abriria redirect aberto.
  if (!target.startsWith('/') || target.startsWith('//')) return '/';
  if (AUTH_ROUTES.includes(target)) return '/';
  return target;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [company, setCompany] = useState<PublicCompany | null>(null);
  const [companyError, setCompanyError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [platformMode, setPlatformMode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  // Instalação de cliente único: o CNPJ vem fixo do .env e o seletor some.
  useEffect(() => {
    if (!appConfig.fixedCnpj) return;

    authApi
      .companyByCnpj(appConfig.fixedCnpj)
      .then(setCompany)
      .catch(() => setCompanyError('Não foi possível carregar a empresa configurada.'));
  }, []);

  // A tela adota a cor da empresa assim que ela é escolhida: o usuário vê que
  // está entrando no lugar certo antes de digitar a senha.
  useEffect(() => {
    applyBrandColor(company?.primaryColor ?? brand.primaryColor);
  }, [company]);

  const showCompanySelect = appConfig.companySelectEnabled && !appConfig.fixedCnpj && !platformMode;

  const onSubmit = handleSubmit(async (values) => {
    setFormError(undefined);
    setCompanyError(undefined);

    if (showCompanySelect && !company) {
      setCompanyError('Selecione a empresa para continuar.');
      return;
    }

    try {
      const response = await login({
        companyId: platformMode ? undefined : company?.id,
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      if (company) rememberCompany(company);

      // Senha temporária ou redefinida pelo admin: troca antes de usar o sistema.
      if (response.user.mustChangePassword) {
        navigate('/trocar-senha', { replace: true });
        return;
      }

      const requested = (location.state as { from?: string } | null)?.from;
      navigate(safeRedirect(requested), { replace: true });
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível conectar ao servidor. Verifique sua conexão.',
      );
    }
  });

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse sua carteira de clientes e o parque de máquinas."
      logoOverride={company?.logoUrl}
      logoLabel={company?.tradeName}
      footer={
        <div className="space-y-3 text-center text-sm">
          <button
            type="button"
            onClick={() => {
              setPlatformMode((current) => !current);
              setCompany(null);
              setCompanyError(undefined);
              setFormError(undefined);
            }}
            className="text-content-muted underline-offset-4 transition-colors hover:text-content hover:underline"
          >
            {platformMode
              ? 'Entrar como usuário de uma empresa'
              : 'Sou administrador do sistema'}
          </button>

          {brand.supportEmail && (
            <p className="text-xs text-content-subtle">
              Problemas para acessar?{' '}
              <a
                href={`mailto:${brand.supportEmail}`}
                className="font-medium text-brand-600 hover:underline"
              >
                {brand.supportEmail}
              </a>
            </p>
          )}
        </div>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError && (
          <Alert tone="error" className="animate-shake">
            {formError}
          </Alert>
        )}

        {platformMode && (
          <Alert tone="info">
            Acesso do administrador da plataforma — sem vínculo com uma empresa.
          </Alert>
        )}

        {showCompanySelect && (
          <CompanySelect
            value={company}
            onChange={(next) => {
              setCompany(next);
              setCompanyError(undefined);
            }}
            error={companyError}
            disabled={isSubmitting}
          />
        )}

        {appConfig.fixedCnpj && company && (
          <div className="rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm">
            <span className="text-content-muted">Empresa: </span>
            <span className="font-medium text-content">{company.tradeName}</span>
          </div>
        )}

        <TextField
          id="login-email"
          label="E-mail"
          type="email"
          inputMode="email"
          autoComplete="username"
          placeholder="voce@empresa.com.br"
          error={errors.email?.message}
          icon={<MailIcon />}
          {...register('email')}
        />

        <PasswordField
          label="Senha"
          autoComplete="current-password"
          placeholder="••••••••••"
          error={errors.password?.message}
          icon={<LockIcon />}
          {...register('password')}
        />

        <div className="flex items-center justify-between pt-1">
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-content-muted">
            <input
              type="checkbox"
              className="size-4 rounded border-line text-brand-600 accent-brand-600"
              {...register('rememberMe')}
            />
            Continuar conectado
          </label>

          <Link
            to="/esqueci-senha"
            className="text-sm font-medium text-brand-600 underline-offset-4 hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>

        <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-2">
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </AuthLayout>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
      <path d="m3 6 7 4.5L17 6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="4" y="8.5" width="12" height="8" rx="2" />
      <path d="M7 8.5V6.5a3 3 0 1 1 6 0v2" />
    </svg>
  );
}
