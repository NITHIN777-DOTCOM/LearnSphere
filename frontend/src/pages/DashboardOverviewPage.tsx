import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { StudentDashboard } from '../components/dashboard/StudentDashboard.js';
import { InstructorDashboard } from '../components/dashboard/InstructorDashboard.js';
import { AdminDashboard } from '../components/dashboard/AdminDashboard.js';

export const DashboardOverviewPage: React.FC = () => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">
          {getGreeting()}, {user?.firstName || 'there'}
        </h1>
        <p className="mt-1 text-sm text-muted-text">Here's where things stand.</p>
      </div>

      {/* Render Role-Specific Dashboard */}
      {user?.role === 'STUDENT' && <StudentDashboard />}
      {user?.role === 'INSTRUCTOR' && <InstructorDashboard />}
      {user?.role === 'ADMIN' && <AdminDashboard />}
    </div>
  );
};
