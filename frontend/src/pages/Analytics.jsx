import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { coinMeta, formatPct } from '../utils/coins';
import { timeRanges, getChartLabels, computePortfolioChartPoints, pointsToPath } from '../utils/chart';
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

const CIRCUMFERENCE = 2 * Math.PI * 40;

const coinTint = (coinId, t) => {
  if (coinId === 'bitcoin')  return { bg: t.CREAM_CHIP, border: t.CREAM_CHIP_BORDER, fg: t.CREAM_DEEP };
  if (coinId === 'ethereum') return { bg: t.LAVENDER,   border: t.HAIR_HEAVY,        fg: t.LAVENDER_TEXT };
  if (coinId === 'solana')   return { bg: t.MINT_BG,    border: t.MINT_CIRCLE_BORDER, fg: t.MINT_DEEP };
  return { bg: t.CARD_3, border: t.HAIR_HEAVY, fg: t.INK };
};

const segmentPalette = (t) => [
  t.MINT_DEEP,
  t.LAVENDER_DEEP,
  t.CREAM_DEEP,
  t.RED_DEEP,
  t.MINT,
  t.LAVENDER,
];

const DonutChart = ({ segments, trackColor }) => {
  let offset = 0;
  return (
    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" fill="transparent" stroke={trackColor} strokeWidth="12" />
      {segments.map((seg, i) => {
        const dash = (seg.pct / 100) * CIRCUMFERENCE;
        const gap = CIRCUMFERENCE - dash;
        const rotateAngle = (offset / 100) * 360;
        offset += seg.pct;
        return (
          <circle
            key={i}
            cx="50" cy="50" r="40"
            fill="transparent"
            stroke={seg.color}
            strokeWidth="12"
            strokeDasharray={`${dash} ${gap}`}
            transform={`rotate(${rotateAngle} 50 50)`}
            className="transition-all duration-1000 ease-out hover:stroke-[14px] cursor-pointer"
          />
        );
      })}
    </svg>
  );
};

const Analytics = () => {
  usePageTitle('Analytics');
  const { formatCurrency: formatEur } = useApp();
  const { portfolios, transactions, isLoading, error } = usePortfolioData();
  const isDark = usePrefersDark();
  const t = isDark ? DARK : LIGHT;
  const [activeRange, setActiveRange] = useState('1Y');

  const chartPoints = useMemo(
    () => computePortfolioChartPoints(transactions, portfolios.flatMap((p) => p.assets ?? []), activeRange),
    [transactions, portfolios, activeRange]
  );

  const eyebrowStyle = {
    ...monoStyle,
    fontSize: 10,
    letterSpacing: '0.22em',
    color: t.SUBINK,
    textTransform: 'uppercase',
  };

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

  const allAssets = groupByCoin(portfolios.flatMap((p) => p.assets ?? []));
  const totalCurrentValue = portfolios.reduce((s, p) => s + (p.totalCurrentValue ?? 0), 0);
  const totalInvested = portfolios.reduce((s, p) => s + (p.totalInvested ?? 0), 0);
  const totalProfit = portfolios.reduce((s, p) => s + (p.totalProfit ?? 0), 0);

  const sortedByPerf = [...allAssets].sort((a, b) => {
    const pctA = a.totalInvested > 0 ? a.profit / a.totalInvested : 0;
    const pctB = b.totalInvested > 0 ? b.profit / b.totalInvested : 0;
    return pctB - pctA;
  });

  const topPerformers = sortedByPerf.filter((a) => a.profit >= 0).slice(0, 3);
  const underperformers = sortedByPerf.filter((a) => a.profit < 0).reverse().slice(0, 3);

  const palette = segmentPalette(t);
  const donutSegments = allAssets
    .filter((a) => totalCurrentValue > 0)
    .map((a, i) => ({
      label: coinMeta(a.coinId).name,
      pct: (a.currentValue / totalCurrentValue) * 100,
      color: palette[i % palette.length],
      coinId: a.coinId,
    }));

  const isProfit = totalProfit >= 0;

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ background: t.PAPER, color: t.INK, fontFamily: bodyFontFamily }}
    >
      <div className="max-w-[1240px] mx-auto px-6 lg:px-10 py-8 lg:py-10 space-y-8 relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-16 w-[520px] h-[420px] rounded-full"
          style={{ background: `radial-gradient(closest-side, ${t.BLOB_LAV}, transparent 70%)`, filter: 'blur(20px)' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 w-[420px] h-[380px] rounded-full"
          style={{ background: `radial-gradient(closest-side, ${t.BLOB_MINT}, transparent 70%)`, filter: 'blur(20px)' }}
        />

        {/* Header */}
        <header className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div className="space-y-3">
            <div style={eyebrowStyle}>ANALYTICS · PERFORMANCE</div>
            <h1
              className="text-[40px] md:text-[48px] leading-[0.95]"
              style={{ ...headlineStyle, fontWeight: 600, letterSpacing: '-0.025em', color: t.INK }}
            >
              Performance intelligence
            </h1>
            <p className="text-[15px] max-w-[58ch] leading-[1.6]" style={{ color: t.SUBINK }}>
              Deep dive into your portfolio allocation and historical returns.
            </p>
          </div>
          <div
            className="flex items-center gap-6 rounded-2xl px-5 py-3"
            style={{ background: t.CARD, border: `1px solid ${t.HAIR_HEAVY}`, boxShadow: t.SH_STATS }}
          >
            <div>
              <div style={eyebrowStyle}>TOTAL VALUE</div>
              <div className="mt-1 tabular-nums" style={{ ...headlineStyle, fontSize: 22, fontWeight: 600, color: t.INK, letterSpacing: '-0.01em' }}>
                {formatEur(totalCurrentValue)}
              </div>
            </div>
            <div className="h-10 w-px" style={{ background: t.HAIR_DIV }} />
            <div>
              <div style={eyebrowStyle}>ALL-TIME ROI</div>
              <div
                className="mt-1 tabular-nums inline-flex items-center gap-1"
                style={{ ...headlineStyle, fontSize: 22, fontWeight: 600, color: isProfit ? t.MINT_DEEP : t.RED_DEEP, letterSpacing: '-0.01em' }}
              >
                <span className="material-symbols-outlined text-[18px]">{isProfit ? 'trending_up' : 'trending_down'}</span>
                {formatPct(totalProfit, totalInvested)}
              </div>
            </div>
          </div>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">

          {/* Capital Appreciation Chart — 8/12 */}
          <section
            className="lg:col-span-8 rounded-3xl p-6 md:p-7 flex flex-col"
            style={{ background: t.CARD, border: `1px solid ${t.HAIR_HEAVY}`, boxShadow: t.SH_CARD }}
          >
            <div className="flex justify-between items-start gap-4 mb-6 flex-wrap">
              <div className="space-y-2">
                <div style={eyebrowStyle}>CAPITAL · APPRECIATION</div>
                <h2 className="text-[22px]" style={{ ...headlineStyle, fontWeight: 600, color: t.INK, letterSpacing: '-0.01em' }}>
                  Value vs. cost basis
                </h2>
                <p className="text-[13px]" style={{ color: t.SUBINK }}>
                  Realized vs. unrealized gains over time.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-3" style={{ ...monoStyle, fontSize: 10, color: t.SUBINK, letterSpacing: '0.12em' }}>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block w-3 h-0.5 rounded" style={{ background: t.LAVENDER_DEEP }} />
                    VALUE
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block w-3 border-t-2 border-dashed" style={{ borderColor: t.MINT_DEEP }} />
                    COST
                  </span>
                </div>
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

            <div className="flex-1 w-full min-h-[280px] relative mt-auto">
              {(() => {
                if (chartPoints.length < 2) {
                  return (
                    <div
                      className="absolute inset-0 flex items-center justify-center text-center"
                      style={{ ...monoStyle, fontSize: 11, letterSpacing: '0.18em', color: t.SUBINK }}
                    >
                      NO TRANSACTION DATA FOR THIS PERIOD
                    </div>
                  );
                }
                const allV = chartPoints.flatMap((p) => [p.cost, p.value]).filter((v) => v > 0);
                const minV = Math.min(...allV) * 0.95;
                const maxV = Math.max(...allV) * 1.05;
                const valuePath = pointsToPath(chartPoints, 'value', minV, maxV);
                const costPath = pointsToPath(chartPoints, 'cost', minV, maxV);
                const valueAreaPath = pointsToPath(chartPoints, 'value', minV, maxV, true);
                return (
                  <>
                    <div
                      className="absolute left-0 top-0 bottom-8 flex flex-col justify-between pr-4 pb-2"
                      style={{ ...monoStyle, fontSize: 10, color: t.SUBINK, borderRight: `1px solid ${t.HAIR}` }}
                    >
                      <span>{formatEur(maxV)}</span>
                      <span>{formatEur((maxV * 2 + minV) / 3)}</span>
                      <span>{formatEur((maxV + minV * 2) / 3)}</span>
                      <span>{formatEur(minV)}</span>
                    </div>
                    <div className="absolute left-12 right-0 top-2 bottom-8 flex flex-col justify-between pointer-events-none">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="w-full" style={{ borderTop: `1px dashed ${t.HAIR_HEAVY}` }} />
                      ))}
                    </div>
                    <div className="absolute left-12 right-0 top-0 bottom-8">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="analytics-area-grad" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor={t.LAVENDER_DEEP} stopOpacity="0.28" />
                            <stop offset="100%" stopColor={t.LAVENDER_DEEP} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {valueAreaPath && <path d={valueAreaPath} fill="url(#analytics-area-grad)" />}
                        {valuePath && (
                          <path
                            d={valuePath}
                            fill="none"
                            stroke={t.LAVENDER_DEEP}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                          />
                        )}
                        {costPath && (
                          <path
                            d={costPath}
                            fill="none"
                            stroke={t.MINT_DEEP}
                            strokeDasharray="4 4"
                            strokeWidth="1.5"
                            vectorEffect="non-scaling-stroke"
                            opacity="0.7"
                          />
                        )}
                      </svg>
                    </div>
                    <div
                      className="absolute bottom-0 left-12 right-0 flex justify-between pt-2"
                      style={{ ...monoStyle, fontSize: 10, color: t.SUBINK }}
                    >
                      {getChartLabels(activeRange).map((m) => <span key={m}>{m}</span>)}
                    </div>
                  </>
                );
              })()}
            </div>
          </section>

          {/* Asset Allocation Donut — 4/12 */}
          <section
            className="lg:col-span-4 rounded-3xl p-6 md:p-7 flex flex-col"
            style={{ background: t.CARD, border: `1px solid ${t.HAIR_HEAVY}`, boxShadow: t.SH_CARD }}
          >
            <div className="space-y-2 mb-5">
              <div style={eyebrowStyle}>ASSET · ALLOCATION</div>
              <h2 className="text-[22px]" style={{ ...headlineStyle, fontWeight: 600, color: t.INK, letterSpacing: '-0.01em' }}>
                Distribution
              </h2>
              <p className="text-[13px]" style={{ color: t.SUBINK }}>
                By current portfolio value.
              </p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-48 h-48">
                <DonutChart segments={donutSegments} trackColor={t.HAIR_STRONG} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.22em', color: t.SUBINK }}>TOTAL</span>
                  <span className="tabular-nums mt-1" style={{ ...headlineStyle, fontSize: 20, fontWeight: 600, color: t.INK }}>
                    {allAssets.length} Asset{allAssets.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="w-full mt-8 space-y-3">
                {donutSegments.map((seg) => (
                  <div key={seg.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: seg.color }} />
                      <span style={{ color: t.INK, fontSize: 13 }}>{seg.label}</span>
                    </div>
                    <span className="tabular-nums" style={{ ...monoStyle, fontSize: 12, color: t.INK }}>
                      {seg.pct.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Top Performers — 6/12 */}
          <section
            className="lg:col-span-6 rounded-3xl overflow-hidden flex flex-col"
            style={{ background: t.CARD, border: `1px solid ${t.HAIR_HEAVY}`, boxShadow: t.SH_CARD }}
          >
            <div
              className="px-6 py-5 flex justify-between items-center"
              style={{ borderBottom: `1px solid ${t.HAIR_DIV}`, background: t.CARD_2 }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-9 h-9 rounded-full inline-flex items-center justify-center"
                  style={{ background: t.MINT_BG, border: `1px solid ${t.MINT_CIRCLE_BORDER}`, color: t.MINT_DEEP }}
                >
                  <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                </span>
                <div className="space-y-1">
                  <div style={eyebrowStyle}>LEADERS</div>
                  <h3 className="text-[18px]" style={{ ...headlineStyle, fontWeight: 600, color: t.INK }}>
                    Top performers
                  </h3>
                </div>
              </div>
              <span style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.18em', color: t.SUBINK }}>VS. AVG ENTRY</span>
            </div>
            <div className="flex-1 flex flex-col">
              {topPerformers.length === 0 && (
                <div
                  className="p-8 text-center"
                  style={{ ...monoStyle, fontSize: 11, letterSpacing: '0.18em', color: t.SUBINK }}
                >
                  NO PROFITABLE ASSETS
                </div>
              )}
              {topPerformers.map((asset, idx) => {
                const meta = coinMeta(asset.coinId);
                const tint = coinTint(asset.coinId, t);
                const avgEntry = asset.totalAmount > 0 ? asset.totalInvested / asset.totalAmount : 0;
                return (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-5 transition-colors"
                    style={{ borderBottom: idx < topPerformers.length - 1 ? `1px solid ${t.HAIR_DIV}` : 'none' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = t.CARD_2)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-[18px]"
                        style={{
                          background: tint.bg,
                          border: `1px solid ${tint.border}`,
                          color: tint.fg,
                          ...headlineStyle,
                          fontWeight: 600,
                        }}
                      >
                        {meta.icon}
                      </div>
                      <div>
                        <div style={{ ...headlineStyle, fontWeight: 600, color: t.INK, fontSize: 15 }}>{meta.name}</div>
                        <div className="mt-0.5" style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.18em', color: t.SUBINK }}>
                          {meta.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="tabular-nums" style={{ ...monoStyle, fontSize: 13, color: t.INK }}>
                          {formatEur(asset.currentPrice)}
                        </div>
                        <div className="mt-0.5 tabular-nums" style={{ ...monoStyle, fontSize: 10, color: t.SUBINK }}>
                          Entry: {formatEur(avgEntry)}
                        </div>
                      </div>
                      <div
                        className="px-2.5 py-1 rounded-md inline-flex items-center gap-1 tabular-nums"
                        style={{
                          background: t.MINT_BG,
                          color: t.MINT_DEEP,
                          border: `1px solid ${t.MINT_CIRCLE_BORDER}`,
                          ...monoStyle,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                        {formatPct(asset.profit, asset.totalInvested).replace('+', '')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Underperforming — 6/12 */}
          <section
            className="lg:col-span-6 rounded-3xl overflow-hidden flex flex-col"
            style={{ background: t.CARD, border: `1px solid ${t.HAIR_HEAVY}`, boxShadow: t.SH_CARD }}
          >
            <div
              className="px-6 py-5 flex justify-between items-center"
              style={{ borderBottom: `1px solid ${t.HAIR_DIV}`, background: t.CARD_2 }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-9 h-9 rounded-full inline-flex items-center justify-center"
                  style={{ background: t.RED_BG, border: `1px solid ${t.HAIR_HEAVY}`, color: t.RED_DEEP }}
                >
                  <span className="material-symbols-outlined text-[18px]">trending_down</span>
                </span>
                <div className="space-y-1">
                  <div style={eyebrowStyle}>LAGGARDS</div>
                  <h3 className="text-[18px]" style={{ ...headlineStyle, fontWeight: 600, color: t.INK }}>
                    Underperforming
                  </h3>
                </div>
              </div>
              <span style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.18em', color: t.SUBINK }}>VS. AVG ENTRY</span>
            </div>
            <div className="flex-1 flex flex-col">
              {underperformers.length === 0 && (
                <div
                  className="p-8 text-center"
                  style={{ ...monoStyle, fontSize: 11, letterSpacing: '0.18em', color: t.SUBINK }}
                >
                  NO UNDERPERFORMING ASSETS
                </div>
              )}
              {underperformers.map((asset, idx) => {
                const meta = coinMeta(asset.coinId);
                const tint = coinTint(asset.coinId, t);
                const avgEntry = asset.totalAmount > 0 ? asset.totalInvested / asset.totalAmount : 0;
                return (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-5 transition-colors"
                    style={{ borderBottom: idx < underperformers.length - 1 ? `1px solid ${t.HAIR_DIV}` : 'none' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = t.CARD_2)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-[18px]"
                        style={{
                          background: tint.bg,
                          border: `1px solid ${tint.border}`,
                          color: tint.fg,
                          ...headlineStyle,
                          fontWeight: 600,
                        }}
                      >
                        {meta.icon}
                      </div>
                      <div>
                        <div style={{ ...headlineStyle, fontWeight: 600, color: t.INK, fontSize: 15 }}>{meta.name}</div>
                        <div className="mt-0.5" style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.18em', color: t.SUBINK }}>
                          {meta.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="tabular-nums" style={{ ...monoStyle, fontSize: 13, color: t.INK }}>
                          {formatEur(asset.currentPrice)}
                        </div>
                        <div className="mt-0.5 tabular-nums" style={{ ...monoStyle, fontSize: 10, color: t.SUBINK }}>
                          Entry: {formatEur(avgEntry)}
                        </div>
                      </div>
                      <div
                        className="px-2.5 py-1 rounded-md inline-flex items-center gap-1 tabular-nums"
                        style={{
                          background: t.RED_BG,
                          color: t.RED_DEEP,
                          border: `1px solid ${t.HAIR_HEAVY}`,
                          ...monoStyle,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                        {formatPct(asset.profit, asset.totalInvested).replace('-', '')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Analytics;
