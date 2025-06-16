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
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // NEW: Add loading state for authentication

  // Check for existing auth state on app load
  useEffect(() => {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (user) {
      setIsAuthenticated(true);
    }
    setIsLoadingAuth(false); // Set to false once auth check is complete
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
    if (isLoadingAuth) {
      // Show a loading indicator while authenticating
      return <div>Loading authentication...</div>; // You can use a Chakra UI Spinner here
    }
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
          path="/profile/:userId" // UPDATED: Route now expects a userId parameter
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        {/* Optional: Route for "My Profile" that redirects to the current user's profile */}
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute>
              {/* IMPORTANT: Replace 'user' and '.userId' with your actual localStorage key and property */}
              {/* This assumes your user object in localStorage has a 'userId' property */}
              <Navigate to={`/profile/${JSON.parse(localStorage.getItem('user'))?.userId || 'default'}`} replace />
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