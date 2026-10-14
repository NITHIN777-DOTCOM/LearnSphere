import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { ToastProvider } from './components/Toast.js';
import { DashboardLayout } from './layouts/DashboardLayout.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { Card, CardHeader, CardTitle, CardContent } from './components/Card.js';

// Lazy loaded page components (converting named exports to default loads)
const HomePage = lazy(() => import('./pages/HomePage.js').then(m => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('./pages/LoginPage.js').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage.js').then(m => ({ default: m.RegisterPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.js').then(m => ({ default: m.NotFoundPage })));
const DashboardOverviewPage = lazy(() => import('./pages/DashboardOverviewPage.js').then(m => ({ default: m.DashboardOverviewPage })));
const ExploreCoursesPage = lazy(() => import('./pages/ExploreCoursesPage.js').then(m => ({ default: m.ExploreCoursesPage })));
const CourseDetailsPage = lazy(() => import('./pages/CourseDetailsPage.js').then(m => ({ default: m.CourseDetailsPage })));
const StudentLessonViewerPage = lazy(() => import('./pages/StudentLessonViewerPage.js').then(m => ({ default: m.StudentLessonViewerPage })));
const InstructorCourseEditorPage = lazy(() => import('./pages/InstructorCourseEditorPage.js').then(m => ({ default: m.InstructorCourseEditorPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage.js').then(m => ({ default: m.ProfilePage })));
const InstructorDashboard = lazy(() => import('./components/dashboard/InstructorDashboard.js').then(m => ({ default: m.InstructorDashboard })));
const InstructorAnalyticsPage = lazy(() => import('./pages/InstructorAnalyticsPage.js').then(m => ({ default: m.InstructorAnalyticsPage })));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage.js').then(m => ({ default: m.AdminUsersPage })));
const AdminCoursesPage = lazy(() => import('./pages/AdminCoursesPage.js').then(m => ({ default: m.AdminCoursesPage })));

// Placeholders for analytics/certificates
const DashboardPlaceholder: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-text">{desc} is initialized and will load dynamic metrics here.</p>
    </CardContent>
  </Card>
);

const AppLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Suspense fallback={<AppLoader />}>
              <Routes>
                {/* Public Pages */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Dashboard Pages */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<DashboardOverviewPage />} />
                  
                  {/* Student Views */}
                  <Route
                    path="my-courses"
                    element={<ExploreCoursesPage />}
                  />
                  <Route
                    path="explore"
                    element={<ExploreCoursesPage />}
                  />
                  <Route
                    path="courses/:id"
                    element={<CourseDetailsPage />}
                  />
                  <Route
                    path="courses/:id/learn"
                    element={<StudentLessonViewerPage />}
                  />
                  <Route
                    path="certificates"
                    element={<DashboardPlaceholder title="Certificates" desc="Student course completion awards" />}
                  />

                  {/* Instructor Views */}
                  <Route
                    path="courses"
                    element={<InstructorDashboard />}
                  />
                  <Route
                    path="courses/new"
                    element={<InstructorCourseEditorPage />}
                  />
                  <Route
                    path="courses/:id/edit"
                    element={<InstructorCourseEditorPage />}
                  />
                  <Route
                    path="analytics"
                    element={<InstructorAnalyticsPage />}
                  />

                  {/* Admin Views */}
                  <Route
                    path="admin/users"
                    element={<AdminUsersPage />}
                  />
                  <Route
                    path="admin/courses"
                    element={<AdminCoursesPage />}
                  />

                  {/* Shared Settings */}
                  <Route
                    path="settings"
                    element={<ProfilePage />}
                  />
                </Route>

                {/* 404 Route */}
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Suspense>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
