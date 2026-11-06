
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const API = 'http://127.0.0.1:5000';

export default function TrackIssues() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('All');
  const [proofs, setProofs] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState('');

  const loadComplaints = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) throw new Error('Please log in again.');

      const response = await fetch(`${API}/api/my-complaints`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Could not load complaints.');

      setComplaints(data.complaints || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const viewProof = async (id) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${API}/api/complaints/${id}/resolution-proof-url`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Could not load proof.');

      setProofs(previous => ({
        ...previous,
        [id]: data.signed_url
      }));
    } catch (error) {
      setMessage(error.message);
    }
  };

  const decide = async (id, decision) => {
    try {
      setBusy(id);
      setMessage('');

      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${API}/api/complaints/${id}/resolution-decision`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ decision })
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Decision failed.');

      setMessage(data.message);
      await loadComplaints();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(null);
    }
  };

  const filters = [
    'All',
    'Pending',
    'In Progress',
    'Awaiting Citizen Confirmation',
    'Resolved'
  ];

  const filtered = filter === 'All'
    ? complaints
    : complaints.filter(c => c.status === filter);

  if (loading) {
    return <div className="p-8 text-center">Loading your complaints...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Track My Complaints
      </h2>

      <p className="text-gray-600 mb-5">
        Track progress and confirm completed work.
      </p>

      {message && (
        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg mb-4">
          {message}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-2 rounded-lg text-sm ${filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700'
              }`}
          >
            {status}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500">
          No complaints found.
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map(complaint => (
            <div key={complaint.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex justify-between flex-wrap gap-2">
                <h3 className="font-bold text-lg">
                  #{complaint.id} - {complaint.title}
                </h3>
                <span className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm">
                  {complaint.status}
                </span>
              </div>

              <p className="mt-3 text-gray-700">{complaint.description}</p>
              <p className="mt-2 text-sm text-gray-600">
                Location: {complaint.location || 'Not specified'}
              </p>
              <p className="text-sm text-gray-600">
                Category: {complaint.category || 'Not specified'}
              </p>

              {complaint.image_url && (
                <img
                  src={complaint.image_url}
                  alt="Reported issue"
                  className="mt-3 w-full max-w-sm h-48 object-cover rounded-lg"
                />
              )}

              {complaint.status === 'Awaiting Citizen Confirmation' && (
                <div className="mt-5 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-bold text-green-900">
                    Work marked as completed
                  </h4>

                  <p className="text-sm text-green-800 mt-1">
                    Please review the resolution photo and confirm whether the issue has actually been fixed.
                  </p>

                  {!proofs[complaint.id] ? (
                    <button
                      onClick={() => viewProof(complaint.id)}
                      className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                      View Resolution Photo
                    </button>
                  ) : (
                    <img
                      src={proofs[complaint.id]}
                      alt="Resolution proof"
                      className="mt-3 w-full max-w-sm rounded-lg"
                    />
                  )}

                  <div className="flex flex-wrap gap-3 mt-4">
                    <button
                      onClick={() => decide(complaint.id, 'accepted')}
                      disabled={busy === complaint.id || !proofs[complaint.id]}
                      className="bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                      {busy === complaint.id ? 'Submitting...' : 'Accept Resolution'}
                    </button>

                    <button
                      onClick={() => decide(complaint.id, 'rejected')}
                      disabled={busy === complaint.id || !proofs[complaint.id]}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                      Reject Resolution
                    </button>
                  </div>
                </div>
              )}

              {complaint.status === 'Resolved' && (
                <p className="mt-4 text-green-700 font-semibold">
                  Resolution accepted. This complaint is closed.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
