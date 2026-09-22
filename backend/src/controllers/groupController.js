import Group from '../models/Group.js';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import calculateBalances from '../utils/balanceCalculator.js';

export const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const group = await Group.create({
      name,
      description: description || '',
      members: [req.user._id],
      createdBy: req.user._id,
    });

    await group.populate('members', 'name email');
    await group.populate('createdBy', 'name email');

    res.status(201).json({ group });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create group', error: error.message });
  }
};

export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('members', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ groups });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch groups', error: error.message });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this group' });
    }

    res.status(200).json({ group });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch group', error: error.message });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(memberId => memberId.toString() === req.user._id.toString());
    
    if (!isMember) {
      return res.status(403).json({ message: 'Only group members can update this group' });
    }

    if (name) group.name = name;
    if (description !== undefined) group.description = description;

    await group.save();
    
    await group.populate('members', 'name email');
    await group.populate('createdBy', 'name email');

    res.status(200).json({ group });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update group', error: error.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'Only group members can add new members' });
    }

    const userToAdd = await User.findOne({ email: email.toLowerCase() });

    if (!userToAdd) {
      return res.status(404).json({ message: 'No user found with that email' });
    }

    const alreadyMember = group.members.some(
      (m) => m.toString() === userToAdd._id.toString()
    );

    if (alreadyMember) {
      return res.status(409).json({ message: 'User is already a member of this group' });
    }

    group.members.push(userToAdd._id);
    await group.save();

    await group.populate('members', 'name email');
    await group.populate('createdBy', 'name email');

    res.status(200).json({ group });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add member', error: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id: groupId, memberId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'Only group members can remove members' });
    }

    const memberExists = group.members.some(m => m.toString() === memberId);
    if (!memberExists) {
      return res.status(404).json({ message: 'User is not a member of this group' });
    }

    const balances = await calculateBalances(groupId);
    const memberBalance = balances[memberId] || 0;

    if (memberBalance !== 0) {
      return res.status(400).json({ message: 'Cannot remove member because their balance is not settled up (₹0)' });
    }

    group.members = group.members.filter(m => m.toString() !== memberId);
    await group.save();

    await group.populate('members', 'name email');
    await group.populate('createdBy', 'name email');

    res.status(200).json({ group, message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove member', error: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(memberId => memberId.toString() === req.user._id.toString());
    
    if (!isMember) {
      return res.status(403).json({ message: 'Only group members can delete this group' });
    }

    await Expense.deleteMany({ group: group._id });
    await group.deleteOne();

    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete group', error: error.message });
  }
};
