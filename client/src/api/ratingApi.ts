// ============================================================================
// REVORA RATING API
// ============================================================================

import { axiosClient, isMockEnabled } from './axiosClient';
import { Rating, ApiResponse } from '../types';
import { mockStores } from '../mock/mockData';

export interface RatingResult {
  rating: Rating | { rating: number; userId: number; storeId: number };
  averageRating: number;
  totalRatings: number;
}

export const ratingApi = {
  getStoreRating: async (storeId: number) => {
    if (isMockEnabled) {
      const store = mockStores.find((s) => s.id === storeId);
      return {
        storeId,
        averageRating: store?.overallRating || 0,
        totalRatings: store?.totalRatings || 0,
        userRating: store?.userRating || null,
      };
    }

    const res = await axiosClient.get<
      ApiResponse<{
        storeId: number;
        averageRating: number;
        totalRatings: number;
        userRating: number | null;
      }>
    >(`/stores/${storeId}/rating`);
    return res.data.data;
  },

  submitRating: async (storeId: number, rating: number): Promise<RatingResult> => {
    if (isMockEnabled) {
      const store = mockStores.find((s) => s.id === storeId);
      if (store) {
        store.userRating = rating;
        store.totalRatings += 1;
        store.overallRating = Number(
          ((store.overallRating * (store.totalRatings - 1) + rating) / store.totalRatings).toFixed(1)
        );
        store.averageRating = store.overallRating;
        return {
          rating: { rating, userId: 3, storeId },
          averageRating: store.overallRating,
          totalRatings: store.totalRatings,
        };
      }
      throw new Error('Store not found');
    }

    const res = await axiosClient.post<ApiResponse<RatingResult>>(
      `/stores/${storeId}/rating`,
      { rating }
    );
    return res.data.data;
  },

  updateRating: async (storeId: number, rating: number): Promise<RatingResult> => {
    if (isMockEnabled) {
      const store = mockStores.find((s) => s.id === storeId);
      if (store) {
        store.userRating = rating;
        return {
          rating: { rating, userId: 3, storeId },
          averageRating: store.overallRating,
          totalRatings: store.totalRatings,
        };
      }
      throw new Error('Store not found');
    }

    const res = await axiosClient.patch<ApiResponse<RatingResult>>(
      `/stores/${storeId}/rating`,
      { rating }
    );
    return res.data.data;
  },
};

export default ratingApi;
