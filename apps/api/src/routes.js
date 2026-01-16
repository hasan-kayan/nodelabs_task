import express from 'express';
import authRoutes from './modules/auth/routes.js';
import userRoutes from './modules/users/routes.js';
import projectRoutes from './modules/projects/routes.js';
import taskRoutes from './modules/tasks/routes.js';
import commentRoutes from './modules/comments/routes.js';
import teamRoutes from './modules/teams/routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/comments', commentRoutes);
router.use('/teams', teamRoutes);

export default router;
