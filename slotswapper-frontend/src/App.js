// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import Requests from './components/Requests';

function App() {
  const token = localStorage.getItem('token');
  const Private = ({ children }) => (token ? children : <Navigate to="/login" />);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-center mb-6">SlotSwapper</h1>
          <Routes>
            <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
            <Route path="/marketplace" element={<Private><Marketplace /></Private>} />
            <Route path="/requests" element={<Private><Requests /></Private>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
