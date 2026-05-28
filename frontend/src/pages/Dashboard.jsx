import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { usePageTitle } from '../hooks/usePageTitle';
import WalletFormModal from '../components/wallet/WalletFormModal';
import { LIGHT, DARK, headlineStyle, monoStyle, usePrefersDark } from '../theme/softStack';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  usePageTitle('Dashboard');
  const isDark = usePrefersDark();
  const t = isDark ? DARK : LIGHT;
  const [wallets, setWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletChainType, setNewWalletChainType] = useState('');
  const [newWalletChainAddress, setNewWalletChainAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const loadWallets = (signal) =>
    axios.get('/api/wallets', { signal })
      .then((res) =>
        Promise.all(
          res.data.map((w) =>
            axios.get(`/api/wallets/${w.id}/portfolio`, { signal }).then((r) => r.data)
          )
        )
      )
      .then(setWallets);

  // Refetch on every navigation to this page so mutations made elsewhere
  // (transaction edit/delete in History, etc.) are reflected without a hard
  // reload. `isLoading` only flips true on the first mount — subsequent
  // refetches happen silently in the background. AbortController cancels any
  // in-flight request when the user navigates away (or re-navigates), so
  // setState never fires on an unmounted component.
  useEffect(() => {
    const controller = new AbortController();
    loadWallets(controller.signal)
      .then(() => setIsLoading(false))
      .catch((err) => {
        if (axios.isCancel(err) || err?.name === 'CanceledError') return;
        setError('Failed to load portfolio data.');
        setIsLoading(false);
      });
    return () => controller.abort();
  }, [location.key]);

  const handleCreateWallet = () => {
    if (!newWalletName.trim()) return;
    setSaving(true);
    const payload = { name: newWalletName.trim() };
    if (newWalletChainType) {
      payload.chainType = newWalletChainType;
      payload.chainAddress = newWalletChainAddress.trim();
    }
    axios.post('/api/wallets', payload)
      .then(() => loadWallets())
      .then(() => {
        setShowAddWallet(false);
        setNewWalletName('');
        setNewWalletChainType('');
        setNewWalletChainAddress('');
        setSaving(false);
      })
      .catch(() => setSaving(false));
  };

  const { formatCurrency } = useApp();

  const calcPercent = (profit, invested) => {
    if (!invested || invested === 0) return 0;
    return ((profit / invested) * 100).toFixed(2);
  };

  const totalInvested = wallets.reduce((sum, w) => sum + (w.totalInvested || 0), 0);
  const totalCurrentValue = wallets.reduce((sum, w) => sum + (w.totalCurrentValue || 0), 0);
  const totalProfit = wallets.reduce((sum, w) => sum + (w.totalProfit || 0), 0);
  const totalPct = calcPercent(totalProfit, totalInvested);
  const isUp = totalProfit >= 0;

  const eyebrow = { ...monoStyle, fontSize: 10, letterSpacing: '0.22em', color: t.SUBINK, textTransform: 'uppercase' };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center gap-3" role="status" aria-live="polite">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ background: t.MINT_DEEP, boxShadow: `0 0 16px ${t.MINT}` }}
            />
            <span style={{ ...monoStyle, fontSize: 12, letterSpacing: '0.2em', color: t.SUBINK }}>
              LOADING · LIVE DATA
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div
          className="max-w-md mx-auto rounded-3xl p-8 text-center"
          style={{ background: t.RED_BG, border: `1px solid ${t.HAIR_HEAVY}`, boxShadow: t.SH_CARD, color: t.RED_DEEP }}
          role="alert"
        >
          <div style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.22em', color: t.RED_DEEP, marginBottom: 8 }}>
            ERROR
          </div>
          <div style={{ ...headlineStyle, fontSize: 18, fontWeight: 600 }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 max-w-[1240px] mx-auto w-full">
      <WalletFormModal
        mode="create"
        open={showAddWallet}
        name={newWalletName}
        setName={setNewWalletName}
        chainType={newWalletChainType}
        setChainType={setNewWalletChainType}
        chainAddress={newWalletChainAddress}
        setChainAddress={setNewWalletChainAddress}
        saving={saving}
        onClose={() => setShowAddWallet(false)}
        onSubmit={handleCreateWallet}
      />

      {/* Header */}
      <div>
        <div style={eyebrow}>OVERVIEW · PORTFOLIO</div>
        <h1
          className="mt-2"
          style={{ ...headlineStyle, fontSize: 'clamp(34px, 4.4vw, 48px)', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1, color: t.INK }}
        >
          Your portfolio, at a glance.
        </h1>
        <p className="mt-3 text-[15px]" style={{ color: t.SUBINK }}>
          Performance vs. your purchase price, across every connected wallet.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Hero — Total portfolio value */}
        <div
          className="md:col-span-3 relative overflow-hidden rounded-[28px] p-7 md:p-10"
          style={{
            background: `linear-gradient(150deg, ${t.CARD} 0%, ${t.CARD_2} 55%, ${t.CARD_3} 100%)`,
            border: `1px solid ${t.HAIR_HEAVY}`,
            boxShadow: t.SH_HERO,
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-16 w-[420px] h-[320px] rounded-full"
            style={{ background: `radial-gradient(closest-side, ${t.BLOB_MINT}, transparent 70%)`, filter: 'blur(10px)' }}
          />
          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div style={eyebrow}>PORTFOLIO · TOTAL VALUE</div>
              <div className="mt-3 flex items-baseline gap-2">
                <span style={{ color: t.SUBINK, fontSize: 18 }}>€</span>
                <span
                  className="tabular-nums"
                  style={{ ...headlineStyle, fontSize: 'clamp(44px, 7vw, 64px)', fontWeight: 600, color: t.INK, letterSpacing: '-0.02em', lineHeight: 1 }}
                >
                  {formatCurrency(totalCurrentValue).replace(/^[^\d-]*/, '')}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
                  style={{
                    background: isUp ? t.MINT_BG : t.RED_BG,
                    color: isUp ? t.MINT_DEEP : t.RED_DEEP,
                    ...monoStyle,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{totalPct}%
                </span>
                <span style={{ ...monoStyle, fontSize: 11, color: t.SUBINK }}>
                  vs. cost basis
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowAddWallet(true)}
              className="inline-flex items-center gap-2 text-[14px] font-semibold px-5 py-3 rounded-full transition-all self-start md:self-auto"
              style={{ background: t.CTA_INK_BG, color: t.CTA_INK_FG, boxShadow: t.SH_CTA_INK }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = t.SH_CTA_INK_H; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = t.SH_CTA_INK; }}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add wallet
            </button>
          </div>

          <div
            className="relative mt-7 pt-6 grid grid-cols-2 md:grid-cols-3 gap-4"
            style={{ borderTop: `1px solid ${t.HAIR_HEAVY}` }}
          >
            <div>
              <div style={eyebrow}>COST · INVESTED</div>
              <div className="mt-2 tabular-nums" style={{ ...headlineStyle, fontSize: 22, fontWeight: 600, color: t.INK }}>
                {formatCurrency(totalInvested)}
              </div>
            </div>
            <div>
              <div style={eyebrow}>UNREALIZED · P&amp;L</div>
              <div
                className="mt-2 tabular-nums"
                style={{ ...headlineStyle, fontSize: 22, fontWeight: 600, color: isUp ? t.MINT_DEEP : t.RED_DEEP }}
              >
                {isUp ? '+' : ''}{formatCurrency(totalProfit)}
              </div>
            </div>
            <div>
              <div style={eyebrow}>WALLETS · COUNT</div>
              <div className="mt-2 tabular-nums" style={{ ...headlineStyle, fontSize: 22, fontWeight: 600, color: t.INK }}>
                {wallets.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Wallets */}
      <div
        className="rounded-[28px] overflow-hidden"
        style={{ background: t.CARD, border: `1px solid ${t.HAIR_HEAVY}`, boxShadow: t.SH_CARD }}
      >
        <div
          className="px-6 py-5 md:px-8 md:py-6 flex items-center justify-between gap-4"
          style={{ borderBottom: `1px solid ${t.HAIR_DIV}` }}
        >
          <div>
            <div style={eyebrow}>HOLDINGS · WALLETS</div>
            <h2 className="mt-1.5" style={{ ...headlineStyle, fontSize: 22, fontWeight: 600, color: t.INK }}>
              Connected wallets
            </h2>
          </div>
          <button
            onClick={() => setShowAddWallet(true)}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-full transition-colors"
            style={{ background: 'transparent', color: t.INK, border: `1px solid ${t.HAIR_STRONG}` }}
            onMouseEnter={(e) => { e.currentTarget.style.background = t.CARD_2; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add wallet
          </button>
        </div>

        {wallets.length > 0 ? (
          <ul className="divide-y" style={{ borderColor: t.HAIR_DIV }}>
            {wallets.map((wallet) => {
              const wUp = (wallet.totalProfit || 0) >= 0;
              const wPct = calcPercent(wallet.totalProfit, wallet.totalInvested);
              const assetCount = wallet.assets?.length ?? 0;
              return (
                <li
                  key={wallet.id}
                  onClick={() => navigate('/wallet', { state: { walletId: wallet.id } })}
                  className="px-6 py-5 md:px-8 md:py-5 cursor-pointer transition-colors"
                  style={{ borderColor: t.HAIR_DIV }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = t.CARD_2)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate('/wallet', { state: { walletId: wallet.id } });
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Coin chip */}
                    <span
                      className="inline-flex w-11 h-11 rounded-2xl items-center justify-center"
                      style={{ background: t.LAVENDER, border: `1px solid ${t.HAIR}` }}
                      aria-hidden="true"
                    >
                      <span className="material-symbols-outlined text-[20px]" style={{ color: t.LAVENDER_TEXT }}>
                        account_balance_wallet
                      </span>
                    </span>

                    {/* Name + assets */}
                    <div className="flex-1 min-w-0">
                      <div className="truncate" style={{ ...headlineStyle, fontSize: 16, fontWeight: 600, color: t.INK }}>
                        {wallet.name}
                      </div>
                      <div className="mt-0.5" style={{ ...monoStyle, fontSize: 11, color: t.SUBINK }}>
                        {assetCount} {assetCount === 1 ? 'asset' : 'assets'}
                      </div>
                    </div>

                    {/* Cost (hidden on small) */}
                    <div className="hidden md:block text-right min-w-[120px]">
                      <div style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.18em', color: t.SUBINK }}>COST</div>
                      <div className="mt-1 tabular-nums" style={{ ...monoStyle, fontSize: 13, color: t.INK }}>
                        {formatCurrency(wallet.totalInvested)}
                      </div>
                    </div>

                    {/* Current value */}
                    <div className="hidden sm:block text-right min-w-[120px]">
                      <div style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.18em', color: t.SUBINK }}>VALUE</div>
                      <div className="mt-1 tabular-nums" style={{ ...monoStyle, fontSize: 13, color: t.INK }}>
                        {formatCurrency(wallet.totalCurrentValue)}
                      </div>
                    </div>

                    {/* P&L */}
                    <div className="text-right min-w-[110px]">
                      <div
                        className="tabular-nums"
                        style={{ ...monoStyle, fontSize: 13, fontWeight: 600, color: wUp ? t.MINT_DEEP : t.RED_DEEP }}
                      >
                        {wUp ? '+' : ''}{formatCurrency(wallet.totalProfit)}
                      </div>
                      <span
                        className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded"
                        style={{
                          background: wUp ? t.MINT_BG : t.RED_BG,
                          color: wUp ? t.MINT_DEEP : t.RED_DEEP,
                          ...monoStyle,
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                      >
                        {wUp ? '▲' : '▼'} {wUp ? '+' : ''}{wPct}%
                      </span>
                    </div>

                    <span
                      className="material-symbols-outlined hidden sm:inline-block text-[20px] ml-1"
                      style={{ color: t.SUBINK }}
                      aria-hidden="true"
                    >
                      chevron_right
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-6 py-14 md:px-8 text-center">
            <div
              className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: t.MINT_BG, border: `1px solid ${t.MINT_CIRCLE_BORDER}` }}
              aria-hidden="true"
            >
              <span className="material-symbols-outlined text-[26px]" style={{ color: t.MINT_DEEP }}>
                account_balance_wallet
              </span>
            </div>
            <h3 style={{ ...headlineStyle, fontSize: 20, fontWeight: 600, color: t.INK }}>
              No wallets yet
            </h3>
            <p className="mt-2 text-[14px] max-w-sm mx-auto" style={{ color: t.SUBINK }}>
              Add your first wallet to start tracking live valuations, cost basis and P&amp;L.
            </p>
            <button
              onClick={() => setShowAddWallet(true)}
              className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold px-5 py-3 rounded-full transition-all"
              style={{ background: t.CTA_INK_BG, color: t.CTA_INK_FG, boxShadow: t.SH_CTA_INK }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = t.SH_CTA_INK_H; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = t.SH_CTA_INK; }}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add a wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
