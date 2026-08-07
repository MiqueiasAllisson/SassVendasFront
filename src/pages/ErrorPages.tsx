import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

function Shell({ code, title, message }: { code: string; title: string; message: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-surface-muted px-6 text-center">
      <Logo height={36} />
      <div>
        <p className="text-5xl font-bold tracking-tight text-brand-600">{code}</p>
        <h1 className="mt-3 text-xl font-semibold text-content">{title}</h1>
        <p className="mt-2 max-w-sm text-sm text-content-muted">{message}</p>
      </div>
      <Link to="/">
        <Button variant="secondary">Voltar ao início</Button>
      </Link>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <Shell
      code="404"
      title="Página não encontrada"
      message="O endereço acessado não existe ou foi movido."
    />
  );
}

export function ForbiddenPage() {
  return (
    <Shell
      code="403"
      title="Acesso negado"
      message="Seu perfil não tem permissão para ver esta página. Fale com o administrador da sua empresa."
    />
  );
}
