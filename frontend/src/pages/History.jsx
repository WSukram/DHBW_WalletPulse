import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { downloadCsv } from '../utils/exportCsv';
import { coinMeta } from '../utils/coins';
import { usePortfolioData } from '../hooks/usePortfolioData';
import EditTransactionModal from '../components/history/EditTransactionModal';
import DeleteTransactionModal from '../components/history/DeleteTransactionModal';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
};

const explorerUrl = (chainType, txHash) => {
  if (!txHash || !chainType) return null;
  switch (chainType) {
    case 'ETH': return `https://etherscan.io/tx/${txHash}`;
    case 'BTC': return `https://blockstream.info/tx/${txHash}`;
    case 'SOL': return `https://solscan.io/tx/${txHash}`;
    default: return null;
  }
};

const PAGE_SIZE = 10;

const History = () => {
  useEffect(() => { document.title = 'History · WalletPulse'; }, []);
  const { formatCurrency: formatEur } = useApp();
  const { wallets, transactions: allTransactions, isLoading, error, reload } = usePortfolioData();
  const [activeWallet, setActiveWallet] = useState('all');
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

  const openEdit = (tx) => {
    setEditTx(tx);
    setEditForm({ amount: String(tx.amount), buyPrice: String(tx.buyPrice), date: tx.date });
    setEditError('');
  };

  const handleSaveEdit = () => {
    const amount = parseFloat(editForm.amount);
    const buyPrice = parseFloat(editForm.buyPrice);
    if (!editForm.date || isNaN(amount) || amount <= 0) { setEditError('Amount must be a positive number.'); return; }
    if (isNaN(buyPrice) || buyPrice < 0) { setEditError('Buy price must be zero or a positive number.'); return; }
    setSavingEdit(true);
    setEditError('');
    axios.put(`/api/transactions/${editTx.id}`, { amount, buyPrice, date: editForm.date })
      .then(() => reload())
      .then(() => { setEditTx(null); setSavingEdit(false); })
      .catch(() => { setEditError('Failed to save changes.'); setSavingEdit(false); });
  };

  const handleDelete = () => {
    setDeleting(true);
    axios.delete(`/api/transactions/${deleteTx.id}`)
      .then(() => reload())
      .then(() => { setDeleteTx(null); setDeleting(false); })
      .catch(() => setDeleting(false));
  };

  if (isLoading) return <div className="p-6 text-on-surface text-center">Loading Live-Data from Backend...</div>;
  if (error) return <div className="p-6 text-error text-center">{error}</div>;

  const walletOptions = [{ id: 'all', name: 'All Wallets' }, ...wallets.map((w) => ({ id: w.id, name: w.name }))];
  const uniqueCoins = [...new Set(allTransactions.map((tx) => tx.coinId))];
  const assetOptions = ['All Assets', ...uniqueCoins];

  const filtered = allTransactions.filter((tx) => {
    const walletMatch = activeWallet === 'all' || tx.walletId === activeWallet;
    const assetMatch = assetFilter === 'All Assets' || tx.coinId === assetFilter;
    return walletMatch && assetMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleWalletChange = (id) => { setActiveWallet(id); setPage(1); };
  const handleAssetChange = (e) => { setAssetFilter(e.target.value); setPage(1); };

  const handleExportCsv = () => {
    const headers = ['Date', 'Asset', 'Symbol', 'Amount', 'Buy Price (EUR)', 'Total Value (EUR)', 'Wallet', 'Source', 'Tx Hash'];
    const rows = filtered.map((tx) => {
      const meta = coinMeta(tx.coinId);
      return [tx.date, meta.name, meta.symbol, tx.amount, tx.buyPrice, tx.amount * tx.buyPrice, tx.walletName, tx.source ?? 'MANUAL', tx.txHash ?? ''];
    });
    const activeName = walletOptions.find((w) => w.id === activeWallet)?.name ?? 'all';
    const walletSlug = activeWallet === 'all' ? 'all' : activeName.replace(/\s+/g, '_');
    downloadCsv(`transactions_${walletSlug}.csv`, headers, rows);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-layout-margin flex flex-col gap-6">

      <EditTransactionModal
        tx={editTx}
        form={editForm}
        setForm={setEditForm}
        saving={savingEdit}
        errorMsg={editError}
        onClose={() => setEditTx(null)}
        onSave={handleSaveEdit}
        formatEur={formatEur}
      />

      <DeleteTransactionModal
        tx={deleteTx}
        deleting={deleting}
        onClose={() => setDeleteTx(null)}
        onConfirm={handleDelete}
        formatEur={formatEur}
        formatDate={formatDate}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="font-heading-lg text-heading-lg text-on-surface mb-1">Transaction History</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">A comprehensive log of all actions across connected wallets.</p>
        </div>
        <button onClick={handleExportCsv} className="flex items-center gap-2 px-4 py-2 bg-surface-container-high border border-outline-variant rounded-lg hover:bg-surface-bright transition-colors font-label-sm text-label-sm text-on-surface">
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
          {walletOptions.map((w) => (
            <button
              key={w.id}
              onClick={() => handleWalletChange(w.id)}
              className={`px-3 py-1.5 rounded font-label-sm text-label-sm transition-colors ${
                activeWallet === w.id
                  ? 'bg-surface-bright text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              {w.name}
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
                {['Date', 'Asset', 'Amount', 'Buy Price', 'Total Value', 'Wallet', 'Source', 'Actions'].map((col, i) => (
                  <th
                    key={col}
                    className={`px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider${
                      i >= 2 && i <= 4 ? ' text-right' : i === 7 ? ' text-center' : ''
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
                      <div className="flex flex-col gap-1">
                        {tx.source === 'IMPORTED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-tertiary/15 text-tertiary w-fit">
                            <span className="material-symbols-outlined text-[12px]">link</span>
                            Imported
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container-high text-on-surface-variant w-fit">
                            <span className="material-symbols-outlined text-[12px]">edit_note</span>
                            Manual
                          </span>
                        )}
                        {explorerUrl(tx.chainType, tx.txHash) && (
                          <a
                            href={explorerUrl(tx.chainType, tx.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[10px] text-primary/70 hover:text-primary transition-colors truncate max-w-[120px]"
                            title={tx.txHash}
                          >
                            {tx.txHash.slice(0, 8)}…{tx.txHash.slice(-6)}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
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
                  <td colSpan={8} className="px-6 py-8 text-center text-on-surface-variant font-label-sm text-label-sm">
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
