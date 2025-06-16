import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DisplayPage from './components/DisplayPage';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import VerifyOTP from './components/VerifyOTP';
import MainPage from './components/MainPage';
import ProfilePage from './components/ProfilePage';
import Dashboard from './components/Dashboard';
import Connections from './components/Swaps';
import NewSwaps from './components/NewSwaps';
import Learnings from './components/Learnings';
import Teachings from './components/Teachings';
import Chats from './components/Chats';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing auth state on app load
  useEffect(() => {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (user) setIsAuthenticated(true);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  // ProtectedRoute wrapper
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/signin" replace />;
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<DisplayPage />} />
        <Route path="/signup" element={<SignUp onLogin={handleLogin} />} />
        <Route path="/signin" element={<SignIn onLogin={handleLogin} />} />
        <Route path="/verify-otp" element={<VerifyOTP onVerify={handleLogin} />} />

        {/* Protected Routes */}
        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <MainPage onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        {/* Add other protected routes similarly */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;