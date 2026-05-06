import React from 'react';

const TopNav = () => {
  return (
    <header className="sticky top-0 z-50 flex justify-between items-center px-6 py-3 w-full bg-slate-950/80 backdrop-blur-md text-indigo-500 dark:text-indigo-400 font-sans antialiased text-slate-200 docked full-width top-0 border-b border-slate-800/50">
      {/* Left: Search Bar */}
      <div className="flex-1 flex items-center">
        <div className="relative w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
          <input className="w-full bg-surface-container text-on-surface text-sm rounded-full py-1.5 pl-10 pr-4 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline" placeholder="Search assets..." type="text" />
        </div>
      </div>

      {/* Center: Mobile Brand Logo */}
      <div className="lg:hidden text-xl font-bold tracking-tight text-white flex-1 text-center">
        WalletPulse
      </div>

      {/* Right: Trailing Icons */}
      <div className="flex-1 flex justify-end items-center gap-2">
        <button className="p-2 text-slate-400 hover:bg-slate-900/50 hover:text-white transition-colors rounded-full scale-95 duration-100 active:opacity-80">
          <span className="material-symbols-outlined">currency_exchange</span>
        </button>
        <button className="p-2 text-slate-400 hover:bg-slate-900/50 hover:text-white transition-colors rounded-full scale-95 duration-100 active:opacity-80">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 text-slate-400 hover:bg-slate-900/50 hover:text-white transition-colors rounded-full scale-95 duration-100 active:opacity-80">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>
  );
};

export default TopNav;
