import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';
import { validators } from '../../utils/validators';
import { getErrorMessage } from '../../utils/formatters';
import Field from '../../components/Field/Field';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const { values, errors, isSubmitting, handleChange, handleBlur, handleSubmit } = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: (vals) => {
      const errs: Record<string, string> = {};
      const emailRes = validators.email(vals.email);
      if (!emailRes.isValid && emailRes.error) errs.email = emailRes.error;

      if (!vals.password) {
        errs.password = 'Password is required';
      }
      return errs;
    },
    onSubmit: async (formValues) => {
      setServerError(null);
      try {
        const authedUser = await login(formValues);

        // Check if there was a redirected location state
        const from = (location.state as any)?.from?.pathname;
        if (from && from !== '/login') {
          navigate(from, { replace: true });
          return;
        }

        // Default role redirection
        switch (authedUser.role) {
          case 'SYSTEM_ADMIN':
            navigate('/admin/dashboard', { replace: true });
            break;
          case 'STORE_OWNER':
            navigate('/owner/dashboard', { replace: true });
            break;
          case 'NORMAL_USER':
          default:
            navigate('/stores', { replace: true });
            break;
        }
      } catch (err: unknown) {
        setServerError(getErrorMessage(err, 'Invalid email or password'));
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
        padding: '24px',
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
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
            Sign in to Revora
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: theme.typography.sizes.sm,
              color: theme.colors.textSecondary,
            }}
          >
            Welcome back! Please enter your details.
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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

          <Field label="Password" htmlFor="password" error={errors.password} required>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={values.password}
              hasError={!!errors.password}
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
            style={{ width: '100%', marginTop: '6px' }}
          >
            Sign In
          </Button>
        </form>

        {/* Signup Link */}
        <div
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.textSecondary,
          }}
        >
          Don't have an account?{' '}
          <Link
            to="/signup"
            style={{
              color: theme.colors.primary,
              fontWeight: theme.typography.weights.semibold,
              textDecoration: 'none',
            }}
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
