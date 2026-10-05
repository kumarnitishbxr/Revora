// ============================================================================
// REVORA DASHBOARD API (Admin Metrics & Store Owner Dashboard)
// ============================================================================

import { axiosClient, isMockEnabled } from './axiosClient';
import { AdminDashboardData, OwnerDashboardData, ApiResponse } from '../types';
import { mockAdminDashboard, mockOwnerDashboard } from '../mock/mockData';

export const dashboardApi = {
  getAdminDashboard: async (): Promise<AdminDashboardData> => {
    if (isMockEnabled) return mockAdminDashboard;
    const res = await axiosClient.get<ApiResponse<AdminDashboardData>>(
      '/admin/dashboard'
    );
    return res.data.data;
  },

  getOwnerDashboard: async (): Promise<OwnerDashboardData> => {
    if (isMockEnabled) return mockOwnerDashboard;
    const res = await axiosClient.get<ApiResponse<OwnerDashboardData>>(
      '/store-owner/dashboard'
    );
    return res.data.data;
  },
};

export default dashboardApi;
