import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { navSections } from './navSections.js';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';

  return (
    <aside className="h-[calc(100vh-4.25rem)] w-60 bg-sidebar border-r border-border overflow-y-auto px-4 py-8 space-y-10">
      {navSections.map((section) => {
        const links = section.links.filter((link) => link.roles.includes(role));
        if (links.length === 0) return null;

        return (
          <div key={section.heading}>
            <p className="text-center text-xs font-medium uppercase tracking-[0.15em] text-muted-text mb-4">
              {section.heading}
            </p>
            <div className="space-y-1">
              {links.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/dashboard' || link.path === '/dashboard/courses'}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-md text-[15px] transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-foreground hover:bg-muted-bg'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        );
      })}
    </aside>
  );
};
