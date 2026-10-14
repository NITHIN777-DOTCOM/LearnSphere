import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Compass, BookOpen, Clock, BarChart2, Star } from 'lucide-react';
import { api } from '../services/api.js';
import { Card, CardContent } from '../components/Card.js';
import { Badge } from '../components/Badge.js';
import { Input } from '../components/Input.js';
import { Spinner } from '../components/Spinner.js';
import { Avatar } from '../components/Avatar.js';
import type { Course } from '../types/index.js';

export const ExploreCoursesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (difficulty) params.append('difficulty', difficulty);

      const response = await api.get(`/courses?${params.toString()}`);
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [category, difficulty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  const categories = ['Development', 'Business', 'Design', 'Marketing', 'Photography', 'General'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" /> Explore Courses
          </h2>
          <p className="text-xs text-muted-text mt-1">Discover new skills taught by professional instructors.</p>
        </div>
      </div>

      {/* Filters row */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search courses, lessons, or instructors..."
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                rightIcon={
                  <button type="submit" className="text-xs text-primary font-bold hover:underline cursor-pointer">
                    Search
                  </button>
                }
              />
            </div>
            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-sidebar border border-border text-foreground rounded-md px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-sidebar border border-border text-foreground rounded-md px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              >
                <option value="">All Difficulties</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : courses.length === 0 ? (
        <Card className="bg-sidebar border border-border/40 p-12 text-center">
          <p className="text-sm text-muted-text">No courses match your search or filter criteria.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const instructorName = course.instructor?.profile 
              ? `${course.instructor.profile.firstName} ${course.instructor.profile.lastName}`
              : 'Senior Instructor';
            return (
              <Card key={course.id} hoverable className="overflow-hidden flex flex-col justify-between h-full bg-card">
                <div className="aspect-video bg-muted-bg border-b border-border/30 relative">
                  {course.coverImage ? (
                    <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40">
                      <BookOpen className="w-12 h-12" />
                    </div>
                  )}
                  <Badge variant="primary" className="absolute bottom-3 left-3">{course.category}</Badge>
                </div>

                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted-text uppercase tracking-wider font-bold">
                        {course.difficulty.toLowerCase()}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-warning font-semibold">
                        <Star className="w-3.5 h-3.5 fill-warning" />
                        <span>4.8</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-foreground text-base line-clamp-1">{course.title}</h4>
                    <p className="text-xs text-muted-text line-clamp-2 leading-relaxed">{course.description}</p>
                  </div>

                  {/* Instructor Bio */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/20">
                    <Avatar
                      src={course.instructor?.profile?.avatarUrl}
                      alt={instructorName}
                      size="sm"
                    />
                    <div className="text-[11px] text-muted-text">
                      <p className="font-semibold text-foreground leading-tight">{instructorName}</p>
                      <p className="text-[9px] mt-0.5">LearnSphere Educator</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-muted-text pt-2 border-t border-border/20">
                    <div className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{Math.round(course.duration / 60)} hrs</span>
                    </div>
                    <div className="flex items-center gap-1 font-medium">
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span className="capitalize">{course.difficulty.toLowerCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-0">
                  <Link to={`/dashboard/courses/${course.id}`}>
                    <button className="w-full bg-sidebar hover:bg-border/60 text-foreground text-xs font-semibold py-2 rounded-md border border-border/60 transition-colors cursor-pointer">
                      View Details
                    </button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
