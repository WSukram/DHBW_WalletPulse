import React, { useState } from 'react';

const topPerformers = [
  { name: 'Bitcoin', symbol: 'BTC', color: '#F7931A', icon: '₿', price: '$64,230.00', entry: '$32k', gain: '+100.7%' },
  { name: 'Ethereum', symbol: 'ETH', color: '#627EEA', icon: 'Ξ', price: '$3,450.20', entry: '$2.1k', gain: '+64.2%' },
  { name: 'Real Estate Trust', symbol: 'REIT', color: '#00A699', icon: null, materialIcon: 'apartment', price: '$145.80', entry: '$110', gain: '+32.5%' },
];

const underperformers = [
  { name: 'Tech ETF Growth', symbol: 'ARKK', icon: null, materialIcon: 'precision_manufacturing', price: '$48.30', entry: '$62.5', loss: '-22.7%' },
  { name: 'Global Corp Bond', symbol: 'BOND', icon: 'C', price: '$92.15', entry: '$105', loss: '-12.2%' },
  { name: 'Altcoin Index', symbol: 'ALT20', color: '#2A5ADA', icon: 'A', price: '$12.40', entry: '$13.5', loss: '-8.1%' },
];

const timeRanges = ['1W', '1M', '1Y', 'ALL'];

const Analytics = () => {
  const [activeRange, setActiveRange] = useState('1Y');

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
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total Net Worth</p>
            <p className="font-data-mono text-heading-md text-on-surface">$1,248,590.45</p>
          </div>
          <div className="h-10 w-px bg-outline-variant/30"></div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">30D Yield</p>
            <p className="font-data-mono text-heading-md text-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
              +12.4%
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
              <p className="text-sm text-on-surface-variant">Realized vs. Unrealized gains over 12 months</p>
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
          <div className="flex-1 w-full min-h-[280px] relative mt-auto flex items-end">
            {/* Y-Axis */}
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-outline font-data-mono pr-4 pb-2 border-r border-outline-variant/20">
              <span>$1.5M</span>
              <span>$1.2M</span>
              <span>$900k</span>
              <span>$600k</span>
            </div>
            {/* Grid lines */}
            <div className="absolute left-10 right-0 top-2 bottom-8 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-full border-t border-outline-variant/10 border-dashed"></div>
              ))}
            </div>
            {/* SVG chart */}
            <div className="ml-10 w-full h-[calc(100%-32px)] relative">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#c3c0ff" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#c3c0ff" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="baselineGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4edea3" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#4edea3" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Baseline investment */}
                <path d="M0,80 Q20,78 40,75 T80,70 T100,68 L100,100 L0,100 Z" fill="url(#baselineGradient)" />
                <path d="M0,80 Q20,78 40,75 T80,70 T100,68" fill="none" stroke="#4edea3" strokeDasharray="4 4" strokeWidth="1.5" opacity="0.6" />
                {/* Portfolio value */}
                <path d="M0,70 Q15,65 25,50 T45,45 T60,20 T80,30 T100,10 L100,100 L0,100 Z" fill="url(#areaGradient)" />
                <path d="M0,70 Q15,65 25,50 T45,45 T60,20 T80,30 T100,10" fill="none" stroke="#c3c0ff" strokeWidth="2.5" />
                {/* Hover point */}
                <circle cx="60" cy="20" r="4" fill="#0b1326" stroke="#c3c0ff" strokeWidth="2" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <line x1="60" x2="60" y1="20" y2="100" stroke="#c3c0ff" strokeDasharray="2 2" strokeWidth="1" className="opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              </svg>
            </div>
            {/* X-Axis */}
            <div className="absolute bottom-0 left-10 right-0 flex justify-between text-[10px] text-outline font-data-mono pt-2">
              {['Jan', 'Mar', 'Jun', 'Sep', 'Dec'].map((m) => <span key={m}>{m}</span>)}
            </div>
          </div>
        </div>

        {/* Asset Allocation Donut — 4/12 */}
        <div className="lg:col-span-4 glass-panel rounded-xl p-lg flex flex-col">
          <h3 className="font-heading-md text-heading-md text-on-surface mb-1">Asset Allocation</h3>
          <p className="text-sm text-on-surface-variant mb-6">Distribution by asset class</p>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#131b2e" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#c3c0ff" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="138.16" className="transition-all duration-1000 ease-out hover:stroke-[14px] cursor-pointer" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#4edea3" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="175.84" transform="rotate(162 50 50)" className="transition-all duration-1000 ease-out hover:stroke-[14px] cursor-pointer" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ffb2b7" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="188.4" transform="rotate(270 50 50)" className="transition-all duration-1000 ease-out hover:stroke-[14px] cursor-pointer" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-on-surface-variant font-label-sm tracking-wider">TOTAL</span>
                <span className="font-data-mono text-lg text-on-surface">12 Assets</span>
              </div>
            </div>
            <div className="w-full mt-8 space-y-3">
              {[
                { label: 'Digital Assets', pct: '45.0%', color: 'bg-primary' },
                { label: 'Equities', pct: '30.0%', color: 'bg-secondary' },
                { label: 'Cash / Stables', pct: '25.0%', color: 'bg-tertiary' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm group cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm ${item.color} group-hover:scale-110 transition-transform`}></div>
                    <span className="text-on-surface-variant group-hover:text-on-surface transition-colors">{item.label}</span>
                  </div>
                  <span className="font-data-mono text-on-surface">{item.pct}</span>
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
            {topPerformers.map((asset, idx) => (
              <div key={asset.symbol} className={`flex items-center justify-between p-4 hover:bg-surface-variant/30 transition-colors ${idx < topPerformers.length - 1 ? 'border-b border-outline-variant/10' : ''}`}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center border"
                    style={asset.color ? { backgroundColor: `${asset.color}1a`, borderColor: `${asset.color}33`, color: asset.color } : {}}
                  >
                    {asset.materialIcon
                      ? <span className="material-symbols-outlined text-[20px] text-on-surface-variant">{asset.materialIcon}</span>
                      : <span className="font-bold text-sm">{asset.icon}</span>
                    }
                  </div>
                  <div>
                    <p className="font-medium text-on-surface">{asset.name}</p>
                    <p className="text-xs text-on-surface-variant font-data-mono">{asset.symbol}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-data-mono text-on-surface">{asset.price}</p>
                    <p className="text-xs text-outline font-data-mono">Entry: {asset.entry}</p>
                  </div>
                  <div className="bg-secondary/10 border border-secondary/20 px-2.5 py-1 rounded text-secondary font-data-mono text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                    {asset.gain.replace('+', '')}
                  </div>
                </div>
              </div>
            ))}
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
            {underperformers.map((asset, idx) => (
              <div key={asset.symbol} className={`flex items-center justify-between p-4 hover:bg-surface-variant/30 transition-colors ${idx < underperformers.length - 1 ? 'border-b border-outline-variant/10' : ''}`}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center border bg-surface-bright border-outline-variant/30"
                    style={asset.color ? { backgroundColor: `${asset.color}1a`, borderColor: `${asset.color}33`, color: asset.color } : {}}
                  >
                    {asset.materialIcon
                      ? <span className="material-symbols-outlined text-[20px] text-on-surface-variant">{asset.materialIcon}</span>
                      : <span className="font-bold text-sm text-on-surface-variant">{asset.icon}</span>
                    }
                  </div>
                  <div>
                    <p className="font-medium text-on-surface">{asset.name}</p>
                    <p className="text-xs text-on-surface-variant font-data-mono">{asset.symbol}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-data-mono text-on-surface">{asset.price}</p>
                    <p className="text-xs text-outline font-data-mono">Entry: {asset.entry}</p>
                  </div>
                  <div className="bg-error/10 border border-error/20 px-2.5 py-1 rounded text-error font-data-mono text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                    {asset.loss.replace('-', '')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
