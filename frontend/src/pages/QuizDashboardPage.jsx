import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useUser, SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { quizApi } from '../lib/api';
import { Plus, Play, BarChart3, Clock, Edit, Trash2, AlertTriangle, LogIn, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';

const QuizDashboardPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [sortBy, setSortBy] = useState('myQuizzes'); // 'myQuizzes', 'newest', 'popular', 'mostPlayed'

  const { data: quizzes, isLoading, error } = useQuery({
    queryKey: ['quizzes'],
    queryFn: quizApi.getAllQuizzes,
  });

  const deleteQuizMutation = useMutation({
    mutationFn: (quizId) => quizApi.deleteQuiz(quizId, user?.id),
    onSuccess: () => {
      toast.success('Quiz deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      setQuizToDelete(null);
    },
    onError: () => {
      toast.error('Failed to delete quiz');
    },
  });

  // Sort quizzes based on selected option
  const sortedQuizzes = quizzes ? [...quizzes].sort((a, b) => {
    if (sortBy === 'myQuizzes') {
      // My quizzes first, then others
      const aIsMine = a.createdBy === user?.id;
      const bIsMine = b.createdBy === user?.id;
      if (aIsMine && !bIsMine) return -1;
      if (!aIsMine && bIsMine) return 1;
      // If both mine or both not mine, sort by newest
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'popular') {
      return (b.averageSuccessRate || 0) - (a.averageSuccessRate || 0);
    } else if (sortBy === 'mostPlayed') {
      return (b.totalPlays || 0) - (a.totalPlays || 0);
    }
    return 0;
  }) : [];

  const handleDeleteClick = (quiz) => {
    setQuizToDelete(quiz);
  };

  const confirmDelete = () => {
    if (quizToDelete) {
      deleteQuizMutation.mutate(quizToDelete._id);
    }
  };

  const cancelDelete = () => {
    setQuizToDelete(null);
  };

  const handleEditQuiz = (quizId) => {
    navigate(`/edit/${quizId}`);
  };

  const handleStartQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  const handleCreateQuiz = () => {
    navigate('/create');
  };

  return (
    <div className="min-h-screen bg-base-200" data-theme="night">
      {/* Page Header */}
<div className="bg-base-100 shadow-sm">
  <div className="container mx-auto px-4 py-6">
    <div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Title + Welcome */}
      <div className="text-center sm:text-left">
        <h1 className="text-4xl font-bold text-primary flex items-center justify-center sm:justify-start gap-3">
          <BarChart3 className="w-10 h-10" />
          Quiz Dashboard
        </h1>
        <SignedIn>
          <p className="text-base-content/70 mt-2">
            Welcome back, {user?.firstName || 'User'}! 👋
          </p>
        </SignedIn>
        <SignedOut>
          <p className="text-base-content/70 mt-2">
            Browse quizzes or sign in to create your own
          </p>
        </SignedOut>
      </div>

      {/* Create Quiz Button */}
      <SignedIn>
        <button
          onClick={handleCreateQuiz}
          className="btn btn-primary btn-lg gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Quiz
        </button>
      </SignedIn>
    </div>
  </div>
</div>


      {/* Main Content */}
      <div className="container w-full mx-auto px-4 py-8">
        {/* Sort Controls */}
{quizzes && quizzes.length > 0 && (
  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
    <div className="flex items-center gap-2 flex-wrap">
      <ArrowUpDown className="w-5 h-5 text-base-content/70" />
      <span className="text-base-content/70 font-medium">Sort by:</span>
    </div>
    <div className="flex flex-wrap gap-2">
  <SignedIn>
    <button
      onClick={() => setSortBy('myQuizzes')}
      className={`btn btn-sm w-full sm:w-auto ${sortBy === 'myQuizzes' ? 'btn-primary' : 'btn-ghost'}`}
    >
      My Quizzes
    </button>
  </SignedIn>
  <button
    onClick={() => setSortBy('newest')}
    className={`btn btn-sm w-full sm:w-auto ${sortBy === 'newest' ? 'btn-primary' : 'btn-ghost'}`}
  >
    Newest
  </button>
  <button
    onClick={() => setSortBy('mostPlayed')}
    className={`btn btn-sm w-full sm:w-auto ${sortBy === 'mostPlayed' ? 'btn-primary' : 'btn-ghost'}`}
  >
    Most Played
  </button>
  <button
    onClick={() => setSortBy('popular')}
    className={`btn btn-sm w-full sm:w-auto ${sortBy === 'popular' ? 'btn-primary' : 'btn-ghost'}`}
  >
    Highest Success Rate
  </button>
</div>

  </div>
)}

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : sortedQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedQuizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="card bg-base-100 shadow-xl quiz-card hover:shadow-2xl hover:shadow-primary/20"
              >
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="text-5xl">{quiz.icon || '📝'}</div>
                    <div className="flex flex-col gap-2 items-end">
                      <div className="flex gap-2">
                        <div className="badge badge-secondary">
                          {quiz.quizQuestions?.length || 0} questions
                        </div>
                        {quiz.timeLimit && (
                          <div className="badge badge-accent gap-1">
                            <Clock className="w-3 h-3" />
                            {quiz.timeLimit}s
                          </div>
                        )}
                      </div>
                      {quiz.createdBy === user?.id && (
                        <div className="badge badge-primary badge-sm">My Quiz</div>
                      )}
                    </div>
                  </div>

                  <h2 className="card-title text-2xl mt-4">{quiz.title}</h2>

                  <div className="flex gap-4 mt-4 text-sm text-base-content/70">
                    <div className="flex items-center gap-1">
                      <Play className="w-4 h-4" />
                      <span>{quiz.totalPlays || 0} plays</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      <span>{quiz.averageSuccessRate || 0}% success</span>
                    </div>
                  </div>

                  {quiz.createdAt && (
                    <div className="flex items-center gap-1 text-xs text-base-content/50 mt-2">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="card-actions justify-between mt-4 gap-2">
                    <SignedIn>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditQuiz(quiz._id)}
                          className="btn btn-ghost btn-sm gap-1"
                          title="Edit quiz"
                          disabled={quiz.createdBy !== user?.id} 
                          style={{ opacity: quiz.createdBy !== user?.id ? 0.5 : 1 }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(quiz)}
                          className="btn btn-ghost btn-sm text-error gap-1"
                          title="Delete quiz"
                          disabled={deleteQuizMutation.isPending || quiz.createdBy !== user?.id}
                          style={{ opacity: quiz.createdBy !== user?.id ? 0.5 : 1 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleStartQuiz(quiz._id)}
                        className="btn btn-primary btn-sm gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Start Quiz
                      </button>
                    </SignedIn>
                    <SignedOut>
                      <SignInButton mode="modal">
                        <button className="btn btn-primary btn-sm gap-2 ml-auto">
                          <LogIn className="w-4 h-4" />
                          Sign in to take quiz
                        </button>
                      </SignInButton>
                    </SignedOut>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold mb-2">No quizzes yet</h3>
            <p className="text-base-content/70 mb-6">
              <SignedIn>Create your first quiz to get started!</SignedIn>
              <SignedOut>Sign in to create the first quiz!</SignedOut>
            </p>
            <SignedIn>
              <button
                onClick={handleCreateQuiz}
                className="btn btn-primary gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Quiz
              </button>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn btn-primary gap-2">
                  <LogIn className="w-5 h-5" />
                  Sign In to Create
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {quizToDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-error" />
              <h3 className="font-bold text-2xl">Delete Quiz?</h3>
            </div>
            <p className="py-4">
              Are you sure you want to delete{' '}
              <span className="font-bold text-primary">"{quizToDelete.title}"</span>?
            </p>
            <p className="text-sm text-base-content/70 mb-4">
              This action cannot be undone. All quiz data, including {quizToDelete.totalPlays || 0} play
              {quizToDelete.totalPlays !== 1 ? 's' : ''}, will be permanently deleted.
            </p>
            <div className="modal-action">
              <button
                onClick={cancelDelete}
                className="btn btn-ghost"
                disabled={deleteQuizMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn btn-error gap-2"
                disabled={deleteQuizMutation.isPending}
              >
                {deleteQuizMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Quiz
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={cancelDelete}></div>
        </div>
      )}
    </div>
  );
};

export default QuizDashboardPage;