import { Target, Zap, Users, Trophy, BookOpen, Sparkles, Heart } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-base-200" data-theme="night">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-primary mb-4 flex items-center justify-center gap-4">
            <span className="text-7xl">🎯</span>
            Areto
          </h1>
          <p className="text-2xl text-base-content/80">
            Your Ultimate Quiz Platform
          </p>
        </div>

        {/* Arete Inspiration Card */}
        <div className="card bg-gradient-to-br from-primary/20 to-secondary/20 shadow-xl mb-8 border-2 border-primary/30">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-primary" />
              <h2 className="card-title text-3xl">The Meaning Behind Areto</h2>
            </div>
            <div className="space-y-4 text-lg">
              <p className="leading-relaxed">
                <span className="font-bold text-primary">Areto</span> is inspired by the ancient Greek concept of{' '}
                <span className="font-bold italic">Arete (ἀρετή)</span>, which means "excellence" or "virtue" - 
                the act of living up to one's fullest potential.
              </p>
              <p className="leading-relaxed">
                In Greek philosophy, <span className="italic">arete</span> wasn't just about being good at something - 
                it was about the pursuit of excellence in all aspects of life, constantly striving to be the best 
                version of yourself.
              </p>
              <div className="bg-base-100 p-6 rounded-lg border-l-4 border-primary mt-4">
                <p className="text-xl font-semibold text-primary mb-2">Our Philosophy</p>
                <p className="leading-relaxed">
                  Just as the ancient Greeks valued <span className="italic">arete</span>, we believe that everyone 
                  has the potential for greatness. Areto is more than a quiz platform - it's a tool to help you 
                  discover your strengths, challenge your knowledge, and reach your full potential through continuous 
                  learning and improvement.
                </p>
              </div>
              <p className="leading-relaxed text-base-content/80">
                Every quiz you take, every question you answer, every mistake you learn from - these are all steps 
                on your journey toward your own <span className="italic">arete</span>. 
                <span className="font-semibold"> Excellence isn't a destination; it's a continuous pursuit.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Mission Card */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-3xl mb-4">Our Mission</h2>
            <p className="text-lg text-base-content/80 leading-relaxed">
              Areto is designed to make learning fun, interactive, and competitive. 
              Create custom quizzes, challenge yourself and others, and track your progress 
              as you master new topics. Whether you're a teacher creating educational content 
              or a trivia enthusiast, Areto provides the perfect platform for knowledge sharing 
              and personal growth.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-8 h-8 text-warning" />
                <h3 className="card-title">Easy Quiz Creation</h3>
              </div>
              <p className="text-base-content/70">
                Build custom quizzes in minutes with our intuitive quiz builder. 
                Add questions, multiple choice options, and track performance.
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="w-8 h-8 text-primary" />
                <h3 className="card-title">Leaderboards</h3>
              </div>
              <p className="text-base-content/70">
                Compete with others! See which quizzes are most popular and 
                which have the highest success rates.
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-8 h-8 text-success" />
                <h3 className="card-title">Track Progress</h3>
              </div>
              <p className="text-base-content/70">
                Monitor your performance with detailed statistics and see 
                your improvement over time.
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-8 h-8 text-info" />
                <h3 className="card-title">Community Driven</h3>
              </div>
              <p className="text-base-content/70">
                Take quizzes created by others, share your own, and learn 
                from a vibrant community.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-3xl mb-6 flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              How It Works
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="badge badge-primary badge-lg">1</div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Sign Up</h4>
                  <p className="text-base-content/70">
                    Create a free account to unlock all features
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="badge badge-primary badge-lg">2</div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Create or Browse</h4>
                  <p className="text-base-content/70">
                    Build your own quiz or explore quizzes made by the community
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="badge badge-primary badge-lg">3</div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Take Quizzes</h4>
                  <p className="text-base-content/70">
                    Test your knowledge and get instant feedback
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="badge badge-primary badge-lg">4</div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Track & Improve</h4>
                  <p className="text-base-content/70">
                    View your results, compare with others, and keep learning
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Card */}
        <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content shadow-xl">
          <div className="card-body text-center">
            <h2 className="card-title text-3xl justify-center mb-4 flex items-center gap-2">
              <Sparkles className="w-8 h-8" />
              Ready to Reach Your Arete?
            </h2>
            <p className="text-lg mb-6">
              Join the Areto community today and start your journey toward excellence!
            </p>
            <div className="card-actions justify-center">
              <a href="/" className="btn btn-lg">
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;