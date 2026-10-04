import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const startRecord = Math.min((page - 1) * limit + 1, total);
  const endRecord = Math.min(page * limit, total);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-2 ${className}`}
    >
      <div className="text-xs text-slate-500 dark:text-slate-400">
        Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{startRecord}</span>{' '}
        to <span className="font-semibold text-slate-700 dark:text-slate-200">{endRecord}</span> of{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-200">{total}</span> results
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
          aria-label="Previous page"
        >
          Previous
        </Button>

        <span className="text-xs px-2 font-medium text-slate-600 dark:text-slate-300">
          Page {page} of {totalPages}
        </span>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          rightIcon={<ChevronRight className="w-4 h-4" />}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </div>
  );
};
