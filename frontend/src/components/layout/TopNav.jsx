import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LIGHT,
  DARK,
  headlineStyle,
  monoStyle,
  usePrefersDark,
} from '../../theme/softStack';

const CURRENCIES = ['EUR', 'USD', 'BTC'];
const THEMES = [
  { label: 'Dark', icon: 'dark_mode' },
  { label: 'Light', icon: 'light_mode' },
  { label: 'System', icon: 'desktop_windows' },
];

const NAV_ITEMS = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/wallet', icon: 'account_balance_wallet', label: 'Wallets' },
  { to: '/assets', icon: 'bar_chart', label: 'Assets' },
  { to: '/history', icon: 'history', label: 'History' },
  { to: '/analytics', icon: 'insights', label: 'Analytics' },
  { to: '/security', icon: 'verified_user', label: 'Security' },
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

const IconButton = ({ t, title, onClick, children, extraStyle = {} }) => (
  <button
    onClick={onClick}
    title={title}
    className="inline-flex items-center justify-center rounded-full transition-colors"
    style={{
      width: 38,
      height: 38,
      color: t.SUBINK,
      background: 'transparent',
      ...extraStyle,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = t.CARD;
      e.currentTarget.style.color = t.INK;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = t.SUBINK;
    }}
  >
    {children}
  </button>
);

const DropdownPanel = ({ t, children, width = 160 }) => (
  <div
    className="absolute right-0 top-full mt-2 rounded-2xl overflow-hidden z-50"
    style={{
      width,
      background: t.CARD,
      border: `1px solid ${t.HAIR_HEAVY}`,
      boxShadow: t.SH_CARD,
    }}
  >
    {children}
  </div>
);

const DropdownItem = ({ t, active, onClick, children }) => (
  <button
    onClick={onClick}
    className="w-full px-3 py-2.5 flex items-center gap-2 text-left transition-colors"
    style={{
      fontSize: 13,
      fontWeight: 500,
      color: active ? t.INK : t.SUBINK,
      background: active ? t.MINT_BG : 'transparent',
    }}
    onMouseEnter={(e) => {
      if (!active) e.currentTarget.style.background = t.CARD_3;
    }}
    onMouseLeave={(e) => {
      if (!active) e.currentTarget.style.background = 'transparent';
    }}
  >
    {children}
  </button>
);

const TopNav = ({ t: tProp }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currency, setCurrency, theme, setTheme, logout } = useApp();
  const isDark = usePrefersDark();
  const t = tProp || (isDark ? DARK : LIGHT);

  const currency$ = useDropdown();
  const theme$ = useDropdown();
  const mobileMenu$ = useDropdown();

  // Close mobile menu on route change
  useEffect(() => {
    mobileMenu$.setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <header
      className="sticky top-0 z-50 flex items-center px-4 sm:px-6 py-3 w-full"
      style={{
        background: t.HEADER_BG,
        backdropFilter: 'saturate(140%) blur(14px)',
        WebkitBackdropFilter: 'saturate(140%) blur(14px)',
        borderBottom: `1px solid ${t.HAIR_LIGHT}`,
      }}
    >
      {/* Left spacer (desktop) / mobile brand */}
      <div className="flex-1 flex items-center lg:justify-start">
        <Link to="/" className="lg:hidden flex items-center gap-2">
          <img src="/wp-icon.svg" alt="WalletPulse" className="w-7 h-7" />
          <span style={{ ...headlineStyle, fontWeight: 600, fontSize: 18, color: t.INK }}>
            WalletPulse
          </span>
        </Link>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1">
        {/* Currency switcher */}
        <div className="relative" ref={currency$.ref}>
          <IconButton t={t} title="Switch currency" onClick={() => currency$.setOpen((v) => !v)}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              currency_exchange
            </span>
            <span
              className="hidden sm:inline-block ml-1"
              style={{ ...monoStyle, fontSize: 11, fontWeight: 600, color: t.INK }}
            >
              {currency}
            </span>
          </IconButton>
          {currency$.open && (
            <DropdownPanel t={t} width={140}>
              {CURRENCIES.map((c) => (
                <DropdownItem
                  key={c}
                  t={t}
                  active={currency === c}
                  onClick={() => { setCurrency(c); currency$.setOpen(false); }}
                >
                  {currency === c
                    ? <span className="material-symbols-outlined" style={{ fontSize: 14, color: t.MINT_DEEP }}>check</span>
                    : <span style={{ width: 14, display: 'inline-block' }} />
                  }
                  <span>{c}</span>
                </DropdownItem>
              ))}
            </DropdownPanel>
          )}
        </div>

        {/* Theme switcher */}
        <div className="relative" ref={theme$.ref}>
          <IconButton t={t} title="Switch theme" onClick={() => theme$.setOpen((v) => !v)}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              {THEMES.find((th) => th.label === theme)?.icon ?? 'dark_mode'}
            </span>
          </IconButton>
          {theme$.open && (
            <DropdownPanel t={t} width={160}>
              {THEMES.map(({ label, icon }) => (
                <DropdownItem
                  key={label}
                  t={t}
                  active={theme === label}
                  onClick={() => { setTheme(label); theme$.setOpen(false); }}
                >
                  {theme === label
                    ? <span className="material-symbols-outlined" style={{ fontSize: 14, color: t.MINT_DEEP }}>check</span>
                    : <span style={{ width: 14, display: 'inline-block' }} />
                  }
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>
                  <span>{label}</span>
                </DropdownItem>
              ))}
            </DropdownPanel>
          )}
        </div>

        {/* Settings (desktop) */}
        <IconButton
          t={t}
          title="Settings"
          onClick={() => navigate('/security')}
          extraStyle={{ display: undefined }}
        >
          <span className="hidden sm:inline material-symbols-outlined" style={{ fontSize: 20 }}>
            settings
          </span>
          <span className="sm:hidden material-symbols-outlined" style={{ fontSize: 20 }}>
            settings
          </span>
        </IconButton>

        {/* Mobile menu trigger */}
        <div className="relative lg:hidden" ref={mobileMenu$.ref}>
          <IconButton t={t} title="Menu" onClick={() => mobileMenu$.setOpen((v) => !v)}>
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
              {mobileMenu$.open ? 'close' : 'menu'}
            </span>
          </IconButton>
          {mobileMenu$.open && (
            <div
              className="absolute right-0 top-full mt-2 rounded-2xl overflow-hidden z-50"
              style={{
                width: 240,
                background: t.CARD,
                border: `1px solid ${t.HAIR_HEAVY}`,
                boxShadow: t.SH_CARD,
              }}
            >
              <div
                className="px-4 pt-3 pb-2"
                style={{
                  ...monoStyle,
                  fontSize: 9,
                  letterSpacing: '0.22em',
                  color: t.SUBINK,
                }}
              >
                NAVIGATION
              </div>
              <nav className="px-2 pb-2 space-y-0.5">
                {NAV_ITEMS.map(({ to, icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => mobileMenu$.setOpen(false)}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 500,
                      color: isActive ? t.INK : t.SUBINK,
                      background: isActive ? t.MINT_BG : 'transparent',
                      border: `1px solid ${isActive ? t.MINT_CIRCLE_BORDER : 'transparent'}`,
                    })}
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 20, color: isActive ? t.MINT_DEEP : t.SUBINK }}
                        >
                          {icon}
                        </span>
                        <span>{label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
              <div style={{ borderTop: `1px solid ${t.HAIR_LIGHT}` }} className="p-2">
                <button
                  onClick={() => { mobileMenu$.setOpen(false); logout(); navigate('/login'); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors"
                  style={{ color: t.SUBINK, fontSize: 13, fontWeight: 500 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = t.RED_DEEP;
                    e.currentTarget.style.background = t.RED_BG;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = t.SUBINK;
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
