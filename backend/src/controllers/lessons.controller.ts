import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { LessonType } from '@prisma/client';

const createLessonSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  pdfUrl: z.string().optional(),
  duration: z.number().nonnegative().default(0), // in minutes
  type: z.nativeEnum(LessonType).default(LessonType.TEXT),
});

const updateLessonSchema = createLessonSchema.partial();

const reorderSchema = z.object({
  lessons: z.array(
    z.object({
      id: z.string(),
      order: z.number(),
    })
  ),
});

// Helper to recalculate course total duration
const updateCourseDuration = async (courseId: string) => {
  const lessons = await prisma.lesson.findMany({
    where: { courseId },
    select: { duration: true },
  });
  const totalDuration = lessons.reduce((sum, lesson) => sum + lesson.duration, 0);
  await prisma.course.update({
    where: { id: courseId },
    data: { duration: totalDuration },
  });
};

// Helper to update enrollment progress %
const updateEnrollmentProgress = async (studentId: string, courseId: string) => {
  const totalLessons = await prisma.lesson.count({
    where: { courseId },
  });

  if (totalLessons === 0) {
    await prisma.enrollment.update({
      where: { studentId_courseId: { studentId, courseId } },
      data: { progress: 100.0 },
    });
    return;
  }

  const completedCount = await prisma.progress.count({
    where: {
      userId: studentId,
      completed: true,
      lesson: { courseId },
    },
  });

  const percentage = (completedCount / totalLessons) * 100;

  await prisma.enrollment.update({
    where: { studentId_courseId: { studentId, courseId } },
    data: { progress: Math.min(100.0, parseFloat(percentage.toFixed(1))) },
  });
};

// Create a lesson (Instructor/Admin)
export const createLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params as any;
    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    if (!req.user || (req.user.role !== 'ADMIN' && course.instructorId !== req.user.id)) {
      res.status(403).json({ message: 'Forbidden: You can only create lessons for your own courses' });
      return;
    }

    const validatedData = createLessonSchema.parse(req.body);

    // Get order number (append at end)
    const count = await prisma.lesson.count({ where: { courseId } });

    const newLesson = await prisma.lesson.create({
      data: {
        ...validatedData,
        order: count + 1,
        courseId,
      },
    });

    await updateCourseDuration(courseId);

    res.status(201).json(newLesson);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    console.error('Create lesson error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Edit a lesson (Instructor/Admin)
export const editLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as any;
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!lesson) {
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }

    if (!req.user || (req.user.role !== 'ADMIN' && (lesson as any).course.instructorId !== req.user.id)) {
      res.status(403).json({ message: 'Forbidden: You can only edit lessons in your own courses' });
      return;
    }

    const validatedData = updateLessonSchema.parse(req.body);

    const updated = await prisma.lesson.update({
      where: { id },
      data: validatedData,
    });

    if (validatedData.duration !== undefined) {
      await updateCourseDuration(lesson.courseId);
    }

    res.status(200).json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    console.error('Edit lesson error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a lesson (Instructor/Admin)
export const deleteLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as any;
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!lesson) {
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }

    if (!req.user || (req.user.role !== 'ADMIN' && (lesson as any).course.instructorId !== req.user.id)) {
      res.status(403).json({ message: 'Forbidden: You can only delete lessons in your own courses' });
      return;
    }

    const { courseId, order: deletedOrder } = lesson;

    await prisma.$transaction(async (tx) => {
      // Delete the lesson
      await tx.lesson.delete({ where: { id } });

      // Re-order remaining lessons
      await tx.lesson.updateMany({
        where: {
          courseId,
          order: { gt: deletedOrder },
        },
        data: {
          order: { decrement: 1 },
        },
      });
    });

    await updateCourseDuration(courseId);

    // Dynamic progress update for all enrolled students
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      select: { studentId: true },
    });

    for (const enrollment of enrollments) {
      await updateEnrollmentProgress(enrollment.studentId, courseId);
    }

    res.status(200).json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Reorder lessons (Instructor/Admin)
export const reorderLessons = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params as any;
    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    if (!req.user || (req.user.role !== 'ADMIN' && course.instructorId !== req.user.id)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const { lessons } = reorderSchema.parse(req.body);

    await prisma.$transaction(
      lessons.map((lesson) =>
        prisma.lesson.update({
          where: { id: lesson.id },
          data: { order: lesson.order },
        })
      )
    );

    res.status(200).json({ message: 'Lessons reordered successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    console.error('Reorder lessons error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Toggle completion of lesson (Student)
export const toggleLessonProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as any;
    const studentId = req.user?.id;

    if (!studentId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!lesson) {
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }

    // Verify student is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId: lesson.courseId,
        },
      },
    });

    if (!enrollment) {
      res.status(400).json({ message: 'You must be enrolled in the course to complete lessons' });
      return;
    }

    // Check if progress already exists
    const progress = await prisma.progress.findUnique({
      where: {
        userId_lessonId: {
          userId: studentId,
          lessonId: id,
        },
      },
    });

    let completed = true;
    if (progress) {
      completed = !progress.completed;
      await prisma.progress.update({
        where: { id: progress.id },
        data: {
          completed,
          completedAt: completed ? new Date() : null,
        },
      });
    } else {
      await prisma.progress.create({
        data: {
          userId: studentId,
          lessonId: id,
          completed: true,
          completedAt: new Date(),
        },
      });
    }

    // Update enrollment progress
    await updateEnrollmentProgress(studentId, lesson.courseId);

    res.status(200).json({ completed, message: `Lesson marked as ${completed ? 'complete' : 'incomplete'}` });
  } catch (error) {
    console.error('Toggle lesson progress error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
