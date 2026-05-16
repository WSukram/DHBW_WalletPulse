import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/terms', label: 'Terms of Service' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/impressum', label: 'Impressum' },
];

const LegalLayout = ({ children }) => {
  const { pathname } = useLocation();

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <div className="flex justify-between items-center w-full px-6 h-16 max-w-[1440px] mx-auto">
          <Link to="/" className="text-xl font-bold tracking-tighter text-slate-50 hover:text-primary transition-colors">
            WalletPulse
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-grow max-w-3xl mx-auto w-full px-6 py-16">
        {children}
      </main>

      <footer className="border-t border-white/5 bg-slate-950">
        <div className="max-w-[1440px] mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm font-bold text-slate-300">WalletPulse</p>
          <p className="text-xs text-slate-500">© 2026 WalletPulse. For educational purposes only.</p>
          <div className="flex gap-6">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-xs transition-colors ${
                  pathname === to
                    ? to === '/terms' ? 'text-primary'
                    : to === '/privacy' ? 'text-secondary'
                    : 'text-tertiary'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LegalLayout;
