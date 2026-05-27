import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isTokenExpired } from '../context/AppContext';
import { TICKER_COINS } from '../utils/coins';
import { useLivePrices } from '../hooks/useLivePrices';
import { usePageTitle } from '../hooks/usePageTitle';
import { LIGHT, DARK, headlineStyle, monoStyle, usePrefersDark } from '../theme/softStack';

/**
 * Three overlapping tilted cards — the hero "card stack".
 * All colors come from the theme `t` so the visual flips with prefers-color-scheme.
 */
const CardStack = ({ t }) => (
  <div className="relative w-full max-w-[680px] mx-auto h-[520px] select-none" aria-hidden="true">
    {/* CARD 3 — back-left, tilted, coin row */}
    <div
      className="absolute left-0 top-24 w-[300px] h-[182px] rounded-[26px] p-5"
      style={{
        transform: 'rotate(-7deg)',
        background: `linear-gradient(155deg, ${t.CARD} 0%, ${t.LAVENDER_TINT} 100%)`,
        border: `1px solid ${t.HAIR_DIV}`,
        boxShadow: t.SH_BACK_LAV,
      }}
    >
      <div className="flex items-center justify-between mb-3.5">
        <span style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.22em', color: t.SUBINK }}>
          MULTI · CHAIN
        </span>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse-soft" style={{ background: t.LAVENDER_DEEP }} />
      </div>
      <div className="space-y-2.5">
        {[
          { sym: 'BTC', name: 'Bitcoin',  pct: '+4.21%', amt: '0.4218', tint: t.CREAM_CHIP, glyph: '₿' },
          { sym: 'ETH', name: 'Ethereum', pct: '+2.08%', amt: '6.118',  tint: t.LAVENDER,   glyph: 'Ξ' },
          { sym: 'SOL', name: 'Solana',   pct: '-1.04%', amt: '128.4',  tint: t.MINT_BG,    glyph: '◎' },
        ].map((c) => (
          <div key={c.sym} className="flex items-center justify-between text-[12px]" style={{ color: t.INK }}>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex w-6 h-6 rounded-full items-center justify-center text-[11px] font-bold"
                style={{ background: c.tint, color: t.INK }}
              >
                {c.glyph}
              </span>
              <span style={{ ...headlineStyle, fontWeight: 600 }}>{c.name}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span style={{ ...monoStyle, color: t.SUBINK, fontSize: 11 }}>{c.amt}</span>
              <span style={{ ...monoStyle, fontSize: 10, color: c.pct.startsWith('-') ? t.RED_DEEP : t.MINT_DEEP }}>
                {c.pct}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* CARD 2 — back-right, tilted, mini sparkline */}
    <div
      className="absolute right-0 top-4 w-[260px] h-[152px] rounded-[26px] p-5"
      style={{
        transform: 'rotate(6deg)',
        background: `linear-gradient(160deg, ${t.CARD} 0%, ${t.MINT_TINT} 100%)`,
        border: `1px solid ${t.HAIR_DIV}`,
        boxShadow: t.SH_BACK_MINT,
      }}
    >
      <div className="flex items-center justify-between">
        <span style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.22em', color: t.SUBINK }}>
          30D · TREND
        </span>
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md"
          style={{ ...monoStyle, fontSize: 10, background: t.MINT_BG, color: t.MINT_DEEP }}
        >
          ▲ +18.42%
        </span>
      </div>
      <svg viewBox="0 0 220 70" className="w-full h-[70px] mt-3" preserveAspectRatio="none">
        <defs>
          <linearGradient id="cs-spark-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={t.MINT} stopOpacity="0.45" />
            <stop offset="100%" stopColor={t.MINT} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="cs-spark-stroke" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={t.LAVENDER_DEEP} />
            <stop offset="100%" stopColor={t.MINT_DEEP} />
          </linearGradient>
        </defs>
        <path
          d="M0,55 L20,50 L40,52 L60,40 L80,44 L100,32 L120,36 L140,22 L160,28 L180,14 L200,20 L220,6 L220,70 L0,70 Z"
          fill="url(#cs-spark-fill)"
        />
        <path
          d="M0,55 L20,50 L40,52 L60,40 L80,44 L100,32 L120,36 L140,22 L160,28 L180,14 L200,20 L220,6"
          fill="none"
          stroke="url(#cs-spark-stroke)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="220" cy="6" r="6" fill={t.MINT} fillOpacity="0.3" />
        <circle cx="220" cy="6" r="3" fill={t.MINT_DEEP} />
      </svg>
    </div>

    {/* CARD 1 — front, the hero "wallet" with big balance */}
    <div
      className="absolute left-1/2 -translate-x-1/2 top-44 w-[360px] h-[304px] rounded-[28px] p-6"
      style={{
        transform: 'rotate(-2deg)',
        background: `linear-gradient(150deg, ${t.CARD} 0%, ${t.CARD_2} 55%, ${t.CARD_3} 100%)`,
        border: `1px solid ${t.HAIR_HEAVY}`,
        boxShadow: t.SH_HERO,
      }}
    >
      {/* corner preview badge */}
      <div
        className="absolute -top-3 right-5 px-2.5 py-1 rounded-full text-[10px] font-semibold tabular-nums"
        style={{ background: t.LAVENDER, color: t.LAVENDER_TEXT, border: `1px solid ${t.PREVIEW_BADGE_BORDER}`, boxShadow: t.SH_BADGE_LAV }}
      >
        · DEMO PREVIEW
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.22em', color: t.SUBINK }}>
            TOTAL BALANCE
          </div>
          <div style={{ ...monoStyle, fontSize: 10, color: t.SUBINK, marginTop: 4 }}>
            wallet · 0x7a…f29c
          </div>
        </div>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: t.MINT_BG, border: `1px solid ${t.MINT_CIRCLE_BORDER}` }}
        >
          <span className="material-symbols-outlined" style={{ color: t.MINT_DEEP, fontSize: 18 }}>
            bolt
          </span>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline gap-1.5">
          <span style={{ color: t.SUBINK, fontSize: 14 }}>€</span>
          <span style={{ ...headlineStyle, fontSize: 46, fontWeight: 600, color: t.INK, letterSpacing: '-0.02em', lineHeight: 1 }}>
            142,308
          </span>
          <span style={{ ...headlineStyle, fontSize: 22, fontWeight: 600, color: t.SUBINK }}>.91</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
            style={{ background: t.MINT_BG, color: t.MINT_DEEP, ...monoStyle, fontSize: 10 }}
          >
            ▲ +€22,146
          </span>
          <span style={{ ...monoStyle, fontSize: 10, color: t.SUBINK }}>
            +18.42% · 30d
          </span>
        </div>
      </div>

      {/* mini stat row */}
      <div className="mt-6 grid grid-cols-3 gap-2 pt-5" style={{ borderTop: `1px solid ${t.HAIR_HEAVY}` }}>
        {[
          { l: 'COST',   v: '€120,162' },
          { l: 'ASSETS', v: '3' },
          { l: 'CHAINS', v: '3' },
        ].map((s) => (
          <div key={s.l}>
            <div style={{ ...monoStyle, fontSize: 9, letterSpacing: '0.2em', color: t.SUBINK }}>
              {s.l}
            </div>
            <div style={{ ...monoStyle, fontSize: 13, color: t.INK, marginTop: 4 }}>
              {s.v}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span style={{ ...monoStyle, fontSize: 9, letterSpacing: '0.2em', color: t.SUBINK }}>
          ◉ LIVE · COINGECKO
        </span>
        <span
          className="w-2 h-2 rounded-full animate-pulse-soft"
          style={{ background: t.MINT_DEEP, boxShadow: `0 0 12px ${t.MINT}` }}
        />
      </div>
    </div>

    {/* Floating BTC coin chip — top right, tilted */}
    <div
      className="absolute right-12 top-[268px] hidden sm:flex w-14 h-14 rounded-2xl items-center justify-center"
      style={{
        transform: 'rotate(12deg)',
        background: t.CREAM_CHIP,
        border: `1px solid ${t.CREAM_CHIP_BORDER}`,
        boxShadow: t.SH_CHIP_BTC,
      }}
    >
      <span style={{ ...headlineStyle, fontSize: 24, fontWeight: 700, color: t.CREAM_DEEP }}>₿</span>
    </div>

    {/* Floating ETH coin chip — bottom left */}
    <div
      className="absolute left-8 top-[420px] hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl"
      style={{
        transform: 'rotate(-5deg)',
        background: t.CARD,
        border: `1px solid ${t.HAIR}`,
        boxShadow: t.SH_CHIP_FL,
      }}
    >
      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: t.LAVENDER, color: t.LAVENDER_TEXT }}>Ξ</span>
      <div className="text-left">
        <div style={{ ...monoStyle, fontSize: 9, letterSpacing: '0.18em', color: t.SUBINK }}>ETH</div>
        <div style={{ ...monoStyle, fontSize: 11, color: t.MINT_DEEP }}>+5.74%</div>
      </div>
    </div>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const prices = useLivePrices();
  const isDark = usePrefersDark();
  const t = isDark ? DARK : LIGHT;
  usePageTitle('');

  const handleEnter = () => {
    const token = localStorage.getItem('wp_token');
    navigate(token && !isTokenExpired(token) ? '/dashboard' : '/login');
  };

  const btc = prices?.bitcoin;
  const liveLine = useMemo(() => {
    if (!btc?.eur) return null;
    return btc.eur.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }, [btc]);

  const features = useMemo(() => [
    {
      emoji: '⚡',
      tint: t.TINT_MINT,
      title: 'Live prices, every minute',
      desc: 'BTC, ETH and SOL valued in EUR straight from CoinGecko. Your portfolio breathes with the market — no refresh needed.',
    },
    {
      emoji: '✦',
      tint: t.TINT_LAV,
      title: 'Cost basis & real P&L',
      desc: 'Know exactly what you paid, what it is worth, and what changed. Per-asset and per-wallet profit, calculated for you.',
    },
    {
      emoji: '⌁',
      tint: t.TINT_CREAM,
      title: 'On-chain in one click',
      desc: 'Pull your full history from Ethereum, Bitcoin or Solana with a single wallet address. No CSV juggling, no manual entry.',
    },
  ], [t]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: t.PAPER, color: t.INK, fontFamily: "'Geist', ui-sans-serif, system-ui, sans-serif" }}>
      {/* ─── Top Nav ─────────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50" style={{ backgroundColor: t.HEADER_BG, backdropFilter: 'saturate(140%) blur(14px)', WebkitBackdropFilter: 'saturate(140%) blur(14px)' }}>
        <div className="relative flex justify-between items-center w-full px-6 lg:px-10 h-[68px] max-w-[1240px] mx-auto">
          <div className="flex items-center gap-2.5">
            <img src="/wp-icon.svg" alt="" className="w-9 h-9" style={{ boxShadow: t.SH_NAV_LOGO, borderRadius: 11 }} />
            <span className="text-[19px] font-semibold" style={headlineStyle}>WalletPulse</span>
          </div>
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
            {[
              { label: 'Live prices', href: '#prices' },
              { label: 'Supported', href: '#supported' },
              { label: 'How it works', href: '#how-it-works' },
            ].map(({ label, href }) => (
              <a key={label} href={href} className="text-[14px] font-medium px-4 py-2 rounded-full transition-colors" style={{ color: t.SUBINK }}
                 onMouseEnter={(e) => (e.currentTarget.style.color = t.INK)}
                 onMouseLeave={(e) => (e.currentTarget.style.color = t.SUBINK)}>
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              onClick={(e) => {
                const token = localStorage.getItem('wp_token');
                if (token && !isTokenExpired(token)) {
                  e.preventDefault();
                  navigate('/dashboard');
                }
              }}
              className="text-[14px] font-medium px-4 py-2"
              style={{ color: t.SUBINK }}
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-[14px] font-semibold px-5 py-2.5 rounded-full transition-all"
              style={{ background: t.CTA_INK_BG, color: t.CTA_INK_FG, boxShadow: t.SH_CTA_INK }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = t.SH_CTA_INK_H; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = t.SH_CTA_INK; }}
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-[120px] pb-24 relative">
        {/* Soft ambient blobs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[720px] overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] rounded-full" style={{ background: `radial-gradient(closest-side, ${t.BLOB_MINT}, transparent 70%)`, filter: 'blur(20px)' }} />
          <div className="absolute top-32 -left-20 w-[460px] h-[460px] rounded-full" style={{ background: `radial-gradient(closest-side, ${t.BLOB_LAV}, transparent 70%)`, filter: 'blur(10px)' }} />
          <div className="absolute top-10 -right-24 w-[420px] h-[420px] rounded-full" style={{ background: `radial-gradient(closest-side, ${t.BLOB_CREAM}, transparent 70%)`, filter: 'blur(10px)' }} />
        </div>

        {/* ─── HERO ─────────────────────────────────────────────────── */}
        <section className="relative max-w-[1240px] mx-auto px-6 lg:px-10 mb-28">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12.5px] font-medium mb-7" style={{ background: t.CHIP_BG, color: t.INK, boxShadow: t.SH_PILL, border: `1px solid ${t.HAIR}` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: t.MINT_DEEP }} />
              {liveLine ? <>BTC € <span className="tabular-nums" style={{ color: t.INK }}>{liveLine}</span> · live now</> : <>New · Multi-chain portfolios</>}
            </span>

            <h1 className="font-semibold max-w-[16ch]" style={{ ...headlineStyle, fontSize: 'clamp(56px, 8vw, 92px)', lineHeight: 0.9, letterSpacing: '-0.035em' }}>
              Your crypto, finally
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">in one calm place</span>
                <span aria-hidden="true" className="absolute left-0 right-0 -bottom-1 h-[16px] rounded-full -z-0" style={{ background: t.MINT, opacity: 0.55, transform: 'translateY(2px)' }} />
              </span>
              .
            </h1>

            <p className="mt-7 text-[18px] leading-[1.55] max-w-[58ch]" style={{ color: t.SUBINK }}>
              Track BTC, ETH and SOL across every wallet you own. Live prices, real P&L,
              friendly numbers — without ever handing over your keys.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleEnter}
                className="inline-flex items-center gap-2 text-[15px] font-semibold px-6 py-3.5 rounded-full transition-all"
                style={{ background: t.MINT, color: t.ON_TINT, boxShadow: t.SH_CTA_MINT }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = t.SH_CTA_MINT_H; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = t.SH_CTA_MINT; }}
              >
                Start tracking — it's free
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 text-[15px] font-medium px-6 py-3.5 rounded-full transition-colors"
                style={{ color: t.INK, background: 'transparent', border: `1.5px solid ${t.HAIR_STRONG}` }}
                onMouseEnter={(e) => { e.currentTarget.style.background = t.CARD; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                Create account
              </Link>
            </div>

            {/* ── Tilted card stack — same composition, theme-driven palette ── */}
            <div className="mt-20 w-full">
              <CardStack t={t} />
            </div>
          </div>
        </section>

        {/* ─── LIVE TICKER ─────────────────────────────────────────── */}
        <section id="prices" className="relative max-w-[1240px] mx-auto px-6 lg:px-10 mb-28">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: t.MINT_DEEP }}>Market · Live</div>
              <h2 className="text-[34px] md:text-[40px] font-semibold" style={headlineStyle}>Three coins, one feed.</h2>
            </div>
            <span className="inline-flex items-center gap-2 text-[12px] px-3 py-1.5 rounded-full" style={{ background: t.CARD, color: t.SUBINK, border: `1px solid ${t.HAIR}` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: t.MINT_DEEP }} />
              Updated every 60s · CoinGecko
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TICKER_COINS.map((coin, i) => {
              const data = prices[coin.id];
              const price = data?.eur;
              const change = data?.eurChange24h;
              const positive = change >= 0;
              const tints = [t.CREAM_CHIP, t.LAVENDER, t.MINT_BG];
              return (
                <div key={coin.id} className="rounded-3xl p-6 transition-transform" style={{ background: t.CARD, boxShadow: t.SH_CARD, border: `1px solid ${t.HAIR_LIGHT}` }}
                     onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                     onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-2xl flex items-center justify-center text-[14px] font-bold" style={{ background: tints[i % 3], color: t.INK }}>
                        {coin.symbol.slice(0, 1)}
                      </span>
                      <div>
                        <div className="text-[15px] font-semibold" style={headlineStyle}>{coin.name}</div>
                        <div className="text-[11px] font-medium tracking-[0.16em] uppercase" style={{ color: t.SUBINK }}>{coin.symbol}</div>
                      </div>
                    </div>
                    {change != null && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold" style={{ background: positive ? t.MINT_BG : t.RED_BG, color: positive ? t.MINT_DEEP : t.RED_DEEP }}>
                        {positive ? '↑' : '↓'} {Math.abs(Number(change)).toFixed(2)}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[13px]" style={{ color: t.SUBINK }}>€</span>
                    <span className="text-[30px] font-semibold tabular-nums" style={{ ...headlineStyle, color: t.INK }}>
                      {price != null ? price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                    </span>
                  </div>
                  <div className="text-[12px] mt-1" style={{ color: t.SUBINK }}>24h change</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── STATS STRIP ─────────────────────────────────────────── */}
        <section id="supported" className="max-w-[1240px] mx-auto px-6 lg:px-10 mb-28">
          <div className="rounded-3xl px-6 py-8 md:px-10 md:py-10 grid grid-cols-2 md:grid-cols-4 gap-6"
               style={{ background: `linear-gradient(135deg, ${t.LAVENDER} 0%, ${t.LAVENDER_MID} 50%, ${t.CARD} 100%)`, boxShadow: t.SH_STATS, border: `1px solid ${t.HAIR_FAINT}` }}>
            {[
              { value: '3', label: 'Supported chains' },
              { value: 'Live', label: 'CoinGecko feed' },
              { value: 'ETH·BTC·SOL', label: 'On-chain import' },
              { value: 'Free', label: 'Forever, no subs' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-[28px] md:text-[32px] font-semibold tabular-nums" style={{ ...headlineStyle, color: t.INK }}>{stat.value}</div>
                <div className="text-[12.5px] mt-1 font-medium" style={{ color: t.SUBINK }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FEATURES — 3 soft-shadow cards ──────────────────────── */}
        <section className="max-w-[1240px] mx-auto px-6 lg:px-10 mb-28">
          <div className="mb-10 max-w-2xl">
            <div className="text-[12px] font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: t.LAVENDER_DEEP }}>What it does</div>
            <h2 className="text-[34px] md:text-[44px] font-semibold leading-[1.05]" style={headlineStyle}>
              The friendliest way to know
              <br />what you actually own.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="rounded-3xl p-7 transition-transform"
                   style={{ background: t.CARD, boxShadow: t.SH_CARD, border: `1px solid ${t.HAIR_LIGHT}` }}
                   onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                   onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[22px] mb-5" style={{ background: f.tint, color: t.INK }}>
                  {f.emoji}
                </div>
                <h3 className="text-[20px] font-semibold mb-2" style={headlineStyle}>{f.title}</h3>
                <p className="text-[14.5px] leading-[1.6]" style={{ color: t.SUBINK }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── HOW IT WORKS ────────────────────────────────────────── */}
        <section id="how-it-works" className="max-w-[1240px] mx-auto px-6 lg:px-10 mb-28">
          <div className="grid grid-cols-12 gap-x-8 gap-y-6 mb-10">
            <div className="col-span-12 md:col-span-5">
              <div className="text-[12px] font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: t.MINT_DEEP }}>How it works</div>
              <h2 className="text-[34px] md:text-[44px] font-semibold leading-[1.05]" style={headlineStyle}>
                Three steps.
                <br />Zero spreadsheets.
              </h2>
            </div>
            <div className="col-span-12 md:col-span-7 md:pt-3">
              <p className="text-[16px] leading-[1.65] max-w-[55ch]" style={{ color: t.SUBINK }}>
                Sign up, drop in the wallet addresses you already own, and let WalletPulse fetch the rest. Your keys never leave your hands — we only read public addresses.
              </p>
            </div>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { step: '01', title: 'Create your account', desc: 'Sign up free in seconds. No credit card, no subscription, no upsell.', tint: t.TINT_MINT },
              { step: '02', title: 'Add your wallets',    desc: 'Paste an ETH, BTC or SOL address — or log transactions by hand.',      tint: t.TINT_LAV },
              { step: '03', title: 'Watch it work',       desc: 'Live valuations, P&L and history across every wallet you added.',     tint: t.TINT_CREAM },
            ].map((s) => (
              <li key={s.step} className="rounded-3xl p-7"
                  style={{ background: t.CARD, boxShadow: t.SH_CARD, border: `1px solid ${t.HAIR_LIGHT}` }}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-11 h-11 rounded-2xl flex items-center justify-center text-[15px] font-semibold tabular-nums" style={{ background: s.tint, color: t.INK }}>
                    {s.step}
                  </span>
                  <span className="flex-1 h-px" style={{ background: t.HAIR_DIV }} />
                </div>
                <h3 className="text-[20px] font-semibold mb-2" style={headlineStyle}>{s.title}</h3>
                <p className="text-[14.5px] leading-[1.6]" style={{ color: t.SUBINK }}>{s.desc}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 flex justify-center">
            <button
              onClick={handleEnter}
              className="inline-flex items-center gap-2 text-[15px] font-semibold px-7 py-3.5 rounded-full transition-all"
              style={{ background: t.MINT, color: t.ON_TINT, boxShadow: t.SH_CTA_MINT }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = t.SH_CTA_MINT_H; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = t.SH_CTA_MINT; }}
            >
              Get started for free
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* ─── API KEYS ───────────────────────────────────────────── */}
        <section className="max-w-[1240px] mx-auto px-6 lg:px-10 mb-28">
          <div className="grid grid-cols-12 gap-x-10 gap-y-8">
            <aside className="col-span-12 md:col-span-4">
              <div className="md:sticky md:top-28">
                <div className="text-[12px] font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: t.LAVENDER_DEEP }}>Connect your chains</div>
                <h2 className="text-[30px] md:text-[34px] font-semibold leading-[1.05] mb-5" style={headlineStyle}>
                  Four providers. All free.
                </h2>
                <p className="text-[14.5px] leading-[1.65] mb-5" style={{ color: t.SUBINK }}>
                  On-chain import needs a free API key from each provider you want to use. No credit card needed for any of them.
                </p>
                <div className="rounded-2xl p-4 text-[12.5px] leading-[1.65]" style={{ background: t.LAVENDER, color: t.LAVENDER_TEXT }}>
                  Only relevant if you self-host WalletPulse. See the{' '}
                  <a href="https://github.com/WSukram/DHBW_WalletPulse" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                    GitHub repository
                  </a>
                  {' '}for full setup instructions.
                </div>
              </div>
            </aside>

            <div className="col-span-12 md:col-span-8 space-y-4">
              {[
                {
                  name: 'CoinGecko',
                  badge: 'Prices',
                  tint: t.MINT_BG,
                  desc: 'Live and historical EUR prices for BTC, ETH and SOL. Free demo key allows 30 requests/min.',
                  steps: ['Sign up at coingecko.com', 'Developer Dashboard → API Keys', 'Set coingecko.api.key in application.properties'],
                  url: 'https://www.coingecko.com/en/api',
                  required: false,
                },
                {
                  name: 'Etherscan',
                  badge: 'ETH import',
                  tint: t.LAVENDER,
                  desc: 'Imports your full Ethereum transaction history by wallet address. Native ETH and ERC-20 tokens.',
                  steps: ['Sign up at etherscan.io', 'My Account → API Keys → Add', 'Set etherscan.api.key in application.properties'],
                  url: 'https://etherscan.io/apis',
                  required: true,
                },
                {
                  name: 'Helius',
                  badge: 'SOL import',
                  tint: t.TINT_CREAM,
                  desc: 'Imports your Solana transaction history. Free plan includes 100,000 requests per month.',
                  steps: ['Sign up at helius.dev', 'Your API key is shown on the dashboard', 'Set helius.api.key in application.properties'],
                  url: 'https://helius.dev',
                  required: true,
                },
                {
                  name: 'Blockstream',
                  badge: 'BTC import',
                  tint: t.RED_BG_2,
                  desc: 'Imports your Bitcoin transaction history using the open Blockstream Esplora API. No account required.',
                  steps: ['No setup needed — works out of the box', 'Set wallet chainType to BTC', 'Add your Bitcoin address and trigger import'],
                  url: null,
                  required: false,
                },
              ].map((api) => (
                <div key={api.name} className="rounded-3xl p-6 md:p-7" style={{ background: t.CARD, boxShadow: t.SH_API, border: `1px solid ${t.HAIR_LIGHT}` }}>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ background: api.tint, color: t.INK }}>
                        {api.badge}
                      </span>
                      <h3 className="text-[22px] font-semibold" style={headlineStyle}>{api.name}</h3>
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full" style={{ background: api.required ? t.RED_BG : t.MINT_BG, color: api.required ? t.RED_DEEP : t.MINT_DEEP }}>
                      {api.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                  <p className="text-[14.5px] leading-[1.6] mb-4" style={{ color: t.SUBINK }}>{api.desc}</p>
                  <ol className="space-y-1.5 mb-4">
                    {api.steps.map((step, j) => (
                      <li key={j} className="flex items-baseline gap-3 text-[13.5px]" style={{ color: t.SUBINK }}>
                        <span className="text-[11px] font-semibold tabular-nums" style={{ color: t.INK }}>{String(j + 1).padStart(2, '0')}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  {api.url ? (
                    <a href={api.url} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold px-4 py-2 rounded-full transition-colors"
                       style={{ background: t.CTA_INK_BG, color: t.CTA_INK_FG }}>
                      Get your free key
                      <span className="material-symbols-outlined text-[14px]">north_east</span>
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold px-4 py-2 rounded-full" style={{ background: t.MINT_BG, color: t.MINT_DEEP }}>
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      No API key required
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ──────────────────────────────────────────────── */}
      <footer className="w-full" style={{ borderTop: `1px solid ${t.HAIR_HEAVY}` }}>
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <img src="/wp-icon.svg" alt="" className="w-7 h-7" style={{ borderRadius: 8 }} />
            <span className="text-[16px] font-semibold" style={headlineStyle}>WalletPulse</span>
          </div>
          <p className="text-[12px]" style={{ color: t.SUBINK }}>
            © 2026 · DHBW Web Engineering 2 project
          </p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { to: '/terms', label: 'Terms' },
              { to: '/privacy', label: 'Privacy' },
              { to: '/impressum', label: 'Impressum' },
              { to: '/docs', label: 'API' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} className="text-[13px] transition-colors" style={{ color: t.SUBINK }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = t.INK)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = t.SUBINK)}>
                {label}
              </Link>
            ))}
            <a href="https://github.com/WSukram/DHBW_WalletPulse" target="_blank" rel="noopener noreferrer" className="text-[13px]" style={{ color: t.SUBINK }}
               onMouseEnter={(e) => (e.currentTarget.style.color = t.INK)}
               onMouseLeave={(e) => (e.currentTarget.style.color = t.SUBINK)}>
              GitHub
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Home;
