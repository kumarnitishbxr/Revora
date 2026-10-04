import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, Star, ShieldCheck, TrendingUp } from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Visual / Brand Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-12 text-white flex-col justify-between overflow-hidden border-r border-slate-800">
        {/* Subtle background glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white m-0">Revora</h1>
            <p className="text-xs text-indigo-300 font-medium">Store Rating Management Platform</p>
          </div>
        </div>

        {/* Core Value Statement */}
        <div className="relative z-10 max-w-md my-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Customer Ratings System</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Transparent ratings. Real customer insights. Better local stores.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Revora powers authentic store discovery with verified reviews, fair score aggregations,
            and real-time analytics for store owners and system administrators.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="text-sm font-bold text-white">5-Star Feedback</span>
              </div>
              <p className="text-xs text-slate-400">Granular 1-5 customer rating engine</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-bold text-white">Live Metrics</span>
              </div>
              <p className="text-xs text-slate-400">Real-time aggregation & dashboards</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/60 pt-4">
          <span>&copy; {new Date().getFullYear()} Revora Inc.</span>
          <span>Enterprise Grade Security</span>
        </div>
      </div>

      {/* Auth Content Area */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        <div className="flex items-center justify-between">
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
            <span className="font-bold text-base text-slate-900 dark:text-white">Revora</span>
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="w-full max-w-md mx-auto my-auto py-8">
          <Outlet />
        </div>

        <div className="text-center text-xs text-slate-400 dark:text-slate-600">
          Protected by HTTPS &bull; Encrypted session tokens &bull; Strict validation
        </div>
      </div>
    </div>
  );
};
