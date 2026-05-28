import React, { useState } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { downloadCsv } from '../utils/exportCsv';
import { coinMeta } from '../utils/coins';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { usePageTitle } from '../hooks/usePageTitle';
import EditTransactionModal from '../components/history/EditTransactionModal';
import DeleteTransactionModal from '../components/history/DeleteTransactionModal';
import { LIGHT, DARK, headlineStyle, monoStyle, usePrefersDark } from '../theme/softStack';

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

const coinTint = (coinId, t) => {
  switch (coinId) {
    case 'bitcoin':  return { bg: t.CREAM_CHIP,    border: t.CREAM_CHIP_BORDER };
    case 'ethereum': return { bg: t.LAVENDER,      border: t.HAIR_HEAVY };
    case 'solana':   return { bg: t.MINT_BG,       border: t.MINT_CIRCLE_BORDER };
    default:         return { bg: t.CARD_3,        border: t.HAIR_HEAVY };
  }
};

const History = () => {
  usePageTitle('History');
  const isDark = usePrefersDark();
  const t = isDark ? DARK : LIGHT;
  const { formatCurrency: formatEur } = useApp();
  const { wallets, transactions: allTransactions, isLoading, error, reload } = usePortfolioData();
  const [activeWallet, setActiveWallet] = useState('all');
  const [assetFilter, setAssetFilter] = useState('All Assets');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [editTx, setEditTx] = useState(null);
  const [editForm, setEditForm] = useState({ amount: '', buyPrice: '', date: '' });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

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

  const eyebrow = { ...monoStyle, fontSize: 10, letterSpacing: '0.22em', color: t.SUBINK, textTransform: 'uppercase' };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center gap-3" role="status" aria-live="polite">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: t.MINT_DEEP, boxShadow: `0 0 16px ${t.MINT}` }} />
            <span style={{ ...monoStyle, fontSize: 12, letterSpacing: '0.2em', color: t.SUBINK }}>LOADING · LIVE DATA</span>
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
          <div style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.22em', color: t.RED_DEEP, marginBottom: 8 }}>ERROR</div>
          <div style={{ ...headlineStyle, fontSize: 18, fontWeight: 600 }}>{error}</div>
        </div>
      </div>
    );
  }

  const walletOptions = [{ id: 'all', name: 'All Wallets' }, ...wallets.map((w) => ({ id: w.id, name: w.name }))];
  const uniqueCoins = [...new Set(allTransactions.map((tx) => tx.coinId))];
  const assetOptions = ['All Assets', ...uniqueCoins];

  const q = search.trim().toLowerCase();
  const filtered = allTransactions.filter((tx) => {
    const walletMatch = activeWallet === 'all' || tx.walletId === activeWallet;
    const assetMatch = assetFilter === 'All Assets' || tx.coinId === assetFilter;
    if (!walletMatch || !assetMatch) return false;
    if (!q) return true;
    const meta = coinMeta(tx.coinId);
    return (
      meta.name.toLowerCase().includes(q) ||
      meta.symbol.toLowerCase().includes(q) ||
      (tx.walletName || '').toLowerCase().includes(q) ||
      (tx.txHash || '').toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleWalletChange = (id) => { setActiveWallet(id); setPage(1); };
  const handleAssetChange = (id) => { setAssetFilter(id); setPage(1); };
  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(1); };

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

  const chipBase = {
    padding: '8px 14px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 160ms ease, color 160ms ease, border-color 160ms ease',
    border: `1px solid ${t.HAIR_HEAVY}`,
    background: t.CARD,
    color: t.SUBINK,
  };
  const chipActive = {
    ...chipBase,
    background: t.MINT_BG,
    color: t.MINT_DEEP,
    border: `1px solid ${t.MINT_CIRCLE_BORDER}`,
    fontWeight: 600,
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 max-w-[1240px] mx-auto w-full">
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
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
        <div>
          <div style={eyebrow}>ACTIVITY · TRANSACTION HISTORY</div>
          <h1
            className="mt-2"
            style={{ ...headlineStyle, fontSize: 'clamp(34px, 4.4vw, 48px)', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1, color: t.INK }}
          >
            History
          </h1>
          <p className="mt-3 text-[15px]" style={{ color: t.SUBINK }}>
            A comprehensive log of every action across your connected wallets.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 self-start sm:self-auto"
          style={{
            padding: '11px 18px',
            borderRadius: 999,
            background: t.CARD,
            color: t.INK,
            border: `1px solid ${t.HAIR_HEAVY}`,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: t.SH_PILL,
            cursor: 'pointer',
            transition: 'background-color 160ms ease, transform 160ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = t.CARD_2; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = t.CARD; }}
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div
        className="rounded-[24px] p-5"
        style={{ background: t.CARD, border: `1px solid ${t.HAIR_HEAVY}`, boxShadow: t.SH_CARD }}
      >
        <div className="flex flex-col gap-4">
          <div className="relative">
            <span
              className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[18px]"
              style={{ color: t.SUBINK }}
            >
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by asset, wallet or tx hash…"
              style={{
                width: '100%',
                padding: '11px 14px 11px 44px',
                borderRadius: 999,
                background: t.PAPER,
                border: `1px solid ${t.HAIR_HEAVY}`,
                color: t.INK,
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 160ms ease, box-shadow 160ms ease',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = t.MINT_DEEP; e.currentTarget.style.boxShadow = `0 0 0 3px ${t.MINT_BG}`; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = t.HAIR_HEAVY; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <div style={{ ...eyebrow, marginBottom: 8 }}>WALLET</div>
              <div className="flex flex-wrap gap-2">
                {walletOptions.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => handleWalletChange(w.id)}
                    style={activeWallet === w.id ? chipActive : chipBase}
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ ...eyebrow, marginBottom: 8 }}>ASSET</div>
              <div className="flex flex-wrap gap-2">
                {assetOptions.map((opt) => {
                  const label = opt === 'All Assets' ? 'All Assets' : `${coinMeta(opt).name} (${coinMeta(opt).symbol})`;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleAssetChange(opt)}
                      style={assetFilter === opt ? chipActive : chipBase}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction list */}
      <div
        className="rounded-[24px] overflow-hidden"
        style={{ background: t.CARD, border: `1px solid ${t.HAIR_HEAVY}`, boxShadow: t.SH_CARD }}
      >
        {/* Column headers (desktop only) */}
        <div
          className="hidden md:grid items-center gap-4 px-6 py-3"
          style={{
            gridTemplateColumns: '110px 1.4fr 120px 1fr 1fr 1fr 130px 88px',
            borderBottom: `1px solid ${t.HAIR_DIV}`,
            background: t.CARD_2,
          }}
        >
          {['Date', 'Asset', 'Type', 'Amount', 'Buy price', 'Total', 'Wallet', ''].map((c, i) => (
            <div
              key={i}
              style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.SUBINK }}
              className={i >= 3 && i <= 5 ? 'text-right' : i === 7 ? 'text-right' : ''}
            >
              {c}
            </div>
          ))}
        </div>

        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
              style={{ background: t.CREAM_CHIP, border: `1px solid ${t.CREAM_CHIP_BORDER}`, color: t.CREAM_DEEP }}
            >
              <span className="material-symbols-outlined text-[24px]">history</span>
            </div>
            <div style={{ ...headlineStyle, fontWeight: 600, fontSize: 18, color: t.INK }}>No transactions found</div>
            <div className="mt-1 text-[14px]" style={{ color: t.SUBINK }}>
              Try a different wallet, asset or search query.
            </div>
          </div>
        ) : (
          paginated.map((tx, idx) => {
            const meta = coinMeta(tx.coinId);
            const total = tx.amount * tx.buyPrice;
            const isImported = tx.source === 'IMPORTED';
            const tint = coinTint(tx.coinId, t);
            const explorer = explorerUrl(tx.chainType, tx.txHash);
            const isSell = tx.amount < 0;
            const typeLabel = isImported ? 'Imported' : isSell ? 'Sell' : 'Buy';
            const typeStyle = isImported
              ? { bg: t.LAVENDER_TINT, fg: t.LAVENDER_TEXT, border: t.HAIR_HEAVY }
              : isSell
                ? { bg: t.RED_BG, fg: t.RED_DEEP, border: t.HAIR_HEAVY }
                : { bg: t.MINT_BG, fg: t.MINT_DEEP, border: t.MINT_CIRCLE_BORDER };

            return (
              <div
                key={tx.id}
                className="px-6 py-4 md:grid md:items-center md:gap-4 flex flex-col gap-3"
                style={{
                  gridTemplateColumns: '110px 1.4fr 120px 1fr 1fr 1fr 130px 88px',
                  borderTop: idx === 0 ? 'none' : `1px solid ${t.HAIR_DIV}`,
                }}
              >
                {/* Date */}
                <div
                  className="tabular-nums"
                  style={{ ...monoStyle, fontSize: 12, color: t.INK }}
                >
                  {formatDate(tx.date)}
                </div>

                {/* Asset */}
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex w-9 h-9 rounded-full items-center justify-center text-[14px] font-bold"
                    style={{ background: tint.bg, border: `1px solid ${tint.border}`, color: t.INK }}
                  >
                    {meta.icon}
                  </span>
                  <div className="flex flex-col">
                    <span style={{ ...headlineStyle, fontWeight: 600, fontSize: 14, color: t.INK }}>{meta.name}</span>
                    <span style={{ ...monoStyle, fontSize: 10, color: t.SUBINK, letterSpacing: '0.08em' }}>{meta.symbol}</span>
                  </div>
                </div>

                {/* Type */}
                <div>
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
                    style={{
                      background: typeStyle.bg,
                      color: typeStyle.fg,
                      border: `1px solid ${typeStyle.border}`,
                      ...monoStyle,
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {isImported ? '◇' : isSell ? '▼' : '▲'} {typeLabel}
                  </span>
                </div>

                {/* Amount */}
                <div
                  className="md:text-right tabular-nums"
                  style={{ ...monoStyle, fontSize: 13, color: isSell ? t.RED_DEEP : t.INK }}
                >
                  <span className="md:hidden mr-2" style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.18em', color: t.SUBINK, textTransform: 'uppercase' }}>Amount</span>
                  {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(8)}
                </div>

                {/* Buy price */}
                <div
                  className="md:text-right tabular-nums"
                  style={{ ...monoStyle, fontSize: 13, color: t.SUBINK }}
                >
                  <span className="md:hidden mr-2" style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.18em', color: t.SUBINK, textTransform: 'uppercase' }}>Buy price</span>
                  {formatEur(tx.buyPrice)}
                </div>

                {/* Total */}
                <div
                  className="md:text-right tabular-nums"
                  style={{ ...monoStyle, fontSize: 13, color: t.INK, fontWeight: 600 }}
                >
                  <span className="md:hidden mr-2" style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.18em', color: t.SUBINK, textTransform: 'uppercase' }}>Total</span>
                  {formatEur(total)}
                </div>

                {/* Wallet */}
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full max-w-full"
                    style={{
                      background: t.CARD_2,
                      border: `1px solid ${t.HAIR_HEAVY}`,
                      ...monoStyle,
                      fontSize: 11,
                      color: t.INK,
                    }}
                    title={tx.walletName}
                  >
                    <span className="material-symbols-outlined text-[14px]" style={{ color: t.SUBINK }}>account_balance_wallet</span>
                    <span className="truncate max-w-[140px]">{tx.walletName}</span>
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center md:justify-end gap-1">
                  {isImported ? (
                    explorer ? (
                      <a
                        href={explorer}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={tx.txHash}
                        className="inline-flex items-center justify-center"
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          color: t.SUBINK,
                          background: 'transparent',
                          transition: 'background-color 160ms ease, color 160ms ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = t.CARD_3; e.currentTarget.style.color = t.LAVENDER_DEEP; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.SUBINK; }}
                      >
                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                      </a>
                    ) : (
                      <span style={{ ...monoStyle, fontSize: 10, color: t.SUBINK }}>—</span>
                    )
                  ) : (
                    <>
                      <button
                        onClick={() => openEdit(tx)}
                        title="Edit transaction"
                        className="inline-flex items-center justify-center"
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          color: t.SUBINK,
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background-color 160ms ease, color 160ms ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = t.CARD_3; e.currentTarget.style.color = t.INK; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.SUBINK; }}
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteTx(tx)}
                        title="Delete transaction"
                        className="inline-flex items-center justify-center"
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          color: t.SUBINK,
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background-color 160ms ease, color 160ms ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = t.RED_BG; e.currentTarget.style.color = t.RED_DEEP; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.SUBINK; }}
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Pagination */}
        {paginated.length > 0 && (
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4"
            style={{ borderTop: `1px solid ${t.HAIR_DIV}`, background: t.CARD_2 }}
          >
            <div style={{ ...monoStyle, fontSize: 11, color: t.SUBINK, letterSpacing: '0.06em' }}>
              {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
              {'–'}
              {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center justify-center"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  background: t.CARD,
                  border: `1px solid ${t.HAIR_HEAVY}`,
                  color: currentPage === 1 ? t.SUBINK : t.INK,
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  transition: 'background-color 160ms ease',
                }}
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
                  item === '...' ? (
                    <span
                      key={`e-${i}`}
                      className="inline-flex items-center justify-center"
                      style={{ width: 34, height: 34, ...monoStyle, fontSize: 12, color: t.SUBINK }}
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className="inline-flex items-center justify-center"
                      style={{
                        minWidth: 34,
                        height: 34,
                        padding: '0 10px',
                        borderRadius: 999,
                        background: currentPage === item ? t.MINT_BG : t.CARD,
                        border: `1px solid ${currentPage === item ? t.MINT_CIRCLE_BORDER : t.HAIR_HEAVY}`,
                        color: currentPage === item ? t.MINT_DEEP : t.INK,
                        ...monoStyle,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background-color 160ms ease',
                      }}
                    >
                      {item}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center justify-center"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  background: t.CARD,
                  border: `1px solid ${t.HAIR_HEAVY}`,
                  color: currentPage === totalPages ? t.SUBINK : t.INK,
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  transition: 'background-color 160ms ease',
                }}
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
