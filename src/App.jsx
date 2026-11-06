import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TrackIssues from './pages/TrackIssues';
import ReportIssue from './pages/ReportIssue';
import Auth from './pages/Auth';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Navbar */}
        <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-extrabold text-blue-600">CivicPulse</Link>
          <div className="space-x-6 text-sm font-semibold text-slate-600">
            <Link to="/" className="hover:text-blue-600 transition">Track Issues</Link>
            <Link to="/report" className="hover:text-blue-600 transition">Report Issue</Link>
            <Link to="/auth" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Login / Sign Up</Link>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<TrackIssues />} />
            <Route path="/report" element={<ReportIssue />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}