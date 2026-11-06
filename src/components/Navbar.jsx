import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-slate-100 px-6 py-3.5 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Brand */}
        <Link to="/home" className="flex items-center space-x-2">
          <span className="text-2xl font-black text-blue-600 tracking-tight">CivicPulse</span>
          <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full uppercase">v1.0</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex space-x-6 text-sm font-semibold text-slate-600 items-center">
          <Link to="/home" className="hover:text-blue-600 transition">Home</Link>
          <Link to="/" className="hover:text-blue-600 transition">Track Issues</Link>
          <Link to="/report" className="hover:text-blue-600 transition">Report Issue</Link>
          <Link to="/verify" className="hover:text-blue-600 transition">Verify Resolution</Link>
          <Link to="/emergency" className="bg-red-600 text-white px-3 py-1.5 rounded-xl hover:bg-red-700 transition flex items-center space-x-1 shadow-xs">
            <span>🚨 Emergency</span>
          </Link>
          <Link to="/admin/dashboard" className="text-indigo-600 font-bold hover:underline">Admin Portal</Link>
        </div>

        {/* Action Utility (Notifications + Auth) */}
        <div className="hidden md:flex items-center space-x-3">
          <NotificationDropdown />
          <Link to="/auth" className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition shadow-sm">
            Sign In / Register
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 focus:outline-none"
        >
          {mobileMenuOpen ? '✖' : '☰'}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-4 pb-2 space-y-3 border-t border-slate-100 mt-3 text-sm font-semibold text-slate-700 flex flex-col">
          <Link to="/home" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Track Issues</Link>
          <Link to="/report" onClick={() => setMobileMenuOpen(false)}>Report Issue</Link>
          <Link to="/verify" onClick={() => setMobileMenuOpen(false)}>Verify Resolution</Link>
          <Link to="/emergency" onClick={() => setMobileMenuOpen(false)} className="text-red-600 font-bold">🚨 Emergency</Link>
          <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-indigo-600 font-bold">Admin Portal</Link>
          <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="text-blue-600 font-bold">Sign In / Register</Link>
        </div>
      )}
    </nav>
  );
}