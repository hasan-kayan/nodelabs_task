import express from 'express';
import { commentController } from './controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireMember } from '../../middlewares/rbac.js';

const router = express.Router();

// All routes require authentication and member role
router.use(authenticate);
router.use(requireMember);

router.post('/', commentController.create);
router.get('/task/:taskId', commentController.getByTask);
router.put('/:id', commentController.update);
router.delete('/:id', commentController.delete);

export default router;
