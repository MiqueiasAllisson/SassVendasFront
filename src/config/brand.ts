/**
 * Identidade visual do produto — **ponto único de troca de marca**.
 *
 * Tudo vem do .env (VITE_BRAND_*), então reetiquetar o sistema é editar um
 * arquivo de ambiente e trocar um SVG em /public. Nenhum componente conhece o
 * nome ou a cor da marca diretamente.
 */
const env = import.meta.env;

export interface Brand {
  name: string;
  shortName: string;
  tagline: string;
  /** Logo horizontal (assinatura). Vazio = usa a marca embutida em <Logo/>. */
  logoUrl: string;
  logoDarkUrl: string;
  /** Símbolo quadrado, para espaços apertados. */
  iconUrl: string;
  primaryColor: string;
  loginBackgroundUrl: string;
  supportEmail: string;
}

export const brand: Brand = {
  name: env.VITE_BRAND_NAME || 'GestorDeVendas',
  shortName: env.VITE_BRAND_SHORT_NAME || 'Gestor',
  tagline: env.VITE_BRAND_TAGLINE || 'Gestor de clientes e parque de máquinas',
  logoUrl: env.VITE_BRAND_LOGO_URL || '',
  logoDarkUrl: env.VITE_BRAND_LOGO_DARK_URL || '',
  iconUrl: env.VITE_BRAND_ICON_URL || '',
  primaryColor: env.VITE_BRAND_PRIMARY_COLOR || '#1F6FEB',
  loginBackgroundUrl: env.VITE_LOGIN_BACKGROUND_URL || '',
  supportEmail: env.VITE_SUPPORT_EMAIL || '',
};

export const appConfig = {
  apiUrl: env.VITE_API_URL || '/api/v1',
  /** Instalação multi-empresa mostra o seletor de CNPJ; single-tenant não. */
  companySelectEnabled: (env.VITE_ENABLE_COMPANY_SELECT ?? 'true') !== 'false',
  /** Em instalação de cliente único, fixa a empresa e esconde o seletor. */
  fixedCnpj: env.VITE_FIXED_CNPJ || '',
};
