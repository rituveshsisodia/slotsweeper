// src/components/common/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const logout = () => { localStorage.removeItem('token'); navigate('/login'); };

  return (
    <div className="flex justify-between items-center mb-6">
      <nav className="space-x-4">
        <Link to="/dashboard" className="text-blue-600">Dashboard</Link>
        <Link to="/marketplace" className="text-blue-600">Marketplace</Link>
        <Link to="/requests" className="text-blue-600">Requests</Link>
      </nav>
      {token && <button className="text-sm bg-red-500 text-white px-3 py-1 rounded" onClick={logout}>Logout</button>}
    </div>
  );
}
