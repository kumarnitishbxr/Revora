import React, { ButtonHTMLAttributes, useState } from 'react';
import { theme } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  type = 'button',
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Size specifications
  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: {
      padding: '6px 12px',
      fontSize: theme.typography.sizes.sm,
      borderRadius: theme.radii.md,
      gap: '6px',
    },
    md: {
      padding: '9px 16px',
      fontSize: theme.typography.sizes.base,
      borderRadius: theme.radii.lg,
      gap: '8px',
    },
    lg: {
      padding: '12px 22px',
      fontSize: theme.typography.sizes.md,
      borderRadius: theme.radii.lg,
      gap: '10px',
    },
  };

  // Variant specifications
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isHovered
            ? isActive
              ? theme.colors.primaryActive
              : theme.colors.primaryHover
            : theme.colors.primary,
          color: theme.colors.textInverse,
          border: '1px solid transparent',
          boxShadow: isHovered ? theme.shadows.md : theme.shadows.sm,
        };
      case 'secondary':
        return {
          backgroundColor: isHovered ? theme.colors.surfaceHover : theme.colors.surfaceSubtle,
          color: theme.colors.textPrimary,
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadows.sm,
        };
      case 'danger':
        return {
          backgroundColor: isHovered ? '#dc2626' : theme.colors.danger,
          color: theme.colors.textInverse,
          border: '1px solid transparent',
          boxShadow: theme.shadows.sm,
        };
      case 'outline':
        return {
          backgroundColor: isHovered ? theme.colors.primaryLight : 'transparent',
          color: theme.colors.primary,
          border: `1px solid ${theme.colors.primaryBorder}`,
        };
      case 'ghost':
        return {
          backgroundColor: isHovered ? theme.colors.surfaceHover : 'transparent',
          color: theme.colors.textSecondary,
          border: '1px solid transparent',
        };
    }
  };

  const isDisabled = disabled || isLoading;

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.weights.medium,
    lineHeight: theme.typography.lineHeights.tight,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.6 : 1,
    transition: theme.transitions.fast,
    outline: 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    ...sizeStyles[size],
    ...getVariantStyles(),
    ...style,
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      style={baseStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            display: 'inline-block',
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'revora-spin 0.6s linear infinite',
            marginRight: '6px',
          }}
        />
      ) : (
        leftIcon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;
