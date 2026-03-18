import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      return stored && token ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup onLogin={handleLogin} />} />
      <Route
        path="/*"
        element={
          user
            ? <Dashboard user={user} onUserUpdate={handleUserUpdate} onLogout={handleLogout} />
            : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}

export default App;
