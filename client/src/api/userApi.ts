// ============================================================================
// REVORA USER API (Profile & Admin User Management)
// ============================================================================

import { axiosClient, isMockEnabled } from './axiosClient';
import { User, ApiResponse, PaginatedResponse, Role } from '../types';
import { mockUsers } from '../mock/mockData';

export interface QueryUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateAdminUserPayload {
  name: string;
  email: string;
  password: string;
  address: string;
  role: Role;
}

export const userApi = {
  // Current logged in user profile
  getProfile: async (): Promise<User> => {
    if (isMockEnabled) return mockUsers[0];
    const res = await axiosClient.get<ApiResponse<{ user: User }>>('/users/me');
    return res.data.data.user;
  },

  updateProfile: async (data: { name?: string; address?: string }): Promise<User> => {
    if (isMockEnabled) return { ...mockUsers[0], ...data };
    const res = await axiosClient.patch<ApiResponse<{ user: User }>>('/users/me', data);
    return res.data.data.user;
  },

  // Admin user management
  getUsers: async (params: QueryUsersParams = {}): Promise<PaginatedResponse<User>> => {
    if (isMockEnabled) {
      let filtered = [...mockUsers];
      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.address.toLowerCase().includes(q)
        );
      }
      if (params.role) {
        filtered = filtered.filter((u) => u.role === params.role);
      }
      return {
        success: true,
        data: filtered,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: filtered.length,
          totalPages: 1,
        },
      };
    }

    const res = await axiosClient.get<PaginatedResponse<User>>('/admin/users', {
      params,
    });
    return res.data;
  },

  getUserById: async (id: number): Promise<User> => {
    if (isMockEnabled) {
      const found = mockUsers.find((u) => u.id === id);
      if (!found) throw new Error('User not found');
      return found;
    }

    const res = await axiosClient.get<ApiResponse<{ user: User }>>(
      `/admin/users/${id}`
    );
    return res.data.data.user;
  },

  createUser: async (payload: CreateAdminUserPayload): Promise<User> => {
    if (isMockEnabled) {
      const newUser: User = {
        id: Date.now(),
        name: payload.name,
        email: payload.email,
        address: payload.address,
        role: payload.role,
        createdAt: new Date().toISOString(),
      };
      mockUsers.push(newUser);
      return newUser;
    }

    const res = await axiosClient.post<ApiResponse<{ user: User }>>(
      '/admin/users',
      payload
    );
    return res.data.data.user;
  },
};

export default userApi;
