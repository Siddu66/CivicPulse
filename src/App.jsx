
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import Navbar from './components/Navbar';
import Welcome from './pages/Welcome';
import RoleSelection from './pages/RoleSelection';
import CitizenHome from './pages/CitizenHome';
import TrackIssues from './pages/TrackIssues';
import ReportIssue from './pages/ReportIssue';
import Verification from './pages/Verification';
import AdminDashboard from './pages/AdminDashboard';
import AdministratorDashboard from './pages/AdministratorDashboard';
import EmergencyReport from './pages/EmergencyReport';
import Auth from './pages/Auth';

function AppContent() {
  const location = useLocation();

  const hideNavbar = [
    '/',
    '/roles',
    '/auth',
    '/citizen/login',
    '/admin/login',
    '/administrator/login'
  ].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {!hideNavbar && <Navbar />}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/roles" element={<RoleSelection />} />

          <Route path="/citizen/login" element={<Auth portal="citizen" />} />
          <Route path="/citizen/dashboard" element={<CitizenHome />} />

          <Route path="/home" element={<CitizenHome />} />
          <Route path="/track" element={<TrackIssues />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="/verify" element={<Verification />} />
          <Route path="/emergency" element={<EmergencyReport />} />

          <Route path="/admin/login" element={<Auth portal="admin" />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="/administrator/login" element={<Auth portal="administrator" />} />
          <Route path="/administrator/dashboard" element={<AdministratorDashboard />} />

          <Route path="/auth" element={<Navigate to="/roles" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
