import express from 'express';
import { projectController } from './controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireMember } from '../../middlewares/rbac.js';
import { validate } from '../../middlewares/validate.js';
import { createProjectSchema, updateProjectSchema } from './validators.js';

const router = express.Router();

// All routes require authentication and member role
router.use(authenticate);
router.use(requireMember);

router.post('/', validate(createProjectSchema), projectController.create);
router.get('/', projectController.getAll);
router.get('/:id', projectController.getById);
router.put('/:id', validate(updateProjectSchema), projectController.update);
router.delete('/:id', projectController.delete);

export default router;
