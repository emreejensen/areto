import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import quizRouter from '../src/routes/quizRoutes.js';
import Quiz from '../src/models/Quiz.js';

const app = express();
app.use(express.json());
app.use('/api/quizzes', quizRouter);

let mongoServer;

describe('Quiz Routes', () => {
  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('GET /api/quizzes', () => {
    it('should return an empty array when no quizzes exist', async () => {
      const res = await request(app).get('/api/quizzes');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return all quizzes with selected fields', async () => {
      const quiz1 = await Quiz.create({
        title: 'JavaScript Basics',
        icon: '💻',
        quizQuestions: [
          {
            question: 'What is 2+2?',
            options: ['3', '4', '5', '6'],
            answer: '4',
          },
        ],
        createdBy: 'user123',
      });

      const quiz2 = await Quiz.create({
        title: 'React Fundamentals',
        icon: '⚛️',
        quizQuestions: [
          {
            question: 'What is JSX?',
            options: ['HTML', 'JavaScript', 'Syntax Extension', 'Framework'],
            answer: 'Syntax Extension',
          },
        ],
        createdBy: 'user456',
      });

      const res = await request(app).get('/api/quizzes');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('icon');
      expect(res.body[0]).toHaveProperty('quizQuestions');
      expect(res.body[0]).toHaveProperty('totalPlays');
      expect(res.body[0]).toHaveProperty('averageSuccessRate');
      expect(res.body[0]).toHaveProperty('createdBy');
    });

    it('should handle server errors gracefully', async () => {
      vi.spyOn(Quiz, 'find').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const res = await request(app).get('/api/quizzes');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('Server Error');
    });
  });

  describe('GET /api/quizzes/:id', () => {
    it('should return a quiz by ID', async () => {
      const quiz = await Quiz.create({
        title: 'Test Quiz',
        icon: '📝',
        quizQuestions: [
          {
            question: 'Sample question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
        timeLimit: 60,
      });

      const res = await request(app).get(`/api/quizzes/${quiz._id}`);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Test Quiz');
      expect(res.body.icon).toBe('📝');
      expect(res.body.timeLimit).toBe(60);
      expect(res.body.quizQuestions).toHaveLength(1);
    });

    it('should return 404 when quiz not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/quizzes/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Quiz not found');
    });

    it('should return 500 for invalid ID format', async () => {
      const res = await request(app).get('/api/quizzes/invalid-id');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /api/quizzes', () => {
    it('should create a new quiz with valid data', async () => {
      const newQuiz = {
        title: 'New Quiz',
        icon: '🎯',
        quizQuestions: [
          {
            question: 'Test question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'B',
          },
        ],
        createdBy: 'user123',
        timeLimit: 45,
      };

      const res = await request(app).post('/api/quizzes').send(newQuiz);

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('New Quiz');
      expect(res.body.icon).toBe('🎯');
      expect(res.body.timeLimit).toBe(45);
      expect(res.body.createdBy).toBe('user123');
      expect(res.body.quizQuestions).toHaveLength(1);
    });

    it('should create quiz with default values when optional fields omitted', async () => {
      const newQuiz = {
        title: 'Minimal Quiz',
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
      };

      const res = await request(app).post('/api/quizzes').send(newQuiz);

      expect(res.status).toBe(201);
      expect(res.body.icon).toBe('📝'); // default icon
      expect(res.body.createdBy).toBe('system'); // default creator
      expect(res.body.timeLimit).toBeNull(); // default null
    });

    it('should return 400 when title is missing', async () => {
      const newQuiz = {
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
      };

      const res = await request(app).post('/api/quizzes').send(newQuiz);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('title');
    });

    it('should return 400 when quizQuestions is empty', async () => {
      const newQuiz = {
        title: 'Empty Quiz',
        quizQuestions: [],
      };

      const res = await request(app).post('/api/quizzes').send(newQuiz);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('at least one question');
    });

    it('should return 400 when quizQuestions is missing', async () => {
      const newQuiz = {
        title: 'No Questions Quiz',
      };

      const res = await request(app).post('/api/quizzes').send(newQuiz);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('at least one question');
    });
  });

  describe('PUT /api/quizzes/:id', () => {
    it('should update a quiz when user is the creator', async () => {
      const quiz = await Quiz.create({
        title: 'Original Title',
        icon: '📝',
        quizQuestions: [
          {
            question: 'Original question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
        timeLimit: 30,
      });

      const updates = {
        title: 'Updated Title',
        icon: '🎯',
        timeLimit: 60,
        userId: 'user123',
      };

      const res = await request(app)
        .put(`/api/quizzes/${quiz._id}`)
        .send(updates);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Title');
      expect(res.body.icon).toBe('🎯');
      expect(res.body.timeLimit).toBe(60);
    });

    it('should update quiz questions', async () => {
      const quiz = await Quiz.create({
        title: 'Test Quiz',
        icon: '📝',
        quizQuestions: [
          {
            question: 'Original?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
      });

      const updates = {
        quizQuestions: [
          {
            question: 'Updated?',
            options: ['1', '2', '3', '4'],
            answer: '1',
          },
          {
            question: 'New question?',
            options: ['W', 'X', 'Y', 'Z'],
            answer: 'Y',
          },
        ],
        userId: 'user123',
      };

      const res = await request(app)
        .put(`/api/quizzes/${quiz._id}`)
        .send(updates);

      expect(res.status).toBe(200);
      expect(res.body.quizQuestions).toHaveLength(2);
      expect(res.body.quizQuestions[0].question).toBe('Updated?');
      expect(res.body.quizQuestions[1].question).toBe('New question?');
    });

    it('should return 403 when user is not the creator', async () => {
      const quiz = await Quiz.create({
        title: 'Test Quiz',
        icon: '📝',
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
      });

      const updates = {
        title: 'Hacked Title',
        userId: 'user456', // Different user
      };

      const res = await request(app)
        .put(`/api/quizzes/${quiz._id}`)
        .send(updates);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('permission');
    });

    it('should return 404 when quiz not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updates = {
        title: 'Updated',
        userId: 'user123',
      };

      const res = await request(app).put(`/api/quizzes/${fakeId}`).send(updates);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Quiz not found');
    });

    it('should preserve fields not included in update', async () => {
      const quiz = await Quiz.create({
        title: 'Test Quiz',
        icon: '📝',
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
        timeLimit: 30,
      });

      const updates = {
        title: 'Updated Title',
        userId: 'user123',
        // Not updating icon, quizQuestions, or timeLimit
      };

      const res = await request(app)
        .put(`/api/quizzes/${quiz._id}`)
        .send(updates);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Title');
      expect(res.body.icon).toBe('📝'); // Unchanged
      expect(res.body.timeLimit).toBe(30); // Unchanged
      expect(res.body.quizQuestions).toHaveLength(1); // Unchanged
    });
  });

  describe('DELETE /api/quizzes/:id', () => {
    it('should delete a quiz when user is the creator', async () => {
      const quiz = await Quiz.create({
        title: 'To Delete',
        icon: '📝',
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
      });

      const res = await request(app)
        .delete(`/api/quizzes/${quiz._id}`)
        .send({ userId: 'user123' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Quiz deleted successfully');

      // Verify quiz is actually deleted
      const deletedQuiz = await Quiz.findById(quiz._id);
      expect(deletedQuiz).toBeNull();
    });

    it('should return 403 when user is not the creator', async () => {
      const quiz = await Quiz.create({
        title: 'Protected Quiz',
        icon: '📝',
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
      });

      const res = await request(app)
        .delete(`/api/quizzes/${quiz._id}`)
        .send({ userId: 'user456' }); // Different user

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('permission');

      // Verify quiz still exists
      const existingQuiz = await Quiz.findById(quiz._id);
      expect(existingQuiz).not.toBeNull();
    });

    it('should return 404 when quiz not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/quizzes/${fakeId}`)
        .send({ userId: 'user123' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Quiz not found');
    });

    it('should return 500 for invalid ID format', async () => {
      const res = await request(app)
        .delete('/api/quizzes/invalid-id')
        .send({ userId: 'user123' });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message');
    });
  });
});