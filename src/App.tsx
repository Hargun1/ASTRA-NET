import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/authStore';
import './styles/App.css';

// Components
import SpaceLoadingGame from './components/SpaceLoadingGame';

// Pages
import LoginPage from './pages/LoginPage';
import MainDashboard from './pages/MainDashboard';
import AstraAditya from './pages/AstraAditya';
import AstraBhumi from './pages/AstraBhumi';
import AstraKaksha from './pages/AstraKaksha';

// Loading Screen Page (after login)
const LoadingGamePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [loadingProgress, setLoadingProgress] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 12;
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  const handleComplete = () => {
    setIsComplete(true);
    // Use React Router navigate instead of window.location
    navigate('/dashboard', { replace: true });
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to dashboard if already complete
  if (isComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <SpaceLoadingGame 
      onComplete={handleComplete} 
      loadingProgress={Math.min(100, Math.round(loadingProgress))} 
    />
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/loading" element={<LoadingGamePage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/aditya"
              element={
                <ProtectedRoute>
                  <AstraAditya />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bhumi"
              element={
                <ProtectedRoute>
                  <AstraBhumi />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kaksha"
              element={
                <ProtectedRoute>
                  <AstraKaksha />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </BrowserRouter>
  );
}

export default App;
