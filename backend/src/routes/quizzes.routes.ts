import { Router } from 'express';
import {
  createQuiz,
  editQuiz,
  deleteQuiz,
  getQuizById,
  attemptQuiz,
} from '../controllers/quizzes.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Manage quizzes (Instructor/Admin)
router.post('/courses/:courseId/quizzes', authenticate, createQuiz);
router.put('/:id', authenticate, editQuiz);
router.delete('/:id', authenticate, deleteQuiz);

// Student quizzes
router.get('/:id', authenticate, getQuizById);
router.post('/:id/attempt', authenticate, attemptQuiz);

export default router;
export { router as quizzesRouter };
