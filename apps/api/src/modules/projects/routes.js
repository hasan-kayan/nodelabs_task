import express from 'express';
import { projectController } from './controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireMember } from '../../middlewares/rbac.js';

const router = express.Router();

// All routes require authentication and member role
router.use(authenticate);
router.use(requireMember);

router.post('/', projectController.create);
router.get('/', projectController.getAll);
router.get('/:id', projectController.getById);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.delete);

export default router;
