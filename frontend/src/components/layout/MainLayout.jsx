import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const MOBILE_NAV = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/wallet', icon: 'account_balance_wallet', label: 'Wallets' },
  { to: '/assets', icon: 'bar_chart', label: 'Assets' },
  { to: '/history', icon: 'history', label: 'History' },
  { to: '/analytics', icon: 'insights', label: 'Analytics' },
];

const MainLayout = () => {
  return (
    <div className="bg-background text-on-background flex h-screen overflow-hidden antialiased">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopNav />
        <div className="flex-1 overflow-auto pb-16 lg:pb-0">
          <Outlet />
        </div>
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex bg-surface-container-low border-t border-outline-variant/30">
          {MOBILE_NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-on-surface-variant'
                }`
              }
            >
              <span className="material-symbols-outlined text-[22px]">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default MainLayout;
