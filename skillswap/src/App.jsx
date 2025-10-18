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
import NewSwaps from './components/NewSwapsPage';
import Learnings from './components/Learnings';
import Teachings from './components/Teachings';
import Chats from './components/Chats';
import NotificationsPage from './components/NotificationPage';
import SwapDetailPage from './components/SwapDetailsPage';
import SessionDetailPage from './components/SessionDetailPage'; 
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Check for existing auth state on app load
  useEffect(() => {
    const checkAuthState = () => {
      const user = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (user) {
        try {
          // Validate the user data
          const userData = JSON.parse(user);
          if (userData && userData.userId) {
            setIsAuthenticated(true);
          } else {
            // Invalid user data, clear it
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
            setIsAuthenticated(false);
          }
        } catch (error) {
          // Invalid JSON, clear it
          localStorage.removeItem('user');
          sessionStorage.removeItem('user');
          setIsAuthenticated(false);
          console.log(error)
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
    };

    checkAuthState();

    // Listen for storage changes (for cross-tab logout)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === null) {
        checkAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom storage events (for same-tab logout)
    window.addEventListener('storage', checkAuthState);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage', checkAuthState);
    };
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Clear storage
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    localStorage.clear();
    sessionStorage.clear();
    
    // Update state
    setIsAuthenticated(false);
    
    // Dispatch storage event for cross-component communication
    window.dispatchEvent(new Event('storage'));
  };

  // ProtectedRoute wrapper
  const ProtectedRoute = ({ children }) => {
    if (isLoadingAuth) {
      // Show a loading indicator while authenticating
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px'
        }}>
          Loading authentication...
        </div>
      );
    }
    return isAuthenticated ? children : <Navigate to="/signin" replace />;
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<DisplayPage />} />
        <Route 
          path="/signup" 
          element={
            !isAuthenticated ? (
              <SignUp onLogin={handleLogin} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/signin" 
          element={
            !isAuthenticated ? (
              <SignIn onLogin={handleLogin} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/verify-otp" 
          element={
            !isAuthenticated ? (
              <VerifyOTP onVerify={handleLogin} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning"
          element={
            <ProtectedRoute>
              <Learnings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teaching"
          element={
            <ProtectedRoute>
              <Teachings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/connections"
          element={
            <ProtectedRoute>
              <Connections />
            </ProtectedRoute>
          }
        />
        <Route
          path="/newswaps"
          element={
            <ProtectedRoute>
              <NewSwaps />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chats"
          element={
            <ProtectedRoute>
              <Chats />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Navigate 
                to={`/profile/${JSON.parse(localStorage.getItem('user') || '{}')?.userId || 'default'}`} 
                replace 
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute>
              <Navigate 
                to={`/profile/${JSON.parse(localStorage.getItem('user') || '{}')?.userId || 'default'}`} 
                replace 
              />
            </ProtectedRoute>
          }
        />
        {/* Catch all route - redirect to dashboard if authenticated, otherwise to home */}
        <Route 
          path="*" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/swap/:swapId" element={<SwapDetailPage />} />
      <Route path="/session/:sessionId" element={<SessionDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;