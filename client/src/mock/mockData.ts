import { User, Store, OwnerDashboardData, AdminDashboardData } from '../types';

export const mockUsers: User[] = [
  {
    id: 1,
    name: 'System Administrator Account',
    email: 'admin@revora.com',
    address: '100 Admin Corporate Plaza, Suite 400, Tech City',
    role: 'SYSTEM_ADMIN',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Store Owner Representative',
    email: 'owner@revora.com',
    address: '12 Commerce Boulevard, Downtown Central',
    role: 'STORE_OWNER',
    createdAt: new Date().toISOString(),
    storeName: 'Revora Organic Market',
    storeRating: 4.8,
  },
  {
    id: 3,
    name: 'Normal Customer Representative',
    email: 'user@revora.com',
    address: '78 Residential Avenue, Suburbia Heights',
    role: 'NORMAL_USER',
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Artisan Coffee Roasters Owner',
    email: 'barista@revora.com',
    address: '45 Beanery Way, Arts District',
    role: 'STORE_OWNER',
    createdAt: new Date().toISOString(),
    storeName: 'Artisan Roastery & Cafe',
    storeRating: 4.9,
  },
];

export const mockStores: Store[] = [
  {
    id: 1,
    name: 'Revora Organic Market',
    email: 'contact@revoramarket.com',
    address: '12 Commerce Boulevard, Floor 1, Downtown Central',
    createdAt: new Date().toISOString(),
    overallRating: 4.8,
    averageRating: 4.8,
    totalRatings: 18,
    userRating: 5,
    ownerId: 2,
    owner: {
      id: 2,
      name: 'Store Owner Representative',
      email: 'owner@revora.com',
    },
  },
  {
    id: 2,
    name: 'Artisan Roastery & Cafe',
    email: 'hello@artisanroasters.com',
    address: '45 Beanery Way, Arts District',
    createdAt: new Date().toISOString(),
    overallRating: 4.9,
    averageRating: 4.9,
    totalRatings: 24,
    userRating: 4,
    ownerId: 4,
    owner: {
      id: 4,
      name: 'Artisan Coffee Roasters Owner',
      email: 'barista@revora.com',
    },
  },
  {
    id: 3,
    name: 'Green Leaf Pharmacy & Wellness',
    email: 'support@greenleafpharmacy.com',
    address: '88 Healthcare Avenue, MedPark Hub',
    createdAt: new Date().toISOString(),
    overallRating: 4.2,
    averageRating: 4.2,
    totalRatings: 12,
    userRating: null,
    ownerId: 2,
    owner: {
      id: 2,
      name: 'Store Owner Representative',
      email: 'owner@revora.com',
    },
  },
];

export const mockAdminDashboard: AdminDashboardData = {
  totalUsers: 142,
  totalStores: 28,
  totalRatings: 384,
};

export const mockOwnerDashboard: OwnerDashboardData = {
  store: {
    id: 1,
    name: 'Revora Organic Market',
    email: 'contact@revoramarket.com',
    address: '12 Commerce Boulevard, Floor 1, Downtown Central',
    createdAt: new Date().toISOString(),
  },
  averageRating: 4.8,
  ratingCount: 18,
  ratingUsers: [
    {
      ratingId: 101,
      rating: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: 3,
        name: 'Normal Customer Representative',
        email: 'user@revora.com',
        address: '78 Residential Avenue, Suburbia Heights',
      },
    },
    {
      ratingId: 102,
      rating: 4,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      user: {
        id: 5,
        name: 'Eleanor Vance Customer Profile',
        email: 'eleanor@vancemail.org',
        address: '92 Highwood Drive, North Sector',
      },
    },
  ],
};
