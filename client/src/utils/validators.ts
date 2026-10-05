export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validators = {
  name: (value: string): ValidationResult => {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return { isValid: false, error: 'Full name is required' };
    }
    if (trimmed.length < 20) {
      return {
        isValid: false,
        error: `Name must be at least 20 characters (${trimmed.length}/20)`,
      };
    }
    if (trimmed.length > 60) {
      return {
        isValid: false,
        error: `Name cannot exceed 60 characters (${trimmed.length}/60)`,
      };
    }
    return { isValid: true };
  },

  email: (value: string): ValidationResult => {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return { isValid: false, error: 'Email address is required' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    return { isValid: true };
  },

  password: (value: string): ValidationResult => {
    const pwd = value || '';
    if (!pwd) {
      return { isValid: false, error: 'Password is required' };
    }
    if (pwd.length < 8) {
      return {
        isValid: false,
        error: `Password must be at least 8 characters (${pwd.length}/8)`,
      };
    }
    if (pwd.length > 16) {
      return {
        isValid: false,
        error: `Password cannot exceed 16 characters (${pwd.length}/16)`,
      };
    }
    if (!/[A-Z]/.test(pwd)) {
      return {
        isValid: false,
        error: 'Password must contain at least one uppercase letter (A-Z)',
      };
    }
    if (!/[^a-zA-Z0-9]/.test(pwd)) {
      return {
        isValid: false,
        error: 'Password must contain at least one special character (!@#$%^&*)',
      };
    }
    return { isValid: true };
  },

  address: (value: string): ValidationResult => {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return { isValid: false, error: 'Address is required' };
    }
    if (trimmed.length > 400) {
      return {
        isValid: false,
        error: `Address cannot exceed 400 characters (${trimmed.length}/400)`,
      };
    }
    return { isValid: true };
  },

  storeName: (value: string): ValidationResult => {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return { isValid: false, error: 'Store name is required' };
    }
    if (trimmed.length < 2) {
      return { isValid: false, error: 'Store name must be at least 2 characters' };
    }
    if (trimmed.length > 100) {
      return { isValid: false, error: 'Store name cannot exceed 100 characters' };
    }
    return { isValid: true };
  },

  rating: (value: number): ValidationResult => {
    if (typeof value !== 'number' || isNaN(value)) {
      return { isValid: false, error: 'Rating is required' };
    }
    if (!Number.isInteger(value)) {
      return { isValid: false, error: 'Rating must be an integer' };
    }
    if (value < 1 || value > 5) {
      return { isValid: false, error: 'Rating must be between 1 and 5' };
    }
    return { isValid: true };
  },

  confirmPassword: (password: string, confirm: string): ValidationResult => {
    if (!confirm) {
      return { isValid: false, error: 'Please confirm your password' };
    }
    if (password !== confirm) {
      return { isValid: false, error: 'Passwords do not match' };
    }
    return { isValid: true };
  },
};
