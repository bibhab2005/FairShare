import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import mongoose from 'mongoose';
import { sendExpenseAddedEmail } from '../utils/emailService.js';

const validateGroupMembership = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group) return { error: 'Group not found', status: 404 };
  const isMember = group.members.some((m) => m.toString() === userId.toString());
  if (!isMember) return { error: 'Access denied. You are not a member of this group', status: 403 };
  return { group };
};

export const createExpense = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { groupId, description, amountPaise, paidBy, splitType, splits } = req.body;

    const { error, status, group } = await validateGroupMembership(groupId, req.user._id);
    if (error) {
      await session.abortTransaction();
      session.endSession();
      return res.status(status).json({ message: error });
    }

    const paidByIsMember = group.members.some((m) => m.toString() === paidBy.toString());
    if (!paidByIsMember) {
      await session.abortTransaction();
      session.endSession();
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
      computedSplits = splits;
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'splitType must be "equal" or "custom"' });
    }

    const [expense] = await Expense.create([{
      group: groupId,
      description,
      amountPaise,
      paidBy,
      splits: computedSplits,
      createdBy: req.user._id,
      isSettlement: false,
    }], { session });

    group.updatedAt = new Date();
    await group.save({ session });

    await session.commitTransaction();
    session.endSession();

    await expense.populate('paidBy', 'name email avatar upiId username');
    await expense.populate('splits.user', 'name email avatar upiId username');
    await expense.populate('createdBy', 'name email avatar upiId username');

    // Populate group members to get emails
    await group.populate('members', 'email');
    const memberEmails = group.members.map(m => m.email).filter(e => e);

    // Send email notification (non-blocking)
    sendExpenseAddedEmail(
      memberEmails,
      group.name,
      expense.description,
      (expense.amountPaise / 100).toFixed(2), // Convert from paise
      expense.paidBy.name || req.user.name
    ).catch(console.error);

    res.status(201).json({ expense });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Failed to create expense', error: error.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;

    const { error, status } = await validateGroupMembership(groupId, req.user._id);
    if (error) return res.status(status).json({ message: error });

    const expenses = await Expense.find({ group: groupId })
      .populate('paidBy', 'name email avatar upiId username')
      .populate('splits.user', 'name email avatar upiId username')
      .populate('createdBy', 'name email avatar upiId username')
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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { groupId, payerId, receiverId, amountPaise } = req.body;

    const { error, status, group } = await validateGroupMembership(groupId, req.user._id);
    if (error) {
      await session.abortTransaction();
      session.endSession();
      return res.status(status).json({ message: error });
    }

    const [settlement] = await Expense.create([{
      group: groupId,
      groupName: group.name,
      description: 'Settlement Payment',
      amountPaise,
      paidBy: payerId,
      splits: [{ user: receiverId, amountPaise }],
      createdBy: req.user._id,
      isSettlement: true,
    }], { session });

    group.updatedAt = new Date();
    await group.save({ session });

    await session.commitTransaction();
    session.endSession();

    await settlement.populate('paidBy', 'name email avatar upiId username');
    await settlement.populate('splits.user', 'name email avatar upiId username');
    await settlement.populate('createdBy', 'name email avatar upiId username');

    res.status(201).json({ settlement });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Failed to record settlement', error: error.message });
  }
};

export const getMySettlements = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find settlements where current user is receiver or payer
    const settlements = await Expense.find({
      isSettlement: true,
      $or: [
        { 'splits.user': userId },
        { paidBy: userId }
      ]
    })
      .populate('paidBy', 'name email avatar upiId username')
      .populate('splits.user', 'name email avatar upiId username')
      .populate('group', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ settlements });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch settlements', error: error.message });
  }
};

