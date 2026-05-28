import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { coinMeta, formatPct } from '../utils/coins';
import { timeRanges, getChartLabels, computeAssetChartPoints, pointsToPath } from '../utils/chart';
import { groupByCoin } from '../utils/groupByCoin';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { usePageTitle } from '../hooks/usePageTitle';
import {
  LIGHT,
  DARK,
  headlineStyle,
  monoStyle,
  bodyFontFamily,
  usePrefersDark,
} from '../theme/softStack';

const coinTint = (coinId, t) => {
  if (coinId === 'bitcoin')  return { bg: t.CREAM_CHIP, border: t.CREAM_CHIP_BORDER, fg: t.INK };
  if (coinId === 'ethereum') return { bg: t.LAVENDER,   border: t.HAIR_HEAVY,        fg: t.LAVENDER_TEXT };
  if (coinId === 'solana')   return { bg: t.MINT_BG,    border: t.MINT_CIRCLE_BORDER, fg: t.MINT_DEEP };
  return { bg: t.CARD_3, border: t.HAIR_HEAVY, fg: t.INK };
};

const Assets = () => {
  usePageTitle('Assets');
  const { formatCurrency: formatEur } = useApp();
  const { portfolios, transactions, isLoading, error } = usePortfolioData();
  const isDark = usePrefersDark();
  const t = isDark ? DARK : LIGHT;

  const [activeCompare, setActiveCompare] = useState(null);
  const [activeRange, setActiveRange] = useState('1Y');

  const portfolio = useMemo(() => {
    if (portfolios.length === 0) return null;
    const allAssets = portfolios.flatMap((p) => p.assets ?? []);
    return {
      assets: groupByCoin(allAssets),
      totalCurrentValue: portfolios.reduce((s, p) => s + (p.totalCurrentValue ?? 0), 0),
      totalInvested: portfolios.reduce((s, p) => s + (p.totalInvested ?? 0), 0),
      totalProfit: portfolios.reduce((s, p) => s + (p.totalProfit ?? 0), 0),
    };
  }, [portfolios]);

  useEffect(() => {
    if (activeCompare == null && portfolio?.assets?.length > 0) {
      setActiveCompare(portfolio.assets[0].coinId);
    }
  }, [portfolio, activeCompare]);

  const activeAsset = useMemo(
    () => (portfolio?.assets ?? []).find((a) => a.coinId === activeCompare) ?? null,
    [portfolio, activeCompare]
  );

  const chartPoints = useMemo(
    () => computeAssetChartPoints(transactions, activeAsset, activeRange),
    [transactions, activeAsset, activeRange]
  );

  if (isLoading) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ background: t.PAPER, color: t.SUBINK, fontFamily: bodyFontFamily, ...monoStyle, fontSize: 12, letterSpacing: '0.2em' }}
      >
        LOADING LIVE DATA…
      </div>
    );
  }
  if (error) {
    return (
      <div
        className="flex-1 flex items-center justify-center px-6 text-center"
        style={{ background: t.PAPER, color: t.RED_DEEP, fontFamily: bodyFontFamily }}
      >
        {error}
      </div>
    );
  }

  const assets = portfolio?.assets ?? [];
  const totalCurrentValue = portfolio?.totalCurrentValue ?? 0;
  const totalInvested = portfolio?.totalInvested ?? 0;
  const totalProfit = portfolio?.totalProfit ?? 0;
  const isProfit = totalProfit >= 0;

  const allValues = chartPoints.flatMap((p) => [p.cost, p.value]).filter((v) => v > 0);
  const minV = allValues.length ? Math.min(...allValues) * 0.95 : 0;
  const maxV = allValues.length ? Math.max(...allValues) * 1.05 : 1;
  const meta = activeAsset ? coinMeta(activeAsset.coinId) : null;
  const valuePath = pointsToPath(chartPoints, 'value', minV, maxV);
  const costPath = pointsToPath(chartPoints, 'cost', minV, maxV);
  const valueAreaPath = pointsToPath(chartPoints, 'value', minV, maxV, true);

  const eyebrowStyle = {
    ...monoStyle,
    fontSize: 10,
    letterSpacing: '0.22em',
    color: t.SUBINK,
    textTransform: 'uppercase',
  };

  const stats = [
    {
      label: 'TOTAL VALUE',
      value: formatEur(totalCurrentValue),
      sub: `${formatPct(totalProfit, totalInvested)} all-time`,
      subColor: isProfit ? t.MINT_DEEP : t.RED_DEEP,
      tint: t.MINT_BG,
      tintBorder: t.MINT_CIRCLE_BORDER,
    },
    {
      label: 'COST BASIS',
      value: formatEur(totalInvested),
      sub: 'Across all assets',
      subColor: t.SUBINK,
      tint: t.LAVENDER,
      tintBorder: t.HAIR_HEAVY,
    },
    {
      label: 'UNREALIZED P&L',
      value: `${isProfit ? '+' : ''}${formatEur(totalProfit)}`,
      sub: `${assets.length} ${assets.length === 1 ? 'asset' : 'assets'}`,
      subColor: t.SUBINK,
      tint: t.CREAM_CHIP,
      tintBorder: t.CREAM_CHIP_BORDER,
      valueColor: isProfit ? t.MINT_DEEP : t.RED_DEEP,
    },
  ];

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ background: t.PAPER, color: t.INK, fontFamily: bodyFontFamily }}
    >
      <div className="max-w-[1240px] mx-auto px-6 lg:px-10 py-8 lg:py-10 space-y-8">
        {/* ─── PAGE HEADER ─────────────────────────────────────────── */}
        <header className="space-y-3">
          <div style={eyebrowStyle}>PORTFOLIO · HOLDINGS</div>
          <h1
            className="text-[40px] md:text-[48px] leading-[0.95]"
            style={{ ...headlineStyle, fontWeight: 600, letterSpacing: '-0.02em', color: t.INK }}
          >
            Your assets
          </h1>
          <p className="text-[15px] max-w-[58ch] leading-[1.6]" style={{ color: t.SUBINK }}>
            Holdings grouped by coin across every wallet you tracked — live values and unrealized P&amp;L from CoinGecko.
          </p>
        </header>

        {/* ─── SUMMARY STATS ───────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-5 flex flex-col gap-4 transition-transform"
              style={{
                background: t.CARD,
                border: `1px solid ${t.HAIR_HEAVY}`,
                boxShadow: t.SH_CARD,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div className="flex items-start justify-between">
                <div style={eyebrowStyle}>{s.label}</div>
                <span
                  className="w-8 h-8 rounded-full inline-flex items-center justify-center shrink-0"
                  style={{ background: s.tint, border: `1px solid ${s.tintBorder}` }}
                  aria-hidden="true"
                />
              </div>
              <div>
                <div
                  className="tabular-nums"
                  style={{ ...headlineStyle, fontWeight: 600, fontSize: 28, color: s.valueColor || t.INK, letterSpacing: '-0.01em' }}
                >
                  {s.value}
                </div>
                <div className="mt-1.5" style={{ ...monoStyle, fontSize: 11, color: s.subColor }}>
                  {s.sub}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* ─── ASSET ANALYTICS CHART ───────────────────────────────── */}
        <section
          className="rounded-3xl overflow-hidden"
          style={{ background: t.CARD, border: `1px solid ${t.HAIR_HEAVY}`, boxShadow: t.SH_CARD }}
        >
          <div
            className="px-6 py-4 flex flex-wrap gap-4 items-center justify-between"
            style={{ borderBottom: `1px solid ${t.HAIR_LIGHT}`, background: t.CARD_2 }}
          >
            <div className="flex items-center gap-3 flex-wrap">
              <span style={eyebrowStyle}>ASSET</span>
              <div className="flex gap-1.5 flex-wrap">
                {assets.map((a) => {
                  const m = coinMeta(a.coinId);
                  const tint = coinTint(a.coinId, t);
                  const active = activeCompare === a.coinId;
                  return (
                    <button
                      key={a.coinId}
                      onClick={() => setActiveCompare(a.coinId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all"
                      style={{
                        background: active ? tint.bg : t.CARD,
                        border: `1px solid ${active ? tint.border : t.HAIR_HEAVY}`,
                        color: active ? tint.fg : t.SUBINK,
                        boxShadow: active ? t.SH_PILL : 'none',
                        ...monoStyle,
                        fontSize: 11,
                        letterSpacing: '0.1em',
                      }}
                    >
                      <span
                        className="inline-flex w-4 h-4 rounded-full items-center justify-center text-[9px] font-bold"
                        style={{ background: tint.bg, color: tint.fg, border: `1px solid ${tint.border}` }}
                      >
                        {m.icon}
                      </span>
                      {m.symbol}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {meta && (
                <div className="hidden md:flex items-center gap-3" style={{ ...monoStyle, fontSize: 10, color: t.SUBINK, letterSpacing: '0.12em' }}>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block w-3 h-0.5 rounded" style={{ background: t.MINT_DEEP }} />
                    VALUE
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block w-3 border-t-2 border-dashed" style={{ borderColor: t.LAVENDER_DEEP }} />
                    COST
                  </span>
                </div>
              )}
              <div
                className="inline-flex rounded-full p-1"
                style={{ background: t.CARD_3, border: `1px solid ${t.HAIR_HEAVY}` }}
              >
                {timeRanges.map((r) => {
                  const active = activeRange === r;
                  return (
                    <button
                      key={r}
                      onClick={() => setActiveRange(r)}
                      className="px-3 py-1 rounded-full transition-all"
                      style={{
                        background: active ? t.CARD : 'transparent',
                        color: active ? t.INK : t.SUBINK,
                        boxShadow: active ? t.SH_PILL : 'none',
                        ...monoStyle,
                        fontSize: 10,
                        letterSpacing: '0.1em',
                      }}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-6 relative h-72 w-full">
            {chartPoints.length < 2 ? (
              <div
                className="absolute inset-0 flex items-center justify-center text-center"
                style={{ ...monoStyle, fontSize: 11, letterSpacing: '0.18em', color: t.SUBINK }}
              >
                NO TRANSACTION DATA FOR THIS PERIOD
              </div>
            ) : (
              <>
                <div
                  className="absolute left-6 top-6 bottom-10 w-20 flex flex-col justify-between pointer-events-none"
                  style={{ ...monoStyle, fontSize: 10, color: t.SUBINK }}
                >
                  <span>{formatEur(maxV)}</span>
                  <span>{formatEur((maxV + minV) / 2)}</span>
                  <span>{formatEur(minV)}</span>
                </div>
                <div className="absolute left-28 right-6 top-6 bottom-10 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-full" style={{ borderTop: `1px dashed ${t.HAIR_HEAVY}` }} />
                  ))}
                </div>
                <svg
                  className="absolute left-28 right-6 top-6 bottom-10"
                  style={{ width: 'calc(100% - 128px)', height: 'calc(100% - 64px)' }}
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="asset-area-grad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={t.MINT} stopOpacity="0.35" />
                      <stop offset="100%" stopColor={t.MINT} stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="asset-line-grad" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor={t.LAVENDER_DEEP} />
                      <stop offset="100%" stopColor={t.MINT_DEEP} />
                    </linearGradient>
                  </defs>
                  {valueAreaPath && <path d={valueAreaPath} fill="url(#asset-area-grad)" />}
                  {valuePath && (
                    <path
                      d={valuePath}
                      fill="none"
                      stroke="url(#asset-line-grad)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                  {costPath && (
                    <path
                      d={costPath}
                      fill="none"
                      stroke={t.LAVENDER_DEEP}
                      strokeWidth="1.4"
                      strokeDasharray="4 3"
                      vectorEffect="non-scaling-stroke"
                      opacity="0.65"
                    />
                  )}
                </svg>
                <div
                  className="absolute bottom-2 left-28 right-6 flex justify-between"
                  style={{ ...monoStyle, fontSize: 10, color: t.SUBINK }}
                >
                  {getChartLabels(activeRange).map((l) => <span key={l}>{l}</span>)}
                </div>
              </>
            )}
          </div>
        </section>

        {/* ─── TRACKED ASSETS ──────────────────────────────────────── */}
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <div style={eyebrowStyle}>TRACKED ASSETS</div>
              <h2 className="text-[26px] leading-tight" style={{ ...headlineStyle, fontWeight: 600, letterSpacing: '-0.01em', color: t.INK }}>
                Holdings overview
              </h2>
            </div>
            <div style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.18em', color: t.SUBINK }}>
              {assets.length} {assets.length === 1 ? 'COIN' : 'COINS'}
            </div>
          </div>

          {assets.length === 0 ? (
            <div
              className="rounded-3xl p-10 text-center flex flex-col items-center gap-4"
              style={{ background: t.CARD, border: `1px solid ${t.HAIR_HEAVY}`, boxShadow: t.SH_CARD }}
            >
              <div
                className="w-14 h-14 rounded-full inline-flex items-center justify-center"
                style={{ background: t.CREAM_CHIP, border: `1px solid ${t.CREAM_CHIP_BORDER}` }}
              >
                <span className="material-symbols-outlined" style={{ color: t.CREAM_DEEP, fontSize: 24 }}>
                  account_balance_wallet
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-[20px]" style={{ ...headlineStyle, fontWeight: 600, color: t.INK }}>
                  No assets yet
                </h3>
                <p className="text-[14px]" style={{ color: t.SUBINK }}>
                  Add a wallet or record your first transaction to see holdings here.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {assets.map((asset) => {
                const m = coinMeta(asset.coinId);
                const tint = coinTint(asset.coinId, t);
                const assetIsProfit = asset.profit >= 0;
                const pct = formatPct(asset.profit, asset.totalInvested);
                const isActive = activeCompare === asset.coinId;

                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setActiveCompare(asset.coinId)}
                    className="rounded-2xl p-5 text-left transition-all w-full"
                    style={{
                      background: t.CARD,
                      border: `1px solid ${isActive ? tint.border : t.HAIR_HEAVY}`,
                      boxShadow: isActive ? t.SH_PILL : t.SH_CARD,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = t.SH_HERO;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = isActive ? t.SH_PILL : t.SH_CARD;
                    }}
                  >
                    <div className="flex items-center gap-5 flex-wrap md:flex-nowrap">
                      {/* Coin chip */}
                      <div
                        className="w-14 h-14 rounded-full inline-flex items-center justify-center shrink-0 text-[22px]"
                        style={{
                          background: tint.bg,
                          border: `1px solid ${tint.border}`,
                          color: tint.fg,
                          ...headlineStyle,
                          fontWeight: 600,
                        }}
                      >
                        {m.icon}
                      </div>

                      {/* Name + ticker */}
                      <div className="min-w-[120px]">
                        <div className="text-[16px]" style={{ ...headlineStyle, fontWeight: 600, color: t.INK }}>
                          {m.name}
                        </div>
                        <div className="mt-1" style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.18em', color: t.SUBINK }}>
                          {m.symbol}
                        </div>
                      </div>

                      {/* Metric grid */}
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 w-full">
                        <div>
                          <div style={{ ...monoStyle, fontSize: 9, letterSpacing: '0.2em', color: t.SUBINK }}>PRICE</div>
                          <div className="mt-1 tabular-nums" style={{ ...monoStyle, fontSize: 13, color: t.INK }}>
                            {formatEur(asset.currentPrice)}
                          </div>
                        </div>
                        <div>
                          <div style={{ ...monoStyle, fontSize: 9, letterSpacing: '0.2em', color: t.SUBINK }}>AMOUNT</div>
                          <div className="mt-1 tabular-nums" style={{ ...monoStyle, fontSize: 13, color: t.INK }}>
                            {asset.totalAmount?.toFixed(8)}
                          </div>
                        </div>
                        <div>
                          <div style={{ ...monoStyle, fontSize: 9, letterSpacing: '0.2em', color: t.SUBINK }}>VALUE</div>
                          <div className="mt-1 tabular-nums" style={{ ...monoStyle, fontSize: 13, color: t.INK }}>
                            {formatEur(asset.currentValue)}
                          </div>
                        </div>
                        <div>
                          <div style={{ ...monoStyle, fontSize: 9, letterSpacing: '0.2em', color: t.SUBINK }}>P&amp;L</div>
                          <div
                            className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md tabular-nums"
                            style={{
                              background: assetIsProfit ? t.MINT_BG : t.RED_BG,
                              color: assetIsProfit ? t.MINT_DEEP : t.RED_DEEP,
                              ...monoStyle,
                              fontSize: 11,
                            }}
                          >
                            <span>{assetIsProfit ? '▲' : '▼'}</span>
                            {pct.replace(/^[+-]/, '')}
                          </div>
                        </div>
                      </div>

                      {/* Active indicator */}
                      <div className="shrink-0 hidden md:flex items-center" aria-hidden="true">
                        <span
                          className="w-2 h-2 rounded-full transition-opacity"
                          style={{
                            background: t.MINT_DEEP,
                            opacity: isActive ? 1 : 0,
                            boxShadow: isActive ? `0 0 12px ${t.MINT}` : 'none',
                          }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Assets;
