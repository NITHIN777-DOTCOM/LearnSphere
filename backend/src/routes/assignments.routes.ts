import { Router } from 'express';
import {
  createAssignment,
  editAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
  getSubmissionsByAssignmentId,
} from '../controllers/assignments.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Manage assignments (Instructor/Admin)
router.post('/courses/:courseId/assignments', authenticate, createAssignment);
router.put('/:id', authenticate, editAssignment);
router.delete('/:id', authenticate, deleteAssignment);
router.get('/:id/submissions', authenticate, getSubmissionsByAssignmentId);

// Student submissions
router.post('/:id/submit', authenticate, submitAssignment);

// Grading
router.post('/submissions/:submissionId/grade', authenticate, gradeSubmission);

export default router;
export { router as assignmentsRouter };
