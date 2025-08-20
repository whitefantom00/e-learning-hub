import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // In a real app, you would verify the token with your backend
      // and fetch user details including role.
      // For now, we'll assume authenticated and set a dummy role.
      setIsAuthenticated(true);
      // This is a placeholder. You'd get the actual role from your backend.
      // For testing, you might manually set it to 'admin' or 'teacher' after login.
      setUserRole('admin'); // Set to 'admin', 'teacher', or 'student' based on actual user
    }
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('access_token', token);
    setIsAuthenticated(true);
    // Fetch user role from backend after successful login
    // For now, setting a dummy role for demonstration
    setUserRole('admin'); // Set to 'admin', 'teacher', or 'student' based on actual user
    navigate('/'); // Redirect to home or dashboard after login
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/login');
  };

  return (
    <div className="App">
      <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">E-Learning Hub</Link>
        <div>
          {isAuthenticated ? (
            <>
              {userRole === 'admin' && (
                <Link to="/admin" className="mr-4">Admin Dashboard</Link>
              )}
              {userRole === 'teacher' && (
                <Link to="/teacher" className="mr-4">Teacher Dashboard</Link>
              )}
              <button onClick={handleLogout} className="mr-4">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mr-4">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        {isAuthenticated && userRole === 'admin' && (
          <Route path="/admin" element={<AdminDashboard />} />
        )}
        {isAuthenticated && userRole === 'teacher' && (
          <Route path="/teacher" element={<TeacherDashboard />} />
        )}
        <Route path="/" element={
          <div className="text-center mt-10">
            <h1 className="text-4xl font-bold">Welcome to E-Learning Hub</h1>
            <p className="mt-4 text-lg">Your platform for IELTS mock tests and training.</p>
            {isAuthenticated && <p className="mt-2">You are logged in as {userRole}.</p>}
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;