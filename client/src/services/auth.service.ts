import api from './api';
import type { ApiResponse, User } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  address: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponseData {
  user: User;
  token?: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<{ user: User; token?: string }> {
    const res = await api.post<ApiResponse<AuthResponseData>>('/auth/login', payload);
    return res.data.data!;
  },

  async register(payload: RegisterPayload): Promise<{ user: User; token?: string }> {
    const res = await api.post<ApiResponse<AuthResponseData>>('/auth/register', payload);
    return res.data.data!;
  },

  async logout(): Promise<void> {
    await api.post<ApiResponse>('/auth/logout');
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data.data!.user;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<string> {
    const res = await api.patch<ApiResponse>('/auth/password', payload);
    return res.data.message || 'Password changed successfully';
  },
};
