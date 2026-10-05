
import React from 'react';
import { Link } from 'react-router-dom';
import { theme } from '../theme';
import Button from '../components/Button/Button';

export const NotFound: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '32px 16px',
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <div
        style={{
          fontSize: '72px',
          fontWeight: theme.typography.weights.black,
          color: theme.colors.primary,
          lineHeight: 1,
          marginBottom: '16px',
        }}
      >
        404
      </div>

      <h2
        style={{
          fontSize: theme.typography.sizes['2xl'],
          fontWeight: theme.typography.weights.bold,
          color: theme.colors.textPrimary,
          margin: '0 0 8px 0',
        }}
      >
        Page Not Found
      </h2>

      <p
        style={{
          fontSize: theme.typography.sizes.base,
          color: theme.colors.textSecondary,
          maxWidth: '420px',
          margin: '0 0 24px 0',
        }}
      >
        The page you are looking for does not exist, has been removed, or you may not have authorization to view it.
      </p>

      <Link to="/" style={{ textDecoration: 'none' }}>
        <Button variant="primary" size="md">
          Back to Platform
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
