import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/features/auth/AuthProvider';

/** Impede que um usuário já autenticado volte para a tela de login. */
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, initializing, user } = useAuth();

  if (initializing) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="size-7 text-brand-600" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={user?.mustChangePassword ? '/trocar-senha' : '/'} replace />;
  }

  return <>{children}</>;
}
