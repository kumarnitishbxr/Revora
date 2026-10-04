import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui';
import { useAuth } from '../hooks';

export const NotFoundPage: React.FC = () => {
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'SYSTEM_ADMIN':
        return '/admin/dashboard';
      case 'STORE_OWNER':
        return '/owner/dashboard';
      case 'NORMAL_USER':
      default:
        return '/user/dashboard';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-md w-full text-center space-y-5 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="text-4xl font-extrabold text-slate-900 dark:text-white">404</span>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Page Not Found
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The page or resource you are looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link to={getDashboardPath()}>
          <Button size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
