import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';

const Register = () => {
  useEffect(() => { document.title = 'Register · WalletPulse'; }, []);
  const navigate = useNavigate();
  const { login } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const data = new FormData(e.target);
    const password = data.get('password');
    const confirmPassword = data.get('confirmPassword');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', {
        firstName: data.get('firstName'),
        lastName: data.get('lastName'),
        email: data.get('email'),
        password,
      });
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-md lg:p-layout-margin relative overflow-hidden font-body-md">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary-container/10 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="w-full max-w-[480px] bg-surface-container border border-outline-variant/50 rounded-xl p-lg md:p-xl shadow-[0px_10px_30px_-5px_rgba(0,0,0,0.5)] relative z-10">
        {/* Header */}
        <header className="flex flex-col items-center gap-sm text-center mb-xl">
          <Link to="/" className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center mb-xs hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-on-primary-container" style={{ fontSize: '28px' }}>
              account_balance_wallet
            </span>
          </Link>
          <h1 className="font-heading-lg text-heading-lg text-on-surface">Create your Account</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Register to access your high-stakes portfolio.</p>
        </header>

        {error && (
          <div className="bg-error/10 border border-error/30 text-error rounded-lg px-4 py-3 font-body-md text-body-md text-center mb-md">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
          {/* Name row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="firstName">First Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">person</span>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  placeholder="John"
                  required
                  className="w-full bg-background border border-outline-variant rounded-lg pl-[44px] pr-md py-sm font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="lastName">Last Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">person</span>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  placeholder="Doe"
                  required
                  className="w-full bg-background border border-outline-variant rounded-lg pl-[44px] pr-md py-sm font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="email">Email Address</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">mail</span>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="john@example.com"
                required
                className="w-full bg-background border border-outline-variant rounded-lg pl-[44px] pr-md py-sm font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="password">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">lock</span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full bg-background border border-outline-variant rounded-lg pl-[44px] pr-[44px] py-sm font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors focus:outline-none"
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="confirmPassword">Confirm Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">lock_reset</span>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                required
                className="w-full bg-background border border-outline-variant rounded-lg pl-[44px] pr-md py-sm font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-container text-white font-body-md text-body-md font-semibold py-md rounded-lg shadow-md hover:bg-inverse-primary hover:shadow-lg transition-all flex items-center justify-center gap-sm mt-sm group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
            {!loading && (
              <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
            )}
          </button>
        </form>

        {/* Footer link */}
        <div className="mt-lg pt-lg border-t border-outline-variant/30 text-center space-y-3">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:text-primary-fixed hover:underline transition-colors">
              Sign in here
            </Link>
          </p>
          <p className="text-xs text-on-surface-variant/60">
            By registering you agree to our{' '}
            <Link to="/terms" target="_blank" className="text-primary/80 hover:text-primary hover:underline transition-colors">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" target="_blank" className="text-primary/80 hover:text-primary hover:underline transition-colors">Privacy Policy</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;
