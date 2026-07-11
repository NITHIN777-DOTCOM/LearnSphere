import { Router } from 'express';
import {
  getStudentDashboard,
  getInstructorDashboard,
  getAdminDashboard,
} from '../controllers/dashboards.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { Role } from '@prisma/client';

const router = Router();

router.get('/student', authenticate, authorize([Role.STUDENT, Role.ADMIN]), getStudentDashboard);
router.get('/instructor', authenticate, authorize([Role.INSTRUCTOR, Role.ADMIN]), getInstructorDashboard);
router.get('/admin', authenticate, authorize([Role.ADMIN]), getAdminDashboard);

export default router;
export { router as dashboardsRouter };
