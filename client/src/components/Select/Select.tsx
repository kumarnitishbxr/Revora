import React, { SelectHTMLAttributes, useState, forwardRef } from 'react';
import { theme } from '../../theme';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  hasError?: boolean;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, hasError, placeholder, disabled, style, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const containerStyle: React.CSSProperties = {
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
    };

    const selectStyle: React.CSSProperties = {
      width: '100%',
      padding: '10px 36px 10px 14px',
      fontSize: theme.typography.sizes.base,
      fontFamily: theme.typography.fontFamily,
      color: theme.colors.textPrimary,
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none',
      appearance: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...style,
    };

    return (
      <div style={containerStyle}>
        <select
          ref={ref}
          disabled={disabled}
          style={selectStyle}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom Chevron Indicator */}
        <span
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: theme.colors.textMuted,
            fontSize: '10px',
          }}
        >
          ▼
        </span>
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
