import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Star, Users, CheckCircle } from 'lucide-react';
import { api } from '../services/api.js';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card.js';
import { Badge } from '../components/Badge.js';
import { Spinner } from '../components/Spinner.js';

interface CourseStat {
  id: string;
  title: string;
  category: string;
  enrollments: number;
  earnings: number;
  rating: number;
}

export const InstructorAnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [courseStats, setCourseStats] = useState<CourseStat[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);

  // SVG Chart Mock Data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/dashboard/instructor');
        const instructorCourses = response.data.courses || [];
        
        // Calculate mock earnings and metrics based on actual seeded database enrollments
        let calculatedEarnings = 0;
        let calculatedStudents = 0;
        
        const stats: CourseStat[] = instructorCourses.map((c: any) => {
          const enrollCount = c._count?.enrollments || 0;
          const courseEarnings = enrollCount * 99; // Assume $99 per enrollment
          calculatedEarnings += courseEarnings;
          calculatedStudents += enrollCount;

          return {
            id: c.id,
            title: c.title,
            category: c.category,
            enrollments: enrollCount,
            earnings: courseEarnings,
            rating: 4.8,
          };
        });

        setCourseStats(stats);
        setTotalEarnings(calculatedEarnings);
        setTotalStudents(calculatedStudents);
      } catch (error) {
        console.error('Failed to load instructor analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
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
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" /> Instructor Analytics
        </h2>
        <p className="text-xs text-muted-text mt-0.5">Track your earnings, student enrollments, and course engagement performance.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="bg-success/10 p-3 rounded-lg border border-success/20">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-text uppercase tracking-wider font-semibold">Total Revenue</p>
              <p className="text-2xl font-extrabold text-foreground mt-0.5">${totalEarnings.toLocaleString()}.00</p>
              <span className="text-[10px] text-success font-semibold flex items-center gap-0.5 mt-0.5">
                <TrendingUp className="w-3 h-3" /> +15.4%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-text uppercase tracking-wider font-semibold">Total Enrollments</p>
              <p className="text-2xl font-extrabold text-foreground mt-0.5">{totalStudents}</p>
              <span className="text-[10px] text-primary font-semibold flex items-center gap-0.5 mt-0.5">
                <TrendingUp className="w-3 h-3" /> +8.2%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="bg-warning/10 p-3 rounded-lg border border-warning/20">
              <Star className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-text uppercase tracking-wider font-semibold">Average Rating</p>
              <p className="text-2xl font-extrabold text-foreground mt-0.5">4.8</p>
              <div className="flex gap-0.5 text-warning mt-1">
                <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                <Star className="w-3.5 h-3.5 fill-warning text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="bg-danger/10 p-3 rounded-lg border border-danger/20">
              <CheckCircle className="w-6 h-6 text-danger" />
            </div>
            <div>
              <p className="text-xs text-muted-text uppercase tracking-wider font-semibold">Completion Rate</p>
              <p className="text-2xl font-extrabold text-foreground mt-0.5">76%</p>
              <span className="text-[10px] text-muted-text mt-0.5 block">Avg class progress</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue growth chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-foreground">Monthly Earnings Growth</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {/* Custom SVG Growth curve */}
          <div className="h-44 w-full">
            <svg className="w-full h-full" viewBox="0 0 500 150">
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="30" y1="20" x2="480" y2="20" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" className="opacity-40" />
              <line x1="30" y1="70" x2="480" y2="70" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" className="opacity-40" />
              <line x1="30" y1="120" x2="480" y2="120" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" className="opacity-40" />

              {/* Area under curve */}
              <path
                d="M 50 120 L 150 100 L 250 80 L 350 50 L 450 20 L 450 120 L 50 120 Z"
                fill="url(#growthGradient)"
              />

              {/* Trend Curve Line */}
              <path
                d="M 50 120 L 150 100 L 250 80 L 350 50 L 450 20"
                fill="none"
                stroke="var(--color-success)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Data Points */}
              <circle cx="50" cy="120" r="4.5" fill="var(--color-background)" stroke="var(--color-success)" strokeWidth="3" />
              <circle cx="150" cy="100" r="4.5" fill="var(--color-background)" stroke="var(--color-success)" strokeWidth="3" />
              <circle cx="250" cy="80" r="4.5" fill="var(--color-background)" stroke="var(--color-success)" strokeWidth="3" />
              <circle cx="350" cy="50" r="4.5" fill="var(--color-background)" stroke="var(--color-success)" strokeWidth="3" />
              <circle cx="450" cy="20" r="4.5" fill="var(--color-background)" stroke="var(--color-success)" strokeWidth="3" />

              {/* Y Axis Labels */}
              <text x="5" y="24" className="fill-muted-text text-[9px] font-semibold">$3,000</text>
              <text x="5" y="74" className="fill-muted-text text-[9px] font-semibold">$1,500</text>
              <text x="5" y="124" className="fill-muted-text text-[9px] font-semibold">$0</text>

              {/* X Axis Labels */}
              {months.map((month, idx) => (
                <text key={month} x={50 + idx * 100} y="142" textAnchor="middle" className="fill-muted-text text-[10px] font-medium">
                  {month}
                </text>
              ))}
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Course Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-foreground">Course-by-Course Analytics</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {courseStats.length === 0 ? (
            <p className="text-xs text-muted-text text-center py-6">No courses data available.</p>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-sidebar/40 text-xs uppercase tracking-wider text-muted-text font-semibold">
                  <th className="p-4">Course Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Students Enrolled</th>
                  <th className="p-4">Course Rating</th>
                  <th className="p-4">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {courseStats.map((stat) => (
                  <tr key={stat.id} className="hover:bg-muted-bg/35 transition-colors">
                    <td className="p-4 font-semibold text-foreground">{stat.title}</td>
                    <td className="p-4">
                      <Badge variant="primary">{stat.category}</Badge>
                    </td>
                    <td className="p-4 text-foreground font-semibold">{stat.enrollments}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-warning">
                        <Star className="w-4 h-4 fill-warning text-warning" />
                        <span className="font-semibold text-xs text-foreground mt-0.5">{stat.rating}</span>
                      </div>
                    </td>
                    <td className="p-4 text-success font-semibold">${stat.earnings.toLocaleString()}.00</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
