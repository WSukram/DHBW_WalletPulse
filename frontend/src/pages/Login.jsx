import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-layout-gutter font-body-md">
      <main className="w-full max-w-md">
        <div className="bg-surface-container rounded-xl border border-white/10 p-lg sm:p-[32px] flex flex-col gap-lg">
          {/* Header */}
          <div className="flex flex-col items-center gap-sm text-center">
            <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center mb-xs">
              <span className="material-symbols-outlined text-on-primary-container" style={{ fontSize: '28px' }}>
                account_balance_wallet
              </span>
            </div>
            <h1 className="font-heading-lg text-heading-lg text-on-surface">Sign in to WalletPulse</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Access your high-fidelity crypto analytics</p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-md">
            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="text"
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
            <div className="flex items-center justify-between mt-xs mb-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-outline-variant bg-background text-primary-container focus:ring-primary-container focus:ring-offset-background"
                />
                <span className="font-label-sm text-label-sm text-on-surface-variant">Remember me</span>
              </label>
              <a href="#" className="font-label-sm text-label-sm text-primary hover:text-primary-fixed transition-colors">
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              className="w-full bg-primary-container text-white font-body-md text-body-md font-semibold py-md rounded-lg shadow-md hover:bg-inverse-primary hover:shadow-lg transition-all flex items-center justify-center gap-sm mt-sm group"
            >
              Sign In
              <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
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
