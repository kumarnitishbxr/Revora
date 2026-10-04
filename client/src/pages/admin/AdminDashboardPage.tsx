import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Store,
  Star,
  Activity,
  ArrowRight,
  UserPlus,
  Store as StoreIcon,
  ShieldCheck,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import api from '../../services/api';
import type { AdminDashboardData } from '../../types';
import { StatCard, Button, LoadingSpinner, ErrorState } from '../../components/ui';
import { getErrorMessage } from '../../utils/error';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [dbStatus, setDbStatus] = useState<string>('checking');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [metrics, healthRes] = await Promise.allSettled([
        adminService.getDashboard(),
        api.get('/health'),
      ]);

      if (metrics.status === 'fulfilled') {
        setData(metrics.value);
      } else {
        throw metrics.reason;
      }

      if (healthRes.status === 'fulfilled' && healthRes.value.data?.database === 'connected') {
        setDbStatus('connected');
      } else {
        setDbStatus('degraded');
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" label="Loading administrator metrics..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Admin Dashboard Unavailable"
        message={error || 'Failed to retrieve administrative statistics.'}
        onRetry={fetchDashboardData}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] font-semibold mb-2 border border-purple-200 dark:border-purple-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>System Administrator Console</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            System Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time platform statistics, registered business counts, and user management
          </p>
        </div>

        {/* Database Health Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-xs">
          <Activity
            className={`w-4 h-4 ${
              dbStatus === 'connected' ? 'text-emerald-500 animate-pulse' : 'text-amber-500'
            }`}
          />
          <span className="text-slate-500 dark:text-slate-400">PostgreSQL Status:</span>
          <span
            className={`font-semibold capitalize ${
              dbStatus === 'connected' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'
            }`}
          >
            {dbStatus}
          </span>
        </div>
      </div>

      {/* Top Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Users"
          value={data.totalUsers}
          icon={<Users className="w-5 h-5" />}
          description="Registered system accounts"
        />

        <StatCard
          title="Total Stores"
          value={data.totalStores}
          icon={<Store className="w-5 h-5" />}
          description="Active business listings"
        />

        <StatCard
          title="Total Ratings"
          value={data.totalRatings}
          icon={<Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
          description="Verified customer ratings recorded"
        />
      </div>

      {/* Management Quick Actions & Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <StoreIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Store Directory</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Create new verified store locations, assign store owners, edit existing details,
              or remove unverified stores.
            </p>
          </div>
          <div>
            <Link to="/admin/stores">
              <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Manage Stores
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">User Accounts</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Inspect user roles, filter by Normal User, Store Owner, or System Admin, and provision
              new platform users.
            </p>
          </div>
          <div>
            <Link to="/admin/users">
              <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Manage Users
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
