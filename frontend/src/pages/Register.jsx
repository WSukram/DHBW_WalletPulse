import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { LIGHT, DARK, headlineStyle, monoStyle, bodyFontFamily, usePrefersDark } from '../theme/softStack';

const Register = () => {
  usePageTitle('Register');
  const navigate = useNavigate();
  const { login } = useApp();
  const isDark = usePrefersDark();
  const t = isDark ? DARK : LIGHT;

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

  const inputStyle = {
    background: t.CARD,
    border: `1px solid ${t.HAIR_HEAVY}`,
    color: t.INK,
    fontFamily: bodyFontFamily,
  };

  const labelStyle = { ...monoStyle, fontSize: 10, letterSpacing: '0.22em', color: t.SUBINK };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: t.PAPER, color: t.INK, fontFamily: bodyFontFamily }}
    >
      {/* ─── Top Nav ─────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 w-full z-50"
        style={{
          backgroundColor: t.HEADER_BG,
          backdropFilter: 'saturate(140%) blur(14px)',
          WebkitBackdropFilter: 'saturate(140%) blur(14px)',
        }}
      >
        <div className="relative flex justify-between items-center w-full px-6 lg:px-10 h-[68px] max-w-[1240px] mx-auto">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/wp-icon.svg" alt="" className="w-9 h-9" style={{ boxShadow: t.SH_NAV_LOGO, borderRadius: 11 }} />
            <span className="text-[19px] font-semibold" style={headlineStyle}>WalletPulse</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[14px]" style={{ color: t.SUBINK }}>
              Already a member?
            </span>
            <Link
              to="/login"
              className="text-[14px] font-semibold px-5 py-2.5 rounded-full transition-all"
              style={{ background: t.CTA_INK_BG, color: t.CTA_INK_FG, boxShadow: t.SH_CTA_INK }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = t.SH_CTA_INK_H; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = t.SH_CTA_INK; }}
            >
              Log in
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-[120px] pb-24 relative flex items-center justify-center">
        {/* Soft ambient blobs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[820px] overflow-hidden">
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[560px] rounded-full"
            style={{ background: `radial-gradient(closest-side, ${t.BLOB_LAV}, transparent 70%)`, filter: 'blur(20px)' }}
          />
          <div
            className="absolute top-40 -left-24 w-[460px] h-[460px] rounded-full"
            style={{ background: `radial-gradient(closest-side, ${t.BLOB_MINT}, transparent 70%)`, filter: 'blur(10px)' }}
          />
          <div
            className="absolute top-10 -right-24 w-[420px] h-[420px] rounded-full"
            style={{ background: `radial-gradient(closest-side, ${t.BLOB_CREAM}, transparent 70%)`, filter: 'blur(10px)' }}
          />
        </div>

        <section className="relative w-full max-w-[520px] px-6">
          <div
            className="text-center mb-3"
            style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.22em', color: t.SUBINK }}
          >
            ◉ WALLETPULSE · CREATE ACCOUNT
          </div>

          <h1
            className="text-center mb-3"
            style={{ ...headlineStyle, fontSize: 'clamp(36px, 5vw, 44px)', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.025em' }}
          >
            Start tracking, free.
          </h1>
          <p
            className="text-center mb-9 text-[15px] leading-[1.55]"
            style={{ color: t.SUBINK }}
          >
            Spin up your portfolio in seconds. No card, no subscription, no upsell.
          </p>

          <div
            className="rounded-3xl p-7 sm:p-8"
            style={{
              background: t.CARD,
              border: `1px solid ${t.HAIR_HEAVY}`,
              boxShadow: t.SH_HERO,
            }}
          >
            {error && (
              <div
                className="rounded-xl px-4 py-3 mb-5 text-[13.5px] text-center"
                style={{ background: t.RED_BG, color: t.RED_DEEP, border: `1px solid ${t.HAIR_LIGHT}` }}
              >
                {error}
              </div>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="firstName" style={labelStyle}>FIRST NAME</label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    placeholder="John"
                    required
                    className="w-full rounded-xl px-4 py-3 text-[14.5px] outline-none transition-colors"
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = t.MINT_DEEP; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = t.HAIR_HEAVY; }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="lastName" style={labelStyle}>LAST NAME</label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    required
                    className="w-full rounded-xl px-4 py-3 text-[14.5px] outline-none transition-colors"
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = t.MINT_DEEP; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = t.HAIR_HEAVY; }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="email" style={labelStyle}>EMAIL</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  required
                  className="w-full rounded-xl px-4 py-3 text-[14.5px] outline-none transition-colors"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = t.MINT_DEEP; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = t.HAIR_HEAVY; }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" style={labelStyle}>PASSWORD</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="At least 12 characters"
                    required
                    minLength={12}
                    className="w-full rounded-xl px-4 py-3 pr-11 text-[14.5px] outline-none transition-colors"
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = t.MINT_DEEP; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = t.HAIR_HEAVY; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-md transition-colors"
                    style={{ color: t.SUBINK }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = t.INK; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = t.SUBINK; }}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="confirmPassword" style={labelStyle}>CONFIRM PASSWORD</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl px-4 py-3 text-[14.5px] outline-none transition-colors"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = t.MINT_DEEP; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = t.HAIR_HEAVY; }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 text-[15px] font-semibold py-3.5 rounded-full transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: t.CTA_INK_BG, color: t.CTA_INK_FG, boxShadow: t.SH_CTA_INK }}
                onMouseEnter={(e) => {
                  if (loading) return;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = t.SH_CTA_INK_H;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = t.SH_CTA_INK;
                }}
              >
                {loading ? 'Creating account…' : 'Create account'}
                {!loading && (
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                )}
              </button>

              {/* Passive terms/privacy consent note — directly below submit, no checkbox */}
              <p className="text-center text-[12px] mt-1" style={{ color: t.SUBINK, lineHeight: 1.55 }}>
                By creating an account you agree to our{' '}
                <Link
                  to="/terms"
                  target="_blank"
                  className="underline-offset-4 hover:underline"
                  style={{ color: t.INK }}
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to="/privacy"
                  target="_blank"
                  className="underline-offset-4 hover:underline"
                  style={{ color: t.INK }}
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </div>

          <p className="text-center text-[13px] mt-6" style={{ color: t.SUBINK }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold underline-offset-4 hover:underline"
              style={{ color: t.INK }}
            >
              Sign in
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
};

export default Register;
