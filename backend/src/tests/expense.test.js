import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../server.js';
import User from '../models/User.js';
import Group from '../models/Group.js';
import Expense from '../models/Expense.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { sendExpenseAddedEmail } from '../utils/emailService.js';


describe('Expense Routes', () => {
  let token;
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockGroupId = '507f191e810c19729de860ea';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'testsecret';
    token = jwt.sign({ id: mockUserId }, process.env.JWT_SECRET);
    
    // Mock for auth middleware
    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: mockUserId, name: 'Test User' })
    });

    jest.spyOn(mongoose, 'startSession').mockResolvedValue({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    });
  });

  it('should successfully create a new expense (happy path)', async () => {
    // Group check in createExpense
    jest.spyOn(Group, 'findById').mockResolvedValue({ 
      _id: mockGroupId, 
      members: [mockUserId],
      save: jest.fn().mockResolvedValue(),
      populate: jest.fn().mockReturnThis()
    });
    
    const mockExpense = {
      _id: 'exp123',
      description: 'Dinner',
      amountPaise: 5000,
      group: mockGroupId,
      paidBy: mockUserId,
      populate: jest.fn().mockReturnThis()
    };
    jest.spyOn(Expense, 'create').mockResolvedValue([mockExpense]);

    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        groupId: mockGroupId,
        description: 'Dinner',
        amountPaise: 5000,
        paidBy: mockUserId,
        splitType: 'custom',
        splits: [
          {
            user: mockUserId,
            amountPaise: 5000,
          },
        ],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('expense');
    expect(res.body.expense.description).toBe('Dinner');
  });

  it('should fail to create an expense with negative amount (failure case)', async () => {
    // No mocks needed, Zod rejects this before the controller runs.

    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        groupId: mockGroupId,
        description: 'Bad Expense',
        amountPaise: -10, // Invalid
        splitType: 'custom',
        paidBy: mockUserId,
        splits: [
          {
            user: mockUserId,
            amountPaise: -10,
          },
        ],
      });

    expect(res.statusCode).toBe(400);
  });

  it('should fail to create an expense due to database error (controller failure)', async () => {
    jest.spyOn(Group, 'findById').mockResolvedValue({ _id: mockGroupId, members: [mockUserId] });
    jest.spyOn(Expense, 'create').mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        groupId: mockGroupId,
        description: 'Valid Expense',
        amountPaise: 5000,
        paidBy: mockUserId,
        splitType: 'custom',
        splits: [{ user: mockUserId, amountPaise: 5000 }],
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Failed to create expense');
  });

  it('should successfully record a new settlement (happy path)', async () => {
    // End-to-end test for createSettlement to ensure groupName reference bug is fixed
    const mockReceiverId = '507f1f77bcf86cd799439022';
    
    jest.spyOn(Group, 'findById').mockResolvedValue({ 
      _id: mockGroupId, 
      name: 'Test Group',
      members: [mockUserId, mockReceiverId],
      save: jest.fn().mockResolvedValue(),
      populate: jest.fn().mockReturnThis()
    });
    
    const mockSettlement = {
      _id: 'set123',
      description: 'Settlement Payment',
      amountPaise: 1000,
      group: mockGroupId,
      groupName: 'Test Group',
      paidBy: mockUserId,
      splits: [{ user: mockReceiverId, amountPaise: 1000 }],
      isSettlement: true,
      populate: jest.fn().mockReturnThis()
    };
    jest.spyOn(Expense, 'create').mockResolvedValue([mockSettlement]);

    const res = await request(app)
      .post('/api/expenses/settle')
      .set('Authorization', `Bearer ${token}`)
      .send({
        groupId: mockGroupId,
        payerId: mockUserId,
        receiverId: mockReceiverId,
        amountPaise: 1000,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('settlement');
    expect(res.body.settlement.description).toBe('Settlement Payment');
    expect(res.body.settlement.groupName).toBe('Test Group');
  });
});
