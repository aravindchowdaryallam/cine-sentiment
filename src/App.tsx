import React, { useState, Suspense } from 'react';
import { Film, User, LogOut } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components to catch import errors and reduce initial bundle size
const SentimentAnalyzer = React.lazy(() => import('./components/SentimentAnalyzer'));
const MovieSearch = React.lazy(() => import('./components/MovieSearch'));
const MovieRecommendation = React.lazy(() => import('./components/MovieRecommendation'));
const Watchlist = React.lazy(() => import('./components/Watchlist'));
import Login from './components/Login';
import Register from './components/Register';

import { WatchlistProvider } from './context/WatchlistContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'search' | 'recommend' | 'watchlist'>('search');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { user, logout } = useAuth();

  // If trying to access protected route (watchlist) while logged out
  const showAuth = activeTab === 'watchlist' && !user;

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-primary/30">
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur border-b border-white/10 z-50 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Film className="text-primary" /> CineSentiment
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex gap-2 bg-white/5 p-1 rounded-full">
              <button onClick={() => setActiveTab('search')} className={`px-4 py-1.5 rounded-full text-sm transition-all ${activeTab === 'search' ? 'bg-white text-black font-bold shadow-lg' : 'text-gray-400 hover:text-white'}`}>Search</button>
              <button onClick={() => setActiveTab('recommend')} className={`px-4 py-1.5 rounded-full text-sm transition-all ${activeTab === 'recommend' ? 'bg-white text-black font-bold shadow-lg' : 'text-gray-400 hover:text-white'}`}>Recommend</button>
              <button onClick={() => setActiveTab('watchlist')} className={`px-4 py-1.5 rounded-full text-sm transition-all ${activeTab === 'watchlist' ? 'bg-white text-black font-bold shadow-lg' : 'text-gray-400 hover:text-white'}`}>My List</button>
              <button onClick={() => setActiveTab('analyze')} className={`px-4 py-1.5 rounded-full text-sm transition-all ${activeTab === 'analyze' ? 'bg-white text-black font-bold shadow-lg' : 'text-gray-400 hover:text-white'}`}>Analyze</button>
            </div>

            {/* User Profile / Login Status */}
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-bold text-white leading-none">{user.name}</p>
                  <p className="text-xs text-primary">Member</p>
                </div>
                <button
                  onClick={logout}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('watchlist')}
                className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-hover transition-colors"
              >
                <User size={18} />
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <ErrorBoundary>
        <Suspense fallback={
          <div className="h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-primary font-mono tracking-widest">LOADING EXPERIENCE...</p>
            </div>
          </div>
        }>
          <main className="pt-28 px-4 pb-20 max-w-7xl mx-auto">
            {showAuth ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                {authMode === 'login' ? (
                  <Login onSwitchToRegister={() => setAuthMode('register')} />
                ) : (
                  <Register onSwitchToLogin={() => setAuthMode('login')} />
                )}
              </div>
            ) : (
              <>
                {activeTab === 'search' && <MovieSearch />}
                {activeTab === 'analyze' && <SentimentAnalyzer />}
                {activeTab === 'recommend' && <MovieRecommendation />}
                {activeTab === 'watchlist' && <Watchlist />}
              </>
            )}
          </main>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <WatchlistProvider>
        <AppContent />
      </WatchlistProvider>
    </AuthProvider>
  );
}

export default App;
