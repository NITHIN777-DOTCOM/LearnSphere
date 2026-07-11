import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const questionSchema = z.object({
  questionText: z.string().min(1, 'Question text cannot be empty'),
  options: z.array(z.string()).min(2, 'Provide at least two options'),
  correctAnswerIndex: z.number().nonnegative(),
});

const createQuizSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  passingScore: z.number().min(0).max(100).default(60),
  questions: z.array(questionSchema).min(1, 'Provide at least one question'),
});

const attemptQuizSchema = z.object({
  answers: z.array(z.number()), // array of selected option indexes
});

// Create/Update quiz for a course (Instructor/Admin)
export const createQuiz = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const { title, passingScore, questions } = createQuizSchema.parse(req.body);

    // Save as JSON directly. Prisma handles JS objects automatically for Json fields.
    const newQuiz = await prisma.quiz.create({
      data: {
        title,
        passingScore,
        questions: questions as any,
        courseId,
      },
    });

    res.status(201).json(newQuiz);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    console.error('Create quiz error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Edit a quiz (Instructor/Admin)
export const editQuiz = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as any;
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' });
      return;
    }

    if (!req.user || (req.user.role !== 'ADMIN' && (quiz as any).course.instructorId !== req.user.id)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const { title, passingScore, questions } = createQuizSchema.partial().parse(req.body);

    const updated = await prisma.quiz.update({
      where: { id },
      data: {
        title,
        passingScore,
        questions: questions as any,
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    console.error('Edit quiz error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a quiz (Instructor/Admin)
export const deleteQuiz = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as any;
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' });
      return;
    }

    if (!req.user || (req.user.role !== 'ADMIN' && (quiz as any).course.instructorId !== req.user.id)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    await prisma.quiz.delete({ where: { id } });

    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get quiz details (Student version strips correct answers to prevent cheating!)
export const getQuizById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as any;

    const quiz = await prisma.quiz.findUnique({ where: { id } });

    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' });
      return;
    }

    const questionsList = (quiz.questions as any) || [];

    // Strip correctAnswerIndex if the requester is a STUDENT
    const sanitizedQuestions = req.user?.role === 'STUDENT'
      ? questionsList.map((q: any) => ({
          questionText: q.questionText,
          options: q.options,
        }))
      : questionsList;

    res.status(200).json({
      id: quiz.id,
      title: quiz.title,
      passingScore: quiz.passingScore,
      courseId: quiz.courseId,
      questions: sanitizedQuestions,
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Attempt a quiz (Student)
export const attemptQuiz = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as any;
    const studentId = req.user?.id;

    if (!studentId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const quiz = await prisma.quiz.findUnique({ where: { id } });
    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' });
      return;
    }

    const { answers } = attemptQuizSchema.parse(req.body);
    const questionsList = (quiz.questions as any) || [];

    if (answers.length !== questionsList.length) {
      res.status(400).json({ message: 'Incorrect number of answers provided' });
      return;
    }

    // Auto grading
    let correctCount = 0;
    questionsList.forEach((q: any, index: number) => {
      if (answers[index] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const totalQuestions = questionsList.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = score >= quiz.passingScore;

    // Save attempt (or update if already attempted)
    const attempt = await prisma.quizAttempt.upsert({
      where: {
        quizId_studentId: {
          quizId: id,
          studentId,
        },
      },
      update: {
        score,
        passed,
        attemptedAt: new Date(),
      },
      create: {
        quizId: id,
        studentId,
        score,
        passed,
      },
    });

    res.status(200).json({
      message: passed ? 'Congratulations! You passed the quiz.' : 'You did not achieve the passing score.',
      score,
      passed,
      correctAnswers: correctCount,
      totalQuestions,
      attempt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation failed', errors: error.issues });
      return;
    }
    console.error('Attempt quiz error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
