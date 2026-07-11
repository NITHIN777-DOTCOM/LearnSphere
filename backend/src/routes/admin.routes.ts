import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { Role } from '@prisma/client';
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllCourses,
  updateCourseStatus,
} from '../controllers/admin.controller.js';

const router = Router();

// Protect all routes to only ADMIN role
router.use(authenticate);
router.use(authorize([Role.ADMIN]));

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/courses', getAllCourses);
router.put('/courses/:id/status', updateCourseStatus);

export default router;
export { router as adminRouter };
