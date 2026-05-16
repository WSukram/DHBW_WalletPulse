import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useApp();

  const navLinkClass = (isActive) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all active:scale-95 ${
      isActive
        ? 'text-primary bg-primary/10 border-r-2 border-primary'
        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
    }`;

  return (
    <aside className="hidden lg:flex flex-col h-screen w-64 border-r border-outline-variant/30 bg-surface-container-low text-sm font-medium shrink-0">
      {/* Brand */}
      <Link to="/" className="px-6 py-6 flex items-center gap-3 border-b border-outline-variant/20 hover:bg-surface-container-high transition-colors">
        <img src="/wp-icon.svg" alt="WalletPulse" className="w-8 h-8 shrink-0" />
        <div>
          <h1 className="text-lg font-black text-on-surface">WalletPulse</h1>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Portfolio Tracker</p>
        </div>
      </Link>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        <NavLink to="/dashboard" className={({ isActive }) => navLinkClass(isActive)}>
          <span className="material-symbols-outlined text-[20px]">dashboard</span>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/wallet" className={({ isActive }) => navLinkClass(isActive)}>
          <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          <span>Wallets</span>
        </NavLink>
        <NavLink to="/assets" className={({ isActive }) => navLinkClass(isActive)}>
          <span className="material-symbols-outlined text-[20px]">bar_chart</span>
          <span>Assets</span>
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => navLinkClass(isActive)}>
          <span className="material-symbols-outlined text-[20px]">history</span>
          <span>History</span>
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => navLinkClass(isActive)}>
          <span className="material-symbols-outlined text-[20px]">insights</span>
          <span>Analytics</span>
        </NavLink>
        <NavLink to="/security" className={({ isActive }) => navLinkClass(isActive)}>
          <span className="material-symbols-outlined text-[20px]">verified_user</span>
          <span>Security</span>
        </NavLink>
      </nav>

      {/* Bottom actions */}
      <div className="px-4 pb-4 space-y-1 border-t border-outline-variant/20 pt-4">
        <button
          onClick={() => navigate('/security')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all cursor-pointer active:scale-95 w-full text-left"
        >
          <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary-container text-sm">person</span>
          </div>
          <span>My Account</span>
        </button>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-all cursor-pointer active:scale-95 w-full text-left"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
