export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  COMPANY_ADMIN: 'COMPANY_ADMIN',
  SELLER: 'SELLER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ROLE_LABEL: Record<UserRole, string> = {
  SUPER_ADMIN: 'Administrador do sistema',
  COMPANY_ADMIN: 'Administrador da empresa',
  SELLER: 'Vendedor',
};

export interface PublicCompany {
  id: string;
  cnpj: string;
  cnpjFormatted: string;
  tradeName: string;
  logoUrl: string | null;
  primaryColor: string | null;
}

export interface SessionCompany {
  id: string;
  cnpj: string;
  tradeName: string;
  corporateName: string;
  logoUrl: string | null;
  primaryColor: string | null;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  mustChangePassword: boolean;
  canSeeWholeCompany: boolean;
  company: SessionCompany | null;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
  user: SessionUser;
}

export interface LoginPayload {
  companyId?: string;
  cnpj?: string;
  email: string;
  password: string;
  rememberMe?: boolean;
}
