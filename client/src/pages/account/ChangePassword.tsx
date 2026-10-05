import React, { useState } from 'react';
import { theme } from '../../theme';
import { authApi } from '../../api/authApi';
import { useForm } from '../../hooks/useForm';
import { validators } from '../../utils/validators';
import { getErrorMessage } from '../../utils/formatters';

import Field from '../../components/Field/Field';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';

export const ChangePassword: React.FC = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { values, errors, isSubmitting, handleChange, handleBlur, handleSubmit, reset } = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: (vals) => {
      const errs: Record<string, string> = {};

      if (!vals.currentPassword) {
        errs.currentPassword = 'Your current password is required';
      }

      const newPwdRes = validators.password(vals.newPassword);
      if (!newPwdRes.isValid && newPwdRes.error) {
        errs.newPassword = newPwdRes.error;
      }

      const confirmRes = validators.confirmPassword(vals.newPassword, vals.confirmPassword);
      if (!confirmRes.isValid && confirmRes.error) {
        errs.confirmPassword = confirmRes.error;
      }

      return errs;
    },
    onSubmit: async (formValues) => {
      setServerError(null);
      setSuccessMessage(null);
      try {
        const msg = await authApi.changePassword({
          currentPassword: formValues.currentPassword,
          newPassword: formValues.newPassword,
        });

        setSuccessMessage(msg || 'Password updated successfully!');
        reset();
      } catch (err: unknown) {
        setServerError(getErrorMessage(err, 'Failed to update password. Please check your current password.'));
      }
    },
  });

  return (
    <div style={{ maxWidth: '580px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ margin: 0, fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.black }}>
          Account Security
        </h2>
        <p style={{ margin: '4px 0 0 0', fontSize: theme.typography.sizes.sm, color: theme.colors.textSecondary }}>
          Update your account password to maintain system security.
        </p>
      </div>

      <div
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.xl,
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadows.card,
          padding: '32px',
        }}
      >
        {successMessage && (
          <div
            role="status"
            style={{
              padding: '12px 16px',
              borderRadius: theme.radii.md,
              backgroundColor: theme.colors.successLight,
              border: `1px solid ${theme.colors.successBorder}`,
              color: theme.colors.successText,
              fontSize: theme.typography.sizes.sm,
              fontWeight: theme.typography.weights.medium,
              marginBottom: '20px',
            }}
          >
            ✓ {successMessage}
          </div>
        )}

        {serverError && (
          <div
            role="alert"
            style={{
              padding: '12px 16px',
              borderRadius: theme.radii.md,
              backgroundColor: theme.colors.dangerLight,
              border: `1px solid ${theme.colors.dangerBorder}`,
              color: theme.colors.dangerText,
              fontSize: theme.typography.sizes.sm,
              marginBottom: '20px',
            }}
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Field
            label="Current Password"
            htmlFor="currentPassword"
            error={errors.currentPassword}
            required
          >
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={values.currentPassword}
              hasError={!!errors.currentPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
            />
          </Field>

          <Field
            label="New Password"
            htmlFor="newPassword"
            error={errors.newPassword}
            hint="8-16 characters, 1 uppercase letter, 1 special character"
            required
          >
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={values.newPassword}
              hasError={!!errors.newPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
            />
          </Field>

          <Field
            label="Confirm New Password"
            htmlFor="confirmPassword"
            error={errors.confirmPassword}
            required
          >
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={values.confirmPassword}
              hasError={!!errors.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
            />
          </Field>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
