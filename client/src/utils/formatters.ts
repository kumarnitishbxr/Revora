export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatRating(rating: number | undefined | null): string {
  if (rating === undefined || rating === null || isNaN(rating)) return '0.0';
  return rating.toFixed(1);
}

export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

export function getInitials(name?: string | null): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export function getErrorMessage(err: unknown, fallback: string = 'An unexpected error occurred'): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;

  const anyErr = err as any;
  if (anyErr.response?.data?.message) {
    return anyErr.response.data.message;
  }
  if (Array.isArray(anyErr.response?.data?.errors) && anyErr.response.data.errors.length > 0) {
    const first = anyErr.response.data.errors[0];
    return first.message || first;
  }
  if (anyErr.message && !anyErr.message.includes('Network Error')) {
    return anyErr.message;
  }
  if (anyErr.message?.includes('Network Error')) {
    return 'Unable to connect to the server. Please check your network or try again.';
  }

  return fallback;
}
