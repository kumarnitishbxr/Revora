import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, AlertCircle, Shield, Store, User } from 'lucide-react';
import { useAuth, useToast } from '../../hooks';
import { Button, Input, PasswordInput } from '../../components/ui';
import { getErrorMessage } from '../../utils/error';

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      const user = await login(data);
      success(`Welcome back, ${user.name.split(' ')[0]}!`, 'Login successful');

      const redirectPath = (location.state as any)?.from?.pathname;
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
        return;
      }

      switch (user.role) {
        case 'SYSTEM_ADMIN':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'STORE_OWNER':
          navigate('/owner/dashboard', { replace: true });
          break;
        case 'NORMAL_USER':
        default:
          navigate('/user/dashboard', { replace: true });
          break;
      }
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setServerError(message);
      toastError(message, 'Authentication Failed');
    }
  };

  const fillCredentials = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'Password123!', { shouldValidate: true });
    setServerError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
          Enter your credentials to access your Revora dashboard
        </p>
      </div>

      {serverError && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="you@domain.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordInput
          label="Password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      {/* Demo Credentials Quick-Fill helper */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
          Quick Demo Accounts
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillCredentials('admin@revora.com')}
            className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white dark:bg-slate-900 text-[11px] transition-all cursor-pointer group"
          >
            <Shield className="w-4 h-4 text-purple-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">Admin</span>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials('owner@revora.com')}
            className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white dark:bg-slate-900 text-[11px] transition-all cursor-pointer group"
          >
            <Store className="w-4 h-4 text-amber-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">Owner</span>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials('user@revora.com')}
            className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white dark:bg-slate-900 text-[11px] transition-all cursor-pointer group"
          >
            <User className="w-4 h-4 text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">User</span>
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Create user account
        </Link>
      </div>
    </div>
  );
};
