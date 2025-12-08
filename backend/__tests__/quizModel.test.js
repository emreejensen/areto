import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Quiz from '../src/models/Quiz.js';

let mongoServer;

describe('Quiz Model', () => {
  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('Schema Validation', () => {
    it('should create a quiz with valid data', async () => {
      const validQuiz = {
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
        timeLimit: 60,
      };

      const quiz = await Quiz.create(validQuiz);

      expect(quiz.title).toBe('JavaScript Basics');
      expect(quiz.icon).toBe('💻');
      expect(quiz.timeLimit).toBe(60);
      expect(quiz.createdBy).toBe('user123');
      expect(quiz.quizQuestions).toHaveLength(1);
      expect(quiz.totalPlays).toBe(0);
      expect(quiz.averageSuccessRate).toBe(0);
      expect(quiz.fastestCompletion).toBeNull();
    });

    it('should apply default values correctly', async () => {
      const minimalQuiz = {
        title: 'Minimal Quiz',
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
      };

      const quiz = await Quiz.create(minimalQuiz);

      expect(quiz.icon).toBe('📝'); // Default icon
      expect(quiz.timeLimit).toBeNull(); // Default null
      expect(quiz.totalPlays).toBe(0); // Default 0
      expect(quiz.averageSuccessRate).toBe(0); // Default 0
      expect(quiz.fastestCompletion).toBeNull(); // Default null
    });

    it('should fail when title is missing', async () => {
      const invalidQuiz = {
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
      };

      await expect(Quiz.create(invalidQuiz)).rejects.toThrow();
    });

    it('should fail when createdBy is missing', async () => {
      const invalidQuiz = {
        title: 'Test Quiz',
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
      };

      await expect(Quiz.create(invalidQuiz)).rejects.toThrow();
    });

    it('should trim whitespace from title', async () => {
      const quiz = await Quiz.create({
        title: '  Whitespace Quiz  ',
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
      });

      expect(quiz.title).toBe('Whitespace Quiz');
    });
  });

  describe('Time Limit Validation', () => {
    it('should accept valid time limits', async () => {
      const quiz = await Quiz.create({
        title: 'Timed Quiz',
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
        timeLimit: 120,
      });

      expect(quiz.timeLimit).toBe(120);
    });

    it('should reject time limit below minimum (5 seconds)', async () => {
      const invalidQuiz = {
        title: 'Too Fast Quiz',
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
        timeLimit: 3,
      };

      await expect(Quiz.create(invalidQuiz)).rejects.toThrow();
    });

    it('should reject time limit above maximum (300 seconds)', async () => {
      const invalidQuiz = {
        title: 'Too Slow Quiz',
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
        timeLimit: 400,
      };

      await expect(Quiz.create(invalidQuiz)).rejects.toThrow();
    });

    it('should accept null as time limit', async () => {
      const quiz = await Quiz.create({
        title: 'Untimed Quiz',
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
        timeLimit: null,
      });

      expect(quiz.timeLimit).toBeNull();
    });
  });

  describe('Quiz Questions Validation', () => {
    it('should require question field', async () => {
      const invalidQuiz = {
        title: 'Bad Quiz',
        quizQuestions: [
          {
            // Missing question
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
      };

      await expect(Quiz.create(invalidQuiz)).rejects.toThrow();
    });

    it('should require options field', async () => {
      const invalidQuiz = {
        title: 'Bad Quiz',
        quizQuestions: [
          {
            question: 'Question?',
            // Missing options
            answer: 'A',
          },
        ],
        createdBy: 'user123',
      };

      await expect(Quiz.create(invalidQuiz)).rejects.toThrow();
    });

    it('should require answer field', async () => {
      const invalidQuiz = {
        title: 'Bad Quiz',
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            // Missing answer
          },
        ],
        createdBy: 'user123',
      };

      await expect(Quiz.create(invalidQuiz)).rejects.toThrow();
    });

    it('should require exactly 4 options', async () => {
      const invalidQuiz = {
        title: 'Bad Options Quiz',
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C'], // Only 3 options
            answer: 'A',
          },
        ],
        createdBy: 'user123',
      };

      await expect(Quiz.create(invalidQuiz)).rejects.toThrow(/exactly 4 options/);
    });

    it('should accept multiple questions', async () => {
      const quiz = await Quiz.create({
        title: 'Multi-Question Quiz',
        quizQuestions: [
          {
            question: 'Question 1?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
          {
            question: 'Question 2?',
            options: ['W', 'X', 'Y', 'Z'],
            answer: 'Y',
          },
          {
            question: 'Question 3?',
            options: ['1', '2', '3', '4'],
            answer: '3',
          },
        ],
        createdBy: 'user123',
      });

      expect(quiz.quizQuestions).toHaveLength(3);
      expect(quiz.quizQuestions[0].question).toBe('Question 1?');
      expect(quiz.quizQuestions[1].question).toBe('Question 2?');
      expect(quiz.quizQuestions[2].question).toBe('Question 3?');
    });
  });

  describe('Statistics Fields', () => {
    it('should initialize totalPlays to 0', async () => {
      const quiz = await Quiz.create({
        title: 'Stats Quiz',
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
      });

      expect(quiz.totalPlays).toBe(0);
    });

    it('should initialize averageSuccessRate to 0', async () => {
      const quiz = await Quiz.create({
        title: 'Stats Quiz',
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
      });

      expect(quiz.averageSuccessRate).toBe(0);
    });

    it('should initialize fastestCompletion to null', async () => {
      const quiz = await Quiz.create({
        title: 'Stats Quiz',
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
      });

      expect(quiz.fastestCompletion).toBeNull();
    });

    it('should allow updating statistics', async () => {
      const quiz = await Quiz.create({
        title: 'Stats Quiz',
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
      });

      quiz.totalPlays = 10;
      quiz.averageSuccessRate = 75.5;
      quiz.fastestCompletion = 45;

      const updated = await quiz.save();

      expect(updated.totalPlays).toBe(10);
      expect(updated.averageSuccessRate).toBe(75.5);
      expect(updated.fastestCompletion).toBe(45);
    });
  });

  describe('Timestamps', () => {
    it('should automatically add createdAt and updatedAt timestamps', async () => {
      const quiz = await Quiz.create({
        title: 'Timestamp Quiz',
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
      });

      expect(quiz.createdAt).toBeInstanceOf(Date);
      expect(quiz.updatedAt).toBeInstanceOf(Date);
      expect(quiz.createdAt.getTime()).toBeCloseTo(quiz.updatedAt.getTime(), -2);
    });

    it('should update updatedAt on modification', async () => {
      const quiz = await Quiz.create({
        title: 'Original Title',
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
      });

      const originalUpdatedAt = quiz.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      quiz.title = 'Updated Title';
      const updated = await quiz.save();

      expect(updated.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe('Quiz CRUD Operations', () => {
    it('should find quiz by ID', async () => {
      const created = await Quiz.create({
        title: 'Find Me',
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
      });

      const found = await Quiz.findById(created._id);

      expect(found).not.toBeNull();
      expect(found.title).toBe('Find Me');
      expect(found._id.toString()).toBe(created._id.toString());
    });

    it('should update quiz', async () => {
      const quiz = await Quiz.create({
        title: 'Original',
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
      });

      const updated = await Quiz.findByIdAndUpdate(
        quiz._id,
        { title: 'Updated' },
        { new: true }
      );

      expect(updated.title).toBe('Updated');
    });

    it('should delete quiz', async () => {
      const quiz = await Quiz.create({
        title: 'To Delete',
        quizQuestions: [
          {
            question: 'Question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
      });

      await Quiz.findByIdAndDelete(quiz._id);

      const found = await Quiz.findById(quiz._id);
      expect(found).toBeNull();
    });

    it('should find all quizzes', async () => {
      await Quiz.create({
        title: 'Quiz 1',
        quizQuestions: [
          {
            question: 'Q1?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A',
          },
        ],
        createdBy: 'user123',
      });

      await Quiz.create({
        title: 'Quiz 2',
        quizQuestions: [
          {
            question: 'Q2?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'B',
          },
        ],
        createdBy: 'user456',
      });

      const allQuizzes = await Quiz.find();

      expect(allQuizzes).toHaveLength(2);
    });
  });
});