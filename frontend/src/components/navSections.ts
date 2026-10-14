import type { Role } from '../types/index.js';

interface SidebarLink {
  label: string;
  path: string;
  roles: Role[];
}

interface SidebarSection {
  heading: string;
  links: SidebarLink[];
}

export const navSections: SidebarSection[] = [
  {
    heading: 'Views',
    links: [
      { label: 'Overview', path: '/dashboard', roles: ['STUDENT', 'INSTRUCTOR', 'ADMIN'] },
      { label: 'My Courses', path: '/dashboard/my-courses', roles: ['STUDENT'] },
      { label: 'Explore', path: '/dashboard/explore', roles: ['STUDENT'] },
      { label: 'Certificates', path: '/dashboard/certificates', roles: ['STUDENT'] },
    ],
  },
  {
    heading: 'Teaching',
    links: [
      { label: 'My Courses', path: '/dashboard/courses', roles: ['INSTRUCTOR'] },
      { label: 'New Course', path: '/dashboard/courses/new', roles: ['INSTRUCTOR'] },
      { label: 'Analytics', path: '/dashboard/analytics', roles: ['INSTRUCTOR'] },
    ],
  },
  {
    heading: 'Admin',
    links: [
      { label: 'Users', path: '/dashboard/admin/users', roles: ['ADMIN'] },
      { label: 'Review Courses', path: '/dashboard/admin/courses', roles: ['ADMIN'] },
    ],
  },
  {
    heading: 'Account',
    links: [{ label: 'Settings', path: '/dashboard/settings', roles: ['STUDENT', 'INSTRUCTOR', 'ADMIN'] }],
  },
];
