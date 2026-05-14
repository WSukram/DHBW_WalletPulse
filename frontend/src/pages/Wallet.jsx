import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { downloadCsv } from '../utils/exportCsv';
import { COIN_META, KNOWN_COINS, coinMeta, formatPct } from '../utils/coins';
import { timeRanges, getChartLabels, computePortfolioChartPoints, pointsToPath } from '../utils/chart';

const CHAIN_META = {
  ETH: { label: 'Ethereum', color: '#627EEA', bg: '#627EEA22' },
  BTC: { label: 'Bitcoin',  color: '#F7931A', bg: '#F7931A22' },
  SOL: { label: 'Solana',   color: '#14F195', bg: '#14F19522' },
};

const addressExplorerUrl = (chainType, address) => {
  if (!address || !chainType) return null;
  switch (chainType) {
    case 'ETH': return `https://etherscan.io/address/${address}`;
    case 'BTC': return `https://blockstream.info/address/${address}`;
    case 'SOL': return `https://solscan.io/account/${address}`;
    default: return null;
  }
};

const formatRelative = (dateStr) => {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ── Shared modal styles ─────────────────────────────────────────────────────
const inputCls = 'w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/50';
const labelCls = 'block font-label-sm text-label-sm text-on-surface-variant mb-1';

const Wallet = () => {
  useEffect(() => { document.title = 'Wallets · WalletPulse'; }, []);
  const location = useLocation();
  const { formatCurrency: formatEur } = useApp();
  const [portfolios, setPortfolios] = useState([]);
  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState(null);
  const [activeRange, setActiveRange] = useState('1Y');
  const [search, setSearch] = useState('');

  // Add Wallet modal state
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletChainType, setNewWalletChainType] = useState('');
  const [newWalletChainAddress, setNewWalletChainAddress] = useState('');
  const [savingWallet, setSavingWallet] = useState(false);

  // Delete Wallet modal state
  const [deleteWallet, setDeleteWallet] = useState(null);
  const [deletingWallet, setDeletingWallet] = useState(false);

  // Edit Wallet modal state
  const [editWallet, setEditWallet] = useState(null);
  const [editWalletName, setEditWalletName] = useState('');
  const [editWalletChainType, setEditWalletChainType] = useState('');
  const [editWalletChainAddress, setEditWalletChainAddress] = useState('');
  const [savingEditWallet, setSavingEditWallet] = useState(false);

  // Import state
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Add Transaction modal state
  const [showAddTx, setShowAddTx] = useState(false);
  const [txForm, setTxForm] = useState({ coinId: '', amount: '', buyPrice: '', date: '' });
  const [savingTx, setSavingTx] = useState(false);
  const [txError, setTxError] = useState('');

  const loadPortfolios = () =>
    axios.get('http://localhost:8080/api/wallets')
      .then((res) =>
        Promise.all(
          res.data.map((w) =>
            axios.get(`http://localhost:8080/api/wallets/${w.id}/portfolio`).then((r) => ({
              ...r.data,
              chainType: w.chainType ?? null,
              chainAddress: w.chainAddress ?? null,
              lastImportTime: w.lastImportTime ?? null,
            }))
          )
        )
      );

  const loadTransactions = (portfolioData) =>
    Promise.all(
      (portfolioData.assets ?? []).map((asset) =>
        axios.get(`http://localhost:8080/api/assets/${asset.id}/transactions`)
          .then((r) => r.data.map((tx) => ({ ...tx, assetId: asset.id, coinId: asset.coinId })))
      )
    ).then((arrays) => arrays.flat());

  // Initial load — also pick up walletId passed from Dashboard
  useEffect(() => {
    loadPortfolios()
      .then((data) => {
        setPortfolios(data);
        setIsLoadingList(false);
        const incomingId = location.state?.walletId;
        if (incomingId && data.some((p) => p.id === incomingId)) {
          setSelectedWalletId(incomingId);
        }
      })
      .catch(() => { setError('Failed to load wallets.'); setIsLoadingList(false); });
  }, []);

  // Load transactions whenever a wallet is selected
  useEffect(() => {
    if (!selectedWalletId) return;
    const p = portfolios.find((p) => p.id === selectedWalletId);
    if (!p) return;
    setIsLoadingDetail(true);
    loadTransactions(p)
      .then((txs) => { setTransactions(txs); setIsLoadingDetail(false); })
      .catch(() => { setError('Failed to load transaction data.'); setIsLoadingDetail(false); });
  }, [selectedWalletId]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreateWallet = () => {
    if (!newWalletName.trim()) return;
    setSavingWallet(true);
    const body = { name: newWalletName.trim() };
    if (newWalletChainType) body.chainType = newWalletChainType;
    if (newWalletChainAddress.trim()) body.chainAddress = newWalletChainAddress.trim();
    axios.post('http://localhost:8080/api/wallets', body)
      .then(() => loadPortfolios())
      .then((data) => {
        setPortfolios(data);
        setShowAddWallet(false);
        setNewWalletName('');
        setNewWalletChainType('');
        setNewWalletChainAddress('');
        setSavingWallet(false);
      })
      .catch(() => setSavingWallet(false));
  };

  const handleEditWallet = () => {
    if (!editWallet || !editWalletName.trim()) return;
    setSavingEditWallet(true);
    const body = {
      name: editWalletName.trim(),
      chainType: editWalletChainType || null,
      chainAddress: editWalletChainAddress.trim() || null,
    };
    axios.put(`http://localhost:8080/api/wallets/${editWallet.id}`, body)
      .then(() => loadPortfolios())
      .then((data) => {
        setPortfolios(data);
        setEditWallet(null);
        setEditWalletName('');
        setEditWalletChainType('');
        setEditWalletChainAddress('');
        setSavingEditWallet(false);
      })
      .catch(() => setSavingEditWallet(false));
  };

  const handleImport = () => {
    if (!selectedWalletId || importing) return;
    setImporting(true);
    setImportResult(null);
    axios.post(`http://localhost:8080/api/wallets/${selectedWalletId}/import`)
      .then((res) => {
        setImportResult(res.data);
        setImporting(false);
        // Reload portfolio + wallet metadata (to pick up updated lastImportTime)
        return Promise.all([
          axios.get(`http://localhost:8080/api/wallets/${selectedWalletId}/portfolio`),
          axios.get(`http://localhost:8080/api/wallets/${selectedWalletId}`),
        ]).then(([portfolioRes, walletRes]) => {
          const w = walletRes.data;
          const updated = {
            ...portfolioRes.data,
            chainType: w.chainType ?? null,
            chainAddress: w.chainAddress ?? null,
            lastImportTime: w.lastImportTime ?? null,
          };
          setPortfolios((prev) => prev.map((p) => (p.id === selectedWalletId ? updated : p)));
        });
      })
      .catch((err) => { setImportResult({ error: true, message: err.response?.data?.error }); setImporting(false); });
  };

  const handleDeleteWallet = () => {
    if (!deleteWallet) return;
    setDeletingWallet(true);
    axios.delete(`http://localhost:8080/api/wallets/${deleteWallet.id}`)
      .then(() => loadPortfolios())
      .then((data) => { setPortfolios(data); setDeleteWallet(null); setDeletingWallet(false); })
      .catch(() => setDeletingWallet(false));
  };

  const openAddTx = () => {
    const portfolio = portfolios.find((p) => p.id === selectedWalletId);
    const firstCoin = portfolio?.assets?.[0]?.coinId ?? KNOWN_COINS[0].id;
    setTxForm({ coinId: firstCoin, amount: '', buyPrice: '', date: new Date().toISOString().split('T')[0] });
    setTxError('');
    setShowAddTx(true);
  };

  const handleAddTransaction = async () => {
    const { coinId, amount, buyPrice, date } = txForm;
    if (!coinId || !amount || !buyPrice || !date) { setTxError('All fields are required.'); return; }
    const parsedAmount = parseFloat(amount);
    const parsedPrice = parseFloat(buyPrice);
    if (isNaN(parsedAmount) || parsedAmount <= 0) { setTxError('Amount must be a positive number.'); return; }
    if (isNaN(parsedPrice) || parsedPrice <= 0) { setTxError('Buy price must be a positive number.'); return; }

    setSavingTx(true);
    setTxError('');
    try {
      const portfolio = portfolios.find((p) => p.id === selectedWalletId);
      const existingAsset = portfolio?.assets?.find((a) => a.coinId === coinId);

      let assetId;
      if (existingAsset) {
        assetId = existingAsset.id;
      } else {
        const res = await axios.post(`http://localhost:8080/api/wallets/${selectedWalletId}/assets`, { coinId });
        assetId = res.data.id;
      }

      await axios.post(`http://localhost:8080/api/assets/${assetId}/transactions`, {
        amount: parsedAmount,
        buyPrice: parsedPrice,
        date,
      });

      // Reload portfolio and transactions
      const updatedPortfolio = await axios.get(`http://localhost:8080/api/wallets/${selectedWalletId}/portfolio`).then((r) => r.data);
      setPortfolios((prev) => prev.map((p) => (p.id === selectedWalletId ? updatedPortfolio : p)));
      const txs = await loadTransactions(updatedPortfolio);
      setTransactions(txs);

      setShowAddTx(false);
      setSavingTx(false);
    } catch {
      setTxError('Failed to save transaction. Please try again.');
      setSavingTx(false);
    }
  };

  const handleExportCsv = () => {
    const p = portfolios.find((po) => po.id === selectedWalletId);
    const headers = ['Date', 'Coin', 'Symbol', 'Amount', 'Buy Price (EUR)', 'Total Value (EUR)', 'Source', 'Tx Hash'];
    const rows = transactions.map((tx) => {
      const meta = coinMeta(tx.coinId);
      return [tx.date, meta.name, meta.symbol, tx.amount, tx.buyPrice, tx.amount * tx.buyPrice, tx.source ?? 'MANUAL', tx.txHash ?? ''];
    });
    const slug = (p?.name ?? 'wallet').replace(/\s+/g, '_');
    downloadCsv(`${slug}_transactions.csv`, headers, rows);
  };

  const portfolio = portfolios.find((p) => p.id === selectedWalletId) ?? null;

  const chartPoints = useMemo(
    () => computePortfolioChartPoints(transactions, portfolio?.assets ?? [], activeRange),
    [transactions, portfolio, activeRange]
  );

  // ── Derived coin options for the transaction modal ────────────────────────
  const existingCoinIds = (portfolio?.assets ?? []).map((a) => a.coinId);
  const coinOptions = [
    ...(portfolio?.assets ?? []).map((a) => ({ id: a.coinId, label: `${coinMeta(a.coinId).name} (${coinMeta(a.coinId).symbol}) — in wallet` })),
    ...KNOWN_COINS.filter((c) => !existingCoinIds.includes(c.id)).map((c) => ({ id: c.id, label: `${c.name} (${c.symbol})` })),
  ];

  // ── WALLET LIST VIEW ──────────────────────────────────────────────────────
  if (!selectedWalletId) {
    if (isLoadingList) return <div className="p-6 text-on-surface text-center">Loading Live-Data from Backend...</div>;
    if (error) return <div className="p-6 text-error text-center">{error}</div>;

    return (
      <div className="flex-1 overflow-y-auto p-6 lg:p-layout-margin space-y-8">
        {showAddWallet && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAddWallet(false)}>
            <div className="bg-surface-container rounded-xl p-6 w-full max-w-sm border border-outline-variant/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-heading-md text-heading-md text-on-surface mb-1">New Wallet</h3>
              <p className="text-sm text-on-surface-variant mb-5">Give your wallet a name to get started.</p>
              <div className="space-y-4 mb-5">
                <div>
                  <label className={labelCls}>Wallet Name</label>
                  <input
                    autoFocus
                    className={inputCls}
                    placeholder="e.g. Main Portfolio"
                    value={newWalletName}
                    onChange={(e) => setNewWalletName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateWallet()}
                  />
                </div>
                <div>
                  <label className={labelCls}>Blockchain (optional)</label>
                  <select className={inputCls} value={newWalletChainType} onChange={(e) => setNewWalletChainType(e.target.value)}>
                    <option value="">None — manual entry only</option>
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="SOL">Solana (SOL)</option>
                  </select>
                </div>
                {newWalletChainType && (
                  <div>
                    <label className={labelCls}>Wallet Address</label>
                    <input
                      className={inputCls}
                      placeholder={newWalletChainType === 'ETH' ? '0x...' : newWalletChainType === 'BTC' ? 'bc1q... or 1A...' : 'Sol address...'}
                      value={newWalletChainAddress}
                      onChange={(e) => setNewWalletChainAddress(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setShowAddWallet(false); setNewWalletChainType(''); setNewWalletChainAddress(''); }} className="px-4 py-2 rounded-lg text-on-surface-variant font-label-sm text-label-sm hover:text-on-surface transition-colors">Cancel</button>
                <button onClick={handleCreateWallet} disabled={savingWallet || !newWalletName.trim()} className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {savingWallet ? 'Creating…' : 'Create Wallet'}
                </button>
              </div>
            </div>
          </div>
        )}

        {editWallet && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setEditWallet(null)}>
          <div className="bg-surface-container rounded-xl p-6 w-full max-w-sm border border-outline-variant/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading-md text-heading-md text-on-surface mb-1">Edit Wallet</h3>
            <p className="text-sm text-on-surface-variant mb-5">Update name or blockchain address for "{editWallet.name}".</p>
            <div className="space-y-4 mb-5">
              <div>
                <label className={labelCls}>Wallet Name</label>
                <input
                  autoFocus
                  className={inputCls}
                  placeholder="e.g. Main Portfolio"
                  value={editWalletName}
                  onChange={(e) => setEditWalletName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEditWallet()}
                />
              </div>
              <div>
                <label className={labelCls}>Blockchain (optional)</label>
                <select className={inputCls} value={editWalletChainType} onChange={(e) => setEditWalletChainType(e.target.value)}>
                  <option value="">None — manual entry only</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="SOL">Solana (SOL)</option>
                </select>
              </div>
              {editWalletChainType && (
                <div>
                  <label className={labelCls}>Wallet Address</label>
                  <input
                    className={inputCls}
                    placeholder={editWalletChainType === 'ETH' ? '0x...' : editWalletChainType === 'BTC' ? 'bc1q... or 1A...' : 'Sol address...'}
                    value={editWalletChainAddress}
                    onChange={(e) => setEditWalletChainAddress(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditWallet(null)} className="px-4 py-2 rounded-lg text-on-surface-variant font-label-sm text-label-sm hover:text-on-surface transition-colors">Cancel</button>
              <button onClick={handleEditWallet} disabled={savingEditWallet || !editWalletName.trim()} className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {savingEditWallet ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteWallet && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setDeleteWallet(null)}>
          <div className="bg-surface-container rounded-xl p-6 w-full max-w-sm border border-outline-variant/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading-md text-heading-md text-on-surface mb-1">Delete Wallet</h3>
            <p className="text-sm text-on-surface-variant mb-2">
              Are you sure you want to delete <span className="text-on-surface font-medium">"{deleteWallet.name}"</span>?
            </p>
            <p className="text-sm text-error mb-5">This will permanently remove the wallet and all its assets and transactions. This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteWallet(null)} className="px-4 py-2 rounded-lg text-on-surface-variant font-label-sm text-label-sm hover:text-on-surface transition-colors">Cancel</button>
              <button onClick={handleDeleteWallet} disabled={deletingWallet} className="px-4 py-2 rounded-lg bg-error text-on-error font-label-sm text-label-sm hover:bg-error/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {deletingWallet ? 'Deleting…' : 'Delete Wallet'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-heading-lg text-heading-lg text-on-surface">My Wallets</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Select a wallet to view its portfolio details.</p>
          </div>
          <button
            onClick={() => setShowAddWallet(true)}
            className="px-4 py-2 rounded-lg bg-primary-container text-on-primary-container font-label-sm text-label-sm hover:bg-inverse-primary transition-colors flex items-center gap-2 self-start shadow-[0_0_15px_rgba(79,70,229,0.3)]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Wallet
          </button>
        </div>

        {portfolios.length === 0 ? (
          <div className="bg-surface-container rounded-xl p-12 text-center border border-white/5">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4 block">account_balance_wallet</span>
            <p className="text-on-surface-variant font-body-md text-body-md mb-4">No wallets found. Create one to get started.</p>
            <button onClick={() => setShowAddWallet(true)} className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary/90 transition-colors">
              Create Wallet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {portfolios.map((p) => {
              const isProfit = (p.totalProfit ?? 0) >= 0;
              return (
                <button
                  key={p.id}
                  onClick={() => { setSearch(''); setActiveRange('1Y'); setTransactions([]); setSelectedWalletId(p.id); }}
                  className="bg-surface-container rounded-xl p-6 border border-white/5 text-left hover:border-primary/30 hover:bg-surface-container-high transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">account_balance_wallet</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-heading-md text-heading-md text-on-surface">{p.name}</div>
                          {p.chainType && (
                            <span
                              className="text-[10px] font-label-sm px-1.5 py-0.5 rounded font-bold tracking-wider"
                              style={{ color: CHAIN_META[p.chainType]?.color, backgroundColor: CHAIN_META[p.chainType]?.bg }}
                            >
                              {p.chainType}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-on-surface-variant font-data-mono">
                          {p.assets?.length ?? 0} {p.assets?.length === 1 ? 'Asset' : 'Assets'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditWalletName(p.name); setEditWalletChainType(p.chainType ?? ''); setEditWalletChainAddress(p.chainAddress ?? ''); setEditWallet(p); }}
                        className="p-1.5 rounded-lg text-on-surface-variant opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-primary/10 transition-all"
                        title="Rename wallet"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteWallet(p); }}
                        className="p-1.5 rounded-lg text-on-surface-variant opacity-0 group-hover:opacity-100 hover:text-error hover:bg-error/10 transition-all"
                        title="Delete wallet"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                      <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-[20px]">chevron_right</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-on-surface-variant uppercase tracking-wider font-label-sm mb-1">Current Value</div>
                      <div className="font-heading-lg text-heading-lg text-on-surface">{formatEur(p.totalCurrentValue)}</div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div>
                        <div className="text-xs text-on-surface-variant font-label-sm">Invested</div>
                        <div className="font-data-mono text-data-mono text-on-surface-variant">{formatEur(p.totalInvested)}</div>
                      </div>
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-data-mono text-sm border ${isProfit ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-error/10 text-error border-error/20'}`}>
                        <span className="material-symbols-outlined text-[14px]">{isProfit ? 'trending_up' : 'trending_down'}</span>
                        {formatPct(p.totalProfit, p.totalInvested)}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── WALLET DETAIL VIEW ────────────────────────────────────────────────────
  if (isLoadingDetail || !portfolio) {
    return <div className="p-6 text-on-surface text-center">Loading Live-Data from Backend...</div>;
  }
  if (error) return <div className="p-6 text-error text-center">{error}</div>;

  const totalProfit = portfolio.totalProfit ?? 0;
  const totalInvested = portfolio.totalInvested ?? 0;
  const totalCurrentValue = portfolio.totalCurrentValue ?? 0;
  const profitPct = formatPct(totalProfit, totalInvested);
  const isPortfolioProfit = totalProfit >= 0;

  const filteredAssets = (portfolio.assets ?? []).filter((a) => {
    const meta = coinMeta(a.coinId);
    const q = search.toLowerCase();
    return meta.name.toLowerCase().includes(q) || meta.symbol.toLowerCase().includes(q) || a.coinId.toLowerCase().includes(q);
  });

  const allValues = chartPoints.flatMap((p) => [p.cost, p.value]).filter((v) => v > 0);
  const minV = allValues.length ? Math.min(...allValues) * 0.95 : 0;
  const maxV = allValues.length ? Math.max(...allValues) * 1.05 : 1;
  const valuePath = pointsToPath(chartPoints, 'value', minV, maxV);
  const costPath = pointsToPath(chartPoints, 'cost', minV, maxV);
  const valueAreaPath = pointsToPath(chartPoints, 'value', minV, maxV, true);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-layout-margin space-y-8">
      {showAddTx && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAddTx(false)}>
          <div className="bg-surface-container rounded-xl p-6 w-full max-w-md border border-outline-variant/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading-md text-heading-md text-on-surface mb-1">Add Transaction</h3>
            <p className="text-sm text-on-surface-variant mb-5">Record a new purchase for this wallet.</p>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Coin</label>
                <select className={inputCls} value={txForm.coinId} onChange={(e) => setTxForm((f) => ({ ...f, coinId: e.target.value }))}>
                  <option value="">Select a coin…</option>
                  {coinOptions.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Amount</label>
                  <input type="number" min="0" step="any" className={inputCls} placeholder="0.00" value={txForm.amount} onChange={(e) => setTxForm((f) => ({ ...f, amount: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Buy Price (EUR)</label>
                  <input type="number" min="0" step="any" className={inputCls} placeholder="0.00" value={txForm.buyPrice} onChange={(e) => setTxForm((f) => ({ ...f, buyPrice: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Purchase Date</label>
                <input type="date" className={inputCls} value={txForm.date} max={new Date().toISOString().split('T')[0]} onChange={(e) => setTxForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              {txForm.amount && txForm.buyPrice && (
                <div className="bg-surface-container-highest rounded-lg px-4 py-3 text-sm text-on-surface-variant">
                  Total cost: <span className="font-data-mono text-on-surface">{formatEur(parseFloat(txForm.amount || 0) * parseFloat(txForm.buyPrice || 0))}</span>
                </div>
              )}
              {txError && <p className="text-error text-sm font-label-sm">{txError}</p>}
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowAddTx(false)} className="px-4 py-2 rounded-lg text-on-surface-variant font-label-sm text-label-sm hover:text-on-surface transition-colors">Cancel</button>
              <button onClick={handleAddTransaction} disabled={savingTx} className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {savingTx ? 'Saving…' : 'Add Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button
            onClick={() => setSelectedWalletId(null)}
            className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm mb-3 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            All Wallets
          </button>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm mb-2 uppercase tracking-widest">
            <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
            Wallet
          </div>
          <h1 className="font-display-xl text-display-xl text-on-surface">{portfolio.name}</h1>
          {(portfolio.chainAddress || portfolio.lastImportTime) && (
            <div className="flex flex-wrap items-center gap-4 mt-3">
              {portfolio.chainAddress && (
                <a
                  href={addressExplorerUrl(portfolio.chainType, portfolio.chainAddress) ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-mono text-xs text-on-surface-variant hover:text-primary transition-colors"
                  title={portfolio.chainAddress}
                >
                  <span className="material-symbols-outlined text-[14px]">link</span>
                  {portfolio.chainAddress.slice(0, 8)}…{portfolio.chainAddress.slice(-6)}
                </a>
              )}
              {portfolio.lastImportTime && (
                <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  Last synced {formatRelative(portfolio.lastImportTime)}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={handleExportCsv} className="px-4 py-2 rounded-lg bg-surface-container-high border border-outline-variant text-on-surface font-label-sm text-label-sm hover:bg-surface-bright transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
          {portfolio.chainType && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-4 py-2 rounded-lg border font-label-sm text-label-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: CHAIN_META[portfolio.chainType]?.color + '55', color: CHAIN_META[portfolio.chainType]?.color, backgroundColor: CHAIN_META[portfolio.chainType]?.bg }}
            >
              <span className="material-symbols-outlined text-[18px]">{importing ? 'sync' : 'travel_explore'}</span>
              {importing ? 'Scanning…' : `Scan ${portfolio.chainType} Wallet`}
            </button>
          )}
          <button
            onClick={openAddTx}
            className="px-4 py-2 rounded-lg bg-primary-container text-on-primary-container font-label-sm text-label-sm hover:bg-inverse-primary transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Transaction
          </button>
        </div>
      </div>

      {/* Import result banner */}
      {importResult && !importResult.error && (
        <div className="flex items-center gap-4 bg-surface-container rounded-xl px-5 py-3 border border-outline-variant/30">
          <span className="material-symbols-outlined text-secondary">check_circle</span>
          <span className="font-label-sm text-label-sm text-on-surface">
            Import complete — <span className="text-secondary font-medium">{importResult.imported} new</span>, {importResult.skipped} skipped, {importResult.failed} failed
          </span>
          <button onClick={() => setImportResult(null)} className="ml-auto text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
      {importResult?.error && (
        <div className="flex items-center gap-4 bg-error/10 rounded-xl px-5 py-3 border border-error/30">
          <span className="material-symbols-outlined text-error">error</span>
          <span className="font-label-sm text-label-sm text-error">{importResult.message ?? 'Import failed. Check that your API key and wallet address are configured correctly.'}</span>
          <button onClick={() => setImportResult(null)} className="ml-auto text-error/70 hover:text-error">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-layout-gutter">

        {/* Summary Cards */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-layout-gutter">
          <div className="bg-surface-container rounded-xl p-lg border-t border-white/[0.08] border-x border-b border-surface-container-lowest relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-4">Current Market Value</h2>
            <div className="font-display-xl text-display-xl text-on-surface mb-2 tracking-tight">{formatEur(totalCurrentValue)}</div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full font-label-sm text-label-sm flex items-center ${isPortfolioProfit ? 'bg-secondary-container/10 text-secondary' : 'bg-error-container/20 text-error'}`}>
                <span className="material-symbols-outlined text-[14px] mr-1">{isPortfolioProfit ? 'trending_up' : 'trending_down'}</span>
                {profitPct}
              </span>
              <span className="text-on-surface-variant font-label-sm text-label-sm">{formatEur(totalProfit)}</span>
            </div>
          </div>

          <div className="bg-surface-container rounded-xl p-lg border-t border-white/[0.08] border-x border-b border-surface-container-lowest">
            <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-4">Total Cost Basis</h2>
            <div className="font-heading-lg text-heading-lg text-on-surface mb-2">{formatEur(totalInvested)}</div>
            <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span>All-time ROI</span>
              <span className={`font-data-mono text-data-mono ${isPortfolioProfit ? 'text-secondary' : 'text-error'}`}>{profitPct}</span>
            </div>
          </div>

          <div className="bg-surface-container rounded-xl p-lg border-t border-white/[0.08] border-x border-b border-surface-container-lowest">
            <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-4">Unrealized P&amp;L</h2>
            <div className={`font-heading-lg text-heading-lg mb-2 ${isPortfolioProfit ? 'text-secondary' : 'text-error'}`}>{formatEur(totalProfit)}</div>
            <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-4">
              <div
                className={`h-1.5 rounded-full ${isPortfolioProfit ? 'bg-secondary' : 'bg-error'}`}
                style={{ width: `${Math.min(Math.abs((totalProfit / (totalInvested || 1)) * 100), 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container rounded-xl p-lg border-t border-white/[0.08] border-x border-b border-surface-container-lowest flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-heading-md text-heading-md text-on-surface">Cost vs Market Value</h2>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                  <span className="w-3 h-0.5 bg-[#c3c0ff] inline-block rounded"></span>
                  Market Value
                </div>
                <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                  <span className="w-3 border-t-2 border-dashed border-[#4edea3] inline-block opacity-70"></span>
                  Cost Basis
                </div>
              </div>
            </div>
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

          <div className="flex-1 relative min-h-[280px] w-full">
            {chartPoints.length < 2 ? (
              <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant font-label-sm text-label-sm">
                No transaction data for this period.
              </div>
            ) : (
              <>
                <div className="absolute left-0 top-0 bottom-8 w-20 flex flex-col justify-between text-[10px] text-outline font-data-mono pr-2 pointer-events-none">
                  <span>{formatEur(maxV)}</span>
                  <span>{formatEur((maxV + minV) / 2)}</span>
                  <span>{formatEur(minV)}</span>
                </div>
                <div className="absolute left-20 right-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-full border-t border-outline-variant/10 border-dashed"></div>
                  ))}
                </div>
                <svg
                  className="absolute left-20 top-0 bottom-8 w-[calc(100%-80px)] h-[calc(100%-32px)]"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#c3c0ff" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#c3c0ff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {valueAreaPath && <path d={valueAreaPath} fill="url(#chartGrad)" />}
                  {valuePath && <path d={valuePath} fill="none" stroke="#c3c0ff" strokeWidth="2" vectorEffect="non-scaling-stroke" />}
                  {costPath && (
                    <path d={costPath} fill="none" stroke="#4edea3" strokeWidth="1.5" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" opacity="0.7" />
                  )}
                </svg>
                <div className="absolute bottom-0 left-20 right-0 flex justify-between text-[10px] text-outline font-data-mono">
                  {getChartLabels(activeRange).map((l) => <span key={l}>{l}</span>)}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Holdings Table */}
        <div className="col-span-12 bg-surface-container rounded-xl border-t border-white/[0.08] border-x border-b border-surface-container-lowest overflow-hidden">
          <div className="p-lg border-b border-surface-container-highest flex justify-between items-center">
            <h2 className="font-heading-md text-heading-md text-on-surface">Holdings</h2>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg pl-10 pr-4 py-2 text-on-surface font-label-sm text-label-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-64 placeholder:text-on-surface-variant/50"
                placeholder="Search assets..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                {filteredAssets.map((asset, idx) => {
                  const meta = coinMeta(asset.coinId);
                  const avgBuyPrice = asset.totalAmount > 0 ? asset.totalInvested / asset.totalAmount : 0;
                  const isProfit = asset.profit >= 0;
                  const profitPctAsset = formatPct(asset.profit, asset.totalInvested);
                  return (
                    <tr
                      key={asset.id}
                      className={`hover:bg-surface-container-highest/50 transition-colors${idx < filteredAssets.length - 1 ? ' border-b border-surface-container-highest' : ''}`}
                    >
                      <td className="py-4 px-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${meta.color}33`, color: meta.color }}
                          >
                            <span className="material-symbols-outlined text-[18px]">{meta.mui}</span>
                          </div>
                          <div>
                            <div className="font-body-md text-body-md font-medium">{meta.name}</div>
                            <div className="font-label-sm text-label-sm text-on-surface-variant">{meta.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-lg text-right">{asset.totalAmount?.toFixed(8)}</td>
                      <td className="py-4 px-lg text-right text-on-surface-variant">{formatEur(avgBuyPrice)}</td>
                      <td className="py-4 px-lg text-right">{formatEur(asset.currentPrice)}</td>
                      <td className="py-4 px-lg text-right">
                        <div className={`mb-1 ${isProfit ? 'text-secondary' : 'text-error'}`}>
                          {(isProfit ? '+' : '') + formatEur(asset.profit)}
                        </div>
                        <div className={`font-label-sm text-label-sm px-2 py-0.5 rounded inline-block ${isProfit ? 'bg-secondary-container/10 text-secondary' : 'bg-error-container/20 text-error'}`}>
                          {profitPctAsset}
                        </div>
                      </td>
                      <td className="py-4 px-lg text-right font-medium">{formatEur(asset.currentValue)}</td>
                    </tr>
                  );
                })}
                {filteredAssets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-on-surface-variant font-label-sm text-label-sm">
                      No assets found.{' '}
                      <button onClick={openAddTx} className="text-primary underline">Add a transaction</button> to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Wallet;
