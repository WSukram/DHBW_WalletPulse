import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const COIN_META = {
  bitcoin:  { name: 'Bitcoin',  symbol: 'BTC', color: '#F7931A', icon: '₿' },
  ethereum: { name: 'Ethereum', symbol: 'ETH', color: '#627EEA', icon: 'Ξ' },
  solana:   { name: 'Solana',   symbol: 'SOL', color: '#14F195', icon: 'S' },
};

const coinMeta = (coinId) =>
  COIN_META[coinId] ?? {
    name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
    symbol: coinId.slice(0, 4).toUpperCase(),
    color: '#888888',
    icon: coinId[0].toUpperCase(),
  };

const formatEur = (value) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value ?? 0);

const formatPct = (profit, invested) => {
  if (!invested || invested === 0) return '0.00%';
  const pct = ((profit / invested) * 100).toFixed(2);
  return (profit >= 0 ? '+' : '') + pct + '%';
};

const CIRCUMFERENCE = 2 * Math.PI * 40;

const DonutChart = ({ segments }) => {
  let offset = 0;
  return (
    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#131b2e" strokeWidth="12" />
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

const timeRanges = ['1W', '1M', '1Y', 'ALL'];

const getChartLabels = (range) => {
  const now = new Date();
  if (range === '1W') {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    });
  }
  if (range === '1M') {
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (28 - i * 7));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
  }
  if (range === '1Y') {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - (10 - i * 2));
      return d.toLocaleDateString('en-US', { month: 'short' });
    });
  }
  const year = now.getFullYear();
  return [year - 4, year - 3, year - 2, year - 1, year].map(String);
};

const computePortfolioChartPoints = (txs, allAssets, range) => {
  if (!txs.length) return [];

  const now = new Date();
  let cutoff = null;
  if (range === '1W') { cutoff = new Date(now); cutoff.setDate(now.getDate() - 7); }
  else if (range === '1M') { cutoff = new Date(now); cutoff.setMonth(now.getMonth() - 1); }
  else if (range === '1Y') { cutoff = new Date(now); cutoff.setFullYear(now.getFullYear() - 1); }

  const priceMap = {};
  const assetCoinMap = {};
  allAssets.forEach((a) => {
    priceMap[a.coinId] = a.currentPrice;
    assetCoinMap[String(a.id)] = a.coinId;
  });

  const sorted = [...txs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const firstTxDate = new Date(sorted[0].date);
  const rangeStart = cutoff && cutoff > firstTxDate ? cutoff : firstTxDate;
  const span = now - rangeStart;
  if (span <= 0) return [];

  const N = 40;
  const holdings = {};
  let cost = 0;
  let txIdx = 0;

  while (txIdx < sorted.length && new Date(sorted[txIdx].date) < rangeStart) {
    const tx = sorted[txIdx];
    holdings[tx.assetId] = (holdings[tx.assetId] || 0) + tx.amount;
    cost += tx.amount * tx.buyPrice;
    txIdx++;
  }

  const points = [];
  for (let i = 0; i <= N; i++) {
    const t = new Date(rangeStart.getTime() + (span * i) / N);
    while (txIdx < sorted.length && new Date(sorted[txIdx].date) <= t) {
      const tx = sorted[txIdx];
      holdings[tx.assetId] = (holdings[tx.assetId] || 0) + tx.amount;
      cost += tx.amount * tx.buyPrice;
      txIdx++;
    }
    let value = 0;
    Object.entries(holdings).forEach(([aid, amt]) => {
      const coinId = assetCoinMap[String(aid)];
      value += amt * (priceMap[coinId] || 0);
    });
    points.push({ t, cost, value });
  }
  return points;
};

const pointsToPath = (points, key, minV, maxV, closed = false) => {
  if (!points.length || maxV === minV) return '';
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * 100;
    const y = 95 - ((p[key] - minV) / (maxV - minV)) * 85;
    return [x, y];
  });
  const d = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
  return closed ? `${d} L100 100 L0 100 Z` : d;
};

const Analytics = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeRange, setActiveRange] = useState('1Y');

  useEffect(() => {
    axios.get('http://localhost:8080/api/wallets')
      .then((res) =>
        Promise.all(
          res.data.map((w) =>
            axios.get(`http://localhost:8080/api/wallets/${w.id}/portfolio`).then((r) => r.data)
          )
        )
      )
      .then((portfolioData) => {
        setPortfolios(portfolioData);
        const allAssets = portfolioData.flatMap((p) => p.assets ?? []);
        return Promise.all(
          allAssets.map((asset) =>
            axios.get(`http://localhost:8080/api/assets/${asset.id}/transactions`)
              .then((r) => r.data.map((tx) => ({ ...tx, assetId: asset.id, coinId: asset.coinId })))
          )
        );
      })
      .then((txArrays) => {
        setTransactions(txArrays.flat());
        setIsLoading(false);
      })
      .catch(() => {
        setError('Failed to load analytics data.');
        setIsLoading(false);
      });
  }, []);

  const chartPoints = useMemo(
    () => computePortfolioChartPoints(transactions, portfolios.flatMap((p) => p.assets ?? []), activeRange),
    [transactions, portfolios, activeRange]
  );

  if (isLoading) return <div className="p-6 text-on-surface text-center">Loading Live-Data from Backend...</div>;
  if (error) return <div className="p-6 text-error text-center">{error}</div>;

  const allAssets = portfolios.flatMap((p) => p.assets ?? []);
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

  const donutSegments = allAssets
    .filter((a) => totalCurrentValue > 0)
    .map((a) => ({
      label: coinMeta(a.coinId).name,
      pct: (a.currentValue / totalCurrentValue) * 100,
      color: coinMeta(a.coinId).color,
    }));

  const isProfit = totalProfit >= 0;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-layout-margin lg:py-10 flex flex-col gap-6 relative">
      {/* Ambient background blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary-container/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-secondary-container/5 blur-[100px] pointer-events-none"></div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10">
        <div>
          <h2 className="font-heading-lg text-heading-lg text-on-surface mb-2">Performance Intelligence</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Deep dive into your portfolio allocation and historical returns.</p>
        </div>
        {/* Quick Stats */}
        <div className="flex items-center gap-6 bg-surface-container-low border border-outline-variant/30 rounded-xl px-5 py-3">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total Portfolio Value</p>
            <p className="font-data-mono text-heading-md text-on-surface">{formatEur(totalCurrentValue)}</p>
          </div>
          <div className="h-10 w-px bg-outline-variant/30"></div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">All-Time ROI</p>
            <p className={`font-data-mono text-heading-md flex items-center gap-1 ${isProfit ? 'text-secondary' : 'text-error'}`}>
              <span className="material-symbols-outlined text-[18px]">{isProfit ? 'trending_up' : 'trending_down'}</span>
              {formatPct(totalProfit, totalInvested)}
            </p>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">

        {/* Capital Appreciation Chart — 8/12 */}
        <div className="lg:col-span-8 glass-panel rounded-xl p-lg flex flex-col relative overflow-hidden group">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-heading-md text-heading-md text-on-surface mb-1">Capital Appreciation</h3>
              <p className="text-sm text-on-surface-variant">Realized vs. Unrealized gains over time</p>
            </div>
            <div className="flex bg-surface-container border border-outline-variant/40 rounded-lg p-1">
              {timeRanges.map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveRange(r)}
                  className={`px-3 py-1 rounded text-xs transition-all ${
                    activeRange === r
                      ? 'bg-surface-variant text-on-surface shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="flex-1 w-full min-h-[280px] relative mt-auto">
            {(() => {
              if (chartPoints.length < 2) {
                return (
                  <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant font-label-sm text-label-sm">
                    No transaction data for this period.
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
                  <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-outline font-data-mono pr-4 pb-2 border-r border-outline-variant/20">
                    <span>{formatEur(maxV)}</span>
                    <span>{formatEur((maxV * 2 + minV) / 3)}</span>
                    <span>{formatEur((maxV + minV * 2) / 3)}</span>
                    <span>{formatEur(minV)}</span>
                  </div>
                  <div className="absolute left-10 right-0 top-2 bottom-8 flex flex-col justify-between pointer-events-none">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="w-full border-t border-outline-variant/10 border-dashed"></div>
                    ))}
                  </div>
                  <div className="absolute left-10 right-0 top-0 bottom-8">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#c3c0ff" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#c3c0ff" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {valueAreaPath && <path d={valueAreaPath} fill="url(#areaGradient)" />}
                      {valuePath && <path d={valuePath} fill="none" stroke="#c3c0ff" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />}
                      {costPath && <path d={costPath} fill="none" stroke="#4edea3" strokeDasharray="4 4" strokeWidth="1.5" vectorEffect="non-scaling-stroke" opacity="0.6" />}
                    </svg>
                  </div>
                  <div className="absolute bottom-0 left-10 right-0 flex justify-between text-[10px] text-outline font-data-mono pt-2">
                    {getChartLabels(activeRange).map((m) => <span key={m}>{m}</span>)}
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Asset Allocation Donut — 4/12 */}
        <div className="lg:col-span-4 glass-panel rounded-xl p-lg flex flex-col">
          <h3 className="font-heading-md text-heading-md text-on-surface mb-1">Asset Allocation</h3>
          <p className="text-sm text-on-surface-variant mb-6">Distribution by current portfolio value</p>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48">
              <DonutChart segments={donutSegments} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-on-surface-variant font-label-sm tracking-wider">TOTAL</span>
                <span className="font-data-mono text-lg text-on-surface">{allAssets.length} Asset{allAssets.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div className="w-full mt-8 space-y-3">
              {donutSegments.map((seg) => (
                <div key={seg.label} className="flex items-center justify-between text-sm group cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm group-hover:scale-110 transition-transform" style={{ backgroundColor: seg.color }}></div>
                    <span className="text-on-surface-variant group-hover:text-on-surface transition-colors">{seg.label}</span>
                  </div>
                  <span className="font-data-mono text-on-surface">{seg.pct.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers — 6/12 */}
        <div className="lg:col-span-6 glass-panel rounded-xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
              </div>
              <h3 className="font-heading-md text-[18px] text-on-surface">Top Performers</h3>
            </div>
            <span className="text-xs text-on-surface-variant">vs. Avg Entry Price</span>
          </div>
          <div className="flex-1 flex flex-col">
            {topPerformers.length === 0 && (
              <div className="p-6 text-center text-on-surface-variant font-label-sm text-label-sm">No profitable assets.</div>
            )}
            {topPerformers.map((asset, idx) => {
              const meta = coinMeta(asset.coinId);
              const avgEntry = asset.totalAmount > 0 ? asset.totalInvested / asset.totalAmount : 0;
              return (
                <div key={asset.id} className={`flex items-center justify-between p-4 hover:bg-surface-variant/30 transition-colors ${idx < topPerformers.length - 1 ? 'border-b border-outline-variant/10' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center border font-bold text-sm"
                      style={{ backgroundColor: `${meta.color}1a`, borderColor: `${meta.color}33`, color: meta.color }}
                    >
                      {meta.icon}
                    </div>
                    <div>
                      <p className="font-medium text-on-surface">{meta.name}</p>
                      <p className="text-xs text-on-surface-variant font-data-mono">{meta.symbol}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-data-mono text-on-surface">{formatEur(asset.currentPrice)}</p>
                      <p className="text-xs text-outline font-data-mono">Entry: {formatEur(avgEntry)}</p>
                    </div>
                    <div className="bg-secondary/10 border border-secondary/20 px-2.5 py-1 rounded text-secondary font-data-mono text-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                      {formatPct(asset.profit, asset.totalInvested).replace('+', '')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Underperforming — 6/12 */}
        <div className="lg:col-span-6 glass-panel rounded-xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-error-container/20 flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[18px]">trending_down</span>
              </div>
              <h3 className="font-heading-md text-[18px] text-on-surface">Underperforming</h3>
            </div>
            <span className="text-xs text-on-surface-variant">vs. Avg Entry Price</span>
          </div>
          <div className="flex-1 flex flex-col">
            {underperformers.length === 0 && (
              <div className="p-6 text-center text-on-surface-variant font-label-sm text-label-sm">No underperforming assets.</div>
            )}
            {underperformers.map((asset, idx) => {
              const meta = coinMeta(asset.coinId);
              const avgEntry = asset.totalAmount > 0 ? asset.totalInvested / asset.totalAmount : 0;
              return (
                <div key={asset.id} className={`flex items-center justify-between p-4 hover:bg-surface-variant/30 transition-colors ${idx < underperformers.length - 1 ? 'border-b border-outline-variant/10' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center border bg-surface-bright border-outline-variant/30 font-bold text-sm"
                      style={{ backgroundColor: `${meta.color}1a`, borderColor: `${meta.color}33`, color: meta.color }}
                    >
                      {meta.icon}
                    </div>
                    <div>
                      <p className="font-medium text-on-surface">{meta.name}</p>
                      <p className="text-xs text-on-surface-variant font-data-mono">{meta.symbol}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-data-mono text-on-surface">{formatEur(asset.currentPrice)}</p>
                      <p className="text-xs text-outline font-data-mono">Entry: {formatEur(avgEntry)}</p>
                    </div>
                    <div className="bg-error/10 border border-error/20 px-2.5 py-1 rounded text-error font-data-mono text-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                      {formatPct(asset.profit, asset.totalInvested).replace('-', '')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
