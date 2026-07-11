import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Users,
  Award,
  Settings,
  GraduationCap,
  PlusCircle,
  BarChart3,
  BookMarked,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import type { Role } from '../types/index.js';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

interface SidebarLink {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: Role[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';

  const links: SidebarLink[] = [
    // Shared links
    {
      label: 'Overview',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />,
      roles: ['STUDENT', 'INSTRUCTOR', 'ADMIN'],
    },
    // Student links
    {
      label: 'My Courses',
      path: '/dashboard/my-courses',
      icon: <BookMarked className="w-5 h-5 flex-shrink-0" />,
      roles: ['STUDENT'],
    },
    {
      label: 'Explore Courses',
      path: '/dashboard/explore',
      icon: <Compass className="w-5 h-5 flex-shrink-0" />,
      roles: ['STUDENT'],
    },
    {
      label: 'Certificates',
      path: '/dashboard/certificates',
      icon: <Award className="w-5 h-5 flex-shrink-0" />,
      roles: ['STUDENT'],
    },
    // Instructor links
    {
      label: 'Create Course',
      path: '/dashboard/courses/new',
      icon: <PlusCircle className="w-5 h-5 flex-shrink-0" />,
      roles: ['INSTRUCTOR'],
    },
    {
      label: 'Course Manager',
      path: '/dashboard/courses',
      icon: <GraduationCap className="w-5 h-5 flex-shrink-0" />,
      roles: ['INSTRUCTOR'],
    },
    {
      label: 'Analytics',
      path: '/dashboard/analytics',
      icon: <BarChart3 className="w-5 h-5 flex-shrink-0" />,
      roles: ['INSTRUCTOR'],
    },
    // Admin links
    {
      label: 'Manage Users',
      path: '/dashboard/admin/users',
      icon: <Users className="w-5 h-5 flex-shrink-0" />,
      roles: ['ADMIN'],
    },
    {
      label: 'Verify Content',
      path: '/dashboard/admin/courses',
      icon: <ShieldCheck className="w-5 h-5 flex-shrink-0" />,
      roles: ['ADMIN'],
    },
    // Shared Settings
    {
      label: 'Settings',
      path: '/dashboard/settings',
      icon: <Settings className="w-5 h-5 flex-shrink-0" />,
      roles: ['STUDENT', 'INSTRUCTOR', 'ADMIN'],
    },
  ];

  const filteredLinks = links.filter((link) => link.roles.includes(role));

  return (
    <aside
      className={`h-[calc(100vh-4rem)] border-r border-border bg-sidebar transition-all duration-300 relative flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Navigation Links */}
      <div className="flex-1 py-6 overflow-y-auto px-4 space-y-1.5 scrollbar-thin">
        {filteredLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-muted-text hover:text-foreground hover:bg-muted-bg/50'
              }`
            }
          >
            {link.icon}
            {!isCollapsed && <span className="truncate">{link.label}</span>}
          </NavLink>
        ))}
      </div>

      {/* Collapse Toggle button */}
      <div className="p-4 border-t border-border/40 flex justify-end">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md border border-border bg-background text-muted-text hover:text-foreground hover:border-primary/40 cursor-pointer transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
