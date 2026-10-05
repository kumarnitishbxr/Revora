import React from 'react';
import { theme } from '../../theme';
import Button from '../Button/Button';

export interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  style?: React.CSSProperties;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  style,
}) => {
  if (totalPages <= 1 && total === 0) return null;

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '16px 4px',
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary,
        ...style,
      }}
    >
      <div>
        Showing <strong style={{ color: theme.colors.textPrimary }}>{start}</strong> to{' '}
        <strong style={{ color: theme.colors.textPrimary }}>{end}</strong> of{' '}
        <strong style={{ color: theme.colors.textPrimary }}>{total}</strong> entries
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous Page"
        >
          Previous
        </Button>

        <span style={{ padding: '0 8px', fontWeight: theme.typography.weights.medium }}>
          Page {page} of {Math.max(1, totalPages)}
        </span>

        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next Page"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
