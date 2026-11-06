import React, { useState } from 'react';

export default function Verification() {
  const [resolvedIssues, setResolvedIssues] = useState([
    {
      id: 1,
      title: 'Pothole Repair on Main Street',
      category: 'Roads',
      officialNote: 'Filled with cold mix asphalt and leveled.',
      dateResolved: '2026-11-04',
      status: 'Awaiting Citizen Verification',
    },
  ]);

  const handleAction = (id, decision) => {
    alert(`Complaint #${id} has been marked as: ${decision}`);
    setResolvedIssues(resolvedIssues.filter(issue => issue.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Resolution Verification</h2>

      {resolvedIssues.length === 0 ? (
        <p className="text-slate-500 text-center py-10 bg-white rounded-xl shadow-sm">
          No resolved complaints awaiting your verification.
        </p>
      ) : (
        resolvedIssues.map((issue) => (
          <div key={issue.id} className="bg-white rounded-xl p-6 shadow-md border border-slate-100 mb-4 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-semibold">
                  {issue.status}
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-2">{issue.title}</h3>
              </div>
              <span className="text-xs text-slate-400">{issue.dateResolved}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
              <span className="font-semibold text-slate-700">Official Note: </span>
              <span className="text-slate-600">{issue.officialNote}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => handleAction(issue.id, 'ACCEPTED & CLOSED')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold transition"
              >
                ✅ Accept Resolution
              </button>
              <button
                onClick={() => handleAction(issue.id, 'REJECTED & REOPENED')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-semibold transition"
              >
                ❌ Reject & Reopen
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}