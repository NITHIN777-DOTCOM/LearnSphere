import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Difficulty } from '@prisma/client';

const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.nativeEnum(Difficulty).default(Difficulty.BEGINNER),
  duration: z.number().nonnegative().default(0), // in minutes
  tags: z.array(z.string()).default([]),
  learningOutcomes: z.array(z.string()).default([]),
  category: z.string().min(1, 'Category is required'),
  coverImage: z.string().optional(),
});

const updateCourseSchema = createCourseSchema.partial();

// Get courses with search and filtering
export const getCourses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, category, difficulty, status } = req.query;

    const whereClause: any = {};

    // Filter by status (Instructors see their own drafts; Students only see published)
    if (status) {
      whereClause.status = status as string;
    } else {
      // By default, if guest or student, show only published; if instructor, let them see drafts
      if (!req.user || req.user.role === 'STUDENT') {
        whereClause.status = 'PUBLISHED';
      }
    }

    // Filter by category
    if (category) {
      whereClause.category = category as string;
    }

    // Filter by difficulty
    if (difficulty) {
      whereClause.difficulty = difficulty as Difficulty;
    }

    // Global Search (Search title, description, instructor names, and lesson titles)
    if (search) {
      const searchStr = search as string;
      whereClause.OR = [
        { title: { contains: searchStr, mode: 'insensitive' } },
        { description: { contains: searchStr, mode: 'insensitive' } },
        { category: { contains: searchStr, mode: 'insensitive' } },
        {
          instructor: {
            profile: {
              OR: [
                { firstName: { contains: searchStr, mode: 'insensitive' } },
                { lastName: { contains: searchStr, mode: 'insensitive' } },
              ],
            },
          },
        },
        {
          lessons: {
            some: {
              title: { contains: searchStr, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        instructor: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            lessons: true,
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single course details
export const getCourseById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as any;
    const userId = req.user?.id;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
                biography: true,
              },
            },
          },
        },
        lessons: {
          orderBy: { order: 'asc' },
        },
        assignments: {
          orderBy: { createdAt: 'desc' },
        },
        quizzes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Check if current user is enrolled
    let enrollment = null;
    let completedLessons: string[] = [];
    let assignmentSubmissions: any[] = [];
    let quizAttempts: any[] = [];

    if (userId) {
      enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: userId,
            courseId: id,
          },
        },
      });

      if (enrollment) {
        // Fetch completed lessons
        const progress = await prisma.progress.findMany({
          where: {
            userId,
            completed: true,
            lesson: { courseId: id },
          },
          select: { lessonId: true },
        });
        completedLessons = progress.map((p) => p.lessonId);

        // Fetch student's assignment submissions
        assignmentSubmissions = await prisma.assignmentSubmission.findMany({
          where: {
            studentId: userId,
            assignment: { courseId: id },
          },
          select: {
            id: true,
            assignmentId: true,
            status: true,
            grade: true,
            submittedAt: true,
          },
        });

        // Fetch student's quiz attempts
        quizAttempts = await prisma.quizAttempt.findMany({
          where: {
            studentId: userId,
            quiz: { courseId: id },
          },
          select: {
            id: true,
            quizId: true,
            score: true,
            passed: true,
            attemptedAt: true,
          },
        });
      }
    }

    res.status(200).json({
      ...course,
      isEnrolled: !!enrollment,
      progressPercentage: enrollment ? enrollment.progress : 0,
      completedLessons,
      submissions: assignmentSubmissions,
      quizAttempts,
    });
  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a course (Instructor/Admin)
export const createCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || (req.user.role !== 'INSTRUCTOR' && req.user.role !== 'ADMIN')) {
      res.status(403).json({ message: 'Forbidden: Only instructors or admins can create courses' });
      return;
    }

    const validatedData = createCourseSchema.parse(req.body);

    const newCourse = await prisma.course.create({
      data: {
        ...validatedData,
        instructorId: req.user.id,
      },
    });

    res.status(201).json(newCourse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Edit a course (Instructor/Admin)
export const editCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as any;

    const existingCourse = await prisma.course.findUnique({ where: { id } });
    if (!existingCourse) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Authorization check
    if (
      !req.user ||
      (req.user.role !== 'ADMIN' && existingCourse.instructorId !== req.user.id)
    ) {
      res.status(403).json({ message: 'Forbidden: You can only edit your own courses' });
      return;
    }

    const validatedData = updateCourseSchema.parse(req.body);

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: validatedData,
    });

    res.status(200).json(updatedCourse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    console.error('Edit course error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a course (Instructor/Admin)
export const deleteCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as any;

    const existingCourse = await prisma.course.findUnique({ where: { id } });
    if (!existingCourse) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Authorization check
    if (
      !req.user ||
      (req.user.role !== 'ADMIN' && existingCourse.instructorId !== req.user.id)
    ) {
      res.status(403).json({ message: 'Forbidden: You can only delete your own courses' });
      return;
    }

    await prisma.course.delete({ where: { id } });

    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Publish course
export const publishCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as any;
    const course = await prisma.course.findUnique({ where: { id } });

    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    if (!req.user || (req.user.role !== 'ADMIN' && course.instructorId !== req.user.id)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const updated = await prisma.course.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Unpublish course
export const unpublishCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as any;
    const course = await prisma.course.findUnique({ where: { id } });

    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    if (!req.user || (req.user.role !== 'ADMIN' && course.instructorId !== req.user.id)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const updated = await prisma.course.update({
      where: { id },
      data: { status: 'DRAFT' },
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Enroll in a course (Student)
export const enrollCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as any;
    const studentId = req.user?.id;

    if (!studentId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // Verify course exists and is published
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    if (course.status !== 'PUBLISHED' && req.user?.role !== 'ADMIN') {
      res.status(400).json({ message: 'Cannot enroll in a draft course' });
      return;
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId: id,
        },
      },
    });

    if (existingEnrollment) {
      res.status(400).json({ message: 'You are already enrolled in this course' });
      return;
    }

    const newEnrollment = await prisma.enrollment.create({
      data: {
        studentId,
        courseId: id,
        progress: 0.0,
      },
    });

    res.status(201).json({ message: 'Enrolled successfully', enrollment: newEnrollment });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
