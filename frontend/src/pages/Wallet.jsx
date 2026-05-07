import React, { useState, useEffect } from 'react';
import axios from 'axios';

const COIN_META = {
  bitcoin:  { name: 'Bitcoin',  symbol: 'BTC', icon: 'currency_bitcoin', color: '#F7931A' },
  ethereum: { name: 'Ethereum', symbol: 'ETH', icon: 'token',            color: '#627EEA' },
  solana:   { name: 'Solana',   symbol: 'SOL', icon: 'toll',             color: '#14F195' },
};

const coinMeta = (coinId) =>
  COIN_META[coinId] ?? {
    name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
    symbol: coinId.slice(0, 4).toUpperCase(),
    icon: 'generating_tokens',
    color: '#888888',
  };

const formatEur = (value) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value ?? 0);

const formatPct = (profit, invested) => {
  if (!invested || invested === 0) return '0.00%';
  const pct = ((profit / invested) * 100).toFixed(2);
  return (profit >= 0 ? '+' : '') + pct + '%';
};

const timeRanges = ['1W', '1M', '1Y', 'ALL'];

const Wallet = () => {
  const [wallets, setWallets] = useState([]);
  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeRange, setActiveRange] = useState('1Y');
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8080/api/wallets')
      .then((res) => {
        setWallets(res.data);
        if (res.data.length > 0) setSelectedWalletId(res.data[0].id);
        else setIsLoading(false);
      })
      .catch(() => {
        setError('Failed to load wallets.');
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedWalletId == null) return;
    setIsLoading(true);
    axios.get(`http://localhost:8080/api/wallets/${selectedWalletId}/portfolio`)
      .then((res) => {
        setPortfolio(res.data);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Failed to load portfolio data.');
        setIsLoading(false);
      });
  }, [selectedWalletId]);

  if (isLoading) {
    return <div className="p-6 text-on-surface text-center">Loading Live-Data from Backend...</div>;
  }

  if (error) {
    return <div className="p-6 text-error text-center">{error}</div>;
  }

  const totalProfit = portfolio?.totalProfit ?? 0;
  const totalInvested = portfolio?.totalInvested ?? 0;
  const totalCurrentValue = portfolio?.totalCurrentValue ?? 0;
  const profitPct = formatPct(totalProfit, totalInvested);
  const isPortfolioProfit = totalProfit >= 0;

  const filteredAssets = (portfolio?.assets ?? []).filter((a) => {
    const meta = coinMeta(a.coinId);
    const q = search.toLowerCase();
    return meta.name.toLowerCase().includes(q) || meta.symbol.toLowerCase().includes(q) || a.coinId.toLowerCase().includes(q);
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-layout-margin space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm mb-2 uppercase tracking-widest">
            <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
            {wallets.length > 1 ? (
              <select
                className="bg-transparent border-none outline-none text-on-surface-variant font-label-sm text-label-sm cursor-pointer"
                value={selectedWalletId ?? ''}
                onChange={(e) => setSelectedWalletId(Number(e.target.value))}
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            ) : (
              'Wallet'
            )}
          </div>
          <h1 className="font-display-xl text-display-xl text-on-surface">{portfolio?.name}</h1>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg bg-surface-container-high border border-outline-variant text-on-surface font-label-sm text-label-sm hover:bg-surface-bright transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
          <button className="px-4 py-2 rounded-lg bg-primary-container text-on-primary-container font-label-sm text-label-sm hover:bg-inverse-primary transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Transaction
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-layout-gutter">

        {/* Summary Cards — left column */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-layout-gutter">

          {/* Current Market Value */}
          <div className="bg-surface-container rounded-xl p-lg border-t border-white/[0.08] border-x border-b border-surface-container-lowest relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-4">Current Market Value</h2>
            <div className="font-display-xl text-display-xl text-on-surface mb-2 tracking-tight">{formatEur(totalCurrentValue)}</div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full font-label-sm text-label-sm flex items-center ${isPortfolioProfit ? 'bg-secondary-container/10 text-secondary' : 'bg-error-container/20 text-error'}`}>
                <span className="material-symbols-outlined text-[14px] mr-1">{isPortfolioProfit ? 'trending_up' : 'trending_down'}</span>
                {profitPct}
              </span>
              <span className="text-on-surface-variant font-label-sm text-label-sm">{formatEur(totalProfit)}</span>
            </div>
          </div>

          {/* Total Cost Basis */}
          <div className="bg-surface-container rounded-xl p-lg border-t border-white/[0.08] border-x border-b border-surface-container-lowest">
            <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-4">Total Cost Basis</h2>
            <div className="font-heading-lg text-heading-lg text-on-surface mb-2">{formatEur(totalInvested)}</div>
            <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span>All-time ROI</span>
              <span className={`font-data-mono text-data-mono ${isPortfolioProfit ? 'text-secondary' : 'text-error'}`}>{profitPct}</span>
            </div>
          </div>

          {/* Unrealized P&L */}
          <div className="bg-surface-container rounded-xl p-lg border-t border-white/[0.08] border-x border-b border-surface-container-lowest">
            <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-4">Unrealized P&amp;L</h2>
            <div className={`font-heading-lg text-heading-lg mb-2 ${isPortfolioProfit ? 'text-secondary' : 'text-error'}`}>{formatEur(totalProfit)}</div>
            <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-4">
              <div
                className={`h-1.5 rounded-full ${isPortfolioProfit ? 'bg-secondary' : 'bg-error'}`}
                style={{ width: `${Math.min(Math.abs((totalProfit / (totalInvested || 1)) * 100), 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Chart Area — right column */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container rounded-xl p-lg border-t border-white/[0.08] border-x border-b border-surface-container-lowest flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-heading-md text-heading-md text-on-surface">Cost vs Market Value</h2>
            <div className="flex bg-surface-container-highest rounded-lg p-1">
              {timeRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => setActiveRange(range)}
                  className={`px-3 py-1 rounded font-label-sm text-label-sm transition-colors ${
                    activeRange === range
                      ? 'bg-surface-bright text-on-surface shadow-sm border border-outline-variant/30'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* SVG chart placeholder */}
          <div className="flex-1 relative min-h-[300px] w-full border-b border-outline-variant/20 mb-8 flex items-end">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-t border-outline-variant w-full"></div>
              <div className="border-t border-outline-variant w-full"></div>
              <div className="border-t border-outline-variant w-full"></div>
              <div className="border-t border-outline-variant w-full"></div>
            </div>
            <div className="absolute bottom-[20%] left-0 w-full border-t-2 border-dashed border-outline-variant/50 pointer-events-none"></div>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,80 Q10,75 20,60 T40,50 T60,40 T80,20 T100,10 L100,100 L0,100 Z" fill="url(#chartGrad)" />
              <path
                d="M0,80 Q10,75 20,60 T40,50 T60,40 T80,20 T100,10"
                fill="none"
                stroke="#c3c0ff"
                strokeWidth="2"
              />
            </svg>
            <div className="absolute bottom-[-28px] left-0 w-full flex justify-between text-on-surface-variant font-label-sm text-label-sm px-1">
              <span>Jan</span>
              <span>Apr</span>
              <span>Jul</span>
              <span>Oct</span>
              <span>Dec</span>
            </div>
          </div>
        </div>

        {/* Holdings Table — full width */}
        <div className="col-span-12 bg-surface-container rounded-xl border-t border-white/[0.08] border-x border-b border-surface-container-lowest overflow-hidden">
          <div className="p-lg border-b border-surface-container-highest flex justify-between items-center">
            <h2 className="font-heading-md text-heading-md text-on-surface">Holdings</h2>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg pl-10 pr-4 py-2 text-on-surface font-label-sm text-label-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-64 placeholder:text-on-surface-variant/50"
                placeholder="Search assets..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-container-highest bg-surface-container-low/50">
                  {['Asset', 'Amount', 'Avg. Buy Price', 'Current Price', 'Profit / Loss', 'Total Value'].map((col, i) => (
                    <th
                      key={col}
                      className={`py-4 px-lg font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest${i > 0 ? ' text-right' : ''}`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-data-mono text-data-mono text-on-surface">
                {filteredAssets.map((asset, idx) => {
                  const meta = coinMeta(asset.coinId);
                  const avgBuyPrice = asset.totalAmount > 0 ? asset.totalInvested / asset.totalAmount : 0;
                  const isProfit = asset.profit >= 0;
                  const profitPctAsset = formatPct(asset.profit, asset.totalInvested);

                  return (
                    <tr
                      key={asset.id}
                      className={`hover:bg-surface-container-highest/50 transition-colors group${idx < filteredAssets.length - 1 ? ' border-b border-surface-container-highest' : ''}`}
                    >
                      <td className="py-4 px-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${meta.color}33`, color: meta.color }}
                          >
                            <span className="material-symbols-outlined text-[18px]">{meta.icon}</span>
                          </div>
                          <div>
                            <div className="font-body-md text-body-md font-medium">{meta.name}</div>
                            <div className="font-label-sm text-label-sm text-on-surface-variant">{meta.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-lg text-right">{asset.totalAmount?.toFixed(8)}</td>
                      <td className="py-4 px-lg text-right text-on-surface-variant">{formatEur(avgBuyPrice)}</td>
                      <td className="py-4 px-lg text-right">{formatEur(asset.currentPrice)}</td>
                      <td className="py-4 px-lg text-right">
                        <div className={`mb-1 ${isProfit ? 'text-secondary' : 'text-error'}`}>
                          {(isProfit ? '+' : '') + formatEur(asset.profit)}
                        </div>
                        <div className={`font-label-sm text-label-sm px-2 py-0.5 rounded inline-block ${isProfit ? 'bg-secondary-container/10 text-secondary' : 'bg-error-container/20 text-error'}`}>
                          {profitPctAsset}
                        </div>
                      </td>
                      <td className="py-4 px-lg text-right font-medium">{formatEur(asset.currentValue)}</td>
                    </tr>
                  );
                })}
                {filteredAssets.length === 0 && (
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
    </div>
  );
};

export default Wallet;
