import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { brand } from '@/config/brand';
import { refreshSession, setAccessToken, setSessionExpiredHandler } from '@/lib/api';
import { applyBrandColor } from '@/lib/theme';

import { authApi } from './auth.api';
import type { AuthResponse, LoginPayload, SessionUser, UserRole } from './auth.types';

interface AuthContextValue {
  user: SessionUser | null;
  /** true enquanto a sessão está sendo restaurada no primeiro carregamento. */
  initializing: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  const applyIdentity = useCallback((session: SessionUser | null) => {
    setUser(session);
    // A empresa "pinta" o sistema com a cor dela; sem empresa, volta à marca.
    applyBrandColor(session?.company?.primaryColor ?? brand.primaryColor);
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    applyIdentity(null);
  }, [applyIdentity]);

  // Recarregar a página não desloga: o cookie httpOnly do refresh token
  // reconstrói a sessão antes da primeira tela renderizar.
  useEffect(() => {
    let cancelled = false;

    setSessionExpiredHandler(() => clearSession());

    (async () => {
      const renewed = await refreshSession();

      if (renewed && !cancelled) {
        try {
          applyIdentity(await authApi.me());
        } catch {
          clearSession();
        }
      }

      if (!cancelled) setInitializing(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [applyIdentity, clearSession]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await authApi.login(payload);
      setAccessToken(response.accessToken);
      applyIdentity(response.user);
      return response;
    },
    [applyIdentity],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      // Mesmo se a chamada falhar, a sessão local cai.
      clearSession();
    }
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    applyIdentity(await authApi.me());
  }, [applyIdentity]);

  const hasRole = useCallback(
    (...roles: UserRole[]) => (user ? roles.includes(user.role) : false),
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      isAuthenticated: Boolean(user),
      login,
      logout,
      refreshUser,
      hasRole,
    }),
    [user, initializing, login, logout, refreshUser, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return context;
}
