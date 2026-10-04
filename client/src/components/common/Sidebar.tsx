import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Store as StoreIcon,
  Users,
  Settings,
  Sparkles,
  BarChart3,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../hooks';

interface SidebarProps {
  onItemClick?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick, className = '' }) => {
  const { role } = useAuth();

  const getNavLinks = () => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return [
          {
            label: 'Overview',
            to: '/admin/dashboard',
            icon: LayoutDashboard,
          },
          {
            label: 'Store Directory',
            to: '/admin/stores',
            icon: StoreIcon,
          },
          {
            label: 'User Accounts',
            to: '/admin/users',
            icon: Users,
          },
          {
            label: 'Settings',
            to: '/settings',
            icon: Settings,
          },
        ];
      case 'STORE_OWNER':
        return [
          {
            label: 'Store Analytics',
            to: '/owner/dashboard',
            icon: BarChart3,
          },
          {
            label: 'Settings',
            to: '/settings',
            icon: Settings,
          },
        ];
      case 'NORMAL_USER':
      default:
        return [
          {
            label: 'Browse Stores',
            to: '/user/dashboard',
            icon: Compass,
          },
          {
            label: 'Account Settings',
            to: '/settings',
            icon: Settings,
          },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside
      className={`w-64 shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors ${className}`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-2.5 border-b border-slate-200 dark:border-slate-800">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <Sparkles className="w-4 h-4 fill-white" />
        </div>
        <div>
          <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Revora
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 block -mt-1">
            Ratings Pro
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Menu
        </div>
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onItemClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 dark:text-slate-500">
        Revora v1.0.0 &bull; Verified Ratings
      </div>
    </aside>
  );
};
