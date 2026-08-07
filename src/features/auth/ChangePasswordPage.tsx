import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { PasswordStrength, isPasswordStrong } from '@/components/ui/PasswordStrength';
import { PasswordField } from '@/components/ui/TextField';
import { ApiError } from '@/lib/api';

import { AuthLayout } from './AuthLayout';
import { authApi } from './auth.api';
import { useAuth } from './AuthProvider';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual.'),
    password: z.string().refine(isPasswordStrong, 'A senha não atende aos requisitos abaixo.'),
    confirmation: z.string(),
  })
  .refine((values) => values.password === values.confirmation, {
    path: ['confirmation'],
    message: 'As senhas não conferem.',
  });

type ChangeForm = z.infer<typeof schema>;

/**
 * Tela obrigatória no primeiro acesso (usuário criado com senha temporária).
 * Trocar a senha derruba todas as sessões, então o usuário volta ao login.
 */
export function ChangePasswordPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string>();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChangeForm>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', password: '', confirmation: '' },
  });

  const password = watch('password');

  const onSubmit = handleSubmit(async (values) => {
    setFormError(undefined);

    try {
      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.password,
      });

      await logout();
      navigate('/entrar?senha-alterada=1', { replace: true });
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Não foi possível trocar a senha.');
    }
  });

  return (
    <AuthLayout
      title={user?.mustChangePassword ? 'Defina sua senha' : 'Trocar senha'}
      subtitle={
        user?.mustChangePassword
          ? 'Sua conta foi criada com uma senha temporária. Escolha a sua para continuar.'
          : 'Por segurança, você sairá de todos os dispositivos depois da troca.'
      }
      logoOverride={user?.company?.logoUrl}
      logoLabel={user?.company?.tradeName}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError && <Alert tone="error">{formError}</Alert>}

        <PasswordField
          label="Senha atual"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />

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
          Salvar e entrar de novo
        </Button>
      </form>
    </AuthLayout>
  );
}
