import { Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

// List all users
export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Admin list users error:', error);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
};

// Update user role
export const updateUserRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { role } = req.body;

  if (!Object.values(Role).includes(role)) {
    res.status(400).json({ message: 'Invalid role selection' });
    return;
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      include: { profile: true },
    });
    res.status(200).json({ message: 'User role updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Admin update user role error:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

// Delete user
export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;

  try {
    // Delete profile, enrollments, submissions first
    await prisma.progress.deleteMany({ where: { userId: id } });
    await prisma.quizAttempt.deleteMany({ where: { studentId: id } });
    await prisma.assignmentSubmission.deleteMany({ where: { studentId: id } });
    await prisma.enrollment.deleteMany({ where: { studentId: id } });
    await prisma.profile.deleteMany({ where: { userId: id } });

    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: 'User profile deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// List all courses
export const getAllCourses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        instructor: {
          select: {
            email: true,
            profile: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(courses);
  } catch (error) {
    console.error('Admin list courses error:', error);
    res.status(500).json({ message: 'Failed to retrieve courses' });
  }
};

// Update course status (verification approval / moderation)
export const updateCourseStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const { status } = req.body;

  if (status !== 'PUBLISHED' && status !== 'DRAFT') {
    res.status(400).json({ message: 'Invalid status parameter' });
    return;
  }

  try {
    const updated = await prisma.course.update({
      where: { id },
      data: { status },
    });
    res.status(200).json({ message: `Course successfully updated to ${status}`, course: updated });
  } catch (error) {
    console.error('Admin update course status error:', error);
    res.status(500).json({ message: 'Failed to update course status' });
  }
};
