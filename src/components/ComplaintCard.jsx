import React, { useState } from 'react';

export default function ComplaintCard({ title, category, status, description, location, upvotes: initialUpvotes = 0, priority = 'Medium' }) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
    Resolved: 'bg-green-100 text-green-800 border-green-300',
  };

  const priorityColors = {
    Low: 'text-gray-500 bg-gray-100',
    Medium: 'text-orange-600 bg-orange-50',
    High: 'text-red-600 bg-red-50 font-bold',
  };

  const handleUpvote = () => {
    if (hasUpvoted) {
      setUpvotes(upvotes - 1);
      setHasUpvoted(false);
    } else {
      setUpvotes(upvotes + 1);
      setHasUpvoted(true);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-2 items-center">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 uppercase">
              {category}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[priority]}`}>
              {priority} Priority
            </span>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColors[status] || 'bg-gray-100'}`}>
            {status}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-2">
        <span className="text-xs text-gray-400">📍 {location}</span>
        
        {/* Upvote / Community Support Button */}
        <button
          onClick={handleUpvote}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            hasUpvoted ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <span>👍 Support</span>
          <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{upvotes}</span>
        </button>
      </div>
    </div>
  );
}