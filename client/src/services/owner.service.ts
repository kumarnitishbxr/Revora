import api from './api';
import type { ApiResponse, OwnerDashboardData } from '../types';

export const ownerService = {
  async getDashboard(): Promise<OwnerDashboardData> {
    const res = await api.get<ApiResponse<OwnerDashboardData>>('/store-owner/dashboard');
    return res.data.data!;
  },
};
