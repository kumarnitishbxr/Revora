import api from './api';
import type {
  ApiResponse,
  PaginatedResponse,
  AdminDashboardData,
  User,
  Store,
  Role,
} from '../types';

export interface AdminUserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  sortBy?: 'name' | 'email' | 'address' | 'role' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface AdminStoreQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  address?: string;
  sortBy?: 'name' | 'email' | 'address' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  address: string;
  role: Role;
}

export interface CreateStorePayload {
  name: string;
  email: string;
  address: string;
  ownerId: number;
}

export interface UpdateStorePayload {
  name?: string;
  email?: string;
  address?: string;
  ownerId?: number;
}

export const adminService = {
  async getDashboard(): Promise<AdminDashboardData> {
    const res = await api.get<ApiResponse<AdminDashboardData>>('/admin/dashboard');
    return res.data.data!;
  },

  async getUsers(params: AdminUserQueryParams = {}): Promise<PaginatedResponse<User>> {
    const res = await api.get<PaginatedResponse<User>>('/admin/users', { params });
    return res.data;
  },

  async getUserById(id: number): Promise<User> {
    const res = await api.get<ApiResponse<{ user: User }>>(`/admin/users/${id}`);
    return res.data.data!.user;
  },

  async createUser(payload: CreateUserPayload): Promise<User> {
    const res = await api.post<ApiResponse<{ user: User }>>('/admin/users', payload);
    return res.data.data!.user;
  },

  async getStores(params: AdminStoreQueryParams = {}): Promise<PaginatedResponse<Store>> {
    const res = await api.get<PaginatedResponse<Store>>('/admin/stores', { params });
    return res.data;
  },

  async createStore(payload: CreateStorePayload): Promise<Store> {
    const res = await api.post<ApiResponse<{ store: Store }>>('/admin/stores', payload);
    return res.data.data!.store;
  },

  async updateStore(id: number, payload: UpdateStorePayload): Promise<Store> {
    const res = await api.patch<ApiResponse<{ store: Store }>>(`/admin/stores/${id}`, payload);
    return res.data.data!.store;
  },

  async deleteStore(id: number): Promise<void> {
    await api.delete<ApiResponse>(`/admin/stores/${id}`);
  },
};
