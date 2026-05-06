import React, { useState } from 'react';

const trackedAssets = [
  {
    name: 'Bitcoin', symbol: 'BTC', color: '#F7931A', icon: '₿',
    price: '$64,230.50', change: '+2.4%', positive: true,
    marketCap: '$1.2T', volume: '$32.1B',
  },
  {
    name: 'Ethereum', symbol: 'ETH', color: '#627EEA', icon: '⟠',
    price: '$3,450.20', change: '+1.8%', positive: true,
    marketCap: '$410B', volume: '$15.4B',
  },
  {
    name: 'Solana', symbol: 'SOL', color: '#14F195', icon: 'S',
    price: '$145.80', change: '-0.5%', positive: false,
    marketCap: '$65B', volume: '$4.2B',
  },
];

const compareAssets = [
  { symbol: 'BTC', color: '#F7931A', active: true },
  { symbol: 'ETH', color: '#627EEA', active: false },
  { symbol: 'SOL', color: '#14F195', active: false },
];

const Assets = () => {
  const [activeCompare, setActiveCompare] = useState('BTC');

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-layout-margin space-y-lg">
      {/* Page Header */}
      <div>
        <h1 className="font-heading-lg text-heading-lg text-on-surface">Market Overview</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">Track and discover digital assets across global markets.</p>
      </div>

      {/* Market Stats Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div className="bg-surface-container rounded-lg p-md border border-outline-variant/30 flex flex-col justify-between h-32">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Global Market Cap</span>
          <div>
            <div className="font-heading-md text-heading-md text-on-surface">$2.45T</div>
            <div className="flex items-center gap-1 mt-1 text-secondary">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span className="font-data-mono text-label-sm">+1.24% (24h)</span>
            </div>
          </div>
        </div>
        <div className="bg-surface-container rounded-lg p-md border border-outline-variant/30 flex flex-col justify-between h-32">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">24h Volume</span>
          <div>
            <div className="font-heading-md text-heading-md text-on-surface">$84.2B</div>
            <div className="flex items-center gap-1 mt-1 text-error">
              <span className="material-symbols-outlined text-[16px]">trending_down</span>
              <span className="font-data-mono text-label-sm">-4.12% (24h)</span>
            </div>
          </div>
        </div>
        <div className="bg-surface-container rounded-lg p-md border border-outline-variant/30 flex flex-col justify-between h-32">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">BTC Dominance</span>
          <div>
            <div className="font-heading-md text-heading-md text-on-surface">52.4%</div>
            <div className="w-full bg-surface-container-highest rounded-full h-1 mt-3">
              <div className="bg-primary h-1 rounded-full" style={{ width: '52.4%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Analytics Chart */}
      <div className="bg-surface-container rounded-xl border border-outline-variant/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-high/50 flex-wrap gap-4">
          <h2 className="font-heading-md text-heading-md text-on-surface">Asset Analytics</h2>
          <div className="flex gap-2 items-center flex-wrap">
            <span className="font-label-sm text-label-sm text-on-surface-variant mr-2">Compare:</span>
            {compareAssets.map((a) => (
              <button
                key={a.symbol}
                onClick={() => setActiveCompare(a.symbol)}
                className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm flex items-center gap-1 transition-colors border ${
                  activeCompare === a.symbol
                    ? 'bg-primary/20 text-primary border-primary/30'
                    : 'bg-surface-container-highest text-on-surface border-outline-variant/30 hover:bg-surface-bright'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }}></span>
                {a.symbol}
                {activeCompare === a.symbol && (
                  <span className="material-symbols-outlined text-[14px]">close</span>
                )}
              </button>
            ))}
            <button className="px-2 py-1.5 rounded-full bg-surface-container-highest text-on-surface font-label-sm text-label-sm hover:bg-surface-bright border border-outline-variant/30 transition-colors flex items-center gap-1 ml-1">
              <span className="material-symbols-outlined text-[16px]">add</span> Add Asset
            </button>
          </div>
        </div>
        <div className="p-6 relative h-64 w-full flex items-end">
          <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="w-full border-b border-outline-variant/30 border-dashed flex-1"></div>
            <div className="w-full border-b border-outline-variant/30 border-dashed flex-1"></div>
            <div className="w-full border-b border-outline-variant/30 border-dashed flex-1"></div>
            <div className="w-full border-b border-outline-variant/30 flex-1"></div>
          </div>
          <svg className="w-full h-full overflow-visible z-10" viewBox="0 0 1000 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="btc-gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#F7931A" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#F7931A" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,150 C100,140 200,160 300,120 C400,80 500,130 600,90 C700,50 800,110 900,60 L1000,40" fill="none" stroke="#F7931A" strokeWidth="3" vectorEffect="non-scaling-stroke" />
            <path d="M0,150 C100,140 200,160 300,120 C400,80 500,130 600,90 C700,50 800,110 900,60 L1000,40 L1000,200 L0,200 Z" fill="url(#btc-gradient)" opacity="0.15" />
          </svg>
          <div className="absolute top-6 right-6 flex items-center gap-4 font-label-sm text-label-sm text-on-surface-variant">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#F7931A]"></span> Bitcoin
            </div>
          </div>
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
                <th className="py-3 px-6 text-right">24h Change</th>
                <th className="py-3 px-6 text-right">Market Cap</th>
                <th className="py-3 px-6 text-right">Volume (24h)</th>
                <th className="py-3 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 font-body-md text-body-md">
              {trackedAssets.map((asset) => (
                <tr key={asset.symbol} className="hover:bg-surface-container-highest/50 transition-colors group">
                  <td className="py-4 px-6 sticky left-0 bg-surface-container group-hover:bg-surface-container-highest/50 transition-colors z-10">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                        style={{ backgroundColor: `${asset.color}1a`, color: asset.color }}
                      >
                        {asset.icon}
                      </div>
                      <div>
                        <div className="text-on-surface">{asset.name}</div>
                        <div className="text-xs text-on-surface-variant">{asset.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right font-data-mono text-data-mono text-on-surface">{asset.price}</td>
                  <td className="py-4 px-6 text-right">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-data-mono text-[12px] border ${
                      asset.positive
                        ? 'bg-secondary-container/10 text-secondary border-secondary/20'
                        : 'bg-error-container/10 text-error border-error/20'
                    }`}>
                      <span className="material-symbols-outlined text-[14px]">{asset.positive ? 'arrow_drop_up' : 'arrow_drop_down'}</span>
                      {asset.change.replace(/[+-]/, '')}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-data-mono text-[14px] text-on-surface-variant">{asset.marketCap}</td>
                  <td className="py-4 px-6 text-right font-data-mono text-[14px] text-on-surface-variant">{asset.volume}</td>
                  <td className="py-4 px-6 text-center">
                    <button className="px-3 py-1.5 rounded bg-surface-container-highest text-primary font-label-sm text-label-sm hover:bg-surface-bright transition-colors border border-outline-variant/30 whitespace-nowrap">
                      View Analytics
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Assets;
