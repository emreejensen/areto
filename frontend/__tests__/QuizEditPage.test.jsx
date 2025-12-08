import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { vi } from 'vitest';
import QuizEditPage from '../src/pages/QuizEditPage';
import { quizApi } from '../src/lib/api';
import toast from 'react-hot-toast';

// Mock dependencies
vi.mock('../src/lib/api');
vi.mock('react-hot-toast');

vi.mock('@clerk/clerk-react', () => ({
  ClerkProvider: ({ children }) => children,
  useUser: vi.fn(),
}));

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'test-quiz-id' }),
  };
});

describe('QuizEditPage', () => {
  let queryClient;
  const mockUser = { id: 'user-123' };
  const mockQuiz = {
    id: 'test-quiz-id',
    title: 'Test Quiz',
    icon: '📝',
    timeLimit: 30,
    createdBy: 'user-123',
    quizQuestions: [
      {
        question: 'What is 2+2?',
        options: ['3', '4', '5', '6'],
        answer: '4',
      },
    ],
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    
    vi.clearAllMocks();
    
    // Setup default mocks
    useUser.mockReturnValue({ user: mockUser });
    
    quizApi.getQuizById.mockResolvedValue(mockQuiz);
    quizApi.updateQuiz.mockResolvedValue({ success: true });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <QuizEditPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  describe('Page Loading', () => {
    test('renders loading state initially', () => {
      renderComponent();
      const spinner = document.querySelector('.loading-spinner');
      expect(spinner).toBeInTheDocument();
    });

    test('loads and displays quiz data', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Quiz')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('📝')).toBeInTheDocument();
      expect(screen.getByDisplayValue('30')).toBeInTheDocument();
      expect(screen.getByDisplayValue('What is 2+2?')).toBeInTheDocument();
    });
  });

  describe('Permission Checks', () => {
    test('redirects if user is not the creator', async () => {
      useUser.mockReturnValue({ user: { id: 'different-user' } });

      renderComponent();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('You do not have permission to edit this quiz');
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    test('allows editing if user is the creator', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Quiz')).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Form Editing', () => {
    test('updates quiz title', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Quiz')).toBeInTheDocument();
      });

      const titleInput = screen.getByPlaceholderText('Enter quiz title...');
      fireEvent.change(titleInput, { target: { value: 'Updated Quiz Title' } });

      expect(titleInput.value).toBe('Updated Quiz Title');
    });

    test('updates quiz icon', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('📝')).toBeInTheDocument();
      });

      const iconInput = screen.getByDisplayValue('📝');
      fireEvent.change(iconInput, { target: { value: '🎯' } });

      expect(iconInput.value).toBe('🎯');
    });

    test('updates time limit', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('30')).toBeInTheDocument();
      });

      const timeLimitInput = screen.getByPlaceholderText('e.g., 30');
      fireEvent.change(timeLimitInput, { target: { value: '60' } });

      expect(timeLimitInput.value).toBe('60');
    });

    test('updates question text', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('What is 2+2?')).toBeInTheDocument();
      });

      const questionInput = screen.getByPlaceholderText('Enter your question...');
      fireEvent.change(questionInput, { target: { value: 'What is 3+3?' } });

      expect(questionInput.value).toBe('What is 3+3?');
    });

    test('updates answer options', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('What is 2+2?')).toBeInTheDocument();
      });

      const optionInputs = screen.getAllByPlaceholderText(/Option \d/);
      fireEvent.change(optionInputs[1], { target: { value: '10' } });

      expect(optionInputs[1].value).toBe('10');
    });
  });

  describe('Question Management', () => {
    test('adds a new question', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Question 1')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add question/i });
      fireEvent.click(addButton);

      expect(screen.getByText('Question 2')).toBeInTheDocument();
    });

    test('removes a question', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Question 1')).toBeInTheDocument();
      });

      // Add a second question first
      const addButton = screen.getByRole('button', { name: /add question/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Question 2')).toBeInTheDocument();
      });

      // Remove the second question - find delete buttons with SVG inside
      const allButtons = screen.getAllByRole('button');
      const deleteButton = allButtons.find(btn => 
        btn.querySelector('svg') && 
        btn.classList.contains('btn-circle') &&
        btn.classList.contains('text-error')
      );
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
      }

      // Wait a bit for the update
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    test('prevents removing the last question', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Question 1')).toBeInTheDocument();
      });

      // Should not show delete button when only one question exists
      const deleteButtons = screen.queryAllByRole('button', { name: '' });
      const trashButtons = deleteButtons.filter(btn => 
        btn.querySelector('svg') && btn.classList.contains('text-error')
      );

      expect(trashButtons.length).toBe(0);
    });
  });

  describe('Form Validation', () => {
    test('shows error when title is empty', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Quiz')).toBeInTheDocument();
      });

      const titleInput = screen.getByPlaceholderText('Enter quiz title...');
      fireEvent.change(titleInput, { target: { value: '' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please enter a quiz title');
      });
    });

    test('shows error when question fields are incomplete', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('What is 2+2?')).toBeInTheDocument();
      });

      const questionInput = screen.getByPlaceholderText('Enter your question...');
      fireEvent.change(questionInput, { target: { value: '' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Please fill in all questions, options, and answers'
        );
      });
    });
  });

  describe('Form Submission', () => {
    test('successfully updates quiz', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Quiz')).toBeInTheDocument();
      });

      const titleInput = screen.getByPlaceholderText('Enter quiz title...');
      fireEvent.change(titleInput, { target: { value: 'Updated Quiz' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(quizApi.updateQuiz).toHaveBeenCalledWith(
          'test-quiz-id',
          expect.objectContaining({
            title: 'Updated Quiz',
            icon: '📝',
            timeLimit: 30,
          }),
          'user-123'
        );
      });

      expect(toast.success).toHaveBeenCalledWith('Quiz updated successfully!');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('handles update failure', async () => {
      quizApi.updateQuiz.mockRejectedValue(new Error('Update failed'));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Quiz')).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to update quiz');
      });
    });

    test('shows loading state during submission', async () => {
      // Make the mutation take longer so we can catch the loading state
      let resolveMutation;
      quizApi.updateQuiz.mockReturnValue(
        new Promise((resolve) => {
          resolveMutation = resolve;
        })
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Quiz')).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      // Check for loading spinner by class
      await waitFor(() => {
        const spinner = document.querySelector('.loading-spinner');
        expect(spinner).toBeInTheDocument();
      });

      // Resolve the mutation
      if (resolveMutation) {
        resolveMutation({ success: true });
      }
    });
  });

  describe('Navigation', () => {
    test('navigates back when back button is clicked', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Quiz')).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: '' });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});