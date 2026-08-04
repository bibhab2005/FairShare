import express from 'express';
import {
  createGroup,
  getGroups,
  getGroupById,
  addMember,
} from '../controllers/groupController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getGroups);
router.post('/', createGroup);
router.get('/:id', getGroupById);
router.post('/:id/members', addMember);

export default router;
