import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from '../routes/auth.js';
import User from '../models/User.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth API', () => {
  beforeAll(async () => {
    // Note: Provide an actual mock MongoDB connection using something like mongodb-memory-server or just distinct testing DB
    // e.g. await mongoose.connect(process.env.MONGO_URI_TEST);
  });

  afterAll(async () => {
    // await mongoose.connection.close();
  });

  it('should reject registration if fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Name, email and password are required');
  });

  it('should reject registration if password is less than 6 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'john@example.com',
      password: '123'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Password must be at least 6 characters long');
  });
});
