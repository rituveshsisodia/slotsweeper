// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email:'', password:'' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function change(e) { setForm({...form, [e.target.name]: e.target.value }); }

  async function submit(e) {
    e.preventDefault(); setError('');
    try {
      const res = await axios.post('/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Log In</h2>
      <form onSubmit={submit} className="space-y-3">
        <input name="email" placeholder="Email" value={form.email} onChange={change} className="border p-2 w-full rounded" />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={change} className="border p-2 w-full rounded" />
        <button className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
      </form>
      {error && <p className="text-red-600 mt-2">{error}</p>}
      <p className="mt-3 text-sm">New? <Link to="/signup" className="text-blue-600">Sign up</Link></p>
    </div>
  );
}
