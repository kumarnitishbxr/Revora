export type Role = 'SYSTEM_ADMIN' | 'NORMAL_USER' | 'STORE_OWNER';

export interface User {
  id: number;
  name: string;
  email: string;
  address: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  createdAt: string;
  updatedAt?: string;
  overallRating: number;
  totalRatings: number;
  userRating?: number | null;
  ownerId?: number;
  owner?: {
    id: number;
    name: string;
    email: string;
  };
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
  };
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
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field?: string; message: string }>;
}
