import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';

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

const formatPct = (profit, invested) => {
  if (!invested || invested === 0) return '0.00%';
  const pct = ((profit / invested) * 100).toFixed(2);
  return (profit >= 0 ? '+' : '') + pct + '%';
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

const computeAssetChartPoints = (txs, asset, range) => {
  if (!txs.length || !asset) return [];
  const assetTxs = txs.filter((tx) => tx.coinId === asset.coinId);
  if (!assetTxs.length) return [];

  const now = new Date();
  let cutoff = null;
  if (range === '1W') { cutoff = new Date(now); cutoff.setDate(now.getDate() - 7); }
  else if (range === '1M') { cutoff = new Date(now); cutoff.setMonth(now.getMonth() - 1); }
  else if (range === '1Y') { cutoff = new Date(now); cutoff.setFullYear(now.getFullYear() - 1); }

  const sorted = [...assetTxs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const firstTxDate = new Date(sorted[0].date);
  const rangeStart = cutoff && cutoff > firstTxDate ? cutoff : firstTxDate;
  const span = now - rangeStart;
  if (span <= 0) return [];

  const N = 40;
  let holdings = 0;
  let cost = 0;
  let txIdx = 0;

  while (txIdx < sorted.length && new Date(sorted[txIdx].date) < rangeStart) {
    holdings += sorted[txIdx].amount;
    cost += sorted[txIdx].amount * sorted[txIdx].buyPrice;
    txIdx++;
  }

  const points = [];
  for (let i = 0; i <= N; i++) {
    const t = new Date(rangeStart.getTime() + (span * i) / N);
    while (txIdx < sorted.length && new Date(sorted[txIdx].date) <= t) {
      holdings += sorted[txIdx].amount;
      cost += sorted[txIdx].amount * sorted[txIdx].buyPrice;
      txIdx++;
    }
    points.push({ t, cost, value: holdings * (asset.currentPrice || 0) });
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

const Assets = () => {
  const { formatCurrency: formatEur } = useApp();
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeCompare, setActiveCompare] = useState(null);
  const [activeRange, setActiveRange] = useState('1Y');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8080/api/wallets')
      .then((res) => {
        if (res.data.length === 0) return null;
        return axios.get(`http://localhost:8080/api/wallets/${res.data[0].id}/portfolio`).then((r) => r.data);
      })
      .then((portfolioData) => {
        if (!portfolioData) { setIsLoading(false); return null; }
        setPortfolio(portfolioData);
        if (portfolioData.assets?.length > 0) setActiveCompare(portfolioData.assets[0].coinId);
        return Promise.all(
          (portfolioData.assets ?? []).map((asset) =>
            axios.get(`http://localhost:8080/api/assets/${asset.id}/transactions`)
              .then((r) => r.data.map((tx) => ({ ...tx, assetId: asset.id, coinId: asset.coinId })))
          )
        );
      })
      .then((txArrays) => {
        if (txArrays) setTransactions(txArrays.flat());
        setIsLoading(false);
      })
      .catch(() => {
        setError('Failed to load asset data.');
        setIsLoading(false);
      });
  }, []);

  const activeAsset = (portfolio?.assets ?? []).find((a) => a.coinId === activeCompare) ?? null;

  const chartPoints = useMemo(
    () => computeAssetChartPoints(transactions, activeAsset, activeRange),
    [transactions, activeAsset, activeRange]
  );

  if (isLoading) return <div className="p-6 text-on-surface text-center">Loading Live-Data from Backend...</div>;
  if (error) return <div className="p-6 text-error text-center">{error}</div>;

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

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-layout-margin space-y-lg">
      {/* Page Header */}
      <div>
        <h1 className="font-heading-lg text-heading-lg text-on-surface">Market Overview</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">Track and discover digital assets across global markets.</p>
      </div>

      {/* Portfolio Stats Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div className="bg-surface-container rounded-lg p-md border border-outline-variant/30 flex flex-col justify-between h-32">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total Portfolio Value</span>
          <div>
            <div className="font-heading-md text-heading-md text-on-surface">{formatEur(totalCurrentValue)}</div>
            <div className={`flex items-center gap-1 mt-1 ${isProfit ? 'text-secondary' : 'text-error'}`}>
              <span className="material-symbols-outlined text-[16px]">{isProfit ? 'trending_up' : 'trending_down'}</span>
              <span className="font-data-mono text-label-sm">{formatPct(totalProfit, totalInvested)} all-time</span>
            </div>
          </div>
        </div>
        <div className="bg-surface-container rounded-lg p-md border border-outline-variant/30 flex flex-col justify-between h-32">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total Invested</span>
          <div>
            <div className="font-heading-md text-heading-md text-on-surface">{formatEur(totalInvested)}</div>
            <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-label-sm text-label-sm">
              Cost basis across all assets
            </div>
          </div>
        </div>
        <div className="bg-surface-container rounded-lg p-md border border-outline-variant/30 flex flex-col justify-between h-32">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Unrealized P&amp;L</span>
          <div>
            <div className={`font-heading-md text-heading-md ${isProfit ? 'text-secondary' : 'text-error'}`}>
              {(isProfit ? '+' : '')}{formatEur(totalProfit)}
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-1 mt-3">
              <div className={`h-1 rounded-full ${isProfit ? 'bg-secondary' : 'bg-error'}`} style={{ width: `${Math.min(Math.abs((totalProfit / (totalInvested || 1)) * 100), 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Analytics Chart */}
      <div className="bg-surface-container rounded-xl border border-outline-variant/30 overflow-hidden">
        {/* Chart header: asset selector + range buttons */}
        <div className="px-6 py-4 border-b border-outline-variant/30 bg-surface-container-high/50 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 items-center flex-wrap">
            <span className="font-label-sm text-label-sm text-on-surface-variant mr-1">Asset:</span>
            {assets.map((a) => {
              const m = coinMeta(a.coinId);
              return (
                <button
                  key={a.coinId}
                  onClick={() => setActiveCompare(a.coinId)}
                  className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm flex items-center gap-1 transition-colors border ${
                    activeCompare === a.coinId
                      ? 'bg-primary/20 text-primary border-primary/30'
                      : 'bg-surface-container-highest text-on-surface border-outline-variant/30 hover:bg-surface-bright'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }}></span>
                  {m.symbol}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            {/* Legend */}
            {meta && (
              <div className="flex items-center gap-3 font-label-sm text-label-sm text-on-surface-variant">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 inline-block rounded" style={{ backgroundColor: meta.color }}></span>
                  Market Value
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 border-t-2 border-dashed inline-block opacity-60" style={{ borderColor: meta.color }}></span>
                  Cost Basis
                </div>
              </div>
            )}
            {/* Range buttons */}
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
        </div>

        {/* Chart body */}
        <div className="p-6 relative h-64 w-full">
          {chartPoints.length < 2 ? (
            <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant font-label-sm text-label-sm">
              No transaction data for this period.
            </div>
          ) : (
            <>
              {/* Y-axis labels */}
              <div className="absolute left-6 top-6 bottom-8 w-16 flex flex-col justify-between text-[10px] text-outline font-data-mono pointer-events-none">
                <span>{formatEur(maxV)}</span>
                <span>{formatEur((maxV + minV) / 2)}</span>
                <span>{formatEur(minV)}</span>
              </div>
              {/* Grid lines */}
              <div className="absolute left-22 right-6 top-6 bottom-8 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-full border-t border-outline-variant/15 border-dashed"></div>
                ))}
              </div>
              {/* SVG chart */}
              <svg
                className="absolute left-22 right-6 top-6 bottom-8 w-[calc(100%-104px)] h-[calc(100%-56px)]"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="asset-area-grad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={meta?.color ?? '#888'} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={meta?.color ?? '#888'} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {valueAreaPath && <path d={valueAreaPath} fill="url(#asset-area-grad)" />}
                {valuePath && (
                  <path d={valuePath} fill="none" stroke={meta?.color ?? '#888'} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                )}
                {costPath && (
                  <path d={costPath} fill="none" stroke={meta?.color ?? '#888'} strokeWidth="1.5" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" opacity="0.5" />
                )}
              </svg>
              {/* X-axis labels */}
              <div className="absolute bottom-0 left-22 right-6 flex justify-between text-[10px] text-outline font-data-mono" style={{ left: '88px' }}>
                {getChartLabels(activeRange).map((l) => <span key={l}>{l}</span>)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tracked Assets Table */}
      <div className="bg-surface-container rounded-xl border border-outline-variant/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-high/50">
          <h2 className="font-heading-md text-heading-md text-on-surface">Tracked Assets</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded bg-surface-container-highest text-on-surface font-label-sm text-label-sm hover:bg-surface-bright transition-colors">All Categories</button>
            <button className="px-3 py-1.5 rounded bg-surface-container-highest text-on-surface font-label-sm text-label-sm hover:bg-surface-bright transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">filter_list</span> Filter
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant">
                <th className="py-3 px-6">Asset</th>
                <th className="py-3 px-6 text-right">Price</th>
                <th className="py-3 px-6 text-right">P&amp;L</th>
                <th className="py-3 px-6 text-right">Amount Held</th>
                <th className="py-3 px-6 text-right">Current Value</th>
                <th className="py-3 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 font-body-md text-body-md">
              {assets.map((asset) => {
                const m = coinMeta(asset.coinId);
                const assetIsProfit = asset.profit >= 0;
                const pct = formatPct(asset.profit, asset.totalInvested);
                return (
                  <tr
                    key={asset.id}
                    onClick={() => setActiveCompare(asset.coinId)}
                    className="hover:bg-surface-container-highest/50 transition-colors group cursor-pointer"
                  >
                    <td className="py-4 px-6 sticky left-0 bg-surface-container group-hover:bg-surface-container-highest/50 transition-colors z-10">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                          style={{ backgroundColor: `${m.color}1a`, color: m.color }}
                        >
                          {m.icon}
                        </div>
                        <div>
                          <div className="text-on-surface">{m.name}</div>
                          <div className="text-xs text-on-surface-variant">{m.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-data-mono text-data-mono text-on-surface">{formatEur(asset.currentPrice)}</td>
                    <td className="py-4 px-6 text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-data-mono text-[12px] border ${
                        assetIsProfit
                          ? 'bg-secondary-container/10 text-secondary border-secondary/20'
                          : 'bg-error-container/10 text-error border-error/20'
                      }`}>
                        <span className="material-symbols-outlined text-[14px]">{assetIsProfit ? 'arrow_drop_up' : 'arrow_drop_down'}</span>
                        {pct.replace(/[+-]/, '')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-data-mono text-[14px] text-on-surface-variant">{asset.totalAmount?.toFixed(8)}</td>
                    <td className="py-4 px-6 text-right font-data-mono text-[14px] text-on-surface-variant">{formatEur(asset.currentValue)}</td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveCompare(asset.coinId); }}
                        className="px-3 py-1.5 rounded bg-surface-container-highest text-primary font-label-sm text-label-sm hover:bg-surface-bright transition-colors border border-outline-variant/30 whitespace-nowrap"
                      >
                        View Analytics
                      </button>
                    </td>
                  </tr>
                );
              })}
              {assets.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant font-label-sm text-label-sm">
                    No assets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Assets;
