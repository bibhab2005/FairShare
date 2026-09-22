import Expense from '../models/Expense.js';
import Group from '../models/Group.js';

const validateGroupMembership = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) return { error: 'Group not found', status: 404 };
  const isMember = group.members.some((m) => m.toString() === userId.toString());
  if (!isMember) return { error: 'Access denied. You are not a member of this group', status: 403 };
  return { group };
};

export const createExpense = async (req, res) => {
  try {
    const { groupId, description, amountPaise, paidBy, splitType, splits } = req.body;

    if (!groupId || !description || !amountPaise || !paidBy || !splitType) {
      return res.status(400).json({ message: 'groupId, description, amountPaise, paidBy, and splitType are required' });
    }

    if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
      return res.status(400).json({ message: 'amountPaise must be a positive integer' });
    }

    const { error, status, group } = await validateGroupMembership(groupId, req.user._id);
    if (error) return res.status(status).json({ message: error });

    const paidByIsMember = group.members.some((m) => m.toString() === paidBy.toString());
    if (!paidByIsMember) {
      return res.status(400).json({ message: 'The payer must be a member of the group' });
    }

    let computedSplits = [];

    if (splitType === 'equal') {
      const memberCount = group.members.length;
      const baseShare = Math.floor(amountPaise / memberCount);
      const remainder = amountPaise - baseShare * memberCount;

      computedSplits = group.members.map((memberId, index) => ({
        user: memberId,
        amountPaise: index === 0 ? baseShare + remainder : baseShare,
      }));
    } else if (splitType === 'custom') {
      if (!Array.isArray(splits) || splits.length === 0) {
        return res.status(400).json({ message: 'Custom splits array is required' });
      }

      const splitTotal = splits.reduce((sum, s) => sum + s.amountPaise, 0);
      if (splitTotal !== amountPaise) {
        return res.status(400).json({
          message: `Custom splits total (${splitTotal}) must equal amountPaise (${amountPaise})`,
        });
      }

      for (const split of splits) {
        if (!Number.isInteger(split.amountPaise) || split.amountPaise < 0) {
          return res.status(400).json({ message: 'Each split amountPaise must be a non-negative integer' });
        }
      }

      computedSplits = splits;
    } else {
      return res.status(400).json({ message: 'splitType must be "equal" or "custom"' });
    }

    const expense = await Expense.create({
      group: groupId,
      description,
      amountPaise,
      paidBy,
      splits: computedSplits,
      createdBy: req.user._id,
      isSettlement: false,
    });

    await expense.populate('paidBy', 'name email');
    await expense.populate('splits.user', 'name email');
    await expense.populate('createdBy', 'name email');

    res.status(201).json({ expense });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create expense', error: error.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;

    const { error, status } = await validateGroupMembership(groupId, req.user._id);
    if (error) return res.status(status).json({ message: error });

    const expenses = await Expense.find({ group: groupId })
      .populate('paidBy', 'name email')
      .populate('splits.user', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ expenses });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch expenses', error: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const { error, status } = await validateGroupMembership(expense.group, req.user._id);
    if (error) return res.status(status).json({ message: error });

    await expense.deleteOne();

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete expense', error: error.message });
  }
};

export const createSettlement = async (req, res) => {
  try {
    const { groupId, payerId, receiverId, amountPaise } = req.body;

    if (!groupId || !payerId || !receiverId || !amountPaise) {
      return res.status(400).json({ message: 'groupId, payerId, receiverId, and amountPaise are required' });
    }

    if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
      return res.status(400).json({ message: 'amountPaise must be a positive integer' });
    }

    const { error, status } = await validateGroupMembership(groupId, req.user._id);
    if (error) return res.status(status).json({ message: error });

    const settlement = await Expense.create({
      group: groupId,
      description: 'Settlement Payment',
      amountPaise,
      paidBy: payerId,
      splits: [{ user: receiverId, amountPaise }],
      createdBy: req.user._id,
      isSettlement: true,
    });

    await settlement.populate('paidBy', 'name email');
    await settlement.populate('splits.user', 'name email');
    await settlement.populate('createdBy', 'name email');

    res.status(201).json({ settlement });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record settlement', error: error.message });
  }
};
