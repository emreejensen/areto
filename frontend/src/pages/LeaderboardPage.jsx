import { useQuery } from '@tanstack/react-query';
import { quizApi } from '../lib/api';
import { Trophy, TrendingUp, Play, Award } from 'lucide-react';

const LeaderboardPage = () => {
  // Fetch all quizzes along with their results
  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: quizApi.getAllQuizzes, // make sure your API returns totalPlays, averageSuccessRate
  });

  // Sort quizzes by different metrics
  const mostPlayed = [...(quizzes || [])]
    .sort((a, b) => (b.totalPlays || 0) - (a.totalPlays || 0))
    .slice(0, 10);

  const highestSuccess = [...(quizzes || [])]
    .sort((a, b) => (b.averageSuccessRate || 0) - (a.averageSuccessRate || 0))
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-base-200" data-theme="night">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-primary flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12" />
            Leaderboard
          </h1>
          <p className="text-xl text-base-content/70">
            Top performing quizzes across Areto
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Most Played */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4 flex items-center gap-2">
                  <Play className="w-6 h-6 text-primary" />
                  Most Played Quizzes
                </h2>
                <div className="space-y-3">
                  {mostPlayed.map((quiz, index) => (
                    <div 
                      key={quiz._id}
                      className="flex items-center gap-4 p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
                    >
                      <div className={`text-2xl font-bold ${
                        index === 0 ? 'text-warning' : 
                        index === 1 ? 'text-base-content/70' : 
                        index === 2 ? 'text-accent' : 
                        'text-base-content/50'
                      }`}>
                        #{index + 1}
                      </div>
                      <div className="text-3xl">{quiz.icon || '📝'}</div>
                      <div className="flex-1">
                        <h3 className="font-bold">{quiz.title}</h3>
                        <p className="text-sm text-base-content/70">
                          {quiz.totalPlays || 0} plays
                        </p>
                      </div>
                      {index === 0 && <Trophy className="w-6 h-6 text-warning" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Highest Success Rate */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-success" />
                  Highest Success Rate
                </h2>
                <div className="space-y-3">
                  {highestSuccess.map((quiz, index) => (
                    <div 
                      key={quiz._id}
                      className="flex items-center gap-4 p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
                    >
                      <div className={`text-2xl font-bold ${
                        index === 0 ? 'text-warning' : 
                        index === 1 ? 'text-base-content/70' : 
                        index === 2 ? 'text-accent' : 
                        'text-base-content/50'
                      }`}>
                        #{index + 1}
                      </div>
                      <div className="text-3xl">{quiz.icon || '📝'}</div>
                      <div className="flex-1">
                        <h3 className="font-bold">{quiz.title}</h3>
                        <p className="text-sm text-base-content/70">
                          {quiz.averageSuccessRate?.toFixed(0) || 0}% success rate
                        </p>
                      </div>
                      {index === 0 && <Award className="w-6 h-6 text-warning" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards - unchanged graphics */}
        <div className="stats stats-vertical lg:stats-horizontal shadow w-full mt-8">
          <div className="stat">
            <div className="stat-figure text-primary">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="stat-title">Total Quizzes</div>
            <div className="stat-value text-primary">{quizzes?.length || 0}</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-secondary">
              <Play className="w-8 h-8" />
            </div>
            <div className="stat-title">Total Plays</div>
            <div className="stat-value text-secondary">
              {quizzes?.reduce((sum, q) => sum + (q.totalPlays || 0), 0) || 0}
            </div>
          </div>

          <div className="stat">
            <div className="stat-figure text-accent">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div className="stat-title">Avg Success Rate</div>
            <div className="stat-value text-accent">
              {quizzes?.length > 0 
                ? Math.round(quizzes.reduce((sum, q) => sum + (q.averageSuccessRate || 0), 0) / quizzes.length)
                : 0}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
