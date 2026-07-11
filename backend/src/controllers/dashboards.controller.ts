import { Response } from 'express';
import { prisma } from '../prisma/client.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

// Student Dashboard Summary
export const getStudentDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // 1. Enrolled Courses (with progress)
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            coverImage: true,
            category: true,
            difficulty: true,
            instructor: {
              select: {
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    // 2. Upcoming Assignments (Due in future, and student hasn't submitted yet)
    const courseIds = enrollments.map((e) => e.courseId);
    const upcomingAssignments = await prisma.assignment.findMany({
      where: {
        courseId: { in: courseIds },
        dueDate: { gt: new Date() },
        submissions: {
          none: { studentId }, // has not submitted
        },
      },
      include: {
        course: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    });

    // 3. Recent Activity (Completed lessons or quiz attempts)
    const completedProgress = await prisma.progress.findMany({
      where: { userId: studentId, completed: true },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            course: {
              select: { title: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 4,
    });

    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { studentId },
      include: {
        quiz: {
          select: {
            title: true,
            course: { select: { title: true } },
          },
        },
      },
      orderBy: { attemptedAt: 'desc' },
      take: 4,
    });

    const activities = [
      ...completedProgress.map((p) => ({
        type: 'LESSON_COMPLETE',
        title: `Completed lesson "${p.lesson.title}"`,
        subtitle: p.lesson.course.title,
        timestamp: p.updatedAt,
      })),
      ...quizAttempts.map((q) => ({
        type: 'QUIZ_ATTEMPT',
        title: `Attempted quiz "${q.quiz.title}" (Score: ${q.score}%)`,
        subtitle: q.quiz.course.title,
        timestamp: q.attemptedAt,
      })),
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);

    // 4. Overall Progress Stats
    const totalEnrolled = enrollments.length;
    const completedCourses = enrollments.filter((e) => e.progress >= 100.0).length;
    const avgProgress = totalEnrolled > 0
      ? parseFloat((enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrolled).toFixed(1))
      : 0;

    res.status(200).json({
      enrollments,
      upcomingAssignments,
      recentActivity: activities,
      stats: {
        totalEnrolled,
        completedCourses,
        avgProgress,
      },
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Instructor Dashboard Summary
export const getInstructorDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const instructorId = req.user?.id;
    if (!instructorId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // 1. My Courses
    const courses = await prisma.course.findMany({
      where: { instructorId },
      include: {
        _count: {
          select: {
            enrollments: true,
            lessons: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const courseIds = courses.map((c) => c.id);

    // 2. Distinct Student Count
    const enrollmentsCountObj = await prisma.enrollment.groupBy({
      by: ['studentId'],
      where: {
        courseId: { in: courseIds },
      },
    });
    const uniqueStudentsCount = enrollmentsCountObj.length;

    // 3. Assignments Pending Grading
    const submissions = await prisma.assignmentSubmission.findMany({
      where: {
        assignment: { courseId: { in: courseIds } },
      },
      include: {
        assignment: { select: { title: true } },
        student: {
          select: {
            profile: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const pendingGradingCount = submissions.filter((s) => s.status === 'SUBMITTED').length;

    // 4. Quiz Attempt Count & Average Score
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: {
        quiz: { courseId: { in: courseIds } },
      },
      select: { score: true },
    });

    const totalAttempts = quizAttempts.length;
    const avgQuizScore = totalAttempts > 0
      ? Math.round(quizAttempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts)
      : 0;

    // 5. Recent Enrollments
    const recentEnrollments = await prisma.enrollment.findMany({
      where: {
        courseId: { in: courseIds },
      },
      include: {
        student: {
          select: {
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        course: {
          select: { title: true },
        },
      },
      orderBy: { enrolledAt: 'desc' },
      take: 5,
    });

    res.status(200).json({
      courses,
      recentEnrollments,
      submissions: submissions.slice(0, 5), // Return recent submissions
      stats: {
        totalCourses: courses.length,
        uniqueStudentsCount,
        pendingGradingCount,
        totalQuizAttempts: totalAttempts,
        avgQuizScore,
      },
    });
  } catch (error) {
    console.error('Instructor dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin Dashboard Summary
export const getAdminDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // 1. Overall platform stats
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalInstructors = await prisma.user.count({ where: { role: 'INSTRUCTOR' } });
    const totalAdmins = await prisma.user.count({ where: { role: 'ADMIN' } });
    
    const totalCourses = await prisma.course.count();
    const publishedCourses = await prisma.course.count({ where: { status: 'PUBLISHED' } });
    const draftCourses = await prisma.course.count({ where: { status: 'DRAFT' } });

    const totalEnrollments = await prisma.enrollment.count();

    // 2. Recent Users
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { profile: true },
      take: 5,
    });

    // 3. Recent Courses
    const recentCourses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        instructor: {
          select: {
            profile: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
      take: 5,
    });

    res.status(200).json({
      recentUsers,
      recentCourses,
      stats: {
        users: {
          total: totalStudents + totalInstructors + totalAdmins,
          students: totalStudents,
          instructors: totalInstructors,
          admins: totalAdmins,
        },
        courses: {
          total: totalCourses,
          published: publishedCourses,
          draft: draftCourses,
        },
        enrollments: {
          total: totalEnrollments,
        },
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
