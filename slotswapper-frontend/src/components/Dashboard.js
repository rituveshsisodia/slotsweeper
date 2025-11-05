// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from './common/Header';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title:'', startTime:'', endTime:'' });
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/api/events', { headers: { Authorization: `Bearer ${token}` }});
      setEvents(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const createEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/events', form, { headers: { Authorization: `Bearer ${token}` }});
      setForm({ title:'', startTime:'', endTime:'' });
      fetchEvents();
    } catch (err) { setError('Create failed'); }
  };

  const toggleSwappable = async (ev) => {
    const newStatus = ev.status === 'SWAPPABLE' ? 'BUSY' : 'SWAPPABLE';
    try {
      await axios.put(`/api/events/${ev._id}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` }});
      fetchEvents();
    } catch (err) { console.error(err); }
  };

  const delEvent = async (id) => {
    try { await axios.delete(`/api/events/${id}`, { headers: { Authorization: `Bearer ${token}` }}); fetchEvents(); } catch (err) { console.error(err); }
  };

  return (
    <div>
      <Header />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Create Event</h3>
          <form onSubmit={createEvent} className="space-y-2">
            <input className="border p-2 w-full rounded" name="title" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            <input className="border p-2 w-full rounded" name="startTime" type="datetime-local" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} />
            <input className="border p-2 w-full rounded" name="endTime" type="datetime-local" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} />
            <button className="bg-green-600 text-white p-2 rounded">Create</button>
            {error && <p className="text-red-600">{error}</p>}
          </form>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Your Events</h3>
          <div className="space-y-3">
            {events.length === 0 && <p className="text-sm text-gray-500">No events yet</p>}
            {events.map(ev => (
              <div key={ev._id} className="border p-3 rounded flex justify-between items-center">
                <div>
                  <div className="font-medium">{ev.title}</div>
                  <div className="text-sm text-gray-600">{new Date(ev.startTime).toLocaleString()} - {new Date(ev.endTime).toLocaleString()}</div>
                  <div className="text-xs mt-1">Status: <span className="font-semibold">{ev.status}</span></div>
                </div>
                <div className="flex flex-col space-y-2">
                  <button onClick={() => toggleSwappable(ev)} className="text-sm bg-blue-500 text-white px-3 py-1 rounded">{ev.status === 'SWAPPABLE' ? 'Make Busy' : 'Make Swappable'}</button>
                  <button onClick={() => delEvent(ev._id)} className="text-sm bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
