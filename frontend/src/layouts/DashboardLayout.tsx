import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Navbar } from '../components/Navbar.js';
import { Sidebar } from '../components/Sidebar.js';
import { Spinner } from '../components/Spinner.js';

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner fullPage size="lg" />;
  }

  // Guard routing: Force login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Dashboard Panel */}
      <div className="flex flex-row flex-1 h-[calc(100vh-4.25rem)] overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:block flex-shrink-0">
          <Sidebar />
        </div>

        {/* Dynamic Nested Content */}
        <main className="flex-1 overflow-y-auto bg-background px-4 py-6 md:px-12 md:py-10 scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
