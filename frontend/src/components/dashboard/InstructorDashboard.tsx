import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, FileCheck, HelpCircle, PlusCircle, Edit, Trash2, Eye, EyeOff, TrendingUp } from 'lucide-react';
import { api } from '../../services/api.js';
import { Card, CardContent } from '../Card.js';
import { Badge } from '../Badge.js';
import { Spinner } from '../Spinner.js';
import { Modal } from '../Modal.js';
import { Input } from '../Input.js';
import { Button } from '../Button.js';
import { useToast } from '../Toast.js';

interface CourseItem {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  status: 'DRAFT' | 'PUBLISHED';
  duration: number;
  _count: {
    enrollments: number;
    lessons: number;
  };
}

interface SubmissionItem {
  id: string;
  assignment: { title: string };
  student: {
    profile: { firstName: string; lastName: string } | null;
    email: string;
  };
  content: string;
  status: string;
  grade: number | null;
  feedback: string | null;
  submittedAt: string;
}

export const InstructorDashboard: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);
  const [gradeValue, setGradeValue] = useState<number>(100);
  const [feedbackValue, setFeedbackValue] = useState<string>('');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  // SVG Mock Data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/instructor');
      setStats(response.data.stats);
      setCourses(response.data.courses);
      setSubmissions(response.data.submissions);
    } catch (error) {
      console.error('Failed to load instructor dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTogglePublish = async (courseId: string, currentStatus: string) => {
    try {
      const endpoint = currentStatus === 'PUBLISHED' ? 'unpublish' : 'publish';
      await api.post(`/courses/${courseId}/${endpoint}`);
      toast.success(`Course successfully ${currentStatus === 'PUBLISHED' ? 'unpublished' : 'published'}!`);
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course? This will delete all lessons, quizzes, and student progress!')) return;
    try {
      await api.delete(`/courses/${courseId}`);
      toast.success('Course deleted successfully');
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete course');
    }
  };

  const handleOpenGradeModal = (sub: SubmissionItem) => {
    setSelectedSubmission(sub);
    setGradeValue(sub.grade !== null ? sub.grade : 100);
    setFeedbackValue(sub.feedback || '');
  };

  const handleSubmitGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    setSubmittingGrade(true);
    try {
      await api.post(`/assignments/submissions/${selectedSubmission.id}/grade`, {
        grade: Number(gradeValue),
        feedback: feedbackValue,
      });
      toast.success('Submission graded successfully!');
      setSelectedSubmission(null);
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to grade submission');
    } finally {
      setSubmittingGrade(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top CTA */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground tracking-tight">Instructor Panel</h2>
        <Link to="/dashboard/courses/new">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Create New Course
          </Button>
        </Link>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-text uppercase tracking-wider font-semibold">My Courses</p>
              <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats?.totalCourses || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="bg-success/10 p-3 rounded-lg border border-success/20">
              <Users className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-text uppercase tracking-wider font-semibold">Total Students</p>
              <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats?.uniqueStudentsCount || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="bg-danger/10 p-3 rounded-lg border border-danger/20">
              <FileCheck className="w-6 h-6 text-danger" />
            </div>
            <div>
              <p className="text-xs text-muted-text uppercase tracking-wider font-semibold">Awaiting Grades</p>
              <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats?.pendingGradingCount || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="bg-warning/10 p-3 rounded-lg border border-warning/20">
              <HelpCircle className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-text uppercase tracking-wider font-semibold">Avg Quiz Score</p>
              <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats?.avgQuizScore || 0}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Row: Enrollment Trend SVG Area Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-foreground text-sm">Enrollment Trends</h4>
                <p className="text-[10px] text-muted-text mt-0.5">Cumulative platform signup metrics</p>
              </div>
              <span className="text-xs font-semibold text-success flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +25% this month
              </span>
            </div>

            {/* Custom SVG Area Chart */}
            <div className="h-44 w-full pt-4">
              <svg className="w-full h-full" viewBox="0 0 500 150">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="30" y1="20" x2="480" y2="20" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" className="opacity-40" />
                <line x1="30" y1="70" x2="480" y2="70" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" className="opacity-40" />
                <line x1="30" y1="120" x2="480" y2="120" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" className="opacity-40" />

                {/* Area under curve */}
                <path
                  d="M 50 120 Q 150 90, 250 80 T 450 30 L 450 120 L 50 120 Z"
                  fill="url(#areaGradient)"
                />

                {/* Trend Curve Line */}
                <path
                  d="M 50 120 Q 150 90, 250 80 T 450 30"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                <circle cx="50" cy="120" r="4" fill="var(--color-background)" stroke="var(--color-primary)" strokeWidth="2.5" />
                <circle cx="150" cy="100" r="4" fill="var(--color-background)" stroke="var(--color-primary)" strokeWidth="2.5" />
                <circle cx="250" cy="80" r="4" fill="var(--color-background)" stroke="var(--color-primary)" strokeWidth="2.5" />
                <circle cx="350" cy="55" r="4" fill="var(--color-background)" stroke="var(--color-primary)" strokeWidth="2.5" />
                <circle cx="450" cy="30" r="4" fill="var(--color-background)" stroke="var(--color-primary)" strokeWidth="2.5" />

                {/* Y Axis Labels */}
                <text x="5" y="24" className="fill-muted-text text-[9px] font-semibold">150</text>
                <text x="5" y="74" className="fill-muted-text text-[9px] font-semibold">75</text>
                <text x="5" y="124" className="fill-muted-text text-[9px] font-semibold">0</text>

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

        {/* Student Engagement Widget */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h4 className="font-bold text-foreground text-sm">Active Study Minutes</h4>
              <p className="text-[10px] text-muted-text mt-0.5">Average lecture watch hours</p>
            </div>

            {/* Custom SVG line trend */}
            <div className="h-32 w-full">
              <svg className="w-full h-full" viewBox="0 0 200 100">
                <path
                  d="M 20 80 L 60 70 L 100 45 L 140 30 L 180 15"
                  fill="none"
                  stroke="var(--color-success)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="20" cy="80" r="3" fill="var(--color-success)" />
                <circle cx="60" cy="70" r="3" fill="var(--color-success)" />
                <circle cx="100" cy="45" r="3" fill="var(--color-success)" />
                <circle cx="140" cy="30" r="3" fill="var(--color-success)" />
                <circle cx="180" cy="15" r="3" fill="var(--color-success)" />
              </svg>
            </div>
            <p className="text-[10px] text-muted-text leading-relaxed">
              Monthly student study duration has increased by **12.5%** since course lessons reordering optimization.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Manager */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            Course Curriculum Manager
          </h3>

          {courses.length === 0 ? (
            <Card className="bg-sidebar border border-border/40 p-8 text-center">
              <p className="text-sm text-muted-text mb-4">You have not created any courses yet.</p>
              <Link to="/dashboard/courses/new">
                <Button variant="primary" size="sm">Create First Course</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {courses.map((course) => (
                <Card key={course.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-foreground text-base">{course.title}</h4>
                      <Badge variant={course.status === 'PUBLISHED' ? 'success' : 'default'}>
                        {course.status}
                      </Badge>
                      <Badge variant="info">{course.category}</Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-text font-semibold">
                      <span>Lessons: {course._count.lessons}</span>
                      <span>Enrolled Students: {course._count.enrollments}</span>
                      <span>Difficulty: {course.difficulty.toLowerCase()}</span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <Link to={`/dashboard/courses/${course.id}/edit`}>
                      <button className="p-2 rounded bg-muted-bg hover:bg-border/60 text-muted-text hover:text-foreground cursor-pointer transition-colors" title="Edit course details & curriculum">
                        <Edit className="w-4 h-4" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleTogglePublish(course.id, course.status)}
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        course.status === 'PUBLISHED'
                          ? 'bg-success/10 hover:bg-success/20 text-success'
                          : 'bg-muted-bg hover:bg-border/60 text-muted-text hover:text-foreground'
                      }`}
                      title={course.status === 'PUBLISHED' ? 'Unpublish Course' : 'Publish Course'}
                    >
                      {course.status === 'PUBLISHED' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-2 rounded bg-danger/10 hover:bg-danger/25 text-danger cursor-pointer transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Grading Queue */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground tracking-tight">
            Grading Queue
          </h3>
          <Card>
            <CardContent className="pt-5 space-y-4">
              {submissions.length === 0 ? (
                <p className="text-xs text-muted-text text-center py-4">No submissions received yet.</p>
              ) : (
                submissions.map((sub) => (
                  <div key={sub.id} className="pb-3 border-b border-border/40 last:border-b-0 last:pb-0 flex justify-between items-start gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {sub.student?.profile?.firstName || 'Student'} {sub.student?.profile?.lastName || ''}
                      </p>
                      <p className="text-[10px] text-muted-text font-semibold">Assignment: {sub.assignment.title}</p>
                      <p className="text-[9px] text-muted-text mt-0.5">Date: {new Date(sub.submittedAt).toLocaleDateString()}</p>
                      <span className={`inline-block mt-2 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        sub.status === 'GRADED' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleOpenGradeModal(sub)}>
                      {sub.status === 'GRADED' ? 'Review' : 'Grade'}
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Grading Modal */}
      <Modal
        isOpen={selectedSubmission !== null}
        onClose={() => setSelectedSubmission(null)}
        title="Grade Assignment Submission"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleSubmitGrade} isLoading={submittingGrade}>
              Save Grade
            </Button>
          </div>
        }
      >
        {selectedSubmission && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-text uppercase font-semibold">Student</p>
              <p className="text-sm font-bold text-foreground">
                {selectedSubmission.student?.profile?.firstName} {selectedSubmission.student?.profile?.lastName} ({selectedSubmission.student?.email})
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-text uppercase font-semibold">Assignment Title</p>
              <p className="text-sm font-medium text-foreground">{selectedSubmission.assignment.title}</p>
            </div>
            <div>
              <p className="text-xs text-muted-text uppercase font-semibold">Submitted Work</p>
              <div className="bg-muted-bg border border-border p-3.5 rounded mt-1 text-sm font-mono whitespace-pre-wrap select-text leading-relaxed">
                {selectedSubmission.content}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1">
                <Input
                  label="Grade (0-100)"
                  id="grade"
                  type="number"
                  min="0"
                  max="100"
                  value={gradeValue}
                  onChange={(e) => setGradeValue(Number(e.target.value))}
                />
              </div>
              <div className="sm:col-span-3">
                <Input
                  label="Feedback Comments"
                  id="feedback"
                  type="text"
                  placeholder="Well structured work. Excellent outcomes."
                  value={feedbackValue}
                  onChange={(e) => setFeedbackValue(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
