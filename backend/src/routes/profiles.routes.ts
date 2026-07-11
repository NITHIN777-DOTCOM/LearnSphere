import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  updateProfile,
  changePassword,
  uploadAvatar,
} from '../controllers/profiles.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Ensure local uploads directory exists
const UPLOADS_DIR = './uploads';
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

// File filter (only image uploads allowed)
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Update profile text info
router.put('/', authenticate, updateProfile);

// Change user password
router.put('/password', authenticate, changePassword);

// Upload profile avatar photo
router.post('/avatar', authenticate, upload.single('avatar'), uploadAvatar);

export default router;
export { router as profilesRouter };
