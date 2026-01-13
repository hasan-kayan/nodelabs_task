import express from 'express';
import { userController } from './controller.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/sessions', userController.getSessions);

export default router;
