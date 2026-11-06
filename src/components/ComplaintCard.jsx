import React from 'react';

export default function ComplaintCard({ title, category, status, description, location }) {
  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
    Resolved: 'bg-green-100 text-green-800 border-green-300',
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wide">
          {category}
        </span>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColors[status] || 'bg-gray-100'}`}>
          {status}
        </span>
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <p className="text-xs text-gray-400">📍 {location}</p>
    </div>
  );
}