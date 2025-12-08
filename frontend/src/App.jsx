import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SignIn, SignUp, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { toast, Toaster } from 'react-hot-toast'; 

import Navbar from './components/Navbar';
import QuizDashboardPage from './pages/QuizDashboardPage';
import QuizBuilderPage from './pages/QuizBuilderPage';
import QuizStartPage from './pages/QuizStartPage';
import QuizResultsPage from './pages/QuizResultsPage';
import QuizEditPage from './pages/QuizEditPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AboutPage from './pages/AboutPage';

import { GlobalContextProvider } from './context/GlobalContext';

const App = () => {
  return (
    <GlobalContextProvider> 
      <div data-theme="night">
        <Toaster position="top-center" reverseOrder={false} />
        
        {/* Global Navbar */}
        <Navbar />

        <Routes>
          {/* Public Routes - Auth Pages */}
          <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
          <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />

          {/* Public Routes */}
          <Route path="/" element={<QuizDashboardPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Protected Routes - Require Sign In */}
          <Route
            path="/create"
            element={
              <>
                <SignedIn>
                  <QuizBuilderPage />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <>
                <SignedIn>
                  <QuizEditPage />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/quiz/:id"
            element={
              <>
                <SignedIn>
                  <QuizStartPage />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/results/:id"
            element={
              <>
                <SignedIn>
                  <QuizResultsPage />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />

          <Route path="*" element={<h1>404: Page Not Found</h1>} />
        </Routes>
      </div>
    </GlobalContextProvider> 
  );
};

export default App;