import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { usePageTitle } from '../hooks/usePageTitle';
import WalletFormModal from '../components/wallet/WalletFormModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  usePageTitle('Dashboard');
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

  if (isLoading) return <div className="p-6 text-on-surface text-center">Loading Live-Data from Backend...</div>;
  if (error) return <div className="p-6 text-error text-center">{error}</div>;

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-layout-margin space-y-8">
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
        <h2 className="font-heading-lg text-heading-lg text-on-surface">Overview</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">Performance vs. Purchase Price</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-low rounded-xl p-lg border-t border-t-white/10 border-x border-x-transparent border-b border-b-transparent relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Total Portfolio Value</p>
          <h3 className="font-display-xl text-display-xl text-on-surface">{formatCurrency(totalCurrentValue)}</h3>
          <div className="mt-4 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-label-sm text-label-sm ${totalProfit >= 0 ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'}`}>
              <span className="material-symbols-outlined text-[14px]">{totalProfit >= 0 ? 'trending_up' : 'trending_down'}</span>
              P&amp;L: {totalProfit >= 0 ? '+' : ''}{calcPercent(totalProfit, totalInvested)}%
            </span>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-lg border-t border-t-white/10 border-x border-x-transparent border-b border-b-transparent">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Total Investment</p>
          <h3 className="font-heading-lg text-heading-lg text-on-surface mt-2">{formatCurrency(totalInvested)}</h3>
          <p className="font-body-md text-body-md text-outline mt-2">Initial cost basis across all connected sources.</p>
        </div>

        <div className="bg-surface-container-low rounded-xl p-lg border-t border-t-white/10 border-x border-x-transparent border-b border-b-transparent">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Unrealized P&amp;L</p>
          <h3 className={`font-heading-lg text-heading-lg mt-2 ${totalProfit >= 0 ? 'text-secondary' : 'text-error'}`}>
            {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
          </h3>
          <div className="mt-4 flex items-center gap-2">
            <span className={`font-data-mono text-data-mono ${totalProfit >= 0 ? 'text-secondary' : 'text-error'}`}>
              {totalProfit >= 0 ? '+' : ''}{calcPercent(totalProfit, totalInvested)}%
            </span>
            <span className="text-outline text-sm">vs. initial investment</span>
          </div>
        </div>
      </div>

      {/* Connected Wallets Table */}
      <div className="bg-surface-container-low rounded-xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-heading-md text-heading-md text-on-surface">Connected Wallets</h3>
          <button
            onClick={() => setShowAddWallet(true)}
            className="text-sm font-medium text-primary hover:text-primary-fixed transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">add</span> Add Wallet
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-white/5 font-label-sm text-label-sm text-on-surface-variant uppercase">
                <th className="px-6 py-4">Wallet Name</th>
                <th className="px-6 py-4 text-right">Initial Cost</th>
                <th className="px-6 py-4 text-right">Current Value</th>
                <th className="px-6 py-4 text-right">Net P&amp;L</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface divide-y divide-white/5">
              {wallets.length > 0 ? (
                wallets.map((wallet) => (
                  <tr
                    key={wallet.id}
                    onClick={() => navigate('/wallet', { state: { walletId: wallet.id } })}
                    className="hover:bg-surface-bright/30 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center text-outline group-hover:text-primary transition-colors">
                          <span className="material-symbols-outlined">account_balance_wallet</span>
                        </div>
                        <div>
                          <div className="font-medium text-on-surface group-hover:text-primary transition-colors">{wallet.name}</div>
                          <div className="text-xs text-outline font-data-mono">{wallet.assets?.length ?? 0} {wallet.assets?.length === 1 ? 'Asset' : 'Assets'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-data-mono text-data-mono">{formatCurrency(wallet.totalInvested)}</td>
                    <td className="px-6 py-4 text-right font-data-mono text-data-mono">{formatCurrency(wallet.totalCurrentValue)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className={`font-data-mono text-data-mono ${wallet.totalProfit >= 0 ? 'text-secondary' : 'text-error'}`}>
                        {wallet.totalProfit >= 0 ? '+' : ''}{formatCurrency(wallet.totalProfit)}
                      </div>
                      <div className={`text-xs mt-1 ${wallet.totalProfit >= 0 ? 'text-secondary' : 'text-error'}`}>
                        {wallet.totalProfit >= 0 ? '+' : ''}{calcPercent(wallet.totalProfit, wallet.totalInvested)}%
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-outline">
                    No wallets found.{' '}
                    <button onClick={() => setShowAddWallet(true)} className="text-primary underline">Add a wallet</button> to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
