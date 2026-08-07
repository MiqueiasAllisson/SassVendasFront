import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { appConfig } from '@/config/brand';

import { AuthLayout } from './AuthLayout';
import { authApi } from './auth.api';
import type { PublicCompany } from './auth.types';
import { CompanySelect } from './CompanySelect';

const schema = z.object({
  email: z.string().min(1, 'Informe seu e-mail.').email('E-mail inválido.'),
});

type ForgotForm = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [params] = useSearchParams();
  const [company, setCompany] = useState<PublicCompany | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: params.get('email') ?? '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    // A API responde 202 mesmo para e-mail inexistente; a tela segue a mesma
    // regra e não revela se a conta existe.
    await authApi
      .forgotPassword({
        email: values.email,
        companyId: company?.id,
        cnpj: appConfig.fixedCnpj || undefined,
      })
      .catch(() => undefined);

    setSent(true);
  });

  if (sent) {
    return (
      <AuthLayout title="Verifique seu e-mail" subtitle="Se a conta existir, o link já está a caminho.">
        <Alert tone="success" title="Pedido registrado">
          Enviamos um link de redefinição para o e-mail informado. Ele vale por poucos minutos e
          só pode ser usado uma vez.
        </Alert>

        <Link
          to="/entrar"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
        >
          <ArrowLeftIcon /> Voltar para o login
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Esqueci minha senha"
      subtitle="Informe a empresa e o e-mail cadastrado. Enviaremos um link para você criar uma nova senha."
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {appConfig.companySelectEnabled && !appConfig.fixedCnpj && (
          <CompanySelect value={company} onChange={setCompany} disabled={isSubmitting} />
        )}

        <TextField
          id="login-email"
          label="E-mail"
          type="email"
          inputMode="email"
          autoComplete="username"
          placeholder="voce@empresa.com.br"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          Enviar link de redefinição
        </Button>

        <Link
          to="/entrar"
          className="inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-content-muted hover:text-content"
        >
          <ArrowLeftIcon /> Voltar para o login
        </Link>
      </form>
    </AuthLayout>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M11 5.5 6.5 10l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
