import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const navigate = useNavigate();

  // Tab State: 'citizen' | 'official'
  const [role, setRole] = useState('citizen');
  // Auth Mode: 'login' | 'signup'
  const [isLogin, setIsLogin] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Official-specific fields
    designation: '',
    district: '',
    subDivision: '',
    taluk: '',
    gramPanchayat: '',
    wardNumber: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    // Role-based redirection logic
    if (role === 'official') {
      alert(`Welcome, Official! Logged in as ${formData.designation || 'Government Official'}.`);
      navigate('/admin/dashboard');
    } else {
      alert('Welcome! Logged in as Citizen.');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-slate-800">CivicPulse</h1>
          <p className="text-slate-500 text-sm mt-1">
            {role === 'official' ? 'Government Officials Portal' : 'Citizen Community Portal'}
          </p>
        </div>

        {/* Role Selector Tabs (Citizen vs Official) */}
        <div className="flex bg-slate-200 p-1 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => setRole('citizen')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              role === 'citizen' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Citizen
          </button>
          <button
            type="button"
            onClick={() => setRole('official')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              role === 'official' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Government Official
          </button>
        </div>

        {/* Sign In vs Sign Up Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              !isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
              />
            </div>
          )}

          {/* Dynamic Official Designation Fields */}
          {!isLogin && role === 'official' && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3 mt-4">
              <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider">Official Jurisdiction Info</h3>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                <select
                  name="designation"
                  required
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                >
                  <option value="">-- Select Designation --</option>
                  <option value="DC">DC (Deputy Commissioner)</option>
                  <option value="AC">AC (Assistant Commissioner)</option>
                  <option value="Tahsildar">Tahsildar</option>
                  <option value="PDO">PDO (Panchayat Dev. Officer)</option>
                  <option value="Ward Officer">Ward Officer</option>
                </select>
              </div>

              {/* Conditional Dynamic Fields based on Designation */}
              {formData.designation && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    name="district"
                    required
                    placeholder="e.g., Dakshina Kannada"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  />
                </div>
              )}

              {['AC', 'Tahsildar', 'PDO'].includes(formData.designation) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sub-Division / Taluk</label>
                  <input
                    type="text"
                    name="taluk"
                    required
                    placeholder="e.g., Mangaluru Taluk"
                    value={formData.taluk}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  />
                </div>
              )}

              {formData.designation === 'PDO' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gram Panchayat</label>
                  <input
                    type="text"
                    name="gramPanchayat"
                    required
                    placeholder="e.g., Gurupura GP"
                    value={formData.gramPanchayat}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  />
                </div>
              )}

              {formData.designation === 'Ward Officer' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ward Number / Name</label>
                  <input
                    type="text"
                    name="wardNumber"
                    required
                    placeholder="e.g., Ward No. 42 (Kadri)"
                    value={formData.wardNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  />
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow transition duration-200 mt-4"
          >
            {isLogin ? `Sign In as ${role === 'official' ? 'Official' : 'Citizen'}` : 'Register Account'}
          </button>
        </form>

      </div>
    </div>
  );
}