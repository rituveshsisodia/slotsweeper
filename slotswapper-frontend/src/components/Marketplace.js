// src/components/Marketplace.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from './common/Header';

export default function Marketplace() {
  const [slots, setSlots] = useState([]);
  const [mySwappables, setMySwappables] = useState([]);
  const [selectedTheir, setSelectedTheir] = useState(null);
  const [selectedMy, setSelectedMy] = useState(null);
  const [msg, setMsg] = useState('');
  const token = localStorage.getItem('token');

  const fetchSlots = async () => {
    const res = await axios.get('/api/swappable-slots', { headers: { Authorization: `Bearer ${token}` }});
    setSlots(res.data);
  };

  const fetchMySwappables = async () => {
    const res = await axios.get('/api/events', { headers: { Authorization: `Bearer ${token}` }});
    setMySwappables(res.data.filter(e => e.status === 'SWAPPABLE'));
  };

  useEffect(() => { fetchSlots(); fetchMySwappables(); }, []);

  const requestSwap = async () => {
    if (!selectedMy || !selectedTheir) { setMsg('Choose both slots'); return; }
    try {
      const res = await axios.post('/api/swap-request', { myEventId: selectedMy._id, theirEventId: selectedTheir._id }, { headers: { Authorization: `Bearer ${token}` }});
      setMsg('Swap request sent');
      // refresh
      fetchSlots(); fetchMySwappables();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Request failed');
    }
  };

  return (
    <div>
      <Header />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Available Slots (Others)</h3>
          {slots.length === 0 && <p className="text-sm text-gray-500">No swappable slots right now</p>}
          <div className="space-y-2">
            {slots.map(s => (
              <div key={s._id} className={`border p-3 rounded ${selectedTheir?._id === s._id ? 'bg-blue-50' : ''}`}
                   onClick={() => setSelectedTheir(s)}>
                <div className="font-medium">{s.title}</div>
                <div className="text-sm">{new Date(s.startTime).toLocaleString()} - {new Date(s.endTime).toLocaleString()}</div>
                <div className="text-xs text-gray-600">Owner: {s.user?.name || s.user?.email}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Your Swappable Slots</h3>
          {mySwappables.length === 0 && <p className="text-sm text-gray-500">No swappable slots — make them swappable in Dashboard</p>}
          <div className="space-y-2 mb-3">
            {mySwappables.map(s => (
              <div key={s._id} className={`border p-3 rounded ${selectedMy?._id === s._id ? 'bg-green-50' : ''}`}
                   onClick={() => setSelectedMy(s)}>
                <div className="font-medium">{s.title}</div>
                <div className="text-sm">{new Date(s.startTime).toLocaleString()} - {new Date(s.endTime).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <button onClick={requestSwap} className="bg-indigo-600 text-white px-4 py-2 rounded">Request Swap</button>
          {msg && <p className="mt-2 text-sm text-green-600">{msg}</p>}
        </div>
      </div>
    </div>
  );
}
