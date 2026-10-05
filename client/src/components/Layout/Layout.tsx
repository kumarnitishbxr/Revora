import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { theme } from '../../theme';
import Sidebar from './Sidebar';
import Header from './Header';

export interface LayoutProps {
  title?: string;
  subtitle?: string;
}

export const Layout: React.FC<LayoutProps> = ({ title, subtitle }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: theme.colors.bg,
        fontFamily: theme.typography.fontFamily,
      }}
    >
      {/* Mobile Drawer Backdrop */}
      {isMobile && isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Sidebar (Permanent on Desktop, Drawer on Mobile) */}
      <Sidebar
        isMobile={isMobile}
        isOpen={!isMobile || isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <Header
          title={title}
          subtitle={subtitle}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        <main
          style={{
            flex: 1,
            padding: '24px',
            maxWidth: `${theme.layout.maxContentWidth}px`,
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
