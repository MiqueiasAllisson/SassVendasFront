import { useAuth } from '@/features/auth/AuthProvider';
import { ROLE_LABEL } from '@/features/auth/auth.types';

/**
 * Placeholder do dashboard (Fase 2 do plano). Existe para fechar o fluxo de
 * autenticação de ponta a ponta: login → sessão → tela interna.
 */
export function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-content">
          Olá, {user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-content-muted">
          {user?.company
            ? `${user.company.tradeName} · ${ROLE_LABEL[user.role]}`
            : ROLE_LABEL[user!.role]}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Contatos atrasados', value: '—', tone: 'text-status-late' },
          { label: 'Contatos de hoje', value: '—', tone: 'text-status-today' },
          { label: 'Agendados', value: '—', tone: 'text-status-scheduled' },
          { label: 'Orçamentos em aberto', value: '—', tone: 'text-content' },
        ].map((card) => (
          <article
            key={card.label}
            className="rounded-card border border-line bg-surface p-5 shadow-card"
          >
            <p className="text-sm text-content-muted">{card.label}</p>
            <p className={`mt-2 text-3xl font-bold ${card.tone}`}>{card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-card border border-dashed border-line bg-surface p-8 text-center">
        <p className="text-sm text-content-muted">
          Autenticação concluída. As telas de clientes, máquinas, orçamentos e relatórios entram
          nas próximas fases do plano.
        </p>
      </section>
    </div>
  );
}
