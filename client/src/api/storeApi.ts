// ============================================================================
// REVORA STORE API (Public / User Stores & Admin Store Management)
// ============================================================================

import { axiosClient, isMockEnabled } from './axiosClient';
import { Store, ApiResponse, PaginatedResponse } from '../types';
import { mockStores } from '../mock/mockData';

export interface QueryStoresParams {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  address?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateStorePayload {
  name: string;
  email: string;
  address: string;
  ownerId?: number;
}

export interface UpdateStorePayload {
  name?: string;
  email?: string;
  address?: string;
  ownerId?: number;
}

export const storeApi = {
  // Public / Normal user store browsing
  getStores: async (params: QueryStoresParams = {}): Promise<PaginatedResponse<Store>> => {
    if (isMockEnabled) {
      let filtered = [...mockStores];
      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.address.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q)
        );
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

    const res = await axiosClient.get<PaginatedResponse<Store>>('/stores', {
      params,
    });
    return res.data;
  },

  getStoreById: async (id: number): Promise<Store> => {
    if (isMockEnabled) {
      const found = mockStores.find((s) => s.id === id);
      if (!found) throw new Error('Store not found');
      return found;
    }

    const res = await axiosClient.get<ApiResponse<{ store: Store }>>(`/stores/${id}`);
    return res.data.data.store;
  },

  // Admin store management
  getAdminStores: async (params: QueryStoresParams = {}): Promise<PaginatedResponse<Store>> => {
    if (isMockEnabled) {
      return storeApi.getStores(params);
    }

    const res = await axiosClient.get<PaginatedResponse<Store>>('/admin/stores', {
      params,
    });
    return res.data;
  },

  createStore: async (payload: CreateStorePayload): Promise<Store> => {
    if (isMockEnabled) {
      const newStore: Store = {
        id: Date.now(),
        name: payload.name,
        email: payload.email,
        address: payload.address,
        createdAt: new Date().toISOString(),
        overallRating: 0,
        averageRating: 0,
        totalRatings: 0,
        ownerId: payload.ownerId,
      };
      mockStores.push(newStore);
      return newStore;
    }

    const res = await axiosClient.post<ApiResponse<{ store: Store }>>(
      '/admin/stores',
      payload
    );
    return res.data.data.store;
  },

  updateStore: async (id: number, payload: UpdateStorePayload): Promise<Store> => {
    if (isMockEnabled) {
      const idx = mockStores.findIndex((s) => s.id === id);
      if (idx !== -1) {
        mockStores[idx] = { ...mockStores[idx], ...payload };
        return mockStores[idx];
      }
      throw new Error('Store not found');
    }

    const res = await axiosClient.patch<ApiResponse<{ store: Store }>>(
      `/admin/stores/${id}`,
      payload
    );
    return res.data.data.store;
  },

  deleteStore: async (id: number): Promise<void> => {
    if (isMockEnabled) {
      const idx = mockStores.findIndex((s) => s.id === id);
      if (idx !== -1) mockStores.splice(idx, 1);
      return;
    }

    await axiosClient.delete(`/admin/stores/${id}`);
  },
};

export default storeApi;
