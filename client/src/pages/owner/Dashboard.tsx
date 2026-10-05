import React, { useState, useEffect, useCallback } from 'react';
import { theme } from '../../theme';
import { dashboardApi } from '../../api/dashboardApi';
import { OwnerDashboardData, RatingUser } from '../../types';
import { formatRating, formatDate, getErrorMessage } from '../../utils/formatters';

import StatCard from '../../components/StatCard/StatCard';
import DataTable, { ColumnDef } from '../../components/DataTable/DataTable';
import Stars from '../../components/Stars/Stars';
import ErrorState from '../../components/ErrorState/ErrorState';
import LoadingState from '../../components/LoadingState/LoadingState';

export const OwnerDashboard: React.FC = () => {
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOwnerDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getOwnerDashboard();
      setData(res);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch store dashboard'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOwnerDashboard();
  }, [fetchOwnerDashboard]);

  if (isLoading) {
    return (
      <div style={{ padding: '60px 0' }}>
        <LoadingState label="Loading store dashboard and customer reviews..." size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState message={error || 'Store dashboard unavailable'} onRetry={fetchOwnerDashboard} />;
  }

  const { store, averageRating, ratingCount, ratingUsers } = data;

  // Table columns for customer ratings
  const columns: ColumnDef<RatingUser>[] = [
    {
      key: 'userName',
      header: 'Customer Name',
      render: (r) => (
        <span style={{ fontWeight: theme.typography.weights.semibold, color: theme.colors.textPrimary }}>
          {r.user.name}
        </span>
      ),
    },
    {
      key: 'userEmail',
      header: 'Customer Email',
      render: (r) => r.user.email,
    },
    {
      key: 'rating',
      header: 'Score',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Stars value={r.rating} size="sm" />
          <span style={{ fontWeight: theme.typography.weights.bold }}>{r.rating}.0</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date Submitted',
      render: (r) => formatDate(r.createdAt),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Store Header Banner */}
      <div
        style={{
          padding: '28px',
          backgroundColor: '#ffffff',
          borderRadius: theme.radii.xl,
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadows.card,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: theme.radii.full,
                backgroundColor: theme.colors.roles.STORE_OWNER.bg,
                color: theme.colors.roles.STORE_OWNER.text,
                fontSize: theme.typography.sizes.xs,
                fontWeight: theme.typography.weights.bold,
                marginBottom: '8px',
              }}
            >
              <span>🏪</span>
              <span>MERCHANT PROFILE</span>
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: theme.typography.sizes['2xl'],
                fontWeight: theme.typography.weights.black,
                color: theme.colors.textPrimary,
                letterSpacing: '-0.02em',
              }}
            >
              {store?.name || 'Assigned Store'}
            </h2>

            <p style={{ margin: '4px 0 0 0', fontSize: theme.typography.sizes.sm, color: theme.colors.textSecondary }}>
              📍 {store?.address || 'No physical address registered'} &bull; ✉ {store?.email}
            </p>
          </div>

          <div
            style={{
              padding: '16px 20px',
              borderRadius: theme.radii.lg,
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 600 }}>OVERALL SCORE</div>
              <div
                style={{
                  fontSize: theme.typography.sizes['3xl'],
                  fontWeight: theme.typography.weights.black,
                  color: '#78350f',
                }}
              >
                {formatRating(averageRating)}
              </div>
            </div>
            <Stars value={averageRating} size="lg" />
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        <StatCard
          title="Average Customer Score"
          value={`${formatRating(averageRating)} / 5.0`}
          description="Aggregated score from verified shoppers"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          }
        />

        <StatCard
          title="Total Reviews Received"
          value={ratingCount}
          description="Total customer ratings recorded for this store"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          }
        />
      </div>

      {/* Customer Reviews Table */}
      <div>
        <div style={{ marginBottom: '14px' }}>
          <h3
            style={{
              margin: 0,
              fontSize: theme.typography.sizes.lg,
              fontWeight: theme.typography.weights.bold,
              color: theme.colors.textPrimary,
            }}
          >
            Recent Customer Reviews
          </h3>
          <p style={{ margin: '2px 0 0 0', fontSize: theme.typography.sizes.sm, color: theme.colors.textSecondary }}>
            Ratings submitted specifically for your store location.
          </p>
        </div>

        <DataTable<RatingUser>
          columns={columns}
          data={ratingUsers}
          keyExtractor={(r) => r.ratingId}
          emptyTitle="No reviews yet"
          emptyDescription="Your store has not received any customer ratings yet. Ratings will automatically appear here once submitted."
        />
      </div>
    </div>
  );
};

export default OwnerDashboard;
