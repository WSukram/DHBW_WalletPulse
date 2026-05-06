import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const navLinkClass = (isActive) => (
    `flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer active:scale-98 ${
      isActive
        ? 'text-indigo-400 border-r-2 border-indigo-500 bg-indigo-500/5'
        : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/40 transition-all'
    }`
  );

  return (
    <aside className="hidden lg:flex flex-col h-full py-6 h-screen w-64 border-r bg-slate-900 text-indigo-500 dark:text-indigo-400 text-sm font-medium border-slate-800">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-on-primary-container text-sm" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
        </div>
        <div>
          <h1 className="text-lg font-black text-white">WalletPulse</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Terminal v1.0</p>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        <NavLink to="/dashboard" className={({ isActive }) => navLinkClass(isActive)}>
          <span className="material-symbols-outlined text-[20px]">dashboard</span>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/wallet" className={({ isActive }) => navLinkClass(isActive)}>
          <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          <span>Wallet</span>
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
      <div className="px-4 mt-auto space-y-1">
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-all cursor-pointer active:scale-95 duration-100" href="#">
          <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
            <img alt="Alex Rivera" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB42lCM_vL9oMduS41-Q6xun7vvDZg8322nNum6uACa2bAfp1qnRhm4inuNFCq3HZsuq8fsnPOPL3A4U4iY0uYBZICOjQvq9ign5VDdf_1fPVfZfUvTY1HGXxoAONR6QZwiPMznFv_Yf1SRvzT5LgHJQIRbtmI3czfLc9B__GA4ELMuo36ldQXt19ruGzZYuKadwAuopJW_Z1veINrJHfvTFeo3rjdvmzwMAU1Mn1sMi4Zcr7-bFI4sBYER8_qnlH6hMLov9RMeMKUe" />
          </div>
          <span>Alex Rivera</span>
        </a>
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-all cursor-pointer active:scale-95 duration-100" href="#">
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Logout</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
