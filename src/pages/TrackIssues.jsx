import React, { useState } from 'react';
import ComplaintCard from '../components/ComplaintCard';

export default function TrackIssues() {
  const [filter, setFilter] = useState('All');

  // Sample data representing community reports
  const issues = [
    {
      id: 1,
      title: 'Broken Streetlight on 5th Avenue',
      category: 'Electricity & Lighting',
      status: 'Pending',
      description: 'The light has been out for 3 days, making the corner very dark at night.',
      location: '5th Avenue, Sector 4',
    },
    {
      id: 2,
      title: 'Large Pothole near Central Market',
      category: 'Roads & Potholes',
      status: 'In Progress',
      description: 'A deep pothole is causing traffic slowdowns and poses a risk to two-wheelers.',
      location: 'Central Market Road',
    },
    {
      id: 3,
      title: 'Overflowing Garbage Bin',
      category: 'Sanitation & Garbage',
      status: 'Resolved',
      description: 'The municipal bin hasn’t been cleared all week, causing bad odors.',
      location: 'Block B, Park Street',
    },
  ];

  const filteredIssues = filter === 'All' ? issues : issues.filter(issue => issue.status === filter);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Track Community Issues</h2>
        
        {/* Filter Buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl space-x-1">
          {['All', 'Pending', 'In Progress', 'Resolved'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filter === status ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Complaint Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIssues.length > 0 ? (
          filteredIssues.map((issue) => (
            <ComplaintCard key={issue.id} {...issue} />
          ))
        ) : (
          <p className="text-gray-500 col-span-2 text-center py-8">No issues found for this filter.</p>
        )}
      </div>
    </div>
  );
}