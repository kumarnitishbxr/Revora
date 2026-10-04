import api from './api';
import type { PaginatedResponse, ApiResponse, Store } from '../types';

export interface StoreQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'address' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export const storeService = {
  async getStores(params: StoreQueryParams = {}): Promise<PaginatedResponse<Store>> {
    const res = await api.get<PaginatedResponse<Store>>('/stores', { params });
    return res.data;
  },

  async getStoreById(id: number): Promise<Store> {
    const res = await api.get<ApiResponse<Store>>(`/stores/${id}`);
    return res.data.data!;
  },
};
