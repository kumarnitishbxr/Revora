import React, { useState, useEffect } from 'react';
import {
  Store,
  Star,
  Users,
  MapPin,
  Mail,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { ownerService } from '../../services/owner.service';
import type { OwnerDashboardData } from '../../types';
import {
  StatCard,
  StarRating,
  LoadingSpinner,
  EmptyState,
  ErrorState,
} from '../../components/ui';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/error';

export const OwnerDashboardPage: React.FC = () => {
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ownerService.getDashboard();
      setData(res);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" label="Loading your store dashboard..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Owner Dashboard Unavailable"
        message={error || 'Could not load store information.'}
        onRetry={fetchDashboard}
      />
    );
  }

  const { store, averageRating, ratingCount, ratingUsers } = data;

  // Calculate rating distribution
  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = ratingUsers.filter((r) => r.rating === stars).length;
    const percentage = ratingCount > 0 ? (count / ratingCount) * 100 : 0;
    return { stars, count, percentage };
  });

  return (
    <div className="space-y-8">
      {/* Store Header Info */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 text-white border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <Store className="w-3.5 h-3.5" />
              <span>Assigned Store Owner</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">{store.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{store.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{store.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Registered {formatDate(store.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 shrink-0">
            <div>
              <div className="text-3xl font-black text-white">{averageRating.toFixed(1)}</div>
              <div className="text-[11px] text-slate-300">Average Rating</div>
            </div>
            <div className="flex flex-col items-center">
              <StarRating value={averageRating} size="md" />
              <div className="text-[11px] text-amber-300 mt-1">
                {ratingCount} customer {ratingCount === 1 ? 'review' : 'reviews'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <StatCard
            title="Overall Score"
            value={`${averageRating.toFixed(1)} / 5.0`}
            icon={<Star className="w-5 h-5 fill-amber-400 text-amber-400" />}
            description="Aggregated customer score"
          />

          <StatCard
            title="Total Reviews"
            value={ratingCount}
            icon={<Users className="w-5 h-5" />}
            description="Verified ratings received"
          />
        </div>

        {/* Rating Distribution Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Rating Breakdown
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Distribution of customer feedback across star ratings
            </p>

            <div className="space-y-3">
              {distribution.map((dist) => (
                <div key={dist.stars} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <span>{dist.stars}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${dist.percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-slate-500 dark:text-slate-400 font-medium">
                    {dist.count} ({Math.round(dist.percentage)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            Calculated in real-time from the verified ratings database
          </div>
        </div>
      </div>

      {/* Customers Rating History Table */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Customer Feedback History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified platform users who have submitted a rating for your store
          </p>
        </div>

        {ratingUsers.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No ratings received yet"
            description="When users submit ratings for your store, their reviews and scores will appear here."
          />
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Address</th>
                    <th className="py-3 px-4">Submitted Date</th>
                    <th className="py-3 px-4">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {ratingUsers.map((item) => (
                    <tr
                      key={item.ratingId}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {item.user.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{item.user.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <StarRating value={item.rating} size="sm" />
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {item.rating} / 5
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                          <span className="truncate">{item.user.address}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {formatDateTime(item.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {formatDateTime(item.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
