import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quizApi } from '../lib/api';
import { Plus, Trash2, ArrowLeft, Save, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUser } from '@clerk/clerk-react'; // Add this import at the top

const QuizEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('📝');
  const [timeLimit, setTimeLimit] = useState('');
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], answer: '' },
  ]);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => quizApi.getQuizById(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (quiz) {
      setTitle(quiz.title);
      setIcon(quiz.icon || '📝');
      setTimeLimit(quiz.timeLimit || '');
      setQuestions(quiz.quizQuestions);
    }
  }, [quiz]);

    useEffect(() => {
    if (quiz && user) {
      if (quiz.createdBy !== user.id) {
        toast.error('You do not have permission to edit this quiz');
        navigate('/');
      }
    }
  }, [quiz, user, navigate]);

  const updateQuizMutation = useMutation({
    mutationFn: (data) => quizApi.updateQuiz(id, data, user?.id),
    onSuccess: () => {
      toast.success('Quiz updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      navigate('/');
    },
    onError: () => {
      toast.error('Failed to update quiz');
    },
  });

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: '', options: ['', '', '', ''], answer: '' },
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }

    const invalidQuestion = questions.find(
      (q) =>
        !q.question.trim() ||
        q.options.some((opt) => !opt.trim()) ||
        !q.answer.trim()
    );

    if (invalidQuestion) {
      toast.error('Please fill in all questions, options, and answers');
      return;
    }

    updateQuizMutation.mutate({
      title,
      icon,
      timeLimit: timeLimit ? parseInt(timeLimit) : null,
      quizQuestions: questions,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center" data-theme="night">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200" data-theme="night">
      {/* Header */}
      <div className="bg-base-100 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="btn btn-ghost btn-circle">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-primary">Edit Quiz</h1>
              <p className="text-base-content/70 mt-1">
                Update your quiz
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quiz Details Card */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Quiz Details</h2>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Quiz Title</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter quiz title..."
                  className="input input-bordered input-primary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Icon (emoji)</span>
                </label>
                <input
                  type="text"
                  placeholder="📝"
                  className="input input-bordered input-primary text-2xl"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  maxLength={2}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time Limit (seconds per question)
                  </span>
                  <span className="label-text-alt">Optional - Leave empty for no time limit</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g., 30"
                  className="input input-bordered"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  min="5"
                  max="300"
                />
                {timeLimit && (
                  <label className="label">
                    <span className="label-text-alt text-info">
                      ⏱️ Players will have {timeLimit} seconds to answer each question
                    </span>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Questions */}
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="card bg-base-100 shadow-xl fade-in">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="card-title">Question {qIndex + 1}</h3>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="btn btn-ghost btn-sm btn-circle text-error"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Question</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your question..."
                    className="input input-bordered"
                    value={question.question}
                    onChange={(e) =>
                      updateQuestion(qIndex, 'question', e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="form-control">
                      <label className="label">
                        <span className="label-text">Option {optIndex + 1}</span>
                      </label>
                      <input
                        type="text"
                        placeholder={`Option ${optIndex + 1}`}
                        className="input input-bordered"
                        value={option}
                        onChange={(e) =>
                          updateOption(qIndex, optIndex, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">Correct Answer</span>
                  </label>
                  <select
                    className="select select-bordered select-success"
                    value={question.answer}
                    onChange={(e) =>
                      updateQuestion(qIndex, 'answer', e.target.value)
                    }
                  >
                    <option value="">Select correct answer...</option>
                    {question.options.map((option, optIndex) => (
                      <option key={optIndex} value={option}>
                        {option || `Option ${optIndex + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={addQuestion}
              className="btn btn-outline btn-primary gap-2 flex-1"
            >
              <Plus className="w-5 h-5" />
              Add Question
            </button>
            <button
              type="submit"
              disabled={updateQuizMutation.isPending}
              className="btn btn-primary gap-2 flex-1"
            >
              {updateQuizMutation.isPending ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizEditPage;