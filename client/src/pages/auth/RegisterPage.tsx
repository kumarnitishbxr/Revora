import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, AlertCircle, CheckCircle2, UserPlus } from 'lucide-react';
import { useAuth, useToast } from '../../hooks';
import { Button, Input, PasswordInput } from '../../components/ui';
import { getErrorMessage } from '../../utils/error';

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(20, 'Name must be at least 20 characters')
      .max(60, 'Name must not exceed 60 characters'),
    email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
    address: z
      .string()
      .trim()
      .min(1, 'Address is required')
      .max(400, 'Address must not exceed 400 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(16, 'Password must not exceed 16 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[^a-zA-Z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      address: '',
      password: '',
      confirmPassword: '',
    },
  });

  const watchedPassword = watch('password') || '';
  const watchedName = watch('name') || '';

  const passwordChecks = [
    { label: '8 to 16 characters', valid: watchedPassword.length >= 8 && watchedPassword.length <= 16 },
    { label: 'At least one uppercase letter (A-Z)', valid: /[A-Z]/.test(watchedPassword) },
    { label: 'At least one special character (!@#$...)', valid: /[^a-zA-Z0-9]/.test(watchedPassword) },
  ];

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerAuth({
        name: data.name,
        email: data.email,
        password: data.password,
        address: data.address,
      });

      success('Account created successfully! Welcome to Revora.', 'Registration Complete');
      navigate('/user/dashboard', { replace: true });
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setServerError(message);
      toastError(message, 'Registration Failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create an account
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
          Join Revora as a verified user to rate and discover local businesses
        </p>
      </div>

      {serverError && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            label="Full Name"
            placeholder="Johnathan Alexander Doe"
            helperText={`${watchedName.length}/60 characters (min 20)`}
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        <Input
          label="Email address"
          type="email"
          placeholder="john.doe@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="w-full">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Street Address <span className="text-rose-500 ml-1">*</span>
          </label>
          <textarea
            rows={2}
            placeholder="123 Blossom Street, Springfield, IL 62701"
            className={`w-full rounded-lg border bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
              errors.address
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
            }`}
            {...register('address')}
          />
          {errors.address && (
            <p className="mt-1 text-xs text-rose-500 font-medium">{errors.address.message}</p>
          )}
        </div>

        <PasswordInput
          label="Password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        {/* Real-time Password Rules Checklist */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Password requirements:
          </div>
          {passwordChecks.map((check, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 text-[11px] transition-colors ${
                check.valid
                  ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 shrink-0 ${
                  check.valid ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'
                }`}
              />
              <span>{check.label}</span>
            </div>
          ))}
        </div>

        <PasswordInput
          label="Confirm Password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          isLoading={isSubmitting}
          leftIcon={<UserPlus className="w-4 h-4" />}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Create Account
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};
