import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const CURRENCIES = ['EUR', 'USD', 'BTC'];
const THEMES = [
  { label: 'Dark', icon: 'dark_mode' },
  { label: 'Light', icon: 'light_mode' },
  { label: 'System', icon: 'desktop_windows' },
];

const useDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return { open, setOpen, ref };
};

const TopNav = () => {
  const navigate = useNavigate();
  const { currency, setCurrency, theme, setTheme } = useApp();
  const currency$ = useDropdown();
  const theme$ = useDropdown();

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center px-6 py-3 w-full bg-surface-container-low/80 backdrop-blur-md border-b border-outline-variant/30">
      {/* Left: Search */}
      <div className="flex-1 flex items-center">
        <div className="relative w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
          <input
            className="w-full bg-surface-container text-on-surface text-sm rounded-full py-1.5 pl-10 pr-4 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline"
            placeholder="Search assets..."
            type="text"
          />
        </div>
      </div>

      {/* Center: Mobile brand */}
      <Link to="/" className="lg:hidden text-xl font-black text-on-surface flex-1 text-center">
        WalletPulse
      </Link>

      {/* Right: Icons */}
      <div className="flex-1 flex justify-end items-center gap-1">

        {/* Currency switcher */}
        <div className="relative" ref={currency$.ref}>
          <button
            onClick={() => currency$.setOpen((v) => !v)}
            className="p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors rounded-full flex items-center gap-1"
            title="Switch currency"
          >
            <span className="material-symbols-outlined">currency_exchange</span>
            <span className="text-xs font-data-mono font-semibold hidden sm:block">{currency}</span>
          </button>
          {currency$.open && (
            <div className="absolute right-0 top-full mt-2 bg-surface-container border border-outline-variant/40 rounded-xl shadow-2xl overflow-hidden z-50 w-32">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  onClick={() => { setCurrency(c); currency$.setOpen(false); }}
                  className={`w-full px-4 py-2.5 text-left font-label-sm text-label-sm transition-colors flex items-center gap-2 ${
                    currency === c
                      ? 'text-primary bg-primary/10'
                      : 'text-on-surface-variant hover:bg-surface-bright hover:text-on-surface'
                  }`}
                >
                  {currency === c
                    ? <span className="material-symbols-outlined text-[14px]">check</span>
                    : <span className="w-[14px]" />
                  }
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme switcher */}
        <div className="relative" ref={theme$.ref}>
          <button
            onClick={() => theme$.setOpen((v) => !v)}
            className="p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors rounded-full"
            title="Switch theme"
          >
            <span className="material-symbols-outlined">
              {THEMES.find((t) => t.label === theme)?.icon ?? 'dark_mode'}
            </span>
          </button>
          {theme$.open && (
            <div className="absolute right-0 top-full mt-2 bg-surface-container border border-outline-variant/40 rounded-xl shadow-2xl overflow-hidden z-50 w-36">
              {THEMES.map(({ label, icon }) => (
                <button
                  key={label}
                  onClick={() => { setTheme(label); theme$.setOpen(false); }}
                  className={`w-full px-4 py-2.5 text-left font-label-sm text-label-sm transition-colors flex items-center gap-2 ${
                    theme === label
                      ? 'text-primary bg-primary/10'
                      : 'text-on-surface-variant hover:bg-surface-bright hover:text-on-surface'
                  }`}
                >
                  {theme === label
                    ? <span className="material-symbols-outlined text-[14px]">check</span>
                    : <span className="w-[14px]" />
                  }
                  <span className="material-symbols-outlined text-[16px]">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <button
          onClick={() => navigate('/security')}
          className="p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors rounded-full"
          title="Settings"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>
  );
};

export default TopNav;
