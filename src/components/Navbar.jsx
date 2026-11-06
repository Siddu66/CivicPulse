
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [role, setRole] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !active) {
        if (active) setRole('');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (active) setRole(data?.role || '');
    };

    loadRole();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadRole();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const logout = async () => {
    await supabase.auth.signOut();
    setRole('');
    setMenuOpen(false);
    navigate('/roles');
  };

  const isAdministrator =
    role === 'administrator' ||
    location.pathname.startsWith('/administrator');

  const isAdmin =
    role === 'admin' ||
    location.pathname.startsWith('/admin/');

  const navLink =
    'rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700';

  const activeLink =
    'rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700';

  const linkClass = (path) =>
    location.pathname === path ? activeLink : navLink;

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">

        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-xl font-extrabold text-white shadow-md">
            C
          </span>

          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Civic<span className="text-blue-600">Pulse</span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:block">
              Community action platform
            </span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕ Close' : '☰ Menu'}
        </button>

        <div
          className={`${menuOpen ? 'flex' : 'hidden'
            } absolute left-0 right-0 top-full flex-col gap-2 border-b border-slate-200 bg-white p-4 shadow-lg md:static md:flex md:flex-row md:items-center md:justify-end md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
        >
          {isAdministrator ? (
            <>
              <span className="px-3 py-2 text-sm font-semibold text-slate-600">
                Administrator Portal
              </span>

              <span className="w-fit rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700">
                Administrator
              </span>

              <button
                onClick={logout}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700"
              >
                Sign Out
              </button>
            </>
          ) : isAdmin ? (
            <>
              <span className="px-3 py-2 text-sm font-semibold text-slate-600">
                Resolution Company Portal
              </span>

              <span className="w-fit rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">
                Admin
              </span>

              <button
                onClick={logout}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/citizen/dashboard"
                className={linkClass('/citizen/dashboard')}
              >
                Home
              </Link>

              <Link
                to="/track"
                className={linkClass('/track')}
              >
                Track Issues
              </Link>

              <Link
                to="/report"
                className={linkClass('/report')}
              >
                Report Issue
              </Link>

              <Link
                to="/verify"
                className={linkClass('/verify')}
              >
                Verify Resolution
              </Link>

              {role === 'citizen' ? (
                <button
                  onClick={logout}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/roles"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-center text-sm font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  Sign In / Register
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
