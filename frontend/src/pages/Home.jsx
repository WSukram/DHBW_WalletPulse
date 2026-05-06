import React from 'react';
import { Link } from 'react-router-dom';

const portfolioRows = [
  {
    name: 'Bitcoin', icon: 'currency_bitcoin', iconColor: 'text-orange-400', iconBg: 'bg-orange-500/20',
    balance: '1.2450', cost: '$45,000.00', value: '$79,966.35', returnPct: '+77.70%', positive: true,
  },
  {
    name: 'Ethereum', icon: 'data_usage', iconColor: 'text-blue-400', iconBg: 'bg-blue-500/20',
    balance: '14.500', cost: '$35,000.00', value: '$50,027.90', returnPct: '+42.93%', positive: true,
  },
  {
    name: 'Tether', icon: 'toll', iconColor: 'text-green-400', iconBg: 'bg-green-500/20',
    balance: '5,430.00', cost: '$5,430.00', value: '$5,430.00', returnPct: '0.00%', positive: null,
  },
];

const features = [
  {
    icon: 'sensors',
    iconColor: 'text-primary',
    title: 'Live CoinGecko Integration',
    desc: 'Real-time price feeds and market metrics powered by industry-leading data, ensuring your portfolio valuation is always up to the second.',
  },
  {
    icon: 'timeline',
    iconColor: 'text-secondary',
    title: 'Historical Cost Analysis',
    desc: 'Track your true performance. We automatically calculate cost basis, realized gains, and impermanent loss across all supported chains.',
  },
  {
    icon: 'hub',
    iconColor: 'text-tertiary',
    title: 'Multi-Wallet Management',
    desc: 'Consolidate your view. Connect hardware wallets, exchange API keys, and Web3 extensions into a single, unified command center.',
  },
];

const Home = () => {
  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col font-sans">
      {/* Top Nav */}
      <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <div className="flex justify-between items-center w-full px-6 h-16 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-8">
            <div className="text-xl font-bold tracking-tighter text-slate-50">WalletPulse</div>
            <nav className="hidden md:flex items-center gap-6">
              {['Markets', 'Portfolio', 'Insights', 'Research'].map((item) => (
                <a key={item} href="#" className="text-sm font-medium tracking-tight text-slate-400 hover:text-slate-100 transition-colors">
                  {item}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative group">
              <span className="material-symbols-outlined text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">search</span>
              <input
                type="text"
                placeholder="Search..."
                className="bg-surface-container border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-sm text-slate-50 focus:outline-none focus:border-indigo-500 transition-colors w-48 bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:bg-white/5 transition-all rounded-full">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
              </button>
              <button className="p-2 text-slate-400 hover:bg-white/5 transition-all rounded-full">
                <span className="material-symbols-outlined text-[20px]">settings</span>
              </button>
            </div>
            <Link
              to="/login"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium tracking-tight px-4 py-2 rounded-md transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)]"
            >
              Connect Wallet
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-32 pb-24">
        {/* Hero */}
        <section className="max-w-[1440px] mx-auto px-6 mb-24 text-center">
          <h1 className="font-display-xl text-display-xl text-inverse-surface mb-6 max-w-4xl mx-auto leading-tight">
            Master Your <span className="text-primary">Crypto Portfolio</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
            High-fidelity analytics, historical cost tracking, and real-time insights for professional traders. Take control of your digital assets with unparalleled precision.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/login"
              className="bg-primary text-on-primary font-label-sm text-label-sm px-8 py-4 rounded-full shadow-[0_0_25px_rgba(195,192,255,0.25)] hover:shadow-[0_0_40px_rgba(195,192,255,0.4)] transition-all transform hover:-translate-y-0.5"
            >
              START ANALYZING
            </Link>
            <button className="border border-outline-variant text-on-surface font-label-sm text-label-sm px-8 py-4 rounded-full hover:bg-surface-container transition-colors">
              VIEW DEMO
            </button>
          </div>
        </section>

        {/* Quick Portfolio Check Widget */}
        <section className="max-w-5xl mx-auto px-6 mb-32 relative z-10">
          <div className="bg-surface-container rounded-xl border border-outline-variant/30 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] p-lg overflow-hidden relative">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
            <h2 className="font-heading-md text-heading-md text-inverse-surface mb-2">Quick Portfolio Check</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">Enter an EVM compatible address to preview current holdings instantly.</p>
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-grow">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">account_balance_wallet</span>
                <input
                  type="text"
                  defaultValue="0x71C...976F"
                  className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary rounded-lg pl-12 pr-4 py-3 font-data-mono text-data-mono text-on-surface focus:outline-none transition-colors"
                />
              </div>
              <button className="bg-surface-bright text-inverse-surface font-label-sm text-label-sm px-6 py-3 rounded-lg border border-outline-variant/50 hover:bg-surface-variant transition-colors whitespace-nowrap">
                Preview Holdings
              </button>
            </div>
            {/* Demo table */}
            <div className="border border-outline-variant/30 rounded-lg overflow-hidden bg-surface-container-lowest/50">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-outline font-label-sm text-label-sm">
                    {['Asset', 'Balance', 'Initial Cost', 'Current Value', 'Return'].map((col, i) => (
                      <th key={col} className={`py-3 px-4 uppercase tracking-wider${i > 0 ? ' text-right' : ''}`}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-data-mono text-data-mono text-on-surface">
                  {portfolioRows.map((row, idx) => (
                    <tr key={row.name} className={`hover:bg-white/[0.02] transition-colors${idx < portfolioRows.length - 1 ? ' border-b border-outline-variant/10' : ''}`}>
                      <td className="py-4 px-4 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${row.iconBg}`}>
                          <span className={`material-symbols-outlined text-[16px] ${row.iconColor}`}>{row.icon}</span>
                        </div>
                        <span className="font-medium text-inverse-surface">{row.name}</span>
                      </td>
                      <td className="py-4 px-4 text-right">{row.balance}</td>
                      <td className="py-4 px-4 text-right text-on-surface-variant">{row.cost}</td>
                      <td className="py-4 px-4 text-right font-medium text-inverse-surface">{row.value}</td>
                      <td className={`py-4 px-4 text-right font-medium ${row.positive === true ? 'text-secondary' : 'text-on-surface-variant'}`}>
                        {row.returnPct}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-[1440px] mx-auto px-6 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {features.map((f) => (
              <div key={f.title} className="bg-surface-container rounded-xl border border-outline-variant/30 p-lg hover:border-primary/50 transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <span className={`material-symbols-outlined text-[24px] ${f.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {f.icon}
                  </span>
                </div>
                <h3 className="font-heading-md text-heading-md text-inverse-surface mb-3">{f.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-slate-950">
        <div className="w-full py-8 px-6 flex flex-col md:flex-row justify-between items-center max-w-[1440px] mx-auto gap-4">
          <div className="text-sm font-bold text-slate-300">WalletPulse</div>
          <div className="text-xs text-slate-500 font-light">© 2026 WalletPulse. High-fidelity crypto analytics.</div>
          <div className="flex gap-6">
            {['Terms of Service', 'Privacy Policy', 'API Documentation', 'Status'].map((link) => (
              <a key={link} href="#" className="text-xs text-slate-500 font-light hover:text-slate-300 transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
