import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

import QuizResultsPage from '../src/pages/QuizResultsPage';
import { quizApi } from '../src/lib/api';
import { useGlobalContext } from '../src/context/GlobalContext';
import confetti from 'canvas-confetti';

// ---------- Mocks ----------
// Mock API
vi.mock('../src/lib/api');

// Mock confetti (default export)
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

// Mock Context
vi.mock('../src/context/GlobalContext', () => ({
  useGlobalContext: vi.fn(),
}));

// Mock react-router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'quiz-123' }),
  };
});

// ---------- Setup ----------
describe('QuizResultsPage', () => {
  let queryClient;

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <QuizResultsPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
  });

  // ---------------------------
  //    NO RESULTS STATE
  // ---------------------------
  describe('No Results State', () => {
    test('renders "No quiz results found"', () => {
      useGlobalContext.mockReturnValue({
        currentQuiz: null,
        quizAnswers: [],
        timeSpent: 0,
        resetQuiz: vi.fn(),
      });

      renderComponent();

      expect(screen.getByText(/No quiz results found/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Back to Dashboard/i })).toBeInTheDocument();
    });

    test('clicking back navigates home', () => {
      const resetMock = vi.fn();
      useGlobalContext.mockReturnValue({
        currentQuiz: null,
        quizAnswers: [],
        timeSpent: 0,
        resetQuiz: resetMock,
      });

      renderComponent();

      fireEvent.click(screen.getByRole('button', { name: /Back to Dashboard/i }));

      expect(resetMock).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  // ---------------------------
  //    RESULTS + BREAKDOWN
  // ---------------------------
  describe('Results Display', () => {
    const mockQuiz = {
      icon: '🔥',
      title: 'Math Quiz',
      quizQuestions: [
        { question: '1+1?', answer: '2' },
        { question: '3+2?', answer: '5' },
      ],
    };

    const mockAnswers = [
      { isCorrect: true, selectedAnswer: '2' },
      { isCorrect: false, selectedAnswer: '4' },
    ];

    beforeEach(() => {
      useGlobalContext.mockReturnValue({
        currentQuiz: mockQuiz,
        quizAnswers: mockAnswers,
        timeSpent: 20,
        resetQuiz: vi.fn(),
      });

      quizApi.completeQuiz.mockResolvedValue({ success: true });
    });

    test('renders quiz title and percentage', async () => {
      renderComponent();

      expect(screen.getByText(/Math Quiz/)).toBeInTheDocument();
      expect(screen.getByText(/50%/)).toBeInTheDocument();
    });

    test('shows breakdown for each question', () => {
      renderComponent();

      expect(screen.getByText('1+1?')).toBeInTheDocument();
      expect(screen.getByText('3+2?')).toBeInTheDocument();

      // FIXED FOR OPTION A — allow multiple occurrences
      const userAnswers = screen.getAllByText(/Your answer/i);
      expect(userAnswers.length).toBeGreaterThan(0);
    });

    test('submits quiz results automatically', async () => {
      renderComponent();

      await waitFor(() => {
        expect(quizApi.completeQuiz).toHaveBeenCalledWith(
          'quiz-123',
          1,
          2,
          20
        );
      });
    });
  });

  // ---------------------------
  //    CONFETTI TRIGGER
  // ---------------------------
  describe('Confetti', () => {
    test('fires confetti when score >= 70%', async () => {
      useGlobalContext.mockReturnValue({
        currentQuiz: {
          icon: '🌟',
          title: 'Great Quiz',
          quizQuestions: [{ question: 'A?', answer: 'B' }],
        },
        quizAnswers: [{ isCorrect: true }],
        timeSpent: 5,
        resetQuiz: vi.fn(),
      });

      quizApi.completeQuiz.mockResolvedValue({ success: true });

      renderComponent();

      await waitFor(() => {
        expect(confetti).toHaveBeenCalled();
      });
    });

    test('does NOT fire confetti if < 70%', async () => {
      useGlobalContext.mockReturnValue({
        currentQuiz: {
          icon: '🌟',
          title: 'Okay Quiz',
          quizQuestions: [{ question: 'A?', answer: 'B' }],
        },
        quizAnswers: [{ isCorrect: false }],
        timeSpent: 5,
        resetQuiz: vi.fn(),
      });

      quizApi.completeQuiz.mockResolvedValue({ success: true });

      renderComponent();

      expect(confetti).not.toHaveBeenCalled();
    });
  });

  // ---------------------------
  //    ACTION BUTTONS
  // ---------------------------
  describe('Action Buttons', () => {
    test('Retake Quiz button resets and navigates', () => {
      const resetMock = vi.fn();

      useGlobalContext.mockReturnValue({
        currentQuiz: {
          icon: '📘',
          title: 'Example Quiz',
          quizQuestions: [{ question: 'Q1?', answer: 'A1' }],
        },
        quizAnswers: [{ isCorrect: true }],
        timeSpent: 10,
        resetQuiz: resetMock,
      });

      quizApi.completeQuiz.mockResolvedValue({ success: true });

      renderComponent();

      fireEvent.click(screen.getByRole('button', { name: /Retake Quiz/i }));

      expect(resetMock).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/quiz/quiz-123');
    });

    test('Back to Dashboard resets and navigates home', () => {
      const resetMock = vi.fn();

      useGlobalContext.mockReturnValue({
        currentQuiz: {
          icon: '📘',
          title: 'Example Quiz',
          quizQuestions: [{ question: 'Q1?', answer: 'A1' }],
        },
        quizAnswers: [{ isCorrect: true }],
        timeSpent: 10,
        resetQuiz: resetMock,
      });

      renderComponent();

      fireEvent.click(screen.getByRole('button', { name: /Back to Dashboard/i }));

      expect(resetMock).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
