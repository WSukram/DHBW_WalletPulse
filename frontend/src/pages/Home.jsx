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
    axios
      .get('http://localhost:8080/api/market/prices')
      .then((res) => setPrices(res.data))
      .catch(() => {});
  }, []);

  return prices;
};

const features = [
  {
    icon: 'sensors',
    iconColor: 'text-primary',
    title: 'Live CoinGecko Prices',
    desc: 'Real-time BTC, ETH and SOL prices powered by CoinGecko. Your portfolio value is always calculated against current market data.',
  },
  {
    icon: 'timeline',
    iconColor: 'text-secondary',
    title: 'Cost Basis & P&L Tracking',
    desc: 'See exactly what you paid vs. what it\'s worth now. WalletPulse calculates your total invested, unrealized P&L and per-asset performance automatically.',
  },
  {
    icon: 'account_balance_wallet',
    iconColor: 'text-tertiary',
    title: 'On-Chain Import',
    desc: 'Import your transaction history directly from Ethereum, Bitcoin or Solana by wallet address — no manual entry required.',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const prices = useLivePrices();
  useEffect(() => { document.title = 'WalletPulse'; }, []);

  const handleEnter = () => {
    const token = localStorage.getItem('wp_token');
    navigate(token && !isTokenExpired(token) ? '/dashboard' : '/login');
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col font-sans scroll-smooth">
      {/* Top Nav */}
      <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <div className="relative flex justify-between items-center w-full px-6 h-16 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-2">
            <img src="/wp-icon.svg" alt="WalletPulse" className="w-7 h-7" />
            <span className="text-xl font-bold tracking-tighter text-slate-50">WalletPulse</span>
          </div>
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
            {[
              { label: 'Live Prices', href: '#prices' },
              { label: "What's supported", href: '#supported' },
              { label: 'How it works', href: '#how-it-works' },
            ].map(({ label, href }) => (
              <a key={label} href={href} className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors px-4 py-2 rounded-md hover:bg-white/5">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              onClick={(e) => {
                const token = localStorage.getItem('wp_token');
                if (token && !isTokenExpired(token)) {
                  e.preventDefault();
                  navigate('/dashboard');
                }
              }}
              className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors px-4 py-2"
            >
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
        <section id="prices" className="max-w-[1440px] mx-auto px-6 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TICKER_COINS.map((coin) => {
              const data = prices[coin.id];
              const price = data?.eur;
              const change = data?.eurChange24h;
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
                        {positive ? '+' : ''}{Number(change).toFixed(2)}%
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Stats Bar */}
        <section id="supported" className="max-w-[1440px] mx-auto px-6 mb-24">
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
        <section id="how-it-works" className="max-w-[1440px] mx-auto px-6 mb-24">
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

        {/* API Keys Setup */}
        <section className="max-w-[1440px] mx-auto px-6 mb-24">
          <div className="text-center mb-12">
            <h2 className="font-heading-lg text-heading-lg text-inverse-surface mb-3">Connect your chains</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">
              On-chain import requires free API keys from these providers. All of them have a free tier — no credit card needed.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                name: 'CoinGecko',
                badge: 'Prices',
                badgeColor: 'text-primary bg-primary/10 border-primary/20',
                icon: 'sensors',
                iconColor: 'text-primary',
                desc: 'Live and historical EUR prices for BTC, ETH and SOL. Free demo key allows 30 requests/min. Without a key the free tier still works but is rate-limited.',
                steps: ['Sign up at coingecko.com', 'Go to Developer Dashboard → API Keys', 'Add to application.properties as coingecko.api.key'],
                url: 'https://www.coingecko.com/en/api',
                required: false,
              },
              {
                name: 'Etherscan',
                badge: 'ETH Import',
                badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                icon: 'currency_exchange',
                iconColor: 'text-blue-400',
                desc: 'Imports your full Ethereum transaction history by wallet address. Supports native ETH and ERC-20 tokens.',
                steps: ['Sign up at etherscan.io', 'Go to My Account → API Keys → Add', 'Add to application.properties as etherscan.api.key'],
                url: 'https://etherscan.io/apis',
                required: true,
              },
              {
                name: 'Helius',
                badge: 'SOL Import',
                badgeColor: 'text-[#14F195] bg-[#14F195]/10 border-[#14F195]/20',
                icon: 'bolt',
                iconColor: 'text-[#14F195]',
                desc: 'Imports your Solana transaction history. Free plan includes 100,000 requests per month — more than enough for personal use.',
                steps: ['Sign up at helius.dev', 'Your API key is shown on the dashboard', 'Add to application.properties as helius.api.key'],
                url: 'https://helius.dev',
                required: true,
              },
              {
                name: 'Blockstream',
                badge: 'BTC Import',
                badgeColor: 'text-[#F7931A] bg-[#F7931A]/10 border-[#F7931A]/20',
                icon: 'lock_open',
                iconColor: 'text-[#F7931A]',
                desc: 'Imports your Bitcoin transaction history using the open Blockstream Esplora API. Completely free and open source — no account or API key required.',
                steps: ['No setup needed — works out of the box', 'Set your wallet chainType to BTC', 'Add your Bitcoin address and trigger import'],
                url: null,
                required: false,
              },
            ].map((api) => (
              <div key={api.name} className="bg-surface-container border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-4 hover:border-outline-variant/60 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1", color: 'inherit' }}>{api.icon}</span>
                    </div>
                    <div>
                      <p className="font-heading-md text-heading-md text-inverse-surface leading-none">{api.name}</p>
                      <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${api.badgeColor}`}>{api.badge}</span>
                    </div>
                  </div>
                  {!api.required && (
                    <span className="text-xs font-semibold text-secondary bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded-full flex-shrink-0">Optional</span>
                  )}
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm">{api.desc}</p>
                <ol className="space-y-1.5">
                  {api.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-on-surface-variant">
                      <span className="w-5 h-5 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-on-surface-variant mt-0.5">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                {api.url ? (
                  <a
                    href={api.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-fixed transition-colors self-start"
                  >
                    Get your free key
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  </a>
                ) : (
                  <span className="mt-auto flex items-center gap-1.5 text-sm font-medium text-secondary self-start">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    No API key required
                  </span>
                )}
              </div>
            ))}
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-slate-950">
        <div className="relative w-full py-8 px-6 flex flex-col md:flex-row justify-between items-center max-w-[1440px] mx-auto gap-4">
          <div className="text-sm font-bold text-slate-300">WalletPulse</div>
          <div className="md:absolute md:left-1/2 md:-translate-x-1/2 text-xs text-slate-500 font-light">© 2026 WalletPulse. High-fidelity crypto analytics.</div>
          <div className="flex gap-6">
            <Link to="/terms" className="text-xs text-slate-500 font-light hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="text-xs text-slate-500 font-light hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <a href="http://localhost:8080/swagger-ui/index.html" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 font-light hover:text-slate-300 transition-colors">API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
