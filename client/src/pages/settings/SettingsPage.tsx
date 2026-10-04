import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Save, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth, useToast } from '../../hooks';
import { userService } from '../../services/user.service';
import { authService } from '../../services/auth.service';
import { Button, Input, PasswordInput, Card, CardHeader, CardContent } from '../../components/ui';
import { formatRoleName, getRoleBadgeClass } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/error';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(16, 'New password must not exceed 16 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const profileSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters').max(60),
  address: z.string().trim().min(1, 'Address is required').max(400),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const SettingsPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      address: user?.address || '',
    },
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    watch: watchPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const watchedNewPass = watchPassword('newPassword') || '';

  const passwordChecks = [
    { label: '8 to 16 characters', valid: watchedNewPass.length >= 8 && watchedNewPass.length <= 16 },
    { label: 'At least one uppercase letter (A-Z)', valid: /[A-Z]/.test(watchedNewPass) },
    { label: 'At least one special character (!@#$...)', valid: /[^a-zA-Z0-9]/.test(watchedNewPass) },
  ];

  const onUpdateProfile = async (data: ProfileFormValues) => {
    try {
      const updated = await userService.updateProfile(data);
      setUser(updated);
      success('Profile details updated successfully!', 'Profile Updated');
    } catch (err: unknown) {
      toastError(getErrorMessage(err), 'Profile Update Failed');
    }
  };

  const onChangePassword = async (data: PasswordFormValues) => {
    setPasswordSuccess(null);
    try {
      const message = await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      success(message, 'Password Changed');
      setPasswordSuccess(message);
      resetPassword();
    } catch (err: unknown) {
      toastError(getErrorMessage(err), 'Password Change Failed');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details, physical address, and account password
        </p>
      </div>

      {/* Account Info Card */}
      <Card>
        <CardHeader
          title="Account Overview"
          description="Your verified identity and authorization role"
        />
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-medium">
                Registered Email
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                {user?.email}
              </span>
            </div>

            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-medium">
                System Role
              </span>
              <span
                className={`inline-block mt-1 px-2.5 py-0.5 rounded-full font-medium ${getRoleBadgeClass(
                  user?.role || ''
                )}`}
              >
                {formatRoleName(user?.role || '')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details Form */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Personal Information</span>
            </div>
          }
          description="Update your display name and street address"
        />
        <CardContent>
          <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Your Name"
              error={profileErrors.name?.message}
              {...registerProfile('name')}
            />

            <div className="w-full">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Address
              </label>
              <textarea
                rows={3}
                placeholder="123 Street Name, City, State"
                className={`w-full rounded-lg border bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  profileErrors.address
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
                {...registerProfile('address')}
              />
              {profileErrors.address && (
                <p className="mt-1 text-xs text-rose-500 font-medium">
                  {profileErrors.address.message}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                size="sm"
                isLoading={isSubmittingProfile}
                leftIcon={<Save className="w-3.5 h-3.5" />}
              >
                Save Details
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Change Form */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Change Password</span>
            </div>
          }
          description="Keep your account secure with regular password updates"
        />
        <CardContent>
          {passwordSuccess && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4">
            <PasswordInput
              label="Current Password"
              placeholder="••••••••"
              error={passwordErrors.currentPassword?.message}
              {...registerPassword('currentPassword')}
            />

            <PasswordInput
              label="New Password"
              placeholder="••••••••"
              error={passwordErrors.newPassword?.message}
              {...registerPassword('newPassword')}
            />

            {/* Password Validation rules */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                New password must meet:
              </div>
              {passwordChecks.map((check, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 text-[11px] ${
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
              label="Confirm New Password"
              placeholder="••••••••"
              error={passwordErrors.confirmPassword?.message}
              {...registerPassword('confirmPassword')}
            />

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                size="sm"
                variant="primary"
                isLoading={isSubmittingPassword}
                leftIcon={<Shield className="w-3.5 h-3.5" />}
              >
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
