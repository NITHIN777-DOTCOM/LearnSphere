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
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-lg border border-border bg-sidebar p-6 md:p-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-2xl font-bold text-foreground">
                {getGreeting()}, {user?.firstName || 'User'}!
              </span>
              <span className="animate-bounce">👋</span>
            </div>
            <p className="text-sm text-muted-text max-w-xl">
              Welcome back to your LearnSphere dashboard. Here is an overview of what is happening.
            </p>
          </div>
        </div>
      </div>

      {/* Render Role-Specific Dashboard */}
      {user?.role === 'STUDENT' && <StudentDashboard />}
      {user?.role === 'INSTRUCTOR' && <InstructorDashboard />}
      {user?.role === 'ADMIN' && <AdminDashboard />}
    </div>
  );
};
