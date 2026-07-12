import { Router } from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  editCourse,
  deleteCourse,
  publishCourse,
  unpublishCourse,
  enrollCourse,
} from '../controllers/courses.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';

const router = Router();

// Browse & filter courses
router.get('/', optionalAuthenticate, getCourses);
router.get('/:id', optionalAuthenticate, getCourseById);

// Manage courses (Instructor/Admin)
router.post('/', authenticate, createCourse);
router.put('/:id', authenticate, editCourse);
router.delete('/:id', authenticate, deleteCourse);
router.post('/:id/publish', authenticate, publishCourse);
router.post('/:id/unpublish', authenticate, unpublishCourse);

// Student enrollment
router.post('/:id/enroll', authenticate, enrollCourse);

export default router;
export { router as coursesRouter };
