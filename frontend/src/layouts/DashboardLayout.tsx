import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Navbar } from '../components/Navbar.js';
import { Sidebar } from '../components/Sidebar.js';
import { Spinner } from '../components/Spinner.js';

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
      <div className="flex flex-row flex-1 h-[calc(100vh-4rem)] overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:block flex-shrink-0">
          <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
        </div>

        {/* Dynamic Nested Content */}
        <main className="flex-1 overflow-y-auto bg-background p-6 md:p-8 scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
