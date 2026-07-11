import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Clock, Award, CheckCircle2, User, Play } from 'lucide-react';
import { api } from '../services/api.js';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card.js';
import { Badge } from '../components/Badge.js';
import { Spinner } from '../components/Spinner.js';
import { Avatar } from '../components/Avatar.js';
import { useToast } from '../components/Toast.js';
import { Button } from '../components/Button.js';
import type { Course } from '../types/index.js';

interface CourseDetailResponse extends Course {
  isEnrolled: boolean;
  progressPercentage: number;
  completedLessons: string[];
}

export const CourseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseDetailResponse | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const fetchCourseDetails = async () => {
    try {
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data);
    } catch (error) {
      console.error('Failed to fetch course details:', error);
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
    if (id) {
      const bookmarks = JSON.parse(localStorage.getItem('learnsphere_bookmarks') || '[]');
      setIsBookmarked(bookmarks.includes(id));

      const recently = JSON.parse(localStorage.getItem('learnsphere_recently_viewed') || '[]');
      const updated = [id, ...recently.filter((x: string) => x !== id)].slice(0, 4);
      localStorage.setItem('learnsphere_recently_viewed', JSON.stringify(updated));
    }
  }, [id]);

  const toggleBookmark = () => {
    if (!id) return;
    const bookmarks = JSON.parse(localStorage.getItem('learnsphere_bookmarks') || '[]');
    let nextBookmarks;
    if (bookmarks.includes(id)) {
      nextBookmarks = bookmarks.filter((x: string) => x !== id);
      setIsBookmarked(false);
      toast.success('Removed course from bookmarks');
    } else {
      nextBookmarks = [...bookmarks, id];
      setIsBookmarked(true);
      toast.success('Added course to bookmarks');
    }
    localStorage.setItem('learnsphere_bookmarks', JSON.stringify(nextBookmarks));
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await api.post(`/courses/${id}/enroll`);
      toast.success('Successfully enrolled in course!');
      fetchCourseDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!course) {
    return (
      <Card className="p-12 text-center bg-sidebar border border-border/40">
        <p className="text-sm text-muted-text">Course not found.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="primary">{course.category}</Badge>
              <Badge variant="info" className="capitalize">{course.difficulty.toLowerCase()}</Badge>
            </div>
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-full border transition-colors cursor-pointer ${
                isBookmarked 
                  ? 'bg-warning/10 border-warning/30 text-warning hover:bg-warning/20' 
                  : 'bg-muted-bg/50 border-border text-muted-text hover:text-foreground'
              }`}
              title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={isBookmarked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              </svg>
            </button>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{course.title}</h1>
          <p className="text-sm text-muted-text leading-relaxed">{course.description}</p>

          <div className="flex gap-6 text-xs text-muted-text items-center pt-2">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{Math.round(course.duration / 60)} Hours Total</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{course.lessons?.length || 0} Lessons</span>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <Card className="glass-card flex flex-col justify-between p-6">
          <div className="space-y-4">
            <div className="aspect-video bg-muted-bg rounded-md overflow-hidden border border-border/40 flex items-center justify-center relative">
              {course.coverImage ? (
                <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-12 h-12 text-primary/30" />
              )}
            </div>
            {course.isEnrolled && (
              <div>
                <div className="flex justify-between text-xs text-muted-text mb-1">
                  <span>Your Study Progress</span>
                  <span>{course.progressPercentage}%</span>
                </div>
                <div className="w-full bg-sidebar border border-border/30 h-2 rounded-full overflow-hidden">
                  <div style={{ width: `${course.progressPercentage}%` }} className="h-full bg-primary rounded-full" />
                </div>
              </div>
            )}
          </div>
          <div className="mt-6">
            {course.isEnrolled ? (
              <Link to={`/dashboard/courses/${course.id}/learn`}>
                <Button variant="primary" fullWidth leftIcon={<Play className="w-4 h-4" />}>
                  Resume Course
                </Button>
              </Link>
            ) : (
              <Button variant="success" fullWidth isLoading={enrolling} onClick={handleEnroll}>
                Enroll Now
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Curriculum & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Learning Outcomes */}
          {course.learningOutcomes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" /> What you'll learn
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.learningOutcomes.map((outcome, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start text-xs text-foreground/80 leading-relaxed">
                    <CheckCircle2 className="w-4.5 h-4.5 text-success flex-shrink-0" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Curriculum Lesson List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground tracking-tight">Curriculum Course Content</h3>
            <Card>
              <CardContent className="p-0">
                {course.lessons && course.lessons.length === 0 ? (
                  <p className="text-xs text-muted-text text-center p-6">No lessons uploaded yet.</p>
                ) : (
                  <div className="divide-y divide-border/40">
                    {course.lessons?.map((lesson, idx) => {
                      const isCompleted = course.completedLessons.includes(lesson.id);
                      return (
                        <div key={lesson.id} className="p-4 flex justify-between items-center hover:bg-muted-bg/15 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-muted-text">{idx + 1}.</span>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{lesson.title}</p>
                              <span className="text-[10px] text-muted-text lowercase tracking-wider font-bold">
                                {lesson.type.toLowerCase()} • {lesson.duration} mins
                              </span>
                            </div>
                          </div>
                          {isCompleted && <CheckCircle2 className="w-4 h-4 text-success" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar - Instructor Bio */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Instructor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Avatar
                  src={course.instructor?.profile?.avatarUrl}
                  alt={`${course.instructor?.profile?.firstName} ${course.instructor?.profile?.lastName}`}
                  size="lg"
                />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {course.instructor?.profile?.firstName} {course.instructor?.profile?.lastName}
                  </p>
                  <p className="text-xs text-muted-text">{course.instructor?.email}</p>
                </div>
              </div>
              <p className="text-xs text-muted-text leading-relaxed pt-2">
                {course.instructor?.profile?.biography || 'No biography details provided.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
