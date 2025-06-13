import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DisplayPage from './components/DisplayPage';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import MainPage from './components/MainPage';
import ProfilePage from './components/ProfilePage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Landing/Display page */}
          <Route 
            path="/" 
            element={<DisplayPage />} 
          />
          
          {/* Auth pages */}
          <Route 
            path="/signup" 
            element={<SignUp onLogin={handleLogin} />} 
          />
          <Route 
            path="/signin" 
            element={<SignIn onLogin={handleLogin} />} 
          />
          
          {/* Protected main page */}
          <Route 
            path="/main" 
            element={
              isAuthenticated ? (
                <MainPage onLogout={handleLogout} />
              ) : (
                <Navigate to="/signin" replace />
              )
            } 
          />
          {/* New protected profile page */}
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;