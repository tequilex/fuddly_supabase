import { apiClient } from './client';
import { AuthResponse, User } from '@/shared/types';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  company?: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterData): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  login: (data: LoginData): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', data);
  },

  getMe: (): Promise<User> => {
    return apiClient.get<User>('/auth/me');
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
};
