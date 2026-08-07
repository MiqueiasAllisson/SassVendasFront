import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/features/auth/AuthProvider';
import { ROLE_LABEL, UserRole } from '@/features/auth/auth.types';
import { cn } from '@/lib/cn';

interface NavItem {
  to: string;
  label: string;
  /** Vazio = visível para todos os perfis. */
  roles?: UserRole[];
}

const NAV: NavItem[] = [
  { to: '/', label: 'Início' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/maquinas', label: 'Máquinas' },
  { to: '/orcamentos', label: 'Orçamentos' },
  { to: '/relatorios', label: 'Relatórios', roles: [UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN] },
  {
    to: '/administracao',
    label: 'Administração',
    roles: [UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN],
  },
];

/** Casca do sistema autenticado: marca da empresa, navegação por perfil e conta. */
export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const items = NAV.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  const handleLogout = async () => {
    await logout();
    navigate('/entrar', { replace: true });
  };

  return (
    <div className="min-h-dvh bg-surface-muted">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-4 sm:px-6">
          {/* A logo da empresa substitui a do produto quando existe. */}
          <Logo src={user?.company?.logoUrl} label={user?.company?.tradeName} height={30} />

          <nav className="hidden flex-1 items-center gap-1 lg:flex">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-content-muted hover:bg-surface-sunken hover:text-content',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight text-content">{user?.name}</p>
              <p className="text-xs text-content-muted">{user ? ROLE_LABEL[user.role] : ''}</p>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              aria-expanded={menuOpen}
              aria-label="Menu da conta"
              className="flex size-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700"
            >
              {user?.name?.trim().charAt(0).toUpperCase() ?? '?'}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-line bg-surface px-4 py-3 sm:px-6">
            <nav className="mb-3 flex flex-wrap gap-1 lg:hidden">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-3 py-2 text-sm font-medium',
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-content-muted',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <NavLink to="/trocar-senha" className="font-medium text-brand-600 hover:underline">
                Trocar senha
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="font-medium text-danger hover:underline"
              >
                Sair
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
