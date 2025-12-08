 import axios from 'axios';

// Update this with your actual backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const quizApi = {
  getAllQuizzes: async () => {
    const response = await api.get('/quizzes');
    return response.data;
  },

  getQuizById: async (id) => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  createQuiz: async (quizData) => {
    const response = await api.post('/quizzes', quizData);
    return response.data;
  },

  updateQuiz: async (id, quizData, userId) => {
    const response = await api.put(`/quizzes/${id}`, { ...quizData, userId });
    return response.data;
  },

  deleteQuiz: async (id, userId) => {
    await api.delete(`/quizzes/${id}`, { data: { userId } });
  },

completeQuiz: async (id, score, totalQuestions, timeSpent) => {
  const response = await api.post(`/quizzes/${id}/complete`, {
    score,
    totalQuestions,
    timeSpent,
  });
  return response.data;
},



};
