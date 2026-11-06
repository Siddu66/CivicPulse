import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const API = 'http://127.0.0.1:5000';

export default function AdministratorDashboard() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [proofs, setProofs] = useState({});
    const [proofLoading, setProofLoading] = useState({});

    const loadComplaints = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError('');

            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError) throw sessionError;
            if (!session) throw new Error('Please log in again.');

            const response = await fetch(`${API}/api/complaints`, {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Unable to load complaints.');
            }

            const all = Array.isArray(data)
                ? data
                : data.complaints || data.data || [];

            // Administrator monitoring is limited to complaints assigned to staff.
            setComplaints(all);
        } catch (err) {
            setError(err.message || 'Something went wrong.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadComplaints();
    }, []);

    const viewResolutionProof = async (complaintId) => {
        try {
            setProofLoading((previous) => ({
                ...previous,
                [complaintId]: true,
            }));

            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError) throw sessionError;
            if (!session) throw new Error('Please log in again.');

            const response = await fetch(
                `${API}/api/administrator/complaints/${complaintId}/resolution-proof`,
                {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || 'Could not load resolution proof.'
                );
            }

            if (!data.url) {
                throw new Error('Resolution proof URL was not returned.');
            }

            setProofs((previous) => ({
                ...previous,
                [complaintId]: data.url,
            }));
        } catch (err) {
            setError(err.message || 'Unable to view resolution photo.');
        } finally {
            setProofLoading((previous) => ({
                ...previous,
                [complaintId]: false,
            }));
        }
    };

    const count = (status) =>
        complaints.filter((complaint) => complaint.status === status).length;

    const personnel = Object.values(
        complaints.reduce((result, complaint) => {
            const name = complaint.assigned_to || 'Unassigned';

            if (!result[name]) {
                result[name] = {
                    name,
                    total: 0,
                    pending: 0,
                    progress: 0,
                    awaiting: 0,
                    resolved: 0,
                    rejected: 0,
                };
            }

            result[name].total++;

            if (complaint.status === 'Pending') result[name].pending++;
            if (complaint.status === 'In Progress') result[name].progress++;
            if (complaint.status === 'Awaiting Citizen Confirmation') {
                result[name].awaiting++;
            }
            if (complaint.status === 'Resolved') result[name].resolved++;
            if (complaint.status === 'Rejected') result[name].rejected++;

            return result;
        }, {})
    );

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

    const priorityStyle = (priority) => {
        if (priority === 'High' || priority === 'Critical') {
            return 'bg-red-100 text-red-700';
        }

        if (priority === 'Medium') {
            return 'bg-orange-100 text-orange-700';
        }

        return 'bg-slate-100 text-slate-600';
    };

    const stats = [
        {
            label: 'Assigned Complaints',
            value: complaints.length,
            icon: '📋',
            color: 'from-blue-500 to-indigo-600',
        },
        {
            label: 'Pending',
            value: count('Pending'),
            icon: '⏳',
            color: 'from-amber-400 to-orange-500',
        },
        {
            label: 'In Progress',
            value: count('In Progress'),
            icon: '🛠️',
            color: 'from-sky-500 to-blue-600',
        },
        {
            label: 'Resolved',
            value: count('Resolved'),
            icon: '✓',
            color: 'from-emerald-500 to-green-600',
        },
    ];

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 text-center shadow-card">
                    <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                    <p className="font-semibold text-slate-700">
                        Loading administrator dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-7 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* Hero */}
                <section className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-900 p-7 text-white shadow-xl sm:p-10">
                    <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-violet-400/15 blur-2xl" />

                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
                        <div>
                            <span className="rounded-full border border-violet-300/30 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-200">
                                CivicPulse • Government oversight
                            </span>

                            <h1 className="mt-5 text-3xl font-extrabold sm:text-4xl">
                                Administrator Portal
                            </h1>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-violet-100 sm:text-base">
                                Monitor assigned work, review staff performance and oversee community issue resolution.
                            </p>
                        </div>

                        <button
                            onClick={() => loadComplaints(true)}
                            disabled={refreshing}
                            className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-900 shadow-lg hover:bg-violet-50 disabled:opacity-50"
                        >
                            {refreshing ? 'Refreshing...' : '↻ Refresh Data'}
                        </button>
                    </div>
                </section>

                {error && (
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                        <span>{error}</span>
                        <button
                            onClick={() => loadComplaints(true)}
                            className="font-bold underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

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
                                        {stat.value}
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

                {/* Personnel performance */}
                <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
                    <div className="border-b border-slate-100 p-5 sm:p-6">
                        <h2 className="text-xl font-extrabold text-slate-900">
                            Personnel Performance
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Overview of complaints assigned to each staff member.
                        </p>
                    </div>

                    {personnel.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="font-semibold text-slate-700">
                                No personnel data available.
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Staff performance will appear after complaints are assigned.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[650px] text-left">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-5 py-4 font-bold">Personnel</th>
                                        <th className="px-4 py-4 font-bold">Total</th>
                                        <th className="px-4 py-4 font-bold">Pending</th>
                                        <th className="px-4 py-4 font-bold">In Progress</th>
                                        <th className="px-4 py-4 font-bold">Awaiting Citizen</th>
                                        <th className="px-4 py-4 font-bold">Resolved</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {personnel.map((person) => (
                                        <tr
                                            key={person.name}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4 font-bold text-slate-800">
                                                {person.name}
                                            </td>
                                            <td className="px-4 py-4 font-semibold text-slate-700">
                                                {person.total}
                                            </td>
                                            <td className="px-4 py-4 text-amber-700">
                                                {person.pending}
                                            </td>
                                            <td className="px-4 py-4 text-blue-700">
                                                {person.progress}
                                            </td>
                                            <td className="px-4 py-4 text-violet-700">
                                                {person.awaiting}
                                            </td>
                                            <td className="px-4 py-4 text-emerald-700">
                                                {person.resolved}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Complaint monitoring */}
                <div className="mb-5">
                    <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                        Assigned Complaint Monitoring
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Review assigned complaints and inspect uploaded resolution evidence.
                    </p>
                </div>

                {complaints.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-card">
                        <div className="text-4xl">📊</div>
                        <h3 className="mt-3 text-lg font-extrabold text-slate-800">
                            No assigned complaints
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Complaints will appear here after an admin assigns them to staff.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {complaints.map((complaint) => (
                            <article
                                key={complaint.id}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card"
                            >
                                <div className="p-5 sm:p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Complaint #{complaint.id}
                                            </p>

                                            <h3 className="mt-1 text-xl font-extrabold text-slate-900">
                                                {complaint.title || 'Untitled complaint'}
                                            </h3>

                                            <p className="mt-1 text-xs text-slate-400">
                                                {complaint.created_at
                                                    ? new Date(complaint.created_at).toLocaleString()
                                                    : 'Date unavailable'}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <span
                                                className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusStyle(complaint.status || 'Pending')}`}
                                            >
                                                {complaint.status || 'Pending'}
                                            </span>

                                            <span
                                                className={`rounded-full px-3 py-1.5 text-xs font-bold ${priorityStyle(complaint.ai_priority || complaint.priority)}`}
                                            >
                                                {complaint.ai_priority || complaint.priority || 'Priority not set'}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                        {complaint.description || 'No description provided.'}
                                    </p>

                                    <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                                        <p className="text-slate-600">
                                            <strong className="text-slate-800">Location:</strong>{' '}
                                            {complaint.location || 'Not specified'}
                                        </p>
                                        <p className="text-slate-600">
                                            <strong className="text-slate-800">Category:</strong>{' '}
                                            {complaint.category || complaint.ai_category || 'Not specified'}
                                        </p>
                                        <p className="text-slate-600">
                                            <strong className="text-slate-800">Department:</strong>{' '}
                                            {complaint.department || 'Not specified'}
                                        </p>
                                        <p className="text-slate-600">
                                            <strong className="text-slate-800">Assigned to:</strong>{' '}
                                            {complaint.assigned_to || 'Not assigned'}
                                        </p>
                                    </div>

                                    {complaint.image_url && (
                                        <div className="mt-5">
                                            <p className="mb-2 text-sm font-bold text-slate-700">
                                                Complaint Photo
                                            </p>
                                            <a
                                                href={complaint.image_url}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <img
                                                    src={complaint.image_url}
                                                    alt="Reported complaint"
                                                    className="max-h-64 w-full max-w-lg rounded-xl border border-slate-200 object-cover"
                                                />
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6">
                                    <h4 className="font-extrabold text-slate-900">
                                        Resolution Evidence
                                    </h4>

                                    {complaint.resolution_proof_url ? (
                                        <>
                                            <p className="mt-1 text-sm font-semibold text-emerald-700">
                                                ✓ Resolution proof has been uploaded.
                                            </p>

                                            <button
                                                onClick={() => viewResolutionProof(complaint.id)}
                                                disabled={!!proofLoading[complaint.id]}
                                                className="mt-4 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                                            >
                                                {proofLoading[complaint.id]
                                                    ? 'Loading proof...'
                                                    : proofs[complaint.id]
                                                        ? 'Refresh Resolution Photo'
                                                        : 'View Resolution Proof'}
                                            </button>

                                            {proofs[complaint.id] && (
                                                <div className="mt-5">
                                                    <p className="mb-2 text-sm font-bold text-slate-700">
                                                        Resolution Photo
                                                    </p>
                                                    <a
                                                        href={proofs[complaint.id]}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        <img
                                                            src={proofs[complaint.id]}
                                                            alt="Resolution proof"
                                                            className="max-h-72 w-full max-w-lg rounded-xl border border-slate-200 bg-white object-contain"
                                                        />
                                                    </a>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="mt-2 rounded-xl bg-orange-50 p-3 text-sm font-medium text-orange-700">
                                            Resolution proof has not been uploaded yet.
                                        </p>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}