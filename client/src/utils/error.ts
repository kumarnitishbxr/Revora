import axios from 'axios';
import type { ApiErrorResponse } from '../types';

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const errorData = error.response?.data as ApiErrorResponse | undefined;

    if (errorData) {
      if (errorData.errors && errorData.errors.length > 0) {
        return errorData.errors.map(e => e.message).join(', ');
      }
      if (errorData.message) {
        return errorData.message;
      }
    }

    if (error.response?.status === 401) {
      return 'Your session has expired. Please log in again.';
    }
    if (error.response?.status === 403) {
      return "You don't have permission to access this resource.";
    }
    if (error.response?.status === 404) {
      return 'The requested resource was not found.';
    }
    if (error.response?.status === 409) {
      return 'A conflict occurred. The record may already exist.';
    }
    if (error.response?.status === 500) {
      return 'Internal server error. Please try again later.';
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('Network Error')) {
      return 'Unable to connect to the Revora server. Please ensure the backend is running.';
    }

    return error.message || 'An unexpected error occurred.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}
