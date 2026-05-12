import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { isTokenExpired } from '../context/AppContext';

const TICKER_COINS = [
  { id: 'bitcoin',  symbol: 'BTC', name: 'Bitcoin',  color: '#F7931A' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', color: '#627EEA' },
  { id: 'solana',   symbol: 'SOL', name: 'Solana',   color: '#14F195' },
];

const useLivePrices = () => {
  const [prices, setPrices] = useState({});

  useEffect(() => {
    const ids = TICKER_COINS.map((c) => c.id).join(',');
    axios
      .get(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=eur&include_24hr_change=true`)
      .then((res) => setPrices(res.data))
      .catch(() => {});
  }, []);

  return prices;
};

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
  const navigate = useNavigate();
  const prices = useLivePrices();

  const handleEnter = () => {
    const token = localStorage.getItem('wp_token');
    navigate(token && !isTokenExpired(token) ? '/dashboard' : '/login');
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col font-sans">
      {/* Top Nav */}
      <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <div className="flex justify-between items-center w-full px-6 h-16 max-w-[1440px] mx-auto">
          <div className="text-xl font-bold tracking-tighter text-slate-50">WalletPulse</div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors px-4 py-2">
              Log in
            </Link>
            <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              Get Started
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
            <button
              onClick={handleEnter}
              className="bg-primary text-on-primary font-label-sm text-label-sm px-8 py-4 rounded-full shadow-[0_0_25px_rgba(195,192,255,0.25)] hover:shadow-[0_0_40px_rgba(195,192,255,0.4)] transition-all transform hover:-translate-y-0.5"
            >
              START ANALYZING
            </button>
            <Link to="/register" className="border border-outline-variant text-on-surface font-label-sm text-label-sm px-8 py-4 rounded-full hover:bg-surface-container transition-colors">
              CREATE ACCOUNT
            </Link>
          </div>
        </section>

        {/* Live Market Ticker */}
        <section className="max-w-[1440px] mx-auto px-6 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TICKER_COINS.map((coin) => {
              const data = prices[coin.id];
              const price = data?.eur;
              const change = data?.eur_24h_change;
              const positive = change >= 0;
              return (
                <div key={coin.id} className="bg-surface-container border border-outline-variant/30 rounded-xl px-6 py-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${coin.color}20` }}>
                      <span className="font-bold text-sm" style={{ color: coin.color }}>{coin.symbol[0]}</span>
                    </div>
                    <div>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">{coin.symbol}</p>
                      <p className="font-heading-sm text-heading-sm text-inverse-surface">{coin.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-data-mono text-data-mono text-inverse-surface">
                      {price != null ? `€${price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                    </p>
                    {change != null && (
                      <p className={`font-data-mono text-xs mt-0.5 ${positive ? 'text-secondary' : 'text-error'}`}>
                        {positive ? '+' : ''}{change.toFixed(2)}%
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Stats Bar */}
        <section className="max-w-[1440px] mx-auto px-6 mb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-outline-variant/20 rounded-2xl overflow-hidden border border-outline-variant/20">
            {[
              { value: '3', label: 'Supported Blockchains', icon: 'hub' },
              { value: 'Live', label: 'CoinGecko Price Feed', icon: 'sensors' },
              { value: 'ETH · BTC · SOL', label: 'On-Chain Import', icon: 'download' },
              { value: 'Free', label: 'No subscription needed', icon: 'verified' },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface-container px-8 py-8 flex flex-col items-center text-center gap-2">
                <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                <p className="font-heading-md text-heading-md text-inverse-surface">{stat.value}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{stat.label}</p>
              </div>
            ))}
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

        {/* How it works */}
        <section className="max-w-[1440px] mx-auto px-6 mb-24">
          <div className="text-center mb-12">
            <h2 className="font-heading-lg text-heading-lg text-inverse-surface mb-3">How it works</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">Get your full crypto portfolio under control in three steps.</p>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20" />
            {[
              { step: '01', icon: 'person_add', title: 'Create your account', desc: 'Register for free in seconds. No credit card, no subscription required.' },
              { step: '02', icon: 'account_balance_wallet', title: 'Add your wallets', desc: 'Connect ETH, BTC or SOL wallets by address, or add transactions manually.' },
              { step: '03', icon: 'insights', title: 'Track your portfolio', desc: 'See live valuations, P&L, and historical performance across all your assets.' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center relative">
                <div className="w-20 h-20 rounded-2xl bg-surface-container border border-outline-variant/30 flex items-center justify-center mb-6 relative z-10">
                  <span className="material-symbols-outlined text-primary text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                </div>
                <span className="font-data-mono text-data-mono text-primary/50 text-xs mb-2 tracking-widest">{s.step}</span>
                <h3 className="font-heading-md text-heading-md text-inverse-surface mb-2">{s.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={handleEnter}
              className="bg-primary text-on-primary font-label-sm text-label-sm px-8 py-4 rounded-full shadow-[0_0_25px_rgba(195,192,255,0.2)] hover:shadow-[0_0_40px_rgba(195,192,255,0.35)] transition-all transform hover:-translate-y-0.5"
            >
              GET STARTED FOR FREE
            </button>
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
