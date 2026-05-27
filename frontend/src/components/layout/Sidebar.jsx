import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LIGHT,
  headlineStyle,
  monoStyle,
  usePrefersDark,
  DARK,
} from '../../theme/softStack';

const NAV_ITEMS = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/wallet', icon: 'account_balance_wallet', label: 'Wallets' },
  { to: '/assets', icon: 'bar_chart', label: 'Assets' },
  { to: '/history', icon: 'history', label: 'History' },
  { to: '/analytics', icon: 'insights', label: 'Analytics' },
  { to: '/security', icon: 'verified_user', label: 'Security' },
];

const getInitials = (user) => {
  if (!user) return 'W';
  const f = (user.firstName || '').trim();
  const l = (user.lastName || '').trim();
  if (f || l) return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase() || 'W';
  const email = (user.email || '').trim();
  return email ? email.charAt(0).toUpperCase() : 'W';
};

const Sidebar = ({ t: tProp }) => {
  const navigate = useNavigate();
  const { logout, user } = useApp();
  const isDark = usePrefersDark();
  const t = tProp || (isDark ? DARK : LIGHT);

  const displayName = user
    ? (user.firstName || user.lastName)
      ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
      : (user.email || 'Account')
    : 'Account';

  return (
    <aside
      className="hidden lg:flex flex-col h-screen w-64 shrink-0 relative"
      style={{
        background: t.CARD_2,
        borderRight: `1px solid ${t.HAIR_HEAVY}`,
        fontFamily: 'inherit',
      }}
    >
      {/* Brand */}
      <Link
        to="/"
        className="px-6 py-6 flex items-center gap-3 transition-colors"
        style={{ borderBottom: `1px solid ${t.HAIR_LIGHT}` }}
      >
        <img src="/wp-icon.svg" alt="WalletPulse" className="w-8 h-8 shrink-0" />
        <div>
          <h1
            className="text-[18px] leading-none"
            style={{ ...headlineStyle, fontWeight: 600, color: t.INK }}
          >
            WalletPulse
          </h1>
          <p
            className="mt-1"
            style={{
              ...monoStyle,
              fontSize: 9,
              letterSpacing: '0.22em',
              color: t.SUBINK,
            }}
          >
            PORTFOLIO TRACKER
          </p>
        </div>
      </Link>

      {/* Section eyebrow */}
      <div
        className="px-6 pt-5 pb-2"
        style={{
          ...monoStyle,
          fontSize: 9,
          letterSpacing: '0.22em',
          color: t.SUBINK,
        }}
      >
        NAVIGATION
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="block"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              color: isActive ? t.INK : t.SUBINK,
              background: isActive ? t.MINT_BG : 'transparent',
              border: `1px solid ${isActive ? t.MINT_CIRCLE_BORDER : 'transparent'}`,
              boxShadow: isActive ? t.SH_PILL : 'none',
              transition: 'background-color 160ms ease, color 160ms ease, border-color 160ms ease',
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
                <span className="flex-1">{label}</span>
                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: t.MINT_DEEP }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: user chip + sign out */}
      <div
        className="px-3 py-4 space-y-2"
        style={{ borderTop: `1px solid ${t.HAIR_LIGHT}` }}
      >
        <button
          onClick={() => navigate('/security')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left"
          style={{
            background: t.CARD,
            border: `1px solid ${t.HAIR_HEAVY}`,
            transition: 'background-color 160ms ease',
          }}
        >
          <span
            className="inline-flex w-8 h-8 rounded-full items-center justify-center shrink-0"
            style={{
              background: t.CREAM_CHIP,
              border: `1px solid ${t.CREAM_CHIP_BORDER}`,
              color: t.INK,
              ...headlineStyle,
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            {getInitials(user)}
          </span>
          <span className="min-w-0 flex-1">
            <span
              className="block truncate"
              style={{ color: t.INK, fontSize: 13, fontWeight: 500 }}
            >
              {displayName}
            </span>
            <span
              className="block"
              style={{ ...monoStyle, fontSize: 9, letterSpacing: '0.2em', color: t.SUBINK }}
            >
              MY ACCOUNT
            </span>
          </span>
        </button>

        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left"
          style={{
            color: t.SUBINK,
            fontSize: 13,
            fontWeight: 500,
            transition: 'color 160ms ease, background-color 160ms ease',
          }}
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
    </aside>
  );
};

export default Sidebar;
