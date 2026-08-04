import express from 'express';
import protect from '../middleware/authMiddleware.js';
import calculateBalances from '../utils/balanceCalculator.js';
import simplifyDebts from '../utils/debtSimplifier.js';
import Group from '../models/Group.js';
import User from '../models/User.js';

const router = express.Router();

router.use(protect);

router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId).populate('members', 'name email');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this group' });
    }

    const rawBalances = await calculateBalances(groupId);
    const simplifiedDebts = simplifyDebts(rawBalances);

    const userIds = Object.keys(rawBalances);
    const users = await User.find({ _id: { $in: userIds } }).select('name email');
    const userMap = {};
    users.forEach((u) => {
      userMap[u._id.toString()] = { name: u.name, email: u.email };
    });

    const namedBalances = Object.entries(rawBalances).map(([userId, amountPaise]) => ({
      userId,
      user: userMap[userId] || null,
      amountPaise,
    }));

    const namedDebts = simplifiedDebts.map((debt) => ({
      ...debt,
      fromUser: userMap[debt.from] || null,
      toUser: userMap[debt.to] || null,
    }));

    res.status(200).json({
      balances: namedBalances,
      simplifiedDebts: namedDebts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to calculate balances', error: error.message });
  }
});

export default router;
