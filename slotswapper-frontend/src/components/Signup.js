// src/components/Signup.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function change(e) { setForm({...form, [e.target.name]: e.target.value }); }

  async function submit(e) {
    e.preventDefault(); setError('');
    try {
      const res = await axios.post('/api/auth/signup', form);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Sign Up</h2>
      <form onSubmit={submit} className="space-y-3">
        <input name="name" placeholder="Name" value={form.name} onChange={change} className="border p-2 w-full rounded" />
        <input name="email" placeholder="Email" value={form.email} onChange={change} className="border p-2 w-full rounded" />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={change} className="border p-2 w-full rounded" />
        <button className="w-full bg-blue-600 text-white p-2 rounded">Sign Up</button>
      </form>
      {error && <p className="text-red-600 mt-2">{error}</p>}
      <p className="mt-3 text-sm">Already have an account? <Link to="/login" className="text-blue-600">Login</Link></p>
    </div>
  );
}
