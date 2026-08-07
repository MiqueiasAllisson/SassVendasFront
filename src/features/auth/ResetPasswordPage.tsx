import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { PasswordStrength, isPasswordStrong } from '@/components/ui/PasswordStrength';
import { PasswordField } from '@/components/ui/TextField';
import { ApiError } from '@/lib/api';

import { AuthLayout } from './AuthLayout';
import { authApi } from './auth.api';

const schema = z
  .object({
    password: z.string().refine(isPasswordStrong, 'A senha não atende aos requisitos abaixo.'),
    confirmation: z.string(),
  })
  .refine((values) => values.password === values.confirmation, {
    path: ['confirmation'],
    message: 'As senhas não conferem.',
  });

type ResetForm = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string>();

  const token = params.get('token') ?? '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmation: '' },
  });

  const password = watch('password');

  const onSubmit = handleSubmit(async (values) => {
    setFormError(undefined);

    try {
      await authApi.resetPassword({ token, password: values.password });
      navigate('/entrar?senha-redefinida=1', { replace: true });
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : 'Não foi possível redefinir a senha.',
      );
    }
  });

  if (!token) {
    return (
      <AuthLayout title="Link inválido">
        <Alert tone="error" title="Não conseguimos ler este link">
          Ele pode ter sido copiado pela metade ou já expirado. Peça um novo na tela de login.
        </Alert>
        <Link
          to="/esqueci-senha"
          className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline"
        >
          Pedir um novo link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Criar nova senha" subtitle="Escolha uma senha que você não use em outro lugar.">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError && <Alert tone="error">{formError}</Alert>}

        <div>
          <PasswordField
            label="Nova senha"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordStrength value={password} />
        </div>

        <PasswordField
          label="Confirme a nova senha"
          autoComplete="new-password"
          error={errors.confirmation?.message}
          {...register('confirmation')}
        />

        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          Salvar nova senha
        </Button>
      </form>
    </AuthLayout>
  );
}
