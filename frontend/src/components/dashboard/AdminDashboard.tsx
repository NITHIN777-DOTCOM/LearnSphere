import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Shield, Award, Calendar, TrendingUp } from 'lucide-react';
import { api } from '../../services/api.js';
import { Card, CardContent } from '../Card.js';
import { Badge } from '../Badge.js';
import { Spinner } from '../Spinner.js';

interface AdminStats {
  users: { total: number; students: number; instructors: number; admins: number };
  courses: { total: number; published: number; draft: number };
  enrollments: { total: number };
}

interface UserLog {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  profile: {
    firstName: string;
    lastName: string;
  } | null;
}

interface CourseLog {
  id: string;
  title: string;
  category: string;
  status: string;
  createdAt: string;
  instructor: {
    profile: {
      firstName: string;
      lastName: string;
    } | null;
  } | null;
}

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserLog[]>([]);
  const [courses, setCourses] = useState<CourseLog[]>([]);

  // SVG Chart Mock Data
  const platformActivity = [40, 60, 45, 90, 110, 85, 120]; // Daily active queries
  const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await api.get('/dashboard/admin');
        setStats(response.data.stats);
        setUsers(response.data.recentUsers);
        setCourses(response.data.recentCourses);
      } catch (error) {
        console.error('Failed to load admin dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-text uppercase tracking-wider font-semibold">Total Platform Users</p>
              <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats?.users.total || 0}</p>
              <div className="flex gap-2.5 text-[10px] text-muted-text mt-1 font-semibold">
                <span>Students: {stats?.users.students}</span>
                <span>Teachers: {stats?.users.instructors}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="bg-success/10 p-3 rounded-lg border border-success/20">
              <BookOpen className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-text uppercase tracking-wider font-semibold">Hosted Courses</p>
              <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats?.courses.total || 0}</p>
              <div className="flex gap-2.5 text-[10px] text-muted-text mt-1 font-semibold">
                <span>Published: {stats?.courses.published}</span>
                <span>Drafts: {stats?.courses.draft}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="bg-warning/10 p-3 rounded-lg border border-warning/20">
              <Award className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-text uppercase tracking-wider font-semibold">Total Enrollments</p>
              <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats?.enrollments.total || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Activity Bar Chart */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-foreground text-sm">System Database Queries</h4>
                <p className="text-[10px] text-muted-text mt-0.5">API requests handled per day</p>
              </div>
              <span className="text-xs font-semibold text-primary flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +15.2% traffic
              </span>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="h-44 w-full pt-4">
              <svg className="w-full h-full" viewBox="0 0 500 140">
                {/* Grid Lines */}
                <line x1="30" y1="20" x2="480" y2="20" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" className="opacity-40" />
                <line x1="30" y1="70" x2="480" y2="70" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" className="opacity-40" />
                <line x1="30" y1="120" x2="480" y2="120" stroke="var(--color-border)" strokeWidth="1" />

                {/* Bars */}
                {platformActivity.map((val, idx) => {
                  const barWidth = 24;
                  const spacing = 62;
                  const x = 50 + idx * spacing;
                  const height = (val / 120) * 100;
                  const y = 120 - height;
                  return (
                    <g key={idx}>
                      <rect x={x} y={y} width={barWidth} height={height} rx="3" fill="var(--color-success)" className="opacity-80 hover:opacity-100 transition-opacity" />
                      <text x={x + barWidth / 2} y="134" textAnchor="middle" className="fill-muted-text text-[9px] font-semibold">
                        {weekdays[idx]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* User distribution breakdown */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h4 className="font-bold text-foreground text-sm">Role Distributions</h4>
              <p className="text-[10px] text-muted-text mt-0.5">Platform user profile segments</p>
            </div>

            {/* Custom SVG Pie Chart / Circle segments */}
            <div className="h-32 flex items-center justify-center relative">
              <svg width="100" height="100" viewBox="0 0 36 36" className="transform -rotate-90">
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="var(--color-border)" strokeWidth="4" />
                {/* Student segment: 70% */}
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="var(--color-primary)" strokeWidth="4" strokeDasharray="70 30" strokeDashoffset="0" />
                {/* Instructor segment: 25% */}
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="var(--color-success)" strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="-70" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xs font-extrabold text-foreground">{stats?.users.total}</span>
                <span className="text-[8px] text-muted-text font-semibold uppercase">Users</span>
              </div>
            </div>

            <div className="flex gap-4 justify-center text-[10px] text-muted-text font-bold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Students</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-success" /> Teachers</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Registrants */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Recent Signups
          </h3>
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-sidebar/40 text-xs uppercase tracking-wider text-muted-text font-semibold">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted-bg/35 transition-colors">
                      <td className="p-4 font-semibold text-foreground">
                        {u.profile?.firstName || 'User'} {u.profile?.lastName || ''}
                      </td>
                      <td className="p-4 text-muted-text font-medium">{u.email}</td>
                      <td className="p-4">
                        <Badge variant={u.role === 'ADMIN' ? 'danger' : u.role === 'INSTRUCTOR' ? 'primary' : 'default'}>
                          {u.role}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Recent Courses */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-success" /> Recent Courses Added
          </h3>
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-sidebar/40 text-xs uppercase tracking-wider text-muted-text font-semibold">
                    <th className="p-4">Course</th>
                    <th className="p-4">Instructor</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-muted-bg/35 transition-colors">
                      <td className="p-4">
                        <p className="font-semibold text-foreground line-clamp-1">{c.title}</p>
                        <span className="text-[10px] text-muted-text font-medium">{c.category}</span>
                      </td>
                      <td className="p-4 text-muted-text font-medium">
                        {c.instructor?.profile?.firstName || 'Instructor'} {c.instructor?.profile?.lastName || ''}
                      </td>
                      <td className="p-4">
                        <Badge variant={c.status === 'PUBLISHED' ? 'success' : 'default'}>
                          {c.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
