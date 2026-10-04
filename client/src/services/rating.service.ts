import api from './api';
import type { ApiResponse, Rating } from '../types';

export interface RatingResponseData {
  rating: Rating;
  averageRating: number;
  totalRatings: number;
}

export interface StoreRatingSummary {
  storeId: number;
  averageRating: number;
  totalRatings: number;
  userRating: number | null;
}

export const ratingService = {
  async getStoreRating(storeId: number): Promise<StoreRatingSummary> {
    const res = await api.get<ApiResponse<StoreRatingSummary>>(`/stores/${storeId}/rating`);
    return res.data.data!;
  },

  async submitRating(storeId: number, rating: number): Promise<RatingResponseData> {
    const res = await api.post<ApiResponse<RatingResponseData>>(`/stores/${storeId}/rating`, {
      rating,
    });
    return res.data.data!;
  },

  async updateRating(storeId: number, rating: number): Promise<RatingResponseData> {
    const res = await api.patch<ApiResponse<RatingResponseData>>(`/stores/${storeId}/rating`, {
      rating,
    });
    return res.data.data!;
  },
};
