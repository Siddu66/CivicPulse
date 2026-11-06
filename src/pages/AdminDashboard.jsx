import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const API = 'http://127.0.0.1:5000';

export default function AdminDashboard() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [locations, setLocations] = useState({});
    const [assignees, setAssignees] = useState({});
    const [messages, setMessages] = useState({});
    const [proofFiles, setProofFiles] = useState({});
    const [uploading, setUploading] = useState({});

    const getToken = async () => {
        const { data, error: sessionError } =
            await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        return data?.session?.access_token;
    };

    const loadComplaints = async () => {
        try {
            setLoading(true);
            setError('');

            const token = await getToken();
            if (!token) throw new Error('Please log in again.');

            const response = await fetch(`${API}/api/complaints`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Could not load complaints.');
            }

            const all = Array.isArray(data)
                ? data
                : data.complaints || data.data || [];

            const active = all.filter(
                (complaint) => complaint.status !== 'Resolved'
            );

            setComplaints(active);

            const locationValues = {};
            const assignmentValues = {};

            active.forEach((complaint) => {
                locationValues[complaint.id] = complaint.location || '';
                assignmentValues[complaint.id] = complaint.assigned_to || '';
            });

            setLocations(locationValues);
            setAssignees(assignmentValues);
        } catch (err) {
            setError(err.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadComplaints();
    }, []);

    const showMessage = (id, text, isError = false) => {
        setMessages((previous) => ({
            ...previous,
            [id]: { text, isError },
        }));
    };

    const saveLocation = async (id) => {
        try {
            const token = await getToken();
            if (!token) throw new Error('Please log in again.');

            if (!locations[id]?.trim()) {
                throw new Error('Please enter a complaint location.');
            }

            const response = await fetch(
                `${API}/api/complaints/${id}/location`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        location: locations[id].trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Location update failed.');
            }

            showMessage(id, 'Location updated successfully.');
            await loadComplaints();
        } catch (err) {
            showMessage(id, err.message, true);
        }
    };

    const saveAssignment = async (id) => {
        try {
            const token = await getToken();
            if (!token) throw new Error('Please log in again.');

            if (!assignees[id]?.trim()) {
                throw new Error('Please enter an officer name.');
            }

            const response = await fetch(`${API}/api/complaints/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    assigned_to: assignees[id].trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Assignment failed.');
            }

            showMessage(id, 'Officer assigned successfully.');
            await loadComplaints();
        } catch (err) {
            showMessage(id, err.message, true);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            if (status === 'Resolved') {
                throw new Error(
                    'Citizen confirmation is required before resolving.'
                );
            }

            const token = await getToken();
            if (!token) throw new Error('Please log in again.');

            const response = await fetch(`${API}/api/complaints/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Status update failed.');
            }

            showMessage(id, 'Complaint status updated.');
            await loadComplaints();
        } catch (err) {
            showMessage(id, err.message, true);
        }
    };

    const uploadProof = async (id) => {
        try {
            const file = proofFiles[id];

            if (!file) {
                throw new Error('Please select a resolution photo.');
            }

            if (!file.type.startsWith('image/')) {
                throw new Error('Please select a valid image file.');
            }

            if (file.size > 5 * 1024 * 1024) {
                throw new Error('Image must be smaller than 5 MB.');
            }

            const token = await getToken();
            if (!token) throw new Error('Please log in again.');

            setUploading((previous) => ({
                ...previous,
                [id]: true,
            }));

            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(
                `${API}/api/complaints/${id}/resolution-proof`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Photo upload failed.');
            }

            setProofFiles((previous) => ({
                ...previous,
                [id]: null,
            }));

            showMessage(
                id,
                'Resolution photo uploaded. Waiting for citizen confirmation.'
            );

            await loadComplaints();
        } catch (err) {
            showMessage(id, err.message, true);
        } finally {
            setUploading((previous) => ({
                ...previous,
                [id]: false,
            }));
        }
    };

    const hasCoordinates = (complaint) => {
        const lat = Number(complaint.latitude);
        const lon = Number(complaint.longitude);

        return (
            complaint.latitude !== null &&
            complaint.latitude !== undefined &&
            complaint.longitude !== null &&
            complaint.longitude !== undefined &&
            Number.isFinite(lat) &&
            Number.isFinite(lon) &&
            lat >= -90 &&
            lat <= 90 &&
            lon >= -180 &&
            lon <= 180
        );
    };

    const mapUrl = (complaint) => {
        const lat = Number(complaint.latitude);
        const lon = Number(complaint.longitude);
        const delta = 0.005;

        const bbox = [
            lon - delta,
            lat - delta,
            lon + delta,
            lat + delta,
        ].join('%2C');

        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
    };

    const statusClass = (status) => {
        if (status === 'In Progress') {
            return 'bg-blue-100 text-blue-700';
        }

        if (status === 'Awaiting Citizen Confirmation') {
            return 'bg-violet-100 text-violet-700';
        }

        if (status === 'Rejected') {
            return 'bg-red-100 text-red-700';
        }

        return 'bg-amber-100 text-amber-700';
    };

    const priorityClass = (priority) => {
        if (priority === 'High' || priority === 'Critical') {
            return 'bg-red-100 text-red-700';
        }

        if (priority === 'Medium') {
            return 'bg-orange-100 text-orange-700';
        }

        return 'bg-slate-100 text-slate-600';
    };

    const inputClass =
        'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100';

    const buttonClass =
        'rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50';

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 text-center shadow-card">
                    <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                    <p className="font-semibold text-slate-700">
                        Loading complaints...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-7 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                <section className="mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-900 p-6 text-white shadow-xl sm:p-9">
                    <div className="flex flex-wrap items-center justify-between gap-5">
                        <div>
                            <span className="rounded-full border border-blue-300/30 bg-blue-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-200">
                                CivicPulse • Staff workspace
                            </span>

                            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Admin Dashboard
                            </h1>

                            <p className="mt-2 max-w-xl text-sm text-blue-100 sm:text-base">
                                Review community reports, coordinate officers and verify completed work.
                            </p>
                        </div>

                        <button
                            onClick={loadComplaints}
                            className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-800 shadow-lg hover:bg-blue-50"
                        >
                            ↻ Refresh Complaints
                        </button>
                    </div>
                </section>

                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                        {error}
                    </div>
                )}

                <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                        <p className="text-sm font-semibold text-slate-500">
                            Unresolved complaints
                        </p>
                        <p className="mt-2 text-3xl font-extrabold text-slate-900">
                            {complaints.length}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                        <p className="text-sm font-semibold text-slate-500">
                            Pending
                        </p>
                        <p className="mt-2 text-3xl font-extrabold text-amber-600">
                            {complaints.filter((c) => (c.status || 'Pending') === 'Pending').length}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                        <p className="text-sm font-semibold text-slate-500">
                            In progress
                        </p>
                        <p className="mt-2 text-3xl font-extrabold text-blue-600">
                            {complaints.filter((c) => c.status === 'In Progress').length}
                        </p>
                    </div>
                </section>

                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900">
                            Complaint management
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Resolved complaints are hidden from this work queue.
                        </p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                        {complaints.length} active reports
                    </span>
                </div>

                {complaints.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-card">
                        <div className="text-4xl">🎉</div>
                        <h3 className="mt-3 text-lg font-bold text-slate-800">
                            All caught up!
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            There are no unresolved complaints at the moment.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {complaints.map((c) => (
                            <article
                                key={c.id}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card"
                            >
                                <div className="border-b border-slate-100 p-5 sm:p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Complaint #{c.id}
                                            </p>
                                            <h3 className="mt-1 text-xl font-extrabold text-slate-900">
                                                {c.title || 'Untitled complaint'}
                                            </h3>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {c.created_at
                                                    ? new Date(c.created_at).toLocaleString()
                                                    : 'Date unavailable'}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusClass(c.status || 'Pending')}`}>
                                                {c.status || 'Pending'}
                                            </span>
                                            <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${priorityClass(c.ai_priority || c.priority)}`}>
                                                {c.ai_priority || c.priority || 'Priority unknown'} priority
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Category
                                            </p>
                                            <p className="mt-1 font-semibold text-slate-800">
                                                {c.category || c.ai_category || 'Not specified'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Automatically assigned department
                                            </p>
                                            <p className="mt-1 font-semibold text-blue-700">
                                                {c.department || 'Not classified'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                            Description
                                        </p>
                                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                            {c.description || 'No description provided.'}
                                        </p>
                                    </div>

                                    {c.image_url && (
                                        <div className="mt-5">
                                            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                                                Reported issue photo
                                            </p>
                                            <a href={c.image_url} target="_blank" rel="noreferrer">
                                                <img
                                                    src={c.image_url}
                                                    alt="Reported complaint"
                                                    className="h-48 w-full max-w-sm rounded-xl border border-slate-200 object-cover"
                                                />
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2">
                                    <section>
                                        <h4 className="font-extrabold text-slate-900">
                                            📍 Complaint location
                                        </h4>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Current address: {c.location || 'Not provided'}
                                        </p>

                                        {hasCoordinates(c) ? (
                                            <>
                                                <p className="mt-2 text-xs text-slate-500">
                                                    Latitude: {Number(c.latitude).toFixed(6)} · Longitude: {Number(c.longitude).toFixed(6)}
                                                </p>

                                                <iframe
                                                    title={`GPS location for complaint ${c.id}`}
                                                    src={mapUrl(c)}
                                                    width="100%"
                                                    height="250"
                                                    className="mt-3 rounded-xl border border-slate-200"
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                />

                                                <a
                                                    href={`https://www.openstreetmap.org/?mlat=${c.latitude}&mlon=${c.longitude}#map=17/${c.latitude}/${c.longitude}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-2 inline-block text-sm font-bold text-blue-600 hover:underline"
                                                >
                                                    Open full map ↗
                                                </a>
                                            </>
                                        ) : (
                                            <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                                                GPS coordinates are unavailable. You can still correct the address below.
                                            </p>
                                        )}

                                        <label className="mt-5 block text-sm font-bold text-slate-700">
                                            Correct complaint address
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={locations[c.id] ?? ''}
                                            onChange={(e) =>
                                                setLocations((previous) => ({
                                                    ...previous,
                                                    [c.id]: e.target.value,
                                                }))
                                            }
                                            placeholder="Enter corrected location"
                                        />

                                        <button
                                            className={`${buttonClass} mt-3`}
                                            onClick={() => saveLocation(c.id)}
                                        >
                                            Save Corrected Location
                                        </button>
                                    </section>

                                    <section>
                                        <h4 className="font-extrabold text-slate-900">
                                            🏢 Department & assignment
                                        </h4>

                                        <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                                            <p className="text-xs font-bold uppercase tracking-wider text-blue-500">
                                                Automatically classified department
                                            </p>
                                            <p className="mt-1 font-bold text-blue-900">
                                                {c.department || 'Not classified'}
                                            </p>
                                        </div>

                                        <label className="mt-5 block text-sm font-bold text-slate-700">
                                            Assigned officer / staff member
                                        </label>
                                        <input
                                            className={inputClass}
                                            value={assignees[c.id] ?? ''}
                                            onChange={(e) =>
                                                setAssignees((previous) => ({
                                                    ...previous,
                                                    [c.id]: e.target.value,
                                                }))
                                            }
                                            placeholder="Enter officer or staff name"
                                        />

                                        <button
                                            className={`${buttonClass} mt-3`}
                                            onClick={() => saveAssignment(c.id)}
                                        >
                                            Save Officer Assignment
                                        </button>

                                        <label className="mt-6 block text-sm font-bold text-slate-700">
                                            Update complaint status
                                        </label>
                                        <select
                                            className={inputClass}
                                            value={c.status || 'Pending'}
                                            onChange={(e) => updateStatus(c.id, e.target.value)}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Awaiting Citizen Confirmation">
                                                Awaiting Citizen Confirmation
                                            </option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                        <p className="mt-2 text-xs text-slate-500">
                                            A complaint can only become Resolved after the citizen accepts the resolution.
                                        </p>
                                    </section>
                                </div>

                                <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6">
                                    <h4 className="font-extrabold text-slate-900">
                                        📷 Resolution proof
                                    </h4>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Upload a photo showing the completed work. The citizen can then accept or reject the resolution.
                                    </p>

                                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2.5 file:font-bold file:text-blue-700 hover:file:bg-blue-100"
                                            onChange={(e) =>
                                                setProofFiles((previous) => ({
                                                    ...previous,
                                                    [c.id]: e.target.files?.[0] || null,
                                                }))
                                            }
                                        />

                                        <button
                                            className="shrink-0 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            disabled={!!uploading[c.id]}
                                            onClick={() => uploadProof(c.id)}
                                        >
                                            {uploading[c.id]
                                                ? 'Uploading...'
                                                : 'Upload Resolution Photo'}
                                        </button>
                                    </div>

                                    <p className="mt-2 text-xs text-slate-400">
                                        JPG, PNG or WEBP · Maximum 5 MB
                                    </p>

                                    {messages[c.id] && (
                                        <p
                                            role="status"
                                            className={`mt-4 rounded-xl p-3 text-sm font-semibold ${messages[c.id].isError
                                                    ? 'border border-red-200 bg-red-50 text-red-700'
                                                    : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                                                }`}
                                        >
                                            {messages[c.id].text}
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