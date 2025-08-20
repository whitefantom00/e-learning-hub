import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="bg-gray-800 p-4 text-white flex justify-between">
          <Link to="/" className="text-xl font-bold">E-Learning Hub</Link>
          <div>
            <Link to="/login" className="mr-4">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        </nav>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <div className="text-center mt-10">
              <h1 className="text-4xl font-bold">Welcome to E-Learning Hub</h1>
              <p className="mt-4 text-lg">Your platform for IELTS mock tests and training.</p>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;