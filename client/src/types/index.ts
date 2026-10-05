// ============================================================================
// REVORA CORE DATA TYPES
// Mapped exactly to Backend Models & API Responses
// ============================================================================

import { UserRole } from '../utils/constants';

export type Role = UserRole;

export interface User {
  id: number;
  name: string;
  email: string;
  address: string;
  role: Role;
  createdAt: string;
  updatedAt?: string;
  storeName?: string | null;
  storeRating?: number | null;
}

export interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  createdAt: string;
  updatedAt?: string;
  overallRating: number;
  averageRating?: number;
  totalRatings: number;
  userRating?: number | null;
  ownerId?: number;
  owner?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface Rating {
  id: number;
  rating: number;
  userId: number;
  storeId: number;
  createdAt: string;
  updatedAt: string;
}

export interface RatingUser {
  ratingId: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    address: string;
  };
}

export interface OwnerDashboardData {
  store: {
    id: number;
    name: string;
    email: string;
    address: string;
    createdAt: string;
  } | null;
  averageRating: number;
  ratingCount: number;
  ratingUsers: RatingUser[];
}

export interface AdminDashboardData {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: PaginationMeta;
}
