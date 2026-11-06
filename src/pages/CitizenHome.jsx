import React from 'react';
import { Link } from 'react-router-dom';

export default function CitizenHome() {
  const stats = [
    { label: 'Total Complaints Reported', count: '1,240', color: 'bg-blue-500' },
    { label: 'Issues In Progress', count: '184', color: 'bg-yellow-500' },
    { label: 'Successfully Resolved', count: '986', color: 'bg-green-500' },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">Empower Your Neighborhood</h1>
          <p className="text-blue-100 max-w-lg mb-6">
            Report local civic issues, support nearby complaints, and verify official resolutions directly.
          </p>
          <div className="flex gap-4">
            <Link to="/report" className="bg-white text-blue-600 px-5 py-2.5 rounded-xl font-bold hover:bg-blue-50 transition shadow">
              📢 Report Problem
            </Link>
            <Link to="/emergency" className="bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-600 transition shadow">
              🚨 Emergency
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className={`w-3 h-12 ${stat.color} rounded-full`}></div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stat.count}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-lg text-slate-800 mb-2">Track & Support Complaints</h3>
          <p className="text-sm text-slate-600 mb-4">View real-time progress on reported community issues across your area.</p>
          <Link to="/" className="text-sm text-blue-600 font-semibold hover:underline">
            View All Issues &rarr;
          </Link>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-lg text-slate-800 mb-2">Resolution Verification</h3>
          <p className="text-sm text-slate-600 mb-4">Review work completed by government officials and confirm or reject resolution.</p>
          <Link to="/verify" className="text-sm text-blue-600 font-semibold hover:underline">
            Review Resolved Issues &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}