import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const API = 'http://127.0.0.1:5000';

export default function CitizenHome() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [deciding, setDeciding] = useState({});

  const getToken = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;
    if (!data.session) throw new Error('Please log in again.');

    return data.session.access_token;
  };

  const loadComplaints = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setMessage('');

      const token = await getToken();

      const response = await fetch(`${API}/api/my-complaints`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to load your complaints.');
      }

      const records = data.complaints || [];

      const complaintsWithProof = await Promise.all(
        records.map(async (item) => {
          if (!item.resolution_proof_url) return item;

          try {
            const proofResponse = await fetch(
              `${API}/api/complaints/${item.id}/resolution-proof-url`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const proofData = await proofResponse.json();

            if (!proofResponse.ok) {
              return {
                ...item,
                resolution_proof_signed_url: null,
                resolution_proof_error:
                  proofData.error || 'Unable to load resolution photo.',
              };
            }

            return {
              ...item,
              resolution_proof_signed_url: proofData.signed_url,
            };
          } catch (error) {
            return {
              ...item,
              resolution_proof_signed_url: null,
              resolution_proof_error: error.message,
            };
          }
        })
      );

      setComplaints(complaintsWithProof);
    } catch (error) {
      setMessage(error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const submitDecision = async (complaintId, decision) => {
    const accepted = decision === 'accepted';

    const confirmed = window.confirm(
      accepted
        ? 'Are you satisfied with the completed work? Accepting will mark this complaint as Resolved.'
        : 'Are you dissatisfied with the completed work? Rejecting will send this complaint back to In Progress.'
    );

    if (!confirmed) return;

    try {
      setDeciding((previous) => ({
        ...previous,
        [complaintId]: true,
      }));

      setMessage('');

      const token = await getToken();

      const response = await fetch(
        `${API}/api/complaints/${complaintId}/resolution-decision`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ decision }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not save your decision.');
      }

      setMessage(
        accepted
          ? `Complaint #${complaintId} marked as resolved. Thank you for confirming!`
          : `Complaint #${complaintId} returned to In Progress. Thank you for your feedback.`
      );

      await loadComplaints(true);
    } catch (error) {
      setMessage(error.message || 'Unable to submit your decision.');
    } finally {
      setDeciding((previous) => ({
        ...previous,
        [complaintId]: false,
      }));
    }
  };

  const pending = complaints.filter(
    (item) => (item.status || 'Pending') === 'Pending'
  ).length;

  const inProgress = complaints.filter(
    (item) => item.status === 'In Progress'
  ).length;

  const awaiting = complaints.filter(
    (item) => item.status === 'Awaiting Citizen Confirmation'
  ).length;

  const resolved = complaints.filter(
    (item) => item.status === 'Resolved'
  ).length;

  const statusStyle = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Awaiting Citizen Confirmation':
        return 'bg-violet-100 text-violet-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  };

  const stats = [
    {
      label: 'My Complaints',
      value: complaints.length,
      icon: '📋',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      label: 'Pending',
      value: pending,
      icon: '⏳',
      color: 'from-amber-400 to-orange-500',
    },
    {
      label: 'In Progress',
      value: inProgress,
      icon: '🛠️',
      color: 'from-sky-500 to-blue-600',
    },
    {
      label: 'Resolved',
      value: resolved,
      icon: '✓',
      color: 'from-emerald-500 to-green-600',
    },
  ];

  return (
    <div className="min-h-screen px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Welcome banner */}
        <section className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-blue-800 to-indigo-700 p-7 text-white shadow-xl sm:p-10">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-28 right-1/3 h-64 w-64 rounded-full bg-cyan-300/10 blur-2xl" />

          <div className="relative z-10 max-w-2xl">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-100">
              Citizen Dashboard
            </span>

            <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              Your community.
              <br />
              Your voice. Your impact.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">
              Report civic problems, follow their progress and help make your neighbourhood better.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/report"
                className="rounded-xl bg-white px-6 py-3 font-bold text-blue-800 shadow-lg hover:-translate-y-0.5 hover:bg-blue-50"
              >
                + Report an Issue
              </Link>

              <Link
                to="/track"
                className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-bold text-white hover:bg-white/20"
              >
                Track Community Issues
              </Link>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">
                    {loading ? '—' : stat.value}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} text-xl text-white shadow-md`}
                >
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Citizen confirmation notice */}
        {awaiting > 0 && (
          <div className="mb-7 flex flex-col gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-extrabold text-violet-900">
                {awaiting} resolution{awaiting > 1 ? 's' : ''} waiting for your confirmation
              </p>
              <p className="mt-1 text-sm text-violet-700">
                Review the uploaded proof photo and accept or reject the completed work.
              </p>
            </div>

            <span className="w-fit rounded-full bg-violet-100 px-4 py-2 text-xs font-bold text-violet-800">
              Action required
            </span>
          </div>
        )}

        {/* Complaints */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                My Reported Issues
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Follow updates and verify completed work.
              </p>
            </div>

            <button
              onClick={() => loadComplaints(true)}
              disabled={refreshing}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
            >
              {refreshing ? 'Refreshing...' : '↻ Refresh'}
            </button>
          </div>

          {message && (
            <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-800">
              {message}
            </div>
          )}

          {loading ? (
            <div className="py-14 text-center">
              <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
              <p className="text-sm font-semibold text-slate-500">
                Loading your complaints...
              </p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-14 text-center">
              <div className="text-4xl">🏘️</div>
              <h3 className="mt-3 text-lg font-extrabold text-slate-800">
                No complaints yet
              </h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                Your reports will appear here. Start by reporting an issue in your neighbourhood.
              </p>
              <Link
                to="/report"
                className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
              >
                Report Your First Issue
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {complaints.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-blue-200 hover:shadow-md"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Complaint #{item.id}
                        </p>
                        <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                          {item.title || 'Untitled complaint'}
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                          {item.created_at
                            ? new Date(item.created_at).toLocaleString()
                            : 'Date unavailable'}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusStyle(item.status)}`}
                      >
                        {item.status || 'Pending'}
                      </span>
                    </div>

                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {item.description || 'No description provided.'}
                    </p>

                    <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                      <p className="text-slate-600">
                        <strong className="text-slate-800">Location:</strong>{' '}
                        {item.location || 'Not provided'}
                      </p>
                      <p className="text-slate-600">
                        <strong className="text-slate-800">Department:</strong>{' '}
                        {item.department || 'Being classified'}
                      </p>
                      <p className="text-slate-600">
                        <strong className="text-slate-800">Assigned to:</strong>{' '}
                        {item.assigned_to || 'Not assigned yet'}
                      </p>
                      <p className="text-slate-600">
                        <strong className="text-slate-800">Priority:</strong>{' '}
                        {item.ai_priority || item.priority || 'Not specified'}
                      </p>
                    </div>

                    {item.image_url && (
                      <div className="mt-5">
                        <p className="mb-2 text-sm font-bold text-slate-700">
                          Reported Issue Photo
                        </p>
                        <a
                          href={item.image_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            src={item.image_url}
                            alt="Reported issue"
                            className="max-h-56 w-full max-w-md rounded-xl border border-slate-200 object-cover"
                          />
                        </a>
                      </div>
                    )}

                    {item.resolution_proof_url && (
                      <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                        <h4 className="font-extrabold text-emerald-800">
                          Resolution Proof Photo
                        </h4>
                        <p className="mt-1 text-xs text-emerald-700">
                          Photo submitted by the responsible staff member.
                        </p>

                        {item.resolution_proof_signed_url ? (
                          <a
                            href={item.resolution_proof_signed_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              src={item.resolution_proof_signed_url}
                              alt="Resolution proof"
                              className="mt-3 max-h-64 w-full max-w-md rounded-xl border border-emerald-200 bg-white object-contain"
                            />
                          </a>
                        ) : (
                          <p className="mt-3 text-sm text-slate-600">
                            {item.resolution_proof_error ||
                              'Unable to load resolution photo.'}
                          </p>
                        )}

                        {item.status === 'Awaiting Citizen Confirmation' && (
                          <div className="mt-5 border-t border-emerald-200 pt-4">
                            <p className="text-sm font-bold text-slate-800">
                              Is the issue actually fixed?
                            </p>
                            <p className="mt-1 text-xs text-slate-600">
                              Accept only if you are satisfied with the completed work.
                            </p>

                            <div className="mt-4 flex flex-wrap gap-3">
                              <button
                                onClick={() =>
                                  submitDecision(item.id, 'accepted')
                                }
                                disabled={!!deciding[item.id]}
                                className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                              >
                                {deciding[item.id]
                                  ? 'Submitting...'
                                  : '✓ Accept Resolution'}
                              </button>

                              <button
                                onClick={() =>
                                  submitDecision(item.id, 'rejected')
                                }
                                disabled={!!deciding[item.id]}
                                className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                              >
                                ✕ Reject Resolution
                              </button>
                            </div>
                          </div>
                        )}

                        {item.status === 'Resolved' && (
                          <p className="mt-4 text-sm font-bold text-emerald-700">
                            ✓ You confirmed this resolution.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Quick links */}
        <section className="mt-7 grid gap-4 md:grid-cols-3">
          <Link
            to="/report"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card hover:-translate-y-1 hover:border-blue-200"
          >
            <span className="text-2xl">📝</span>
            <h3 className="mt-3 font-extrabold text-slate-900">
              Report an Issue
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Submit a new civic complaint.
            </p>
          </Link>

          <Link
            to="/track"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card hover:-translate-y-1 hover:border-blue-200"
          >
            <span className="text-2xl">📍</span>
            <h3 className="mt-3 font-extrabold text-slate-900">
              Track Issues
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Explore community complaint progress.
            </p>
          </Link>

          <Link
            to="/verify"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card hover:-translate-y-1 hover:border-blue-200"
          >
            <span className="text-2xl">✓</span>
            <h3 className="mt-3 font-extrabold text-slate-900">
              Verify Resolution
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Review completed work and give feedback.
            </p>
          </Link>
        </section>
      </div>
    </div>
  );
}