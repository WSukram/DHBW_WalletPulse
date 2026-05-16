import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { usePageTitle } from '../hooks/usePageTitle';

const Login = () => {
  usePageTitle('Login');
  const navigate = useNavigate();
  const { login } = useApp();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const data = new FormData(e.target);
    try {
      const res = await axios.post('/api/auth/login', {
        email: data.get('email'),
        password: data.get('password'),
      });
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error ?? 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-layout-gutter font-body-md">
      <main className="w-full max-w-md">
        <div className="bg-surface-container rounded-xl border border-white/10 p-lg sm:p-[32px] flex flex-col gap-lg">
          {/* Header */}
          <div className="flex flex-col items-center gap-sm text-center">
            <Link to="/" className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center mb-xs hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined text-on-primary-container" style={{ fontSize: '28px' }}>
                account_balance_wallet
              </span>
            </Link>
            <h1 className="font-heading-lg text-heading-lg text-on-surface">Sign in to WalletPulse</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Access your high-fidelity crypto analytics</p>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/30 text-error rounded-lg px-4 py-3 font-body-md text-body-md text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="name@company.com"
                required
                className="w-full bg-background border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-outline"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                required
                className="w-full bg-background border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-outline"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-container text-white font-body-md text-body-md font-semibold py-md rounded-lg shadow-md hover:bg-inverse-primary hover:shadow-lg transition-all flex items-center justify-center gap-sm mt-sm group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && (
                <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="text-center mt-sm">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary-fixed transition-colors font-medium">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
