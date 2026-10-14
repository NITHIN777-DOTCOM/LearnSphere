import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo.js';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../context/ThemeContext.js';
import { useToast } from './Toast.js';
import { navSections } from './navSections.js';

const plainButton =
  'px-4 py-2 text-sm rounded-md border border-border text-foreground hover:bg-muted-bg transition-colors cursor-pointer';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
    setMobileMenuOpen(false);
  };

  // Label shows the mode you'd switch to, like LinkVault's "dark mode" button
  const themeLabel = theme === 'dark' ? 'light mode' : 'dark mode';
  const role = user?.role || 'STUDENT';

  return (
    <nav className="sticky top-0 z-40 w-full bg-sidebar border-b border-border">
      {/* thin accent strip along the very top */}
      <div className="h-1 bg-[var(--strip)]" />
      <div className="px-4 sm:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={isAuthenticated ? '/dashboard' : '/'}>
            <Logo />
          </Link>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/dashboard/settings"
                  className="text-sm text-muted-text hover:text-foreground transition-colors mr-2"
                >
                  Welcome {user.firstName}
                </Link>
                <button onClick={toggleTheme} className={plainButton}>
                  {themeLabel}
                </button>
                <button onClick={handleLogout} className={plainButton}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={toggleTheme} className={plainButton}>
                  {themeLabel}
                </button>
                <Link to="/login" className={plainButton}>
                  Sign in
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-muted-text hover:text-foreground p-2 rounded-md hover:bg-muted-bg transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-sidebar px-4 pt-2 pb-4 space-y-1">
          {isAuthenticated &&
            navSections
              .map((section) => section.links.filter((link) => link.roles.includes(role)))
              .flat()
              .map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-sm ${
                      isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted-bg'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
          <div className="flex gap-2 pt-3">
            <button onClick={toggleTheme} className={plainButton}>
              {themeLabel}
            </button>
            {isAuthenticated ? (
              <button onClick={handleLogout} className={plainButton}>
                Logout
              </button>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className={plainButton}>
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
