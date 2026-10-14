import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { Navbar } from '../components/Navbar.js';
import { useAuth } from '../hooks/useAuth.js';
import { useSEO } from '../hooks/useSEO.js';
import type { Course } from '../types/index.js';

const difficultyLabel: Record<Course['difficulty'], string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

export const HomePage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useSEO({
    title: 'Home',
    description: 'Courses, lessons and quizzes in one place.',
  });

  useEffect(() => {
    api
      .get('/courses')
      .then((res) => setCourses(res.data))
      .catch((err) => console.error('Failed to load courses:', err))
      .finally(() => setLoading(false));
  }, []);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const q = query.trim().toLowerCase();
  const visible = q
    ? courses.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q) ||
          c.tags?.some((t) => t.toLowerCase().includes(q))
      )
    : courses;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <section className="max-w-2xl">
          <h1 className="text-3xl font-semibold text-foreground">Hi, this is LearnSphere.</h1>
          <p className="mt-4 text-secondary-text leading-relaxed">
            It's a small place to take courses and to teach them. Instructors put together lessons,
            quizzes and assignments; students work through them at their own pace and keep track of
            where they left off. That's about it.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Make an account
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-md border border-border text-foreground text-sm hover:bg-muted-bg transition-colors"
            >
              I already have one
            </Link>
          </div>
        </section>

        <section className="mt-16">
          <div className="flex items-baseline justify-between gap-4 mb-5">
            <h2 className="text-2xl font-semibold text-foreground">Courses</h2>
            {!loading && <span className="text-sm text-muted-text">{courses.length} so far</span>}
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses..."
            className="w-full bg-card border border-border rounded-md px-5 py-3.5 text-foreground placeholder:text-muted-text focus:outline-none focus:border-muted-text transition-colors"
          />

          <div className="mt-6 space-y-4">
            {loading && <p className="text-sm text-muted-text">Loading courses…</p>}

            {!loading && visible.length === 0 && (
              <p className="text-sm text-muted-text">
                {q ? 'Nothing matches that.' : 'No courses yet. Check back soon.'}
              </p>
            )}

            {visible.map((course) => {
              const instructor = course.instructor?.profile;
              return (
                <Link
                  key={course.id}
                  to="/login"
                  className="block bg-card border border-border rounded-lg p-6 hover:border-muted-text/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-foreground">{course.title}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {course.category && (
                      <span className="px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-sm">
                        {course.category}
                      </span>
                    )}
                    <span className="px-3.5 py-1.5 rounded-full border border-border text-muted-text text-sm">
                      {difficultyLabel[course.difficulty] ?? course.difficulty}
                    </span>
                  </div>
                  {course.description && (
                    <p className="mt-3 text-sm text-muted-text line-clamp-2">{course.description}</p>
                  )}
                  <p className="mt-3 text-sm text-muted-text">
                    {instructor ? `by ${instructor.firstName} ${instructor.lastName}` : ''}
                    {instructor && course._count ? ' · ' : ''}
                    {course._count ? `${course._count.lessons} lessons` : ''}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-text">
        LearnSphere
      </footer>
    </div>
  );
};
