import { api } from '@/lib/api';

import type { AuthResponse, LoginPayload, PublicCompany, SessionUser } from './auth.types';

export const authApi = {
  /** Busca do seletor de empresa — pública, exige ao menos 2 caracteres. */
  searchCompanies: (search: string) =>
    api.get<PublicCompany[]>(`/auth/companies?search=${encodeURIComponent(search)}`, {
      skipAuthRetry: true,
    }),

  companyByCnpj: (cnpj: string) =>
    api.get<PublicCompany>(`/auth/companies/by-cnpj?cnpj=${encodeURIComponent(cnpj)}`, {
      skipAuthRetry: true,
    }),

  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', payload, { skipAuthRetry: true }),

  me: () => api.get<SessionUser>('/auth/me'),

  logout: () => api.post<void>('/auth/logout'),

  forgotPassword: (payload: { email: string; companyId?: string; cnpj?: string }) =>
    api.post<void>('/auth/forgot-password', payload, { skipAuthRetry: true }),

  resetPassword: (payload: { token: string; password: string }) =>
    api.post<void>('/auth/reset-password', payload, { skipAuthRetry: true }),

  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    api.post<void>('/auth/change-password', payload),
};
