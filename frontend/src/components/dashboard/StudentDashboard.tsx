import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Clock, Award, PlayCircle, Flame, Bookmark } from 'lucide-react';
import { api } from '../../services/api.js';
import { Card, CardContent } from '../Card.js';
import { ProgressBar } from '../ProgressBar.js';
import { Badge } from '../Badge.js';
import { Spinner } from '../Spinner.js';

interface DashboardStats {
  totalEnrolled: number;
  completedCourses: number;
  avgProgress: number;
}

interface EnrolledCourseItem {
  id: string;
  progress: number;
  course: {
    id: string;
    title: string;
    description: string;
    coverImage: string | null;
    category: string;
    difficulty: string;
    instructor: {
      profile: {
        firstName: string;
        lastName: string;
      } | null;
    } | null;
  };
}

interface UpcomingAssignmentItem {
  id: string;
  title: string;
  dueDate: string;
  course: {
    title: string;
  };
}

interface RecentActivityItem {
  type: string;
  title: string;
  subtitle: string;
  timestamp: string;
}

export const StudentDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [enrollments, setEnrollments] = useState<EnrolledCourseItem[]>([]);
  const [assignments, setAssignments] = useState<UpcomingAssignmentItem[]>([]);
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  
  // Bookmark and Recently Viewed Courses
  const [bookmarkedCourses, setBookmarkedCourses] = useState<any[]>([]);
  const [recentlyViewedCourses, setRecentlyViewedCourses] = useState<any[]>([]);

  // Streak & study mock data
  const streakCount = 5;
  const studyHours = [2.5, 4.0, 1.5, 3.2, 5.0, 0.8, 2.0]; // Mon-Sun
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/student');
        setStats(response.data.stats);
        setEnrollments(response.data.enrollments);
        setAssignments(response.data.upcomingAssignments);
        setActivities(response.data.recentActivity);

        // Fetch all catalog courses to lookup details for bookmarks & recently viewed
        const coursesResponse = await api.get('/courses');
        const coursesList = coursesResponse.data;

        // Filter Bookmarked Courses
        const bookmarkIds = JSON.parse(localStorage.getItem('learnsphere_bookmarks') || '[]');
        const bookmarked = coursesList.filter((c: any) => bookmarkIds.includes(c.id));
        setBookmarkedCourses(bookmarked);

        // Filter Recently Viewed Courses
        const recentlyIds = JSON.parse(localStorage.getItem('learnsphere_recently_viewed') || '[]');
        const recently = recentlyIds
          .map((id: string) => coursesList.find((c: any) => c.id === id))
          .filter(Boolean);
        setRecentlyViewedCourses(recently);
      } catch (error) {
        console.error('Failed to load student dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const maxHours = Math.max(...studyHours);

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-text uppercase tracking-wider font-semibold">Enrolled Courses</p>
              <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats?.totalEnrolled || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="bg-success/10 p-3 rounded-lg border border-success/20">
              <Award className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-text uppercase tracking-wider font-semibold">Completed Courses</p>
              <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats?.completedCourses || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="bg-warning/10 p-3 rounded-lg border border-warning/20">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-text uppercase tracking-wider font-semibold">Average Progress</p>
              <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats?.avgProgress || 0}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Row: Weekly study hours & Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Study Bar Chart */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-foreground text-sm">Weekly Study Hours</h4>
                <p className="text-[10px] text-muted-text mt-0.5">Average active time per day</p>
              </div>
              <span className="text-xs font-semibold text-primary">Total: 19.0 hrs</span>
            </div>

            {/* Custom Responsive SVG Chart */}
            <div className="h-48 w-full pt-4">
              <svg className="w-full h-full" viewBox="0 0 500 160">
                {/* Grid Lines */}
                <line x1="30" y1="20" x2="480" y2="20" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" className="opacity-40" />
                <line x1="30" y1="70" x2="480" y2="70" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" className="opacity-40" />
                <line x1="30" y1="120" x2="480" y2="120" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" className="opacity-40" />
                <line x1="30" y1="140" x2="480" y2="140" stroke="var(--color-border)" strokeWidth="1" />

                {/* Y Axis Labels */}
                <text x="5" y="24" className="fill-muted-text text-[10px] font-semibold">{Math.round(maxHours)}h</text>
                <text x="5" y="74" className="fill-muted-text text-[10px] font-semibold">{Math.round(maxHours / 2)}h</text>
                <text x="5" y="124" className="fill-muted-text text-[10px] font-semibold">0h</text>

                {/* Bars */}
                {studyHours.map((hours, index) => {
                  const barWidth = 32;
                  const spacing = 62;
                  const x = 40 + index * spacing;
                  const height = (hours / maxHours) * 100;
                  const y = 140 - height;
                  return (
                    <g key={index} className="group cursor-pointer">
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={height}
                        rx="4"
                        fill="var(--color-primary)"
                        className="opacity-80 hover:opacity-100 transition-opacity duration-200"
                      />
                      {/* Tooltip on Hover */}
                      <text
                        x={x + barWidth / 2}
                        y={y - 8}
                        textAnchor="middle"
                        className="fill-primary text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        {hours}h
                      </text>
                      {/* X Labels */}
                      <text
                        x={x + barWidth / 2}
                        y="155"
                        textAnchor="middle"
                        className="fill-muted-text text-[10px] font-medium"
                      >
                        {daysOfWeek[index]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Streak & Streak Calendar Widget */}
        <Card className="flex flex-col justify-between">
          <CardContent className="pt-6 space-y-6 flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-foreground text-sm">Study Streak</h4>
                <p className="text-[10px] text-muted-text mt-0.5">Consecutive learning days</p>
              </div>
              <div className="flex items-center gap-1 text-warning bg-warning/10 border border-warning/20 px-2.5 py-0.5 rounded-full text-xs font-extrabold">
                <Flame className="w-4 h-4 fill-warning" />
                <span>{streakCount} Days</span>
              </div>
            </div>

            {/* Daily Streak Indicator */}
            <div className="flex justify-between items-center gap-2 pt-2">
              {daysOfWeek.map((day, idx) => {
                const isActive = idx < streakCount;
                return (
                  <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                      isActive 
                        ? 'bg-warning/15 border-warning text-warning shadow-soft' 
                        : 'bg-muted-bg/30 border-border text-muted-text'
                    }`}>
                      <Flame className={`w-4 h-4 ${isActive ? 'fill-warning' : 'opacity-20'}`} />
                    </div>
                    <span className="text-[9px] font-bold text-muted-text">{day}</span>
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] text-muted-text leading-relaxed pt-2 border-t border-border/40">
              Keep reading lessons and taking quizzes to increase your study streak! Consistent learning improves retention by 40%.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Continue Learning, Bookmarks, Recently Viewed */}
        <div className="lg:col-span-2 space-y-8">
          {/* Continue Learning */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-primary" /> Continue Learning
            </h3>

            {enrollments.length === 0 ? (
              <Card className="bg-sidebar border border-border/40 p-8 text-center">
                <p className="text-sm text-muted-text mb-4">You are not enrolled in any courses yet.</p>
                <Link to="/dashboard/explore">
                  <Badge variant="primary" className="py-1 px-4 cursor-pointer text-xs font-semibold">
                    Browse Courses
                  </Badge>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrollments.map((item) => (
                  <Card key={item.id} hoverable className="overflow-hidden flex flex-col justify-between h-full bg-card">
                    <div className="p-5 space-y-4">
                      <div className="flex justify-between items-start gap-2">
                        <Badge variant="info">{item.course.category}</Badge>
                        <span className="text-[10px] text-muted-text uppercase tracking-wider font-bold">
                          {item.course.difficulty.toLowerCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-base line-clamp-1">
                          {item.course.title}
                        </h4>
                        <p className="text-xs text-muted-text line-clamp-2 mt-1 font-medium leading-relaxed">
                          {item.course.description}
                        </p>
                      </div>
                    </div>
                    <div className="px-5 pb-5 pt-2 border-t border-border/30">
                      <ProgressBar value={item.progress} showLabel size="sm" className="mb-4" />
                      <Link to={`/dashboard/courses/${item.course.id}/learn`}>
                        <button className="w-full bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold py-2 rounded-md transition-colors cursor-pointer">
                          Resume Study
                        </button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Bookmarked Courses */}
          {bookmarkedCourses.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-warning" /> Bookmarked Courses
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bookmarkedCourses.map((c) => (
                  <Card key={c.id} hoverable className="overflow-hidden flex flex-col justify-between h-full bg-card">
                    <div className="p-5 space-y-4">
                      <div className="flex justify-between items-start gap-2">
                        <Badge variant="primary">{c.category}</Badge>
                        <span className="text-[10px] text-muted-text uppercase tracking-wider font-bold">
                          {c.difficulty.toLowerCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm line-clamp-1">{c.title}</h4>
                        <p className="text-xs text-muted-text line-clamp-2 mt-1 leading-relaxed">
                          {c.description}
                        </p>
                      </div>
                    </div>
                    <div className="px-5 pb-5 pt-2 border-t border-border/30">
                      <Link to={`/dashboard/courses/${c.id}`} className="block">
                        <button className="w-full bg-sidebar hover:bg-border/60 text-foreground text-xs font-semibold py-2 rounded-md border border-border/60 cursor-pointer">
                          View details
                        </button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recently Viewed Courses */}
          {recentlyViewedCourses.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Recently Viewed
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentlyViewedCourses.map((c) => (
                  <Card key={c.id} hoverable className="overflow-hidden flex flex-col justify-between h-full bg-card">
                    <div className="p-5 space-y-4">
                      <div className="flex justify-between items-start gap-2">
                        <Badge variant="info">{c.category}</Badge>
                        <span className="text-[10px] text-muted-text uppercase tracking-wider font-bold">
                          {c.difficulty.toLowerCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm line-clamp-1">{c.title}</h4>
                        <p className="text-xs text-muted-text line-clamp-2 mt-1 leading-relaxed">
                          {c.description}
                        </p>
                      </div>
                    </div>
                    <div className="px-5 pb-5 pt-2 border-t border-border/30">
                      <Link to={`/dashboard/courses/${c.id}`} className="block">
                        <button className="w-full bg-sidebar hover:bg-border/60 text-foreground text-xs font-semibold py-2 rounded-md border border-border/60 cursor-pointer">
                          View details
                        </button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Deadlines, Activity */}
        <div className="space-y-8">
          {/* Upcoming Assignments */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-warning" /> Due Assignments
            </h3>
            <Card>
              <CardContent className="pt-5 space-y-4">
                {assignments.length === 0 ? (
                  <p className="text-xs text-muted-text text-center py-2">No pending assignments!</p>
                ) : (
                  assignments.map((asm) => (
                    <div key={asm.id} className="pb-3 border-b border-border/40 last:border-b-0 last:pb-0">
                      <Link to={`/dashboard/courses/submissions`} className="hover:text-primary transition-colors">
                        <p className="text-sm font-semibold text-foreground line-clamp-1">{asm.title}</p>
                      </Link>
                      <p className="text-[10px] text-muted-text mt-0.5 font-medium">Course: {asm.course.title}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-danger font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Due: {new Date(asm.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-success" /> Recent Activity
            </h3>
            <Card>
              <CardContent className="pt-5 space-y-4">
                {activities.length === 0 ? (
                  <p className="text-xs text-muted-text text-center py-2">No recent learning activity.</p>
                ) : (
                  activities.map((act, index) => (
                    <div key={index} className="flex gap-3 text-xs pb-3 border-b border-border/40 last:border-b-0 last:pb-0">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground leading-tight">{act.title}</p>
                        <p className="text-[10px] text-muted-text mt-0.5 font-medium">{act.subtitle}</p>
                        <span className="text-[9px] text-muted-text block mt-1">
                          {new Date(act.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
