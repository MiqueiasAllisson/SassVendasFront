import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/features/auth/AuthProvider';
import type { UserRole } from '@/features/auth/auth.types';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Perfis autorizados. Vazio = qualquer usuário autenticado. */
  roles?: UserRole[];
  /** Rotas como "trocar senha" precisam ficar acessíveis mesmo com troca pendente. */
  allowPendingPassword?: boolean;
}

export function ProtectedRoute({ children, roles, allowPendingPassword }: ProtectedRouteProps) {
  const { user, initializing, isAuthenticated } = useAuth();
  const location = useLocation();

  // Enquanto a sessão é restaurada pelo refresh token, não decidimos nada —
  // redirecionar aqui jogaria o usuário para o login a cada F5.
  if (initializing) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="size-7 text-brand-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/entrar" replace state={{ from: location.pathname }} />;
  }

  if (user?.mustChangePassword && !allowPendingPassword) {
    return <Navigate to="/trocar-senha" replace />;
  }

  if (roles?.length && user && !roles.includes(user.role)) {
    return <Navigate to="/sem-permissao" replace />;
  }

  return <>{children}</>;
}
