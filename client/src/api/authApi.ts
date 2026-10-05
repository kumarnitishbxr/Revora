// ============================================================================
// REVORA AUTHENTICATION API
// ============================================================================

import { axiosClient, isMockEnabled } from './axiosClient';
import { User, ApiResponse } from '../types';
import { mockUsers } from '../mock/mockData';

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
  token: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponseData> => {
    if (isMockEnabled) {
      const found = mockUsers.find(
        (u) => u.email.toLowerCase() === payload.email.toLowerCase()
      );
      if (found) {
        return { user: found, token: 'mock-jwt-token-' + found.id };
      }
      throw new Error('Invalid email or password');
    }

    const res = await axiosClient.post<ApiResponse<AuthResponseData>>(
      '/auth/login',
      payload
    );
    return res.data.data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponseData> => {
    if (isMockEnabled) {
      const newUser: User = {
        id: Date.now(),
        name: payload.name,
        email: payload.email,
        address: payload.address,
        role: 'NORMAL_USER',
        createdAt: new Date().toISOString(),
      };
      return { user: newUser, token: 'mock-jwt-token-' + newUser.id };
    }

    const res = await axiosClient.post<ApiResponse<AuthResponseData>>(
      '/auth/register',
      payload
    );
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    if (isMockEnabled) return;
    try {
      await axiosClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
  },

  getMe: async (): Promise<User> => {
    if (isMockEnabled) {
      return mockUsers[0];
    }
    const res = await axiosClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data.data.user;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<string> => {
    if (isMockEnabled) {
      return 'Password updated successfully (Mock)';
    }
    const res = await axiosClient.patch<ApiResponse<unknown>>(
      '/auth/password',
      payload
    );
    return res.data.message || 'Password changed successfully';
  },
};

export default authApi;
