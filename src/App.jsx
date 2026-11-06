import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CitizenHome from './pages/CitizenHome';
import TrackIssues from './pages/TrackIssues';
import ReportIssue from './pages/ReportIssue';
import Verification from './pages/Verification';
import AdminDashboard from './pages/AdminDashboard';
import EmergencyReport from './pages/EmergencyReport';
import Auth from './pages/Auth';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        {/* Global Navigation Bar */}
        <Navbar />

        {/* Main Content Viewport */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<TrackIssues />} />
            <Route path="/home" element={<CitizenHome />} />
            <Route path="/report" element={<ReportIssue />} />
            <Route path="/verify" element={<Verification />} />
            <Route path="/emergency" element={<EmergencyReport />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}