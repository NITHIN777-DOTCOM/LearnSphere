import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { authRouter } from './routes/auth.routes.js';
import { coursesRouter } from './routes/courses.routes.js';
import { lessonsRouter } from './routes/lessons.routes.js';
import { assignmentsRouter } from './routes/assignments.routes.js';
import { quizzesRouter } from './routes/quizzes.routes.js';
import { dashboardsRouter } from './routes/dashboards.routes.js';
import { profilesRouter } from './routes/profiles.routes.js';
import { adminRouter } from './routes/admin.routes.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Customize for production
  credentials: true,
}));
app.use(express.json());

// Serve local upload files statically
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/lessons', lessonsRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/quizzes', quizzesRouter);
app.use('/api/dashboard', dashboardsRouter);
app.use('/api/profile', profilesRouter);
app.use('/api/admin', adminRouter);

// Root Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// Start Server
app.listen(config.port, () => {
  console.log(`[LearnSphere Server] Running on http://localhost:${config.port} in ${config.nodeEnv} mode`);
});
