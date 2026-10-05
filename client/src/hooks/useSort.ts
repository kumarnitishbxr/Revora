import { useState, useCallback } from 'react';

export function useSort(initialField: string = 'createdAt', initialOrder: 'asc' | 'desc' = 'desc') {
  const [sortBy, setSortBy] = useState<string>(initialField);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialOrder);

  const handleSort = useCallback((field: string) => {
    setSortBy((prevField) => {
      if (prevField === field) {
        setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
        return field;
      }
      setSortOrder('asc');
      return field;
    });
  }, []);

  return {
    sortBy,
    sortOrder,
    handleSort,
    setSortBy,
    setSortOrder,
  };
}

export default useSort;
