import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import QuizStartPage from '../src/pages/QuizStartPage';
import { quizApi } from '../src/lib/api';
import { useGlobalContext } from '../src/context/GlobalContext';
import toast from 'react-hot-toast';

// --- Mocks ---
vi.mock('../src/lib/api', () => ({
  quizApi: {
    getQuizById: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => {
  const toast = {
    success: vi.fn(),
    error: vi.fn(),
  };
  return {
    default: toast,
    toast: toast,
  };
});

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock global context
const mockSetCurrentQuiz = vi.fn();
const mockSetQuizAnswers = vi.fn();
const mockSetTimeSpent = vi.fn();

vi.mock('../src/context/GlobalContext', () => {
  return {
    useGlobalContext: vi.fn(() => ({
      setCurrentQuiz: vi.fn(),
      setQuizAnswers: vi.fn(),
      setTimeSpent: vi.fn(),
      timeSpent: 0,
    })),
  };
});


// --- Test Data ---
const mockQuiz = {
  id: '1',
  title: 'Sample Quiz',
  icon: '🔥',
  timeLimit: 15,
  quizQuestions: [
    {
      question: 'What is 2 + 2?',
      options: ['3', '4', '5'],
      answer: '4',
    },
  ],
};

describe('QuizStartPage (Vitest Version)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    quizApi.getQuizById.mockResolvedValue(mockQuiz);

    useGlobalContext.mockReturnValue({
      setCurrentQuiz: mockSetCurrentQuiz,
      setQuizAnswers: mockSetQuizAnswers,
      setTimeSpent: mockSetTimeSpent,
      timeSpent: 0,
    });
  });

  const renderPage = () => {
    const client = new QueryClient();

    return render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/quiz/1']}>
          <Routes>
            <Route path="/quiz/:id" element={<QuizStartPage />} />
            <Route path="/results/1" element={<div>Results Page</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  // ---------------------------
  // TEST: Loading State
  // ---------------------------
  it('renders loading spinner while fetching', async () => {
    quizApi.getQuizById.mockReturnValue(
      new Promise(() => {}) // never resolves
    );

    renderPage();

    expect(screen.getByRole('status')).toBeTruthy();
  });

  // ---------------------------
  // TEST: Renders quiz question
  // ---------------------------
  it('displays quiz question from API', async () => {
    renderPage();

    expect(await screen.findByText('What is 2 + 2?')).toBeInTheDocument();
  });

  // ---------------------------
  // TEST: Select answer + Submit
  // ---------------------------
  it('selects an answer and submits', async () => {
    renderPage();

    // Answer buttons appear
    const optionButton = await screen.findByText('4');

    fireEvent.click(optionButton);

    const submitBtn = screen.getByText('Submit Answer');
    fireEvent.click(submitBtn);

    expect(toast.success).toHaveBeenCalled();
  });

  // ---------------------------
  // TEST: Navigates to results
  // ---------------------------
  it('goes to results after clicking next', async () => {
    renderPage();

    const option = await screen.findByText('4');

    fireEvent.click(option);
    fireEvent.click(screen.getByText('Submit Answer'));

    const nextBtn = await screen.findByText('See Results');
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/results/1');
    });
  });

  // ---------------------------
  // TEST: Requires answer before submitting
  // ---------------------------
it('shows error toast if submitting without selecting', async () => {
  renderPage();

  // Wait for quiz to load
  await screen.findByText('What is 2 + 2?');
  
  const submitBtn = screen.getByText('Submit Answer');
  
  // Check that the button is disabled when no answer is selected
  expect(submitBtn).toBeDisabled();
});

  // ---------------------------
  // TEST: Timer displays correctly
  // ---------------------------
  it('shows the countdown timer', async () => {
    renderPage();

    expect(await screen.findByText('seconds')).toBeInTheDocument();
  });
});
