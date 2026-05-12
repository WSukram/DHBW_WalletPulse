import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isTokenExpired } from '../context/AppContext';

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
