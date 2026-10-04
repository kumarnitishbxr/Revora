import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Response interceptor for centralized handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 and not already on /login or /register, could notify or handle session expiration
    return Promise.reject(error);
  }
);

export default api;
