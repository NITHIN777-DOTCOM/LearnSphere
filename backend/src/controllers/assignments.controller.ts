import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().transform((val) => new Date(val)),
});

const submitAssignmentSchema = z.object({
  content: z.string().min(1, 'Submission content cannot be empty'),
});

const gradeSubmissionSchema = z.object({
  grade: z.number().min(0).max(100, 'Grade must be between 0 and 100'),
  feedback: z.string().optional(),
});

// Create assignment (Instructor/Admin)
export const createAssignment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const { title, description, dueDate } = createAssignmentSchema.parse(req.body);

    const newAssignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate,
        courseId,
      },
    });

    res.status(201).json(newAssignment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Edit assignment (Instructor/Admin)
export const editAssignment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as any;
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!assignment) {
      res.status(404).json({ message: 'Assignment not found' });
      return;
    }

    if (!req.user || (req.user.role !== 'ADMIN' && assignment.course.instructorId !== req.user.id)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const { title, description, dueDate } = createAssignmentSchema.partial().parse(req.body);

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        title,
        description,
        dueDate,
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    console.error('Edit assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete assignment (Instructor/Admin)
export const deleteAssignment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as any;
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!assignment) {
      res.status(404).json({ message: 'Assignment not found' });
      return;
    }

    if (!req.user || (req.user.role !== 'ADMIN' && assignment.course.instructorId !== req.user.id)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    await prisma.assignment.delete({ where: { id } });

    res.status(200).json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Submit Assignment (Student)
export const submitAssignment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as any;
    const studentId = req.user?.id;

    if (!studentId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!assignment) {
      res.status(404).json({ message: 'Assignment not found' });
      return;
    }

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId: assignment.courseId,
        },
      },
    });

    if (!enrollment) {
      res.status(400).json({ message: 'You must be enrolled in the course to submit assignments' });
      return;
    }

    const { content } = submitAssignmentSchema.parse(req.body);

    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: id,
          studentId,
        },
      },
      update: {
        content,
        submittedAt: new Date(),
        status: 'SUBMITTED', // Reset status if resubmitted
      },
      create: {
        assignmentId: id,
        studentId,
        content,
      },
    });

    res.status(200).json({ message: 'Assignment submitted successfully', submission });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Grade assignment submission (Instructor/Admin)
export const gradeSubmission = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params as any;

    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: { course: true },
        },
      },
    });

    if (!submission) {
      res.status(404).json({ message: 'Submission not found' });
      return;
    }

    // Verify instructor
    if (
      !req.user ||
      (req.user.role !== 'ADMIN' && submission.assignment.course.instructorId !== req.user.id)
    ) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const { grade, feedback } = gradeSubmissionSchema.parse(req.body);

    const updatedSubmission = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        grade,
        feedback,
        status: 'GRADED',
      },
    });

    res.status(200).json({ message: 'Submission graded successfully', submission: updatedSubmission });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    console.error('Grade submission error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get submissions of an assignment (Instructor/Admin)
export const getSubmissionsByAssignmentId = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as any;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!assignment) {
      res.status(404).json({ message: 'Assignment not found' });
      return;
    }

    if (!req.user || (req.user.role !== 'ADMIN' && assignment.course.instructorId !== req.user.id)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const submissions = await prisma.assignmentSubmission.findMany({
      where: { assignmentId: id },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    res.status(200).json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
