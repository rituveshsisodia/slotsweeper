// src/components/Requests.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from './common/Header';

export default function Requests() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [msg, setMsg] = useState('');
  const token = localStorage.getItem('token');

  const fetch = async () => {
    try {
      const inc = await axios.get('/api/requests/incoming', { headers: { Authorization: `Bearer ${token}` }});
      const out = await axios.get('/api/requests/outgoing', { headers: { Authorization: `Bearer ${token}` }});
      setIncoming(inc.data);
      setOutgoing(out.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetch(); }, []);

  const respond = async (id, accept) => {
    try {
      await axios.post(`/api/swap-response/${id}`, { accept }, { headers: { Authorization: `Bearer ${token}` }});
      setMsg(accept ? 'Accepted' : 'Rejected');
      fetch();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Action failed');
    }
  };

  return (
    <div>
      <Header />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Incoming Requests</h3>
          {incoming.length === 0 && <p className="text-sm text-gray-500">No incoming requests</p>}
          <div className="space-y-3">
            {incoming.map(r => (
              <div key={r._id} className="border p-3 rounded">
                <div className="font-medium">From: {r.requester.name}</div>
                <div className="text-sm">They offered: {r.myEvent?.title} ({new Date(r.myEvent?.startTime).toLocaleString()})</div>
                <div className="text-sm">Your slot: {r.theirEvent?.title} ({new Date(r.theirEvent?.startTime).toLocaleString()})</div>
                <div className="mt-2 space-x-2">
                  <button onClick={() => respond(r._id, true)} className="bg-green-600 text-white px-3 py-1 rounded">Accept</button>
                  <button onClick={() => respond(r._1d, false)} className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Outgoing Requests</h3>
          {outgoing.length === 0 && <p className="text-sm text-gray-500">No outgoing requests</p>}
          <div className="space-y-3">
            {outgoing.map(r => (
              <div key={r._id} className="border p-3 rounded">
                <div className="font-medium">To: {r.responder.name}</div>
                <div className="text-sm">Your offered: {r.myEvent?.title}</div>
                <div className="text-sm">Their slot: {r.theirEvent?.title}</div>
                <div className="text-xs mt-2">Status: {r.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {msg && <p className="mt-3 text-sm text-green-600">{msg}</p>}
    </div>
  );
}
