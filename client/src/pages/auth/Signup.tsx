import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';
import { validators } from '../../utils/validators';
import { getErrorMessage } from '../../utils/formatters';
import Field from '../../components/Field/Field';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';

export const Signup: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const { values, errors, isSubmitting, handleChange, handleBlur, handleSubmit } = useForm({
    initialValues: {
      name: '',
      email: '',
      address: '',
      password: '',
      confirmPassword: '',
    },
    validate: (vals) => {
      const errs: Record<string, string> = {};

      const nameRes = validators.name(vals.name);
      if (!nameRes.isValid && nameRes.error) errs.name = nameRes.error;

      const emailRes = validators.email(vals.email);
      if (!emailRes.isValid && emailRes.error) errs.email = emailRes.error;

      const addressRes = validators.address(vals.address);
      if (!addressRes.isValid && addressRes.error) errs.address = addressRes.error;

      const pwdRes = validators.password(vals.password);
      if (!pwdRes.isValid && pwdRes.error) errs.password = pwdRes.error;

      const confirmRes = validators.confirmPassword(vals.password, vals.confirmPassword);
      if (!confirmRes.isValid && confirmRes.error) errs.confirmPassword = confirmRes.error;

      return errs;
    },
    onSubmit: async (formValues) => {
      setServerError(null);
      try {
        await register({
          name: formValues.name.trim(),
          email: formValues.email.trim(),
          address: formValues.address.trim(),
          password: formValues.password,
        });

        // Newly registered users are NORMAL_USER and directed to /stores
        navigate('/stores', { replace: true });
      } catch (err: unknown) {
        setServerError(getErrorMessage(err, 'Registration failed. Please verify your details.'));
      }
    },
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.bg,
        padding: '32px 20px',
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.xl,
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadows.lg,
          padding: '36px',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: theme.radii.lg,
              backgroundColor: theme.colors.primary,
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: theme.typography.weights.black,
              fontSize: '22px',
              boxShadow: theme.shadows.md,
              marginBottom: '14px',
            }}
          >
            R
          </div>
          <h2
            style={{
              margin: '0 0 6px 0',
              fontSize: theme.typography.sizes['2xl'],
              fontWeight: theme.typography.weights.black,
              color: theme.colors.textPrimary,
              letterSpacing: '-0.02em',
            }}
          >
            Create your account
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: theme.typography.sizes.sm,
              color: theme.colors.textSecondary,
            }}
          >
            Join Revora to discover and review verified stores
          </p>
        </div>

        {/* Global Server Error Banner */}
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

        {/* Signup Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field
            label="Full Name"
            htmlFor="name"
            error={errors.name}
            hint="Minimum 20 characters, maximum 60"
            required
          >
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Alexander Jonathan Montgomery"
              value={values.name}
              hasError={!!errors.name}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
            />
          </Field>

          <Field label="Email Address" htmlFor="email" error={errors.email} required>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={values.email}
              hasError={!!errors.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
            />
          </Field>

          <Field
            label="Address"
            htmlFor="address"
            error={errors.address}
            hint="Maximum 400 characters"
            required
          >
            <Input
              id="address"
              name="address"
              type="text"
              autoComplete="street-address"
              placeholder="e.g. 100 Main Boulevard, Downtown Sector 4"
              value={values.address}
              hasError={!!errors.address}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
            />
          </Field>

          <Field
            label="Password"
            htmlFor="password"
            error={errors.password}
            hint="8-16 characters, 1 uppercase, 1 special character"
            required
          >
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={values.password}
              hasError={!!errors.password}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
            />
          </Field>

          <Field
            label="Confirm Password"
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

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: '8px' }}
          >
            Create Account
          </Button>
        </form>

        {/* Login Link */}
        <div
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.textSecondary,
          }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: theme.colors.primary,
              fontWeight: theme.typography.weights.semibold,
              textDecoration: 'none',
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
