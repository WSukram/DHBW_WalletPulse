import React, { useState, useEffect } from 'react';
import axios from 'axios';

const COIN_META = {
  bitcoin:  { name: 'Bitcoin',  symbol: 'BTC', color: '#F7931A', icon: '₿' },
  ethereum: { name: 'Ethereum', symbol: 'ETH', color: '#627EEA', icon: 'Ξ' },
  solana:   { name: 'Solana',   symbol: 'SOL', color: '#14F195', icon: 'S' },
};

const coinMeta = (coinId) =>
  COIN_META[coinId] ?? {
    name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
    symbol: coinId.slice(0, 4).toUpperCase(),
    color: '#888888',
    icon: coinId[0].toUpperCase(),
  };

const formatEur = (value) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value ?? 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
};

const inputCls = 'w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/50';
const labelCls = 'block font-label-sm text-label-sm text-on-surface-variant mb-1';

const PAGE_SIZE = 10;

const History = () => {
  const [wallets, setWallets] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeWallet, setActiveWallet] = useState('All Wallets');
  const [assetFilter, setAssetFilter] = useState('All Assets');
  const [page, setPage] = useState(1);

  // Edit modal state
  const [editTx, setEditTx] = useState(null);
  const [editForm, setEditForm] = useState({ amount: '', buyPrice: '', date: '' });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete confirmation state
  const [deleteTx, setDeleteTx] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadAll = () =>
    axios.get('http://localhost:8080/api/wallets')
      .then((res) => {
        const walletList = res.data;
        setWallets(walletList);
        return Promise.all(
          walletList.map((w) =>
            axios.get(`http://localhost:8080/api/wallets/${w.id}/portfolio`).then((r) => ({
              wallet: w,
              portfolio: r.data,
            }))
          )
        );
      })
      .then((walletPortfolios) =>
        Promise.all(
          walletPortfolios.flatMap(({ wallet, portfolio }) =>
            (portfolio.assets ?? []).map((asset) =>
              axios.get(`http://localhost:8080/api/assets/${asset.id}/transactions`).then((r) =>
                r.data.map((tx) => ({
                  ...tx,
                  coinId: asset.coinId,
                  walletId: wallet.id,
                  walletName: wallet.name,
                }))
              )
            )
          )
        )
      )
      .then((txArrays) => {
        const flat = txArrays.flat().sort((a, b) => new Date(b.date) - new Date(a.date));
        setAllTransactions(flat);
      });

  useEffect(() => {
    loadAll()
      .then(() => setIsLoading(false))
      .catch(() => { setError('Failed to load transaction history.'); setIsLoading(false); });
  }, []);

  const openEdit = (tx) => {
    setEditTx(tx);
    setEditForm({ amount: String(tx.amount), buyPrice: String(tx.buyPrice), date: tx.date });
    setEditError('');
  };

  const handleSaveEdit = () => {
    const amount = parseFloat(editForm.amount);
    const buyPrice = parseFloat(editForm.buyPrice);
    if (!editForm.date || isNaN(amount) || amount <= 0) { setEditError('Amount must be a positive number.'); return; }
    if (isNaN(buyPrice) || buyPrice <= 0) { setEditError('Buy price must be a positive number.'); return; }
    setSavingEdit(true);
    setEditError('');
    axios.put(`http://localhost:8080/api/transactions/${editTx.id}`, { amount, buyPrice, date: editForm.date })
      .then(() => loadAll())
      .then(() => { setEditTx(null); setSavingEdit(false); })
      .catch(() => { setEditError('Failed to save changes.'); setSavingEdit(false); });
  };

  const handleDelete = () => {
    setDeleting(true);
    axios.delete(`http://localhost:8080/api/transactions/${deleteTx.id}`)
      .then(() => loadAll())
      .then(() => { setDeleteTx(null); setDeleting(false); })
      .catch(() => setDeleting(false));
  };

  if (isLoading) return <div className="p-6 text-on-surface text-center">Loading Live-Data from Backend...</div>;
  if (error) return <div className="p-6 text-error text-center">{error}</div>;

  const walletNames = ['All Wallets', ...wallets.map((w) => w.name)];
  const uniqueCoins = [...new Set(allTransactions.map((tx) => tx.coinId))];
  const assetOptions = ['All Assets', ...uniqueCoins];

  const filtered = allTransactions.filter((tx) => {
    const walletMatch = activeWallet === 'All Wallets' || tx.walletName === activeWallet;
    const assetMatch = assetFilter === 'All Assets' || tx.coinId === assetFilter;
    return walletMatch && assetMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleWalletChange = (name) => { setActiveWallet(name); setPage(1); };
  const handleAssetChange = (e) => { setAssetFilter(e.target.value); setPage(1); };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-layout-margin flex flex-col gap-6">

      {/* Edit Modal */}
      {editTx && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setEditTx(null)}>
          <div className="bg-surface-container rounded-xl p-6 w-full max-w-md border border-outline-variant/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading-md text-heading-md text-on-surface mb-1">Edit Transaction</h3>
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: `${coinMeta(editTx.coinId).color}1a`, color: coinMeta(editTx.coinId).color }}
              >
                {coinMeta(editTx.coinId).icon}
              </div>
              <span className="text-sm text-on-surface-variant">{coinMeta(editTx.coinId).name} · {editTx.walletName}</span>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className={inputCls}
                    value={editForm.amount}
                    onChange={(e) => setEditForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Buy Price (EUR)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className={inputCls}
                    value={editForm.buyPrice}
                    onChange={(e) => setEditForm((f) => ({ ...f, buyPrice: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Purchase Date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={editForm.date}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              {editForm.amount && editForm.buyPrice && (
                <div className="bg-surface-container-highest rounded-lg px-4 py-3 text-sm text-on-surface-variant">
                  Total cost: <span className="font-data-mono text-on-surface">
                    {formatEur(parseFloat(editForm.amount || 0) * parseFloat(editForm.buyPrice || 0))}
                  </span>
                </div>
              )}
              {editError && <p className="text-error text-sm">{editError}</p>}
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setEditTx(null)} className="px-4 py-2 rounded-lg text-on-surface-variant font-label-sm text-label-sm hover:text-on-surface transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingEdit ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTx && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setDeleteTx(null)}>
          <div className="bg-surface-container rounded-xl p-6 w-full max-w-sm border border-outline-variant/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-error text-[20px]">delete</span>
            </div>
            <h3 className="font-heading-md text-heading-md text-on-surface mb-2">Delete Transaction</h3>
            <p className="text-sm text-on-surface-variant mb-1">
              {coinMeta(deleteTx.coinId).name} · {deleteTx.amount.toFixed(8)} units
            </p>
            <p className="text-sm text-on-surface-variant mb-5">
              Purchased on {formatDate(deleteTx.date)} at {formatEur(deleteTx.buyPrice)}/unit
            </p>
            <p className="text-sm text-error/80 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTx(null)} className="px-4 py-2 rounded-lg text-on-surface-variant font-label-sm text-label-sm hover:text-on-surface transition-colors">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-error text-on-error font-label-sm text-label-sm hover:bg-error/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="font-heading-lg text-heading-lg text-on-surface mb-1">Transaction History</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">A comprehensive log of all actions across connected wallets.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-high border border-outline-variant rounded-lg hover:bg-surface-bright transition-colors font-label-sm text-label-sm text-on-surface">
          <span className="material-symbols-outlined text-[16px]">download</span>
          Export CSV
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <select
              className="appearance-none pl-4 pr-10 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-label-sm text-label-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer hover:border-outline"
              value={assetFilter}
              onChange={handleAssetChange}
            >
              {assetOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === 'All Assets' ? 'All Assets' : `${coinMeta(opt).name} (${coinMeta(opt).symbol})`}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">token</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-surface-container-lowest border border-outline-variant rounded-lg p-1">
          {walletNames.map((w) => (
            <button
              key={w}
              onClick={() => handleWalletChange(w)}
              className={`px-3 py-1.5 rounded font-label-sm text-label-sm transition-colors ${
                activeWallet === w
                  ? 'bg-surface-bright text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container/30">
                {['Date', 'Asset', 'Amount', 'Buy Price', 'Total Value', 'Wallet', 'Actions'].map((col, i) => (
                  <th
                    key={col}
                    className={`px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider${
                      i >= 2 && i <= 4 ? ' text-right' : i === 6 ? ' text-center' : ''
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {paginated.map((tx) => {
                const meta = coinMeta(tx.coinId);
                const total = tx.amount * tx.buyPrice;
                return (
                  <tr key={tx.id} className="hover:bg-surface-container-highest/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-data-mono text-data-mono text-on-surface">{formatDate(tx.date)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center border font-bold text-xs"
                          style={{ backgroundColor: `${meta.color}1a`, borderColor: `${meta.color}33`, color: meta.color }}
                        >
                          {meta.icon}
                        </div>
                        <div>
                          <div className="font-label-sm text-label-sm text-on-surface">{meta.name}</div>
                          <div className="text-xs text-on-surface-variant font-mono">{meta.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-data-mono text-data-mono text-secondary">
                      +{tx.amount.toFixed(8)}
                    </td>
                    <td className="px-6 py-4 text-right font-data-mono text-data-mono text-on-surface-variant">
                      {formatEur(tx.buyPrice)}
                    </td>
                    <td className="px-6 py-4 text-right font-data-mono text-data-mono text-on-surface">
                      {formatEur(total)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-outline">account_balance_wallet</span>
                        {tx.walletName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(tx)}
                          title="Edit transaction"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteTx(tx)}
                          title="Delete transaction"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-on-surface-variant font-label-sm text-label-sm">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container/30 flex items-center justify-between">
          <div className="font-label-sm text-label-sm text-on-surface-variant">
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} transactions
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-high text-on-surface-variant disabled:opacity-50 disabled:cursor-not-allowed hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPages || Math.abs(n - currentPage) <= 1)
              .reduce((acc, n, i, arr) => {
                if (i > 0 && n - arr[i - 1] > 1) acc.push('...');
                acc.push(n);
                return acc;
              }, [])
              .map((item, i) =>
                item === '...'
                  ? <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-on-surface-variant font-label-sm text-label-sm">...</span>
                  : <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`w-8 h-8 flex items-center justify-center rounded font-label-sm text-label-sm transition-colors ${
                        currentPage === item
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright'
                      }`}
                    >
                      {item}
                    </button>
              )
            }
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-high text-on-surface-variant disabled:opacity-50 disabled:cursor-not-allowed hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
