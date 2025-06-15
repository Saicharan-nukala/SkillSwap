import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DisplayPage from './components/DisplayPage';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/learning" element={<Learnings />} />
          <Route path="/teaching" element={<Teachings />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/newswaps" element={<NewSwaps />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;