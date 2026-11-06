
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Auth({ portal = 'citizen' }) {
  const navigate = useNavigate();

  const portalConfig = {
    citizen: {
      title: 'Citizen Portal',
      role: 'citizen',
      destination: '/citizen/dashboard',
      description: 'Create an account to report and track community issues.',
    },
    admin: {
      title: 'Admin Portal',
      role: 'admin',
      destination: '/admin/dashboard',
      description: 'Manage complaints and coordinate resolutions.',
    },
    administrator: {
      title: 'Administrator Portal',
      role: 'administrator',
      destination: '/administrator/dashboard',
      description: 'Access department administration services.',
    },
  };

  const config = portalConfig[portal] || portalConfig.citizen;
  const canRegister = portal !== 'administrator';
  const isCitizen = portal === 'citizen';
  const isAdmin = portal === 'admin';

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [address, setAddress] = useState({
    district: '',
    taluk: '',
    city: '',
    village: '',
    area: '',
    ward: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const updateAddress = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const adminAddressFields = [
    { name: 'district', label: 'District', placeholder: 'Enter assigned district' },
    { name: 'area', label: 'Area / Locality', placeholder: 'Enter assigned area' },
    { name: 'ward', label: 'Ward Number', placeholder: 'Enter assigned ward number' },
  ];

  const citizenAddressFields = [
    { name: 'district', label: 'District', placeholder: 'Enter district' },
    { name: 'taluk', label: 'Taluk', placeholder: 'Enter taluk' },
    { name: 'city', label: 'City', placeholder: 'Enter city' },
    { name: 'village', label: 'Village', placeholder: 'Enter village' },
    { name: 'area', label: 'Area / Locality', placeholder: 'Enter area or locality' },
    { name: 'ward', label: 'Ward Number', placeholder: 'Enter ward number' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      if (!isLogin) {
        if (!canRegister) {
          throw new Error('Administrator registration is disabled.');
        }

        if (!name.trim()) {
          throw new Error('Please enter your full name.');
        }

        if (password.length < 6) {
          throw new Error('Password must contain at least 6 characters.');
        }

        const requiredFields = isAdmin
          ? ['district', 'area', 'ward']
          : ['district', 'taluk', 'city', 'village', 'area', 'ward'];

        for (const field of requiredFields) {
          if (!address[field].trim()) {
            throw new Error(`Please enter your ${field}.`);
          }
        }

        const signupMetadata = {
          full_name: name.trim(),
          requested_portal: portal,
          ...address,
        };

        const { data, error: signupError } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: signupMetadata,
            },
          });

        if (signupError) throw signupError;

        setMessage(
          data.session
            ? 'Registration successful! Your address details have been saved. You can now log in.'
            : 'Registration successful! Check your email to confirm your account, then log in.'
        );

        setIsLogin(true);
        setPassword('');
        return;
      }

      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) throw loginError;

      const user = data.user;

      const { data: profile, error: profileError } =
        await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        await supabase.auth.signOut();
        throw new Error(
          'Your account profile is not ready. Please contact the administrator.'
        );
      }

      if (profile.role !== config.role) {
        await supabase.auth.signOut();
        throw new Error(
          `This account does not have ${config.title} access. Please use the correct portal.`
        );
      }

      navigate(config.destination);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fieldsToShow = isAdmin
    ? adminAddressFields
    : citizenAddressFields;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">

        <button
          type="button"
          onClick={() => navigate('/roles')}
          className="text-sm text-blue-600 hover:underline mb-6"
        >
          ← Back to portal selection
        </button>

        <div className="text-center mb-7">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Civic<span className="text-blue-600">Pulse</span>
          </h1>
          <h2 className="text-xl font-bold text-slate-800 mt-4">
            {config.title}
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            {config.description}
          </p>
        </div>

        {canRegister && (
          <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
                setMessage('');
              }}
              className={`flex-1 py-2 rounded-md font-semibold ${isLogin ? 'bg-white text-blue-700 shadow' : 'text-slate-500'
                }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
                setMessage('');
              }}
              className={`flex-1 py-2 rounded-md font-semibold ${!isLogin ? 'bg-white text-blue-700 shadow' : 'text-slate-500'
                }`}
            >
              Register New
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {!isLogin && canRegister && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold text-slate-800 mb-1">
                  {isAdmin ? 'Assigned Administrative Area' : 'Residential Address'}
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  {isAdmin
                    ? 'Enter the district, area and ward this admin is responsible for.'
                    : 'Enter your residential location details.'}
                </p>

                <div className="space-y-3">
                  {fieldsToShow.map(field => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        name={field.name}
                        value={address[field.name]}
                        onChange={updateAddress}
                        placeholder={field.placeholder}
                        required
                        className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 rounded-lg transition"
          >
            {loading
              ? 'Please wait...'
              : isLogin
                ? 'Login'
                : 'Create Account'}
          </button>
        </form>

        {canRegister && (
          <p className="text-center text-sm text-slate-500 mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setMessage('');
              }}
              className="text-blue-600 font-semibold hover:underline"
            >
              {isLogin ? 'Register New' : 'Login'}
            </button>
          </p>
        )}

        {!canRegister && (
          <p className="text-center text-sm text-slate-500 mt-6">
            Authorized department officials only.
          </p>
        )}
      </div>
    </div>
  );
}
