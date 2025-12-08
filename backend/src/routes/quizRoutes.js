import express from 'express';
import Quiz from '../models/Quiz.js';

const router = express.Router();

// GET all quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find().select(
      'title icon quizQuestions totalPlays averageSuccessRate createdAt createdBy'
    );
    res.status(200).json(quizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error.message);
    res.status(500).json({ message: 'Server Error: Could not fetch quizzes.' });
  }
});

// GET quiz by ID
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json(quiz);
  } catch (error) {
    console.error("Error fetching quiz:", error.message);
    res.status(500).json({ message: 'Server Error: Could not fetch quiz.' });
  }
});

// CREATE a quiz
router.post('/', async (req, res) => {
  const { title, icon, quizQuestions, createdBy, timeLimit } = req.body;

  if (!title || !quizQuestions || quizQuestions.length === 0) {
    return res.status(400).json({ message: 'Please include a title and at least one question.' });
  }

  try {
    const newQuiz = new Quiz({
      title,
      icon,
      quizQuestions,
      createdBy: createdBy || 'system',
      timeLimit: timeLimit || null,
    });

    const savedQuiz = await newQuiz.save();
    res.status(201).json(savedQuiz);
  } catch (error) {
    console.error('Error creating quiz:', error.message);
    res.status(500).json({ message: 'Server Error: Could not create quiz.', error: error.message });
  }
});

// UPDATE a quiz
router.put('/:id', async (req, res) => {
  try {
    const { title, icon, quizQuestions, timeLimit, userId } = req.body; // Add userId here
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // ADD THIS AUTHORIZATION CHECK
    if (quiz.createdBy !== userId) {
      return res.status(403).json({ message: 'You do not have permission to edit this quiz' });
    }

    quiz.title = title || quiz.title;
    quiz.icon = icon ?? quiz.icon;
    quiz.quizQuestions = quizQuestions || quiz.quizQuestions;
    quiz.timeLimit = timeLimit ?? quiz.timeLimit;

    const updatedQuiz = await quiz.save();
    res.status(200).json(updatedQuiz);
  } catch (error) {
    console.error('Error updating quiz:', error.message);
    res.status(500).json({ message: 'Server Error: Could not update quiz.' });
  }
});

// DELETE a quiz
router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.body; // or get from query params
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // ADD THIS AUTHORIZATION CHECK
    if (quiz.createdBy !== userId) {
      return res.status(403).json({ message: 'You do not have permission to delete this quiz' });
    }

    await Quiz.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error.message);
    res.status(500).json({ message: 'Server Error: Could not delete quiz.' });
  }
});

export default router;
