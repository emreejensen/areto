import { useState, useEffect } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { quizApi } from '../lib/api';
import { useGlobalContext } from '../context/GlobalContext';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const QuizStartPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCurrentQuiz, setQuizAnswers, timeSpent, setTimeSpent } = useGlobalContext();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerExpired, setTimerExpired] = useState(false);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => quizApi.getQuizById(id),
    enabled: !!id,
  });

  // Set quiz in global context and initialize timer
  useEffect(() => {
    if (quiz) {
      setCurrentQuiz(quiz);
      if (quiz.timeLimit) setTimeLeft(quiz.timeLimit);
    }
  }, [quiz, setCurrentQuiz]);

  // Track total time spent across the quiz
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [setTimeSpent]);

  // Countdown per question
  useEffect(() => {
    if (timeLeft === null || showFeedback || timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setTimerExpired(true);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showFeedback]);

  // Reset per-question timer
  useEffect(() => {
    if (quiz?.timeLimit && !showFeedback) {
      setTimeLeft(quiz.timeLimit);
      setTimerExpired(false);
    }
  }, [currentQuestionIndex, showFeedback, quiz?.timeLimit]);

  const handleTimeUp = () => {
    if (showFeedback) return;

    toast.error("Time's up! ⏰", { icon: '⏱️' });

    const newAnswer = {
      questionIndex: currentQuestionIndex,
      selectedAnswer: selectedAnswer || 'No answer',
      isCorrect: false,
    };

    setAnswers(prev => [...prev, newAnswer]);
    setShowFeedback(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center" data-theme="night">
        <span className="loading loading-spinner loading-lg text-primary" role="status" aria-label="Loading quiz" />
      </div>
    );
  }

  if (!quiz || !quiz.quizQuestions) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center" data-theme="night">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz not found</h2>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.quizQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.quizQuestions.length - 1;
  const progress = ((currentQuestionIndex + 1) / quiz.quizQuestions.length) * 100;

  const handleAnswerSelect = (option) => {
    if (!showFeedback && !timerExpired) setSelectedAnswer(option);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) {
      toast.error('Please select an answer');
      return;
    }

    const isCorrect = selectedAnswer === currentQuestion.answer;
    const newAnswer = {
      questionIndex: currentQuestionIndex,
      selectedAnswer,
      isCorrect,
    };

    setAnswers(prev => [...prev, newAnswer]);
    setShowFeedback(true);

    isCorrect
      ? toast.success('Correct!', { icon: '✅' })
      : toast.error('Incorrect!', { icon: '❌' });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setQuizAnswers([...answers, { // include the last answer if just submitted
        questionIndex: currentQuestionIndex,
        selectedAnswer: selectedAnswer || 'No answer',
        isCorrect: selectedAnswer === currentQuestion.answer,
      }]);
      navigate(`/results/${id}`);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowFeedback(false);
    }
  };

  // Timer progress display
  const timerPercentage = quiz.timeLimit ? (timeLeft / quiz.timeLimit) * 100 : 0;
  const timerColor = timeLeft <= 5 ? 'text-error' : timeLeft <= 10 ? 'text-warning' : 'text-success';

  return (
    <div className="min-h-screen bg-base-200" data-theme="night">
      {/* Header */}
      <div className="bg-base-100 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="btn btn-ghost btn-circle">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-3xl">{quiz.icon}</span>
                {quiz.title}
              </h1>
              <div className="mt-2">
                <div className="flex items-center gap-2 text-sm text-base-content/70">
                  <span>Question {currentQuestionIndex + 1} of {quiz.quizQuestions.length}</span>
                  {quiz.timeLimit && (
                    <>
                      <span>•</span>
                      <Clock className="w-4 h-4" />
                      <span>{quiz.timeLimit}s per question</span>
                    </>
                  )}
                </div>
                <progress
                  className="progress progress-primary w-full mt-2"
                  value={progress}
                  max="100"
                ></progress>
              </div>
            </div>

            {quiz.timeLimit && timeLeft !== null && (
              <div className={`flex flex-col items-center ${timerColor}`}>
                <div className="radial-progress text-4xl font-bold" 
                     style={{"--value": timerPercentage, "--size": "5rem", "--thickness": "0.4rem"}}
                     role="progressbar">
                  {timeLeft}
                </div>
                <span className="text-xs mt-1">seconds</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {timerExpired && !showFeedback && (
          <div className="alert alert-error mb-6 shadow-lg">
            <AlertCircle className="w-6 h-6" />
            <span>Time expired! Moving to next question...</span>
          </div>
        )}

        <div className="card bg-base-100 shadow-2xl fade-in">
          <div className="card-body">
            <h2 className="text-2xl font-bold mb-6">{currentQuestion.question}</h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.answer;
                const showCorrect = showFeedback && isCorrect;
                const showIncorrect = showFeedback && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={showFeedback || timerExpired}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all quiz-option ${
                      showCorrect
                        ? 'border-success bg-success/20'
                        : showIncorrect
                        ? 'border-error bg-error/20'
                        : isSelected
                        ? 'border-primary bg-primary/20'
                        : 'border-base-300 hover:border-primary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      {showCorrect && <CheckCircle className="w-6 h-6 text-success" />}
                      {showIncorrect && <XCircle className="w-6 h-6 text-error" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="card-actions justify-end mt-6">
              {!showFeedback && !timerExpired ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                  className="btn btn-primary btn-lg gap-2"
                >
                  Submit Answer
                </button>
              ) : (
                <button onClick={handleNext} className="btn btn-primary btn-lg gap-2">
                  {isLastQuestion ? 'See Results' : 'Next Question'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizStartPage;
