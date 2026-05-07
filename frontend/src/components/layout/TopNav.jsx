import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const CURRENCIES = ['EUR', 'USD', 'BTC'];

const TopNav = () => {
  const navigate = useNavigate();
  const { currency, setCurrency } = useApp();
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!showCurrencyMenu) return;
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowCurrencyMenu(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showCurrencyMenu]);

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
      <div className="lg:hidden text-xl font-black text-on-surface flex-1 text-center">
        WalletPulse
      </div>

      {/* Right: Icons */}
      <div className="flex-1 flex justify-end items-center gap-1">
        {/* Currency switcher */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowCurrencyMenu((v) => !v)}
            className="p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors rounded-full flex items-center gap-1"
            title="Switch currency"
          >
            <span className="material-symbols-outlined">currency_exchange</span>
            <span className="text-xs font-data-mono font-semibold hidden sm:block">{currency}</span>
          </button>
          {showCurrencyMenu && (
            <div className="absolute right-0 top-full mt-2 bg-surface-container border border-outline-variant/40 rounded-xl shadow-2xl overflow-hidden z-50 w-32">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  onClick={() => { setCurrency(c); setShowCurrencyMenu(false); }}
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

        <button className="p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors rounded-full">
          <span className="material-symbols-outlined">notifications</span>
        </button>
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
