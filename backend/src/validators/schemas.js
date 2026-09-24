import { z } from 'zod';

// Reusable custom validators
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');
const upiIdSchema = z.string().regex(/^[\w.-]+@[\w.-]+$/, 'Please enter a valid UPI ID (e.g., name@bank)').optional().or(z.literal(''));
const usernameSchema = z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, underscores, dashes, and periods');

// Auth Schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const setUsernameSchema = z.object({
  username: usernameSchema,
  upiId: upiIdSchema,
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  username: usernameSchema.optional().or(z.literal('')),
  upiId: upiIdSchema,
});

// Group Schemas
export const createGroupSchema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters'),
  description: z.string().optional().default(''),
});

export const updateGroupSchema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters').optional(),
  description: z.string().optional(),
});

export const addMemberSchema = z.object({
  email: z.string().min(1, 'Email is required'),
});

// Expense Schemas
const splitSchema = z.object({
  user: objectIdSchema,
  amountPaise: z.number().int('amountPaise must be an integer').nonnegative('Split amount cannot be negative'),
});

export const createExpenseSchema = z.object({
  groupId: objectIdSchema,
  description: z.string().min(1, 'Description cannot be empty'),
  amountPaise: z.number().int('amountPaise must be an integer').positive('Amount must be greater than zero'),
  paidBy: objectIdSchema,
  splitType: z.enum(['equal', 'custom'], { required_error: 'splitType must be "equal" or "custom"' }),
  splits: z.array(splitSchema).optional(),
}).refine(data => {
  if (data.splitType === 'custom') {
    return Array.isArray(data.splits) && data.splits.length > 0;
  }
  return true;
}, {
  message: 'Custom splits array is required',
  path: ['splits'],
}).refine(data => {
  if (data.splitType === 'custom' && data.splits) {
    const splitTotal = data.splits.reduce((sum, s) => sum + s.amountPaise, 0);
    return splitTotal === data.amountPaise;
  }
  return true;
}, {
  message: 'Custom splits total must equal amountPaise',
  path: ['splits'],
});

export const createSettlementSchema = z.object({
  groupId: objectIdSchema,
  payerId: objectIdSchema,
  receiverId: objectIdSchema,
  amountPaise: z.number().int('amountPaise must be an integer').positive('amountPaise must be a positive integer'),
});
