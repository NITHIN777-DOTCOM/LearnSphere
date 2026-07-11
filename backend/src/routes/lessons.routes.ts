import { Router } from 'express';
import {
  createLesson,
  editLesson,
  deleteLesson,
  reorderLessons,
  toggleLessonProgress,
} from '../controllers/lessons.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Manage lessons (Instructor/Admin)
router.post('/courses/:courseId/lessons', authenticate, createLesson);
router.put('/:id', authenticate, editLesson);
router.delete('/:id', authenticate, deleteLesson);
router.post('/courses/:courseId/lessons/reorder', authenticate, reorderLessons);

// Student lesson progress
router.post('/:id/complete', authenticate, toggleLessonProgress);

export default router;
export { router as lessonsRouter };
