import React, { InputHTMLAttributes, useState, forwardRef } from 'react';
import { theme } from '../../theme';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  prefixElement?: React.ReactNode;
  suffixElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type = 'text', hasError, prefixElement, suffixElement, disabled, style, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPasswordType = type === 'password';
    const computedType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      width: '100%',
      backgroundColor: disabled ? theme.colors.surfaceSubtle : theme.colors.surface,
      border: `1px solid ${
        hasError
          ? theme.colors.danger
          : isFocused
          ? theme.colors.borderFocus
          : theme.colors.border
      }`,
      borderRadius: theme.radii.md,
      boxShadow: hasError
        ? '0 0 0 3px rgba(239, 68, 68, 0.15)'
        : isFocused
        ? theme.shadows.focus
        : theme.shadows.sm,
      transition: theme.transitions.fast,
      overflow: 'hidden',
    };

    const inputStyle: React.CSSProperties = {
      flex: 1,
      width: '100%',
      padding: '10px 14px',
      fontSize: theme.typography.sizes.base,
      fontFamily: theme.typography.fontFamily,
      color: theme.colors.textPrimary,
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none',
      cursor: disabled ? 'not-allowed' : 'text',
      ...style,
    };

    return (
      <div style={containerStyle}>
        {prefixElement && (
          <span
            style={{
              paddingLeft: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              color: theme.colors.textMuted,
            }}
          >
            {prefixElement}
          </span>
        )}

        <input
          ref={ref}
          type={computedType}
          disabled={disabled}
          style={inputStyle}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />

        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            style={{
              padding: '0 12px',
              background: 'none',
              border: 'none',
              color: theme.colors.textSecondary,
              cursor: 'pointer',
              fontSize: theme.typography.sizes.sm,
              fontWeight: theme.typography.weights.medium,
              outline: 'none',
            }}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}

        {suffixElement && !isPasswordType && (
          <span
            style={{
              paddingRight: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              color: theme.colors.textMuted,
            }}
          >
            {suffixElement}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
