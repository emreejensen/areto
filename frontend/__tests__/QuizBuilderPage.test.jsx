import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import QuizBuilderPage from '../src/pages/QuizBuilderPage';
import { quizApi } from '../src/lib/api';
import toast from 'react-hot-toast';

// Mock dependencies
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ userId: 'test-user-123' }),
}));

vi.mock('../src/lib/api', () => ({
  quizApi: {
    createQuiz: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const renderWithProviders = (component) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('QuizBuilderPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the quiz builder page with initial form', () => {
      renderWithProviders(<QuizBuilderPage />);

      expect(screen.getByText('Quiz Builder')).toBeInTheDocument();
      expect(screen.getByText('Create an amazing quiz')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter quiz title...')).toBeInTheDocument();
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    it('renders all form fields', () => {
      renderWithProviders(<QuizBuilderPage />);

      expect(screen.getByPlaceholderText('Enter quiz title...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('📝')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., 30')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your question...')).toBeInTheDocument();
      expect(screen.getAllByPlaceholderText(/Option \d/)).toHaveLength(4);
      expect(screen.getByText('Select correct answer...')).toBeInTheDocument();
    });

    it('renders action buttons', () => {
      renderWithProviders(<QuizBuilderPage />);

      expect(screen.getByRole('button', { name: /Add Question/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create Quiz/i })).toBeInTheDocument();
    });
  });

  describe('Form Input', () => {
    it('allows user to enter quiz title', async () => {
      const user = userEvent.setup();
      renderWithProviders(<QuizBuilderPage />);

      const titleInput = screen.getByPlaceholderText('Enter quiz title...');
      await user.type(titleInput, 'My Awesome Quiz');

      expect(titleInput).toHaveValue('My Awesome Quiz');
    });

    it('allows user to change icon', async () => {
      const user = userEvent.setup();
      renderWithProviders(<QuizBuilderPage />);

      const iconInput = screen.getByPlaceholderText('📝');
      await user.clear(iconInput);
      await user.type(iconInput, '🎮');

      expect(iconInput).toHaveValue('🎮');
    });

    it('allows user to set time limit', async () => {
      const user = userEvent.setup();
      renderWithProviders(<QuizBuilderPage />);

      const timeLimitInput = screen.getByPlaceholderText('e.g., 30');
      await user.type(timeLimitInput, '60');

      expect(timeLimitInput).toHaveValue(60);
      expect(screen.getByText(/Players will have 60 seconds/i)).toBeInTheDocument();
    });

    it('allows user to enter question text', async () => {
      const user = userEvent.setup();
      renderWithProviders(<QuizBuilderPage />);

      const questionInput = screen.getByPlaceholderText('Enter your question...');
      await user.type(questionInput, 'What is 2+2?');

      expect(questionInput).toHaveValue('What is 2+2?');
    });

    it('allows user to enter option values', async () => {
      const user = userEvent.setup();
      renderWithProviders(<QuizBuilderPage />);

      const options = screen.getAllByPlaceholderText(/Option \d/);
      await user.type(options[0], '3');
      await user.type(options[1], '4');
      await user.type(options[2], '5');
      await user.type(options[3], '6');

      expect(options[0]).toHaveValue('3');
      expect(options[1]).toHaveValue('4');
      expect(options[2]).toHaveValue('5');
      expect(options[3]).toHaveValue('6');
    });

    it('allows user to select correct answer', async () => {
      const user = userEvent.setup();
      renderWithProviders(<QuizBuilderPage />);

      // Fill in options first
      const options = screen.getAllByPlaceholderText(/Option \d/);
      await user.type(options[0], '3');
      await user.type(options[1], '4');

      // Select correct answer
      const answerSelect = screen.getByRole('combobox');
      await user.selectOptions(answerSelect, '4');

      expect(answerSelect).toHaveValue('4');
    });
  });

  describe('Adding and Removing Questions', () => {
    it('adds a new question when "Add Question" is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<QuizBuilderPage />);

      expect(screen.getByText('Question 1')).toBeInTheDocument();
      expect(screen.queryByText('Question 2')).not.toBeInTheDocument();

      const addButton = screen.getByRole('button', { name: /Add Question/i });
      await user.click(addButton);

      expect(screen.getByText('Question 2')).toBeInTheDocument();
    });

    it('removes a question when delete button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<QuizBuilderPage />);

      // Add a second question
      const addButton = screen.getByRole('button', { name: /Add Question/i });
      await user.click(addButton);

      expect(screen.getByText('Question 2')).toBeInTheDocument();

      // Remove the second question
      const deleteButtons = screen.getAllByRole('button', { name: '' }).filter(
        btn => btn.querySelector('.lucide-trash-2')
      );
      await user.click(deleteButtons[1]);

      expect(screen.queryByText('Question 2')).not.toBeInTheDocument();
    });

    it('does not show delete button when only one question exists', () => {
      renderWithProviders(<QuizBuilderPage />);

      const deleteButtons = screen.queryAllByRole('button', { name: '' }).filter(
        btn => btn.querySelector('.lucide-trash-2')
      );

      expect(deleteButtons).toHaveLength(0);
    });
  });

  describe('Form Validation', () => {
    it('shows error when submitting without title', async () => {
      const user = userEvent.setup();
      renderWithProviders(<QuizBuilderPage />);

      const submitButton = screen.getByRole('button', { name: /Create Quiz/i });
      await user.click(submitButton);

      expect(toast.error).toHaveBeenCalledWith('Please enter a quiz title');
    });

    it('shows error when submitting with incomplete question', async () => {
      const user = userEvent.setup();
      renderWithProviders(<QuizBuilderPage />);

      // Fill in title only
      const titleInput = screen.getByPlaceholderText('Enter quiz title...');
      await user.type(titleInput, 'Test Quiz');

      const submitButton = screen.getByRole('button', { name: /Create Quiz/i });
      await user.click(submitButton);

      expect(toast.error).toHaveBeenCalledWith(
        'Please fill in all questions, options, and answers'
      );
    });

    it('shows error when options are empty', async () => {
      const user = userEvent.setup();
      renderWithProviders(<QuizBuilderPage />);

      // Fill in title and question
      await user.type(screen.getByPlaceholderText('Enter quiz title...'), 'Test Quiz');
      await user.type(screen.getByPlaceholderText('Enter your question...'), 'Question?');

      // Leave options empty, select answer
      const answerSelect = screen.getByRole('combobox');
      await user.selectOptions(answerSelect, 'Option 1');

      const submitButton = screen.getByRole('button', { name: /Create Quiz/i });
      await user.click(submitButton);

      expect(toast.error).toHaveBeenCalledWith(
        'Please fill in all questions, options, and answers'
      );
    });
  });

  describe('Quiz Creation', () => {
    it('successfully creates a quiz with valid data', async () => {
      const user = userEvent.setup();
      mockNavigate.mockClear();
      quizApi.createQuiz.mockResolvedValue({ id: 'quiz-123' });
      
      renderWithProviders(<QuizBuilderPage />);

      // Fill in all required fields
      await user.type(screen.getByPlaceholderText('Enter quiz title...'), 'Test Quiz');
      await user.type(screen.getByPlaceholderText('Enter your question...'), 'What is 2+2?');
      
      const options = screen.getAllByPlaceholderText(/Option \d/);
      await user.type(options[0], '3');
      await user.type(options[1], '4');
      await user.type(options[2], '5');
      await user.type(options[3], '6');

      const answerSelect = screen.getByRole('combobox');
      await user.selectOptions(answerSelect, '4');

      // Submit
      const submitButton = screen.getByRole('button', { name: /Create Quiz/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(quizApi.createQuiz).toHaveBeenCalled();
        const callArgs = quizApi.createQuiz.mock.calls[0][0];
        expect(callArgs).toEqual({
          title: 'Test Quiz',
          icon: '📝',
          timeLimit: null,
          quizQuestions: [
            {
              question: 'What is 2+2?',
              options: ['3', '4', '5', '6'],
              answer: '4',
            },
          ],
          createdBy: 'test-user-123',
        });
      });

      expect(toast.success).toHaveBeenCalledWith('Quiz created successfully!');
    });

    it('includes time limit when provided', async () => {
      const user = userEvent.setup();
      quizApi.createQuiz.mockResolvedValue({ id: 'quiz-123' });
      
      renderWithProviders(<QuizBuilderPage />);

      // Fill in fields including time limit
      await user.type(screen.getByPlaceholderText('Enter quiz title...'), 'Timed Quiz');
      await user.type(screen.getByPlaceholderText('e.g., 30'), '45');
      await user.type(screen.getByPlaceholderText('Enter your question...'), 'Question?');
      
      const options = screen.getAllByPlaceholderText(/Option \d/);
      await user.type(options[0], 'A');
      await user.type(options[1], 'B');
      await user.type(options[2], 'C');
      await user.type(options[3], 'D');

      await user.selectOptions(screen.getByRole('combobox'), 'A');
      await user.click(screen.getByRole('button', { name: /Create Quiz/i }));

      await waitFor(() => {
        expect(quizApi.createQuiz).toHaveBeenCalled();
        const callArgs = quizApi.createQuiz.mock.calls[0][0];
        expect(callArgs).toMatchObject({
          timeLimit: 45,
        });
      });
    });

    it('handles API error gracefully', async () => {
      const user = userEvent.setup();
      quizApi.createQuiz.mockRejectedValue(new Error('API Error'));
      
      renderWithProviders(<QuizBuilderPage />);

      // Fill in valid data
      await user.type(screen.getByPlaceholderText('Enter quiz title...'), 'Test Quiz');
      await user.type(screen.getByPlaceholderText('Enter your question...'), 'Question?');
      
      const options = screen.getAllByPlaceholderText(/Option \d/);
      await user.type(options[0], 'A');
      await user.type(options[1], 'B');
      await user.type(options[2], 'C');
      await user.type(options[3], 'D');

      await user.selectOptions(screen.getByRole('combobox'), 'A');
      await user.click(screen.getByRole('button', { name: /Create Quiz/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to create quiz');
      });
    });

    it('disables submit button while creating quiz', async () => {
      const user = userEvent.setup();
      quizApi.createQuiz.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderWithProviders(<QuizBuilderPage />);

      // Fill in valid data
      await user.type(screen.getByPlaceholderText('Enter quiz title...'), 'Test Quiz');
      await user.type(screen.getByPlaceholderText('Enter your question...'), 'Question?');
      
      const options = screen.getAllByPlaceholderText(/Option \d/);
      await user.type(options[0], 'A');
      await user.type(options[1], 'B');
      await user.type(options[2], 'C');
      await user.type(options[3], 'D');

      await user.selectOptions(screen.getByRole('combobox'), 'A');

      const submitButton = screen.getByRole('button', { name: /Create Quiz/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates back when back button is clicked', async () => {
      const user = userEvent.setup();
      mockNavigate.mockClear();
      
      renderWithProviders(<QuizBuilderPage />);

      const backButton = screen.getAllByRole('button')[0]; // First button (back arrow)
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});