import express from 'express';
import {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  addMember,
  removeMember,
  deleteGroup,
  getGroupInviteInfo,
  joinGroupViaLink,
} from '../controllers/groupController.js';
import protect from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { createGroupSchema, updateGroupSchema, addMemberSchema } from '../validators/schemas.js';

const router = express.Router();

router.use(protect);

router.get('/', getGroups);
router.post('/', validateBody(createGroupSchema), createGroup);
router.get('/:id', getGroupById);
router.put('/:id', validateBody(updateGroupSchema), updateGroup);
router.post('/:id/members', validateBody(addMemberSchema), addMember);
router.delete('/:id/members/:memberId', removeMember);
router.delete('/:id', deleteGroup);
router.get('/:id/invite-info', getGroupInviteInfo);
router.post('/:id/join', joinGroupViaLink);

export default router;
