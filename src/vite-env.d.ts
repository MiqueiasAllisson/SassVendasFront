/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_API_PROXY_TARGET?: string;
  readonly VITE_PORT?: string;

  readonly VITE_BRAND_NAME?: string;
  readonly VITE_BRAND_SHORT_NAME?: string;
  readonly VITE_BRAND_TAGLINE?: string;
  readonly VITE_BRAND_LOGO_URL?: string;
  readonly VITE_BRAND_LOGO_DARK_URL?: string;
  readonly VITE_BRAND_ICON_URL?: string;
  readonly VITE_BRAND_PRIMARY_COLOR?: string;
  readonly VITE_LOGIN_BACKGROUND_URL?: string;
  readonly VITE_SUPPORT_EMAIL?: string;

  readonly VITE_ENABLE_COMPANY_SELECT?: string;
  readonly VITE_FIXED_CNPJ?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
