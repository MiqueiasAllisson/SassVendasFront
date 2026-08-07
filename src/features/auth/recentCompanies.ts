import type { PublicCompany } from './auth.types';

/**
 * Empresas usadas recentemente neste navegador.
 *
 * Existe por causa da realidade do usuário: o vendedor entra na mesma empresa
 * todo dia e não deveria digitar 14 dígitos por isso. Guardamos só o
 * suficiente para montar o atalho — nenhum dado de autenticação.
 */
const STORAGE_KEY = 'gestordevendas:recent-companies';
const MAX_ITEMS = 4;

export function getRecentCompanies(): PublicCompany[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is PublicCompany => {
        const candidate = item as Partial<PublicCompany>;
        return typeof candidate?.id === 'string' && typeof candidate?.cnpj === 'string';
      })
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export function rememberCompany(company: PublicCompany): void {
  try {
    const others = getRecentCompanies().filter((item) => item.id !== company.id);
    const next = [company, ...others].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage bloqueado (modo privativo): o atalho some, o login continua.
  }
}

export function forgetCompanies(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignora
  }
}
