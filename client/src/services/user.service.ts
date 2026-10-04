import api from './api';
import type { ApiResponse, User } from '../types';

export interface UpdateProfilePayload {
  name?: string;
  address?: string;
}

export const userService = {
  async getProfile(): Promise<User> {
    const res = await api.get<ApiResponse<{ user: User }>>('/users/me');
    return res.data.data!.user;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const res = await api.patch<ApiResponse<{ user: User }>>('/users/me', payload);
    return res.data.data!.user;
  },
};
