
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-center px-6">
      <div className="max-w-4xl text-center">
        <div className="inline-block bg-blue-500/20 border border-blue-400/30 rounded-full px-5 py-2 text-blue-200 text-sm mb-8">
          AI-Powered Community Platform
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold">
          Civic<span className="text-cyan-400">Pulse</span>
        </h1>

        <p className="text-xl md:text-2xl text-blue-100 mt-6">
          Your Voice. Your Community. Our Responsibility.
        </p>

        <p className="text-slate-300 max-w-2xl mx-auto mt-5 leading-7">
          Report community problems, track their progress and work together
          to build safer, cleaner and better neighbourhoods.
        </p>

        <button
          onClick={() => navigate('/roles')}
          className="mt-10 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold px-10 py-4 rounded-xl text-lg shadow-lg transition"
        >
          Continue →
        </button>

        <p className="text-slate-400 text-sm mt-12">
          Building better communities, one report at a time.
        </p>
      </div>
    </div>
  );
}
