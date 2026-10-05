import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { theme } from '../../theme';
import { dashboardApi } from '../../api/dashboardApi';
import { AdminDashboardData } from '../../types';
import { getErrorMessage } from '../../utils/formatters';
import StatCard from '../../components/StatCard/StatCard';
import ErrorState from '../../components/ErrorState/ErrorState';
import Button from '../../components/Button/Button';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getAdminDashboard();
      setMetrics(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch platform metrics'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Welcome Banner */}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: theme.typography.sizes.xl,
                fontWeight: theme.typography.weights.black,
                color: theme.colors.textPrimary,
                letterSpacing: '-0.02em',
              }}
            >
              System Administration
            </h2>
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: theme.typography.sizes.sm,
                color: theme.colors.textSecondary,
              }}
            >
              Real-time platform metrics, store directory monitoring, and user management.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/admin/stores" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="md">
                Stores Directory
              </Button>
            </Link>
            <Link to="/admin/users" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="md">
                User Management
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && <ErrorState message={error} onRetry={fetchMetrics} />}

      {/* Top Level Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        <StatCard
          title="Total Registered Users"
          value={metrics?.totalUsers}
          description="Registered consumers, store owners, and administrators"
          isLoading={isLoading}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />

        <StatCard
          title="Registered Stores"
          value={metrics?.totalStores}
          description="Active verified merchant listings in the discovery directory"
          isLoading={isLoading}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          }
        />

        <StatCard
          title="Submitted Ratings"
          value={metrics?.totalRatings}
          description="Verified customer ratings recorded on the platform"
          isLoading={isLoading}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          }
        />
      </div>

      {/* Quick Navigation Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        <div
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radii.lg,
            border: `1px solid ${theme.colors.border}`,
            padding: '24px',
            boxShadow: theme.shadows.card,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: theme.typography.sizes.lg, color: theme.colors.textPrimary }}>
              Merchant Stores
            </h3>
            <p style={{ margin: 0, fontSize: theme.typography.sizes.sm, color: theme.colors.textSecondary }}>
              Register new store locations, update addresses, and assign verified store owner representatives.
            </p>
          </div>
          <Link to="/admin/stores" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="md">
              View All Stores &rarr;
            </Button>
          </Link>
        </div>

        <div
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radii.lg,
            border: `1px solid ${theme.colors.border}`,
            padding: '24px',
            boxShadow: theme.shadows.card,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: theme.typography.sizes.lg, color: theme.colors.textPrimary }}>
              User Accounts
            </h3>
            <p style={{ margin: 0, fontSize: theme.typography.sizes.sm, color: theme.colors.textSecondary }}>
              Provision new administrative accounts, inspect customer rating histories, and manage store owner roles.
            </p>
          </div>
          <Link to="/admin/users" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="md">
              View All Users &rarr;
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
