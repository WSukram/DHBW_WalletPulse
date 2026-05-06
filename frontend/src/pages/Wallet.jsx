import React, { useState } from 'react';

const assets = [
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: 'currency_bitcoin',
    color: '#F7931A',
    amount: '1.54200000',
    avgBuyPrice: '$32,450.00',
    currentPrice: '$64,200.00',
    profitValue: '+$48,958.50',
    profitPct: '+97.8%',
    isProfit: true,
    totalValue: '$98,996.40',
  },
  {
    name: 'Ethereum',
    symbol: 'ETH',
    icon: 'token',
    color: '#627EEA',
    amount: '8.40000000',
    avgBuyPrice: '$1,850.00',
    currentPrice: '$3,450.00',
    profitValue: '+$13,440.00',
    profitPct: '+86.4%',
    isProfit: true,
    totalValue: '$28,980.00',
  },
  {
    name: 'Solana',
    symbol: 'SOL',
    icon: 'toll',
    color: '#14F195',
    amount: '105.0000000',
    avgBuyPrice: '$185.00',
    currentPrice: '$141.65',
    profitValue: '-$4,551.75',
    profitPct: '-23.4%',
    isProfit: false,
    totalValue: '$14,873.25',
  },
];

const timeRanges = ['1W', '1M', '1Y', 'ALL'];

const Wallet = () => {
  const [activeRange, setActiveRange] = useState('1Y');

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-layout-margin space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm mb-2 uppercase tracking-widest">
            <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
            Hardware Wallet
          </div>
          <h1 className="font-display-xl text-display-xl text-on-surface">Main HODL Wallet</h1>
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
            <div className="font-display-xl text-display-xl text-on-surface mb-2 tracking-tight">$142,850.00</div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full bg-secondary-container/10 text-secondary font-label-sm text-label-sm flex items-center">
                <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span>
                +12.4% (24h)
              </span>
              <span className="text-on-surface-variant font-label-sm text-label-sm">+$15,750</span>
            </div>
          </div>

          {/* Total Cost Basis */}
          <div className="bg-surface-container rounded-xl p-lg border-t border-white/[0.08] border-x border-b border-surface-container-lowest">
            <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-4">Total Cost Basis</h2>
            <div className="font-heading-lg text-heading-lg text-on-surface mb-2">$85,400.00</div>
            <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span>All-time ROI</span>
              <span className="text-secondary font-data-mono text-data-mono">+67.27%</span>
            </div>
          </div>

          {/* Unrealized P&L */}
          <div className="bg-surface-container rounded-xl p-lg border-t border-white/[0.08] border-x border-b border-surface-container-lowest">
            <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-4">Unrealized P&amp;L</h2>
            <div className="font-heading-lg text-heading-lg text-secondary mb-2">+$57,450.00</div>
            <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-4">
              <div className="bg-secondary h-1.5 rounded-full" style={{ width: '67%' }}></div>
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
                {assets.map((asset, idx) => (
                  <tr
                    key={asset.symbol}
                    className={`hover:bg-surface-container-highest/50 transition-colors group${idx < assets.length - 1 ? ' border-b border-surface-container-highest' : ''}`}
                  >
                    <td className="py-4 px-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${asset.color}33`, color: asset.color }}
                        >
                          <span className="material-symbols-outlined text-[18px]">{asset.icon}</span>
                        </div>
                        <div>
                          <div className="font-body-md text-body-md font-medium">{asset.name}</div>
                          <div className="font-label-sm text-label-sm text-on-surface-variant">{asset.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-lg text-right">{asset.amount}</td>
                    <td className="py-4 px-lg text-right text-on-surface-variant">{asset.avgBuyPrice}</td>
                    <td className="py-4 px-lg text-right">{asset.currentPrice}</td>
                    <td className="py-4 px-lg text-right">
                      <div className={`mb-1 ${asset.isProfit ? 'text-secondary' : 'text-error'}`}>{asset.profitValue}</div>
                      <div className={`font-label-sm text-label-sm px-2 py-0.5 rounded inline-block ${asset.isProfit ? 'bg-secondary-container/10 text-secondary' : 'bg-error-container/20 text-error'}`}>
                        {asset.profitPct}
                      </div>
                    </td>
                    <td className="py-4 px-lg text-right font-medium">{asset.totalValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Wallet;
