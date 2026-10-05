import React, { useState } from 'react';
import { theme } from '../../theme';
import Pagination, { PaginationProps } from '../Pagination/Pagination';
import LoadingState from '../LoadingState/LoadingState';
import EmptyState from '../EmptyState/EmptyState';

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string | number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
  pagination?: PaginationProps;
  style?: React.CSSProperties;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  sortBy,
  sortOrder,
  onSort,
  isLoading = false,
  emptyTitle = 'No data found',
  emptyDescription = 'There are no records to display.',
  onRowClick,
  pagination,
  style,
}: DataTableProps<T>) {
  const [hoveredRowId, setHoveredRowId] = useState<string | number | null>(null);

  const tableWrapperStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadows.card,
    overflow: 'hidden',
    ...style,
  };

  const scrollContainerStyle: React.CSSProperties = {
    width: '100%',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily,
  };

  const thStyle = (col: ColumnDef<T>): React.CSSProperties => ({
    padding: '14px 18px',
    backgroundColor: theme.colors.surfaceSubtle,
    borderBottom: `1px solid ${theme.colors.border}`,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.semibold,
    fontSize: theme.typography.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    textAlign: col.align || 'left',
    width: col.width,
    whiteSpace: 'nowrap',
    userSelect: col.sortable ? 'none' : 'auto',
    cursor: col.sortable && onSort ? 'pointer' : 'default',
  });

  const tdStyle = (col: ColumnDef<T>): React.CSSProperties => ({
    padding: '14px 18px',
    borderBottom: `1px solid ${theme.colors.border}`,
    color: theme.colors.textPrimary,
    textAlign: col.align || 'left',
    verticalAlign: 'middle',
  });

  return (
    <div style={tableWrapperStyle}>
      <div style={scrollContainerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {columns.map((col) => {
                const isSorted = sortBy === col.key;
                return (
                  <th
                    key={col.key}
                    style={thStyle(col)}
                    onClick={() => col.sortable && onSort && onSort(col.key)}
                  >
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        justifyContent:
                          col.align === 'right'
                            ? 'flex-end'
                            : col.align === 'center'
                            ? 'center'
                            : 'flex-start',
                      }}
                    >
                      <span>{col.header}</span>
                      {col.sortable && onSort && (
                        <span
                          style={{
                            fontSize: '11px',
                            color: isSorted ? theme.colors.primary : theme.colors.textMuted,
                          }}
                        >
                          {isSorted ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '40px', textAlign: 'center' }}>
                  <LoadingState label="Loading table records..." />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '32px 16px' }}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const key = keyExtractor(item, index);
                const isHovered = hoveredRowId === key;

                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick && onRowClick(item)}
                    onMouseEnter={() => setHoveredRowId(key)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    style={{
                      backgroundColor: isHovered
                        ? theme.colors.surfaceHover
                        : index % 2 === 1
                        ? '#fafafa'
                        : theme.colors.surface,
                      cursor: onRowClick ? 'pointer' : 'default',
                      transition: 'background-color 0.1s ease',
                    }}
                  >
                    {columns.map((col) => (
                      <td key={col.key} style={tdStyle(col)}>
                        {col.render
                          ? col.render(item, index)
                          : (item as any)[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div style={{ borderTop: `1px solid ${theme.colors.border}`, padding: '0 16px' }}>
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
}

export default DataTable;
