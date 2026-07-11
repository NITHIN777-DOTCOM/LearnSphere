export type Role = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type LessonType = 'VIDEO' | 'PDF' | 'TEXT';

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  biography: string | null;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  biography: string | null;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  coverImage: string | null;
  instructorId: string;
  instructor?: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
      biography?: string | null;
    } | null;
  };
  status: 'DRAFT' | 'PUBLISHED';
  difficulty: Difficulty;
  duration: number; // in minutes
  tags: string[];
  learningOutcomes: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
  lessons?: Lesson[];
  assignments?: Assignment[];
  quizzes?: Quiz[];
  _count?: {
    lessons: number;
    enrollments: number;
  };
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  progress: number;
  course?: Course;
}

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  videoUrl: string | null;
  pdfUrl: string | null;
  duration: number;
  order: number;
  type: LessonType;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
  submissions?: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignment?: Assignment;
  studentId: string;
  student?: User;
  content: string;
  grade: number | null;
  feedback: string | null;
  status: 'SUBMITTED' | 'GRADED';
  submittedAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  passingScore: number;
  questions: QuizQuestion[];
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id?: string;
  questionText: string;
  options: string[];
  correctAnswerIndex?: number; // Omitted for students
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  passed: boolean;
  attemptedAt: string;
}
