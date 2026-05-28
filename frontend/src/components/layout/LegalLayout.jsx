import { Link, useLocation } from 'react-router-dom';
import { isTokenExpired } from '../../context/AppContext';
import {
  LIGHT,
  DARK,
  headlineStyle,
  bodyFontFamily,
  usePrefersDark,
} from '../../theme/softStack';

const navLinks = [
  { to: '/terms', label: 'Terms' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/impressum', label: 'Impressum' },
];

const footerLinks = [
  { to: '/terms', label: 'Terms' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/impressum', label: 'Impressum' },
  { to: '/docs', label: 'API' },
];

const LegalLayout = ({ children }) => {
  const { pathname } = useLocation();
  const isDark = usePrefersDark();
  const t = isDark ? DARK : LIGHT;

  const onCtaEnter = (e) => {
    e.currentTarget.style.transform = 'translateY(-1px)';
    e.currentTarget.style.boxShadow = t.SH_CTA_INK_H;
  };
  const onCtaLeave = (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = t.SH_CTA_INK;
  };

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
            <img
              src="/wp-icon.svg"
              alt=""
              className="w-9 h-9"
              style={{ boxShadow: t.SH_NAV_LOGO, borderRadius: 11 }}
            />
            <span className="text-[19px] font-semibold" style={headlineStyle}>
              WalletPulse
            </span>
          </Link>

          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
            {navLinks.map(({ to, label }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className="relative text-[14px] font-medium px-4 py-2 rounded-full transition-colors inline-flex items-center gap-2"
                  style={{ color: active ? t.INK : t.SUBINK }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.color = t.INK;
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.color = t.SUBINK;
                  }}
                >
                  {label}
                  {active && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: t.MINT_DEEP }}
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              onClick={(e) => {
                const token = localStorage.getItem('wp_token');
                if (token && !isTokenExpired(token)) {
                  e.preventDefault();
                  window.location.href = '/dashboard';
                }
              }}
              className="text-[14px] font-medium px-4 py-2"
              style={{ color: t.SUBINK }}
              onMouseEnter={(e) => (e.currentTarget.style.color = t.INK)}
              onMouseLeave={(e) => (e.currentTarget.style.color = t.SUBINK)}
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-[14px] font-semibold px-5 py-2.5 rounded-full transition-all"
              style={{
                background: t.CTA_INK_BG,
                color: t.CTA_INK_FG,
                boxShadow: t.SH_CTA_INK,
              }}
              onMouseEnter={onCtaEnter}
              onMouseLeave={onCtaLeave}
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-[120px] pb-24 relative">
        {/* Soft ambient blobs at the top */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden"
        >
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[520px] rounded-full"
            style={{
              background: `radial-gradient(closest-side, ${t.BLOB_LAV}, transparent 70%)`,
              filter: 'blur(20px)',
            }}
          />
          <div
            className="absolute top-24 -right-20 w-[380px] h-[380px] rounded-full"
            style={{
              background: `radial-gradient(closest-side, ${t.BLOB_MINT}, transparent 70%)`,
              filter: 'blur(12px)',
            }}
          />
        </div>

        <div className="relative max-w-[820px] mx-auto px-6 lg:px-10">
          {children}
        </div>
      </main>

      {/* ─── FOOTER ──────────────────────────────────────────────── */}
      <footer className="w-full" style={{ borderTop: `1px solid ${t.HAIR_HEAVY}` }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/wp-icon.svg"
              alt=""
              className="w-7 h-7"
              style={{ borderRadius: 8 }}
            />
            <span className="text-[16px] font-semibold" style={headlineStyle}>
              WalletPulse
            </span>
          </Link>
          <p className="text-[12px]" style={{ color: t.SUBINK }}>
            © 2026 · DHBW Web Engineering 2 project
          </p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-[13px] transition-colors"
                style={{ color: pathname === to ? t.INK : t.SUBINK }}
                onMouseEnter={(e) => (e.currentTarget.style.color = t.INK)}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = pathname === to ? t.INK : t.SUBINK;
                }}
              >
                {label}
              </Link>
            ))}
            <a
              href="https://github.com/WSukram/DHBW_WalletPulse"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px]"
              style={{ color: t.SUBINK }}
              onMouseEnter={(e) => (e.currentTarget.style.color = t.INK)}
              onMouseLeave={(e) => (e.currentTarget.style.color = t.SUBINK)}
            >
              GitHub
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default LegalLayout;
