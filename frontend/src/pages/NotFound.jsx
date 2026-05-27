import React from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { LIGHT, DARK, headlineStyle, monoStyle, bodyFontFamily, usePrefersDark } from '../theme/softStack';

const NotFound = () => {
  usePageTitle('Page not found');
  const isDark = usePrefersDark();
  const t = isDark ? DARK : LIGHT;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: t.PAPER, color: t.INK, fontFamily: bodyFontFamily }}
    >
      <Link
        to="/"
        className="absolute top-6 left-6 lg:top-8 lg:left-10 flex items-center gap-2.5 z-10"
      >
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

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] rounded-full"
          style={{
            background: `radial-gradient(closest-side, ${t.BLOB_MINT}, transparent 70%)`,
            filter: 'blur(20px)',
          }}
        />
        <div
          className="absolute top-32 -left-20 w-[460px] h-[460px] rounded-full"
          style={{
            background: `radial-gradient(closest-side, ${t.BLOB_LAV}, transparent 70%)`,
            filter: 'blur(10px)',
          }}
        />
        <div
          className="absolute top-10 -right-24 w-[420px] h-[420px] rounded-full"
          style={{
            background: `radial-gradient(closest-side, ${t.BLOB_CREAM}, transparent 70%)`,
            filter: 'blur(10px)',
          }}
        />
      </div>

      <main className="flex-grow flex items-center justify-center px-6 lg:px-10 relative">
        <div className="flex flex-col items-center text-center max-w-[640px]">
          <span
            style={{
              ...monoStyle,
              fontSize: 11,
              letterSpacing: '0.22em',
              color: t.SUBINK,
            }}
          >
            ERROR · 404
          </span>

          <h1
            className="mt-5"
            style={{
              ...headlineStyle,
              fontSize: 'clamp(96px, 14vw, 180px)',
              fontWeight: 600,
              letterSpacing: '-0.04em',
              lineHeight: 0.9,
              color: t.INK,
            }}
          >
            404
          </h1>

          <p
            className="mt-6 text-[18px] leading-[1.45] font-medium"
            style={{ color: t.SUBINK }}
          >
            We couldn&apos;t find that page.
          </p>

          <p
            className="mt-3 text-[15px] leading-[1.65] max-w-[48ch]"
            style={{ color: t.SUBINK }}
          >
            The link may be broken or the page might have moved. Head back to the
            home page and pick up where you left off.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[15px] font-semibold px-6 py-3.5 rounded-full transition-all"
              style={{
                background: t.CTA_INK_BG,
                color: t.CTA_INK_FG,
                boxShadow: t.SH_CTA_INK,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = t.SH_CTA_INK_H;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = t.SH_CTA_INK;
              }}
            >
              Back to home
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <Link
              to="/dashboard"
              className="text-[14px] font-medium px-4 py-2 transition-colors"
              style={{ color: t.SUBINK }}
              onMouseEnter={(e) => (e.currentTarget.style.color = t.INK)}
              onMouseLeave={(e) => (e.currentTarget.style.color = t.SUBINK)}
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
