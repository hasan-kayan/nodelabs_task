import express from 'express';
import { teamController } from './controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireMember } from '../../middlewares/rbac.js';
import { validate } from '../../middlewares/validate.js';
import { 
  createTeamSchema, 
  updateTeamSchema, 
  inviteMemberSchema,
  approveMemberSchema,
  rejectMemberSchema,
} from './validators.js';

const router = express.Router();

// All routes require authentication and member role
router.use(authenticate);
router.use(requireMember);

router.post('/', validate(createTeamSchema), teamController.create);
router.get('/', teamController.getAll);
router.get('/:id', teamController.getById);
router.put('/:id', validate(updateTeamSchema), teamController.update);
router.delete('/:id', teamController.delete);

// Team member management
router.post('/:id/invite', validate(inviteMemberSchema), teamController.inviteMember);
router.post('/:id/approve', validate(approveMemberSchema), teamController.approveMember);
router.post('/:id/reject', validate(rejectMemberSchema), teamController.rejectMember);

// User accepts/rejects their own invitation
router.post('/:id/accept', teamController.acceptInvitation);
router.post('/:id/decline', teamController.rejectInvitation);

export default router;
