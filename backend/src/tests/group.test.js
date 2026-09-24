import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../server.js';
import User from '../models/User.js';
import Group from '../models/Group.js';
import jwt from 'jsonwebtoken';

describe('Group Routes', () => {
  let token;
  const mockUserId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'testsecret';
    token = jwt.sign({ id: mockUserId }, process.env.JWT_SECRET);
    
    // Mock for auth middleware
    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: mockUserId, name: 'Test User' })
    });
  });

  it('should successfully create a new group (happy path)', async () => {
    const mockGroup = {
      _id: '507f191e810c19729de860ea',
      name: 'Trip to Paris',
      members: [mockUserId],
      populate: jest.fn().mockReturnThis()
    };
    Group.prototype.save = jest.fn().mockResolvedValue();
    jest.spyOn(Group, 'create').mockResolvedValue(mockGroup);

    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Trip to Paris',
        description: 'Expenses for Paris trip',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.group.name).toBe('Trip to Paris');
  });

  it('should fail to create a group without a name (failure case)', async () => {
    // No mocks needed here, Zod catches it before the controller runs.

    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Missing name',
      });

    expect(res.statusCode).toBe(400);
  });

  it('should fail to create a group due to database error (controller failure)', async () => {
    jest.spyOn(Group, 'create').mockRejectedValue(new Error('Database connection lost'));

    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Valid Name',
        description: 'Valid description',
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Failed to create group');
  });
});
