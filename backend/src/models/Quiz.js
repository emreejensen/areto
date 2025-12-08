import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    default: '📝'
  },
  timeLimit: {
    type: Number,
    default: null, // null means no time limit, otherwise seconds per question
    min: 5,
    max: 300 // 5 minutes max per question
  },
  quizQuestions: [{
    question: {
      type: String,
      required: true
    },
    options: {
      type: [String],
      required: true,
      validate: [arr => arr.length === 4, 'Must have exactly 4 options']
    },
    answer: {
      type: String,
      required: true
    }
  }],
  totalPlays: {
    type: Number,
    default: 0
  },
  averageSuccessRate: {
    type: Number,
    default: 0
  },
  // ✅ NEW FIELD: fastest completion time in seconds
  fastestCompletion: {
    type: Number,
    default: null // null means no one has finished yet
  },
  createdBy: {
    type: String, // Clerk user ID
    required: true
  }
}, {
  timestamps: true
});

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
