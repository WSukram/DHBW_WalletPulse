import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { downloadCsv } from '../utils/exportCsv';
import { KNOWN_COINS, coinMeta, formatPct } from '../utils/coins';
import { timeRanges, getChartLabels, computePortfolioChartPoints, pointsToPath } from '../utils/chart';
import WalletFormModal from '../components/wallet/WalletFormModal';
import DeleteWalletModal from '../components/wallet/DeleteWalletModal';
import { usePageTitle } from '../hooks/usePageTitle';
import AddTransactionModal from '../components/wallet/AddTransactionModal';
import {
  LIGHT,
  DARK,
  headlineStyle,
  monoStyle,
  bodyFontFamily,
  usePrefersDark,
} from '../theme/softStack';

const CHAIN_META = {
  ETH: { label: 'Ethereum' },
  BTC: { label: 'Bitcoin' },
  SOL: { label: 'Solana' },
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

// Map chain to soft-stack accent tokens (filled at render with t.*)
const chainTint = (t, chain) => {
  switch (chain) {
    case 'ETH': return { bg: t.LAVENDER, fg: t.LAVENDER_TEXT, border: t.HAIR_HEAVY };
    case 'BTC': return { bg: t.CREAM_CHIP, fg: t.CREAM_DEEP, border: t.CREAM_CHIP_BORDER };
    case 'SOL': return { bg: t.MINT_BG, fg: t.MINT_DEEP, border: t.MINT_CIRCLE_BORDER };
    default:    return { bg: t.CARD_3, fg: t.SUBINK, border: t.HAIR_HEAVY };
  }
};

const eyebrowStyle = (t) => ({
  ...monoStyle,
  fontSize: 10,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: t.SUBINK,
});

const Wallet = () => {
  usePageTitle('Wallets');
  const location = useLocation();
  const { formatCurrency: formatEur } = useApp();
  const isDark = usePrefersDark();
  const t = isDark ? DARK : LIGHT;

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
    axios.get('/api/wallets')
      .then((res) =>
        Promise.all(
          res.data.map((w) =>
            axios.get(`/api/wallets/${w.id}/portfolio`).then((r) => ({
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
        axios.get(`/api/assets/${asset.id}/transactions`)
          .then((r) => r.data.map((tx) => ({ ...tx, assetId: asset.id, coinId: asset.coinId })))
      )
    ).then((arrays) => arrays.flat());

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
    axios.post('/api/wallets', body)
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
    axios.put(`/api/wallets/${editWallet.id}`, body)
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
    axios.post(`/api/wallets/${selectedWalletId}/import`)
      .then((res) => {
        setImportResult(res.data);
        setImporting(false);
        return Promise.all([
          axios.get(`/api/wallets/${selectedWalletId}/portfolio`),
          axios.get(`/api/wallets/${selectedWalletId}`),
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
    axios.delete(`/api/wallets/${deleteWallet.id}`)
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
        const res = await axios.post(`/api/wallets/${selectedWalletId}/assets`, { coinId });
        assetId = res.data.id;
      }

      await axios.post(`/api/assets/${assetId}/transactions`, {
        amount: parsedAmount,
        buyPrice: parsedPrice,
        date,
      });

      const updatedPortfolio = await axios.get(`/api/wallets/${selectedWalletId}/portfolio`).then((r) => r.data);
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

  const portfolio = useMemo(
    () => portfolios.find((p) => p.id === selectedWalletId) ?? null,
    [portfolios, selectedWalletId]
  );

  const chartPoints = useMemo(
    () => computePortfolioChartPoints(transactions, portfolio?.assets ?? [], activeRange),
    [transactions, portfolio, activeRange]
  );

  const existingCoinIds = (portfolio?.assets ?? []).map((a) => a.coinId);
  const coinOptions = [
    ...(portfolio?.assets ?? []).map((a) => ({ id: a.coinId, label: `${coinMeta(a.coinId).name} (${coinMeta(a.coinId).symbol}) — in wallet` })),
    ...KNOWN_COINS.filter((c) => !existingCoinIds.includes(c.id)).map((c) => ({ id: c.id, label: `${c.name} (${c.symbol})` })),
  ];

  // ── Shared little components ──────────────────────────────────────────────

  const CoinChip = ({ coinId, size = 36 }) => {
    const meta = coinMeta(coinId);
    const tint = coinId === 'bitcoin'
      ? { bg: t.CREAM_CHIP, fg: t.CREAM_DEEP, border: t.CREAM_CHIP_BORDER }
      : coinId === 'ethereum'
        ? { bg: t.LAVENDER, fg: t.LAVENDER_TEXT, border: t.HAIR_HEAVY }
        : coinId === 'solana'
          ? { bg: t.MINT_BG, fg: t.MINT_DEEP, border: t.MINT_CIRCLE_BORDER }
          : { bg: t.CARD_3, fg: t.SUBINK, border: t.HAIR_HEAVY };
    return (
      <span
        className="inline-flex items-center justify-center shrink-0"
        style={{
          width: size,
          height: size,
          borderRadius: 999,
          background: tint.bg,
          color: tint.fg,
          border: `1px solid ${tint.border}`,
          ...headlineStyle,
          fontWeight: 600,
          fontSize: size * 0.5,
          lineHeight: 1,
        }}
      >
        {meta.icon}
      </span>
    );
  };

  // ── WALLET LIST VIEW ──────────────────────────────────────────────────────
  if (!selectedWalletId) {
    if (isLoadingList) {
      return (
        <div
          className="flex-1 flex items-center justify-center"
          style={{ background: t.PAPER, color: t.SUBINK, fontFamily: bodyFontFamily }}
        >
          Loading live data from backend…
        </div>
      );
    }
    if (error) {
      return (
        <div
          className="flex-1 flex items-center justify-center"
          style={{ background: t.PAPER, color: t.RED_DEEP, fontFamily: bodyFontFamily }}
        >
          {error}
        </div>
      );
    }

    return (
      <div
        className="flex-1 overflow-y-auto"
        style={{ background: t.PAPER, color: t.INK, fontFamily: bodyFontFamily }}
      >
        <WalletFormModal
          mode="create"
          open={showAddWallet}
          name={newWalletName} setName={setNewWalletName}
          chainType={newWalletChainType} setChainType={setNewWalletChainType}
          chainAddress={newWalletChainAddress} setChainAddress={setNewWalletChainAddress}
          saving={savingWallet}
          onClose={() => { setShowAddWallet(false); setNewWalletChainType(''); setNewWalletChainAddress(''); }}
          onSubmit={handleCreateWallet}
        />
        <WalletFormModal
          mode="edit"
          wallet={editWallet}
          name={editWalletName} setName={setEditWalletName}
          chainType={editWalletChainType} setChainType={setEditWalletChainType}
          chainAddress={editWalletChainAddress} setChainAddress={setEditWalletChainAddress}
          saving={savingEditWallet}
          onClose={() => setEditWallet(null)}
          onSubmit={handleEditWallet}
        />
        <DeleteWalletModal
          wallet={deleteWallet}
          deleting={deletingWallet}
          onClose={() => setDeleteWallet(null)}
          onConfirm={handleDeleteWallet}
        />

        <div className="p-6 lg:p-10 space-y-8 max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div style={eyebrowStyle(t)} className="mb-3">PORTFOLIO · WALLETS</div>
              <h1 style={{ ...headlineStyle, fontWeight: 600, fontSize: 44, lineHeight: 1.05, letterSpacing: '-0.02em', color: t.INK }}>
                My wallets
              </h1>
              <p style={{ color: t.SUBINK, fontSize: 15, marginTop: 10 }}>
                Select a wallet to view its portfolio details.
              </p>
            </div>
            <button
              onClick={() => setShowAddWallet(true)}
              style={{
                padding: '12px 22px',
                borderRadius: 999,
                background: t.CTA_INK_BG,
                color: t.CTA_INK_FG,
                fontSize: 14,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: t.SH_CTA_INK,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'box-shadow 160ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = t.SH_CTA_INK_H; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = t.SH_CTA_INK; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
              New wallet
            </button>
          </div>

          {portfolios.length === 0 ? (
            <div
              style={{
                background: t.CARD,
                border: `1px solid ${t.HAIR_HEAVY}`,
                borderRadius: 24,
                boxShadow: t.SH_CARD,
                padding: '56px 32px',
                textAlign: 'center',
              }}
            >
              <span
                className="inline-flex w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{
                  background: t.CREAM_CHIP,
                  border: `1px solid ${t.CREAM_CHIP_BORDER}`,
                  color: t.CREAM_DEEP,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 28 }}>account_balance_wallet</span>
              </span>
              <h3 style={{ ...headlineStyle, fontWeight: 600, fontSize: 22, color: t.INK, marginTop: 4 }}>
                No wallets yet
              </h3>
              <p style={{ color: t.SUBINK, fontSize: 14, marginTop: 8, marginBottom: 20 }}>
                Create your first wallet to start tracking your portfolio.
              </p>
              <button
                onClick={() => setShowAddWallet(true)}
                style={{
                  padding: '12px 22px',
                  borderRadius: 999,
                  background: t.CTA_INK_BG,
                  color: t.CTA_INK_FG,
                  fontSize: 14,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: t.SH_CTA_INK,
                }}
              >
                Create wallet
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {portfolios.map((p) => {
                const isProfit = (p.totalProfit ?? 0) >= 0;
                const tint = chainTint(t, p.chainType);
                return (
                  <button
                    key={p.id}
                    onClick={() => { setSearch(''); setActiveRange('1Y'); setTransactions([]); setSelectedWalletId(p.id); }}
                    className="text-left group"
                    style={{
                      background: t.CARD,
                      border: `1px solid ${t.HAIR_HEAVY}`,
                      borderRadius: 24,
                      boxShadow: t.SH_CARD,
                      padding: 24,
                      transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = t.SH_HERO;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = t.SH_CARD;
                    }}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span
                          className="inline-flex w-11 h-11 rounded-2xl items-center justify-center shrink-0"
                          style={{
                            background: tint.bg,
                            border: `1px solid ${tint.border}`,
                            color: tint.fg,
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>account_balance_wallet</span>
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <div style={{ ...headlineStyle, fontWeight: 600, fontSize: 18, color: t.INK }}>{p.name}</div>
                            {p.chainType && (
                              <span
                                style={{
                                  ...monoStyle,
                                  fontSize: 10,
                                  letterSpacing: '0.18em',
                                  padding: '3px 8px',
                                  borderRadius: 999,
                                  background: tint.bg,
                                  color: tint.fg,
                                  border: `1px solid ${tint.border}`,
                                }}
                              >
                                {p.chainType}
                              </span>
                            )}
                          </div>
                          <div style={{ ...monoStyle, fontSize: 11, letterSpacing: '0.16em', color: t.SUBINK, marginTop: 4 }}>
                            {p.assets?.length ?? 0} {p.assets?.length === 1 ? 'ASSET' : 'ASSETS'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditWalletName(p.name); setEditWalletChainType(p.chainType ?? ''); setEditWalletChainAddress(p.chainAddress ?? ''); setEditWallet(p); }}
                          aria-label="Rename wallet"
                          className="material-symbols-outlined"
                          style={{
                            color: t.SUBINK, fontSize: 18, width: 32, height: 32, borderRadius: 10,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            background: 'transparent', border: 'none', cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = t.CARD_3; e.currentTarget.style.color = t.INK; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.SUBINK; }}
                        >
                          edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteWallet(p); }}
                          aria-label="Delete wallet"
                          className="material-symbols-outlined"
                          style={{
                            color: t.SUBINK, fontSize: 18, width: 32, height: 32, borderRadius: 10,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            background: 'transparent', border: 'none', cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = t.RED_BG; e.currentTarget.style.color = t.RED_DEEP; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.SUBINK; }}
                        >
                          delete
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div style={eyebrowStyle(t)} className="mb-1">CURRENT VALUE</div>
                        <div style={{ ...headlineStyle, fontWeight: 600, fontSize: 28, color: t.INK, letterSpacing: '-0.01em' }}>
                          {formatEur(p.totalCurrentValue)}
                        </div>
                      </div>
                      <div
                        className="flex items-center justify-between pt-3"
                        style={{ borderTop: `1px solid ${t.HAIR_DIV}` }}
                      >
                        <div>
                          <div style={eyebrowStyle(t)}>INVESTED</div>
                          <div style={{ ...monoStyle, fontSize: 13, color: t.SUBINK, marginTop: 4 }}>
                            {formatEur(p.totalInvested)}
                          </div>
                        </div>
                        <div
                          className="flex items-center gap-1"
                          style={{
                            padding: '4px 10px',
                            borderRadius: 999,
                            background: isProfit ? t.MINT_BG : t.RED_BG,
                            color: isProfit ? t.MINT_DEEP : t.RED_DEEP,
                            border: `1px solid ${isProfit ? t.MINT_CIRCLE_BORDER : t.RED_BG_2}`,
                            ...monoStyle,
                            fontSize: 12,
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                            {isProfit ? 'trending_up' : 'trending_down'}
                          </span>
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
      </div>
    );
  }

  // ── WALLET DETAIL VIEW ────────────────────────────────────────────────────
  if (isLoadingDetail || !portfolio) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ background: t.PAPER, color: t.SUBINK, fontFamily: bodyFontFamily }}
      >
        Loading live data from backend…
      </div>
    );
  }
  if (error) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ background: t.PAPER, color: t.RED_DEEP, fontFamily: bodyFontFamily }}
      >
        {error}
      </div>
    );
  }

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

  const tintChain = chainTint(t, portfolio.chainType);

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ background: t.PAPER, color: t.INK, fontFamily: bodyFontFamily }}
    >
      <AddTransactionModal
        open={showAddTx}
        form={txForm} setForm={setTxForm}
        coinOptions={coinOptions}
        saving={savingTx}
        errorMsg={txError}
        onClose={() => setShowAddTx(false)}
        onSave={handleAddTransaction}
        formatEur={formatEur}
      />

      <div className="p-6 lg:p-10 space-y-8 max-w-[1400px] mx-auto">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <button
              onClick={() => setSelectedWalletId(null)}
              className="flex items-center gap-1 mb-4"
              style={{
                color: t.SUBINK,
                fontSize: 13,
                fontWeight: 500,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'color 160ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = t.INK; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = t.SUBINK; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
              All wallets
            </button>
            <div style={eyebrowStyle(t)} className="mb-3">
              BALANCE · WALLET
              {portfolio.chainAddress && (
                <> · {portfolio.chainAddress.slice(0, 6)}…{portfolio.chainAddress.slice(-4)}</>
              )}
            </div>
            <h1 style={{ ...headlineStyle, fontWeight: 600, fontSize: 56, lineHeight: 0.95, letterSpacing: '-0.025em', color: t.INK }}>
              {portfolio.name}
            </h1>
            {(portfolio.chainAddress || portfolio.lastImportTime) && (
              <div className="flex flex-wrap items-center gap-4 mt-4">
                {portfolio.chainType && (
                  <span
                    style={{
                      ...monoStyle,
                      fontSize: 10,
                      letterSpacing: '0.22em',
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: tintChain.bg,
                      color: tintChain.fg,
                      border: `1px solid ${tintChain.border}`,
                    }}
                  >
                    {CHAIN_META[portfolio.chainType]?.label?.toUpperCase() ?? portfolio.chainType}
                  </span>
                )}
                {portfolio.chainAddress && (
                  <a
                    href={addressExplorerUrl(portfolio.chainType, portfolio.chainAddress) ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5"
                    style={{ ...monoStyle, fontSize: 12, color: t.SUBINK, textDecoration: 'none', transition: 'color 160ms ease' }}
                    title={portfolio.chainAddress}
                    onMouseEnter={(e) => { e.currentTarget.style.color = t.INK; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = t.SUBINK; }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>open_in_new</span>
                    {portfolio.chainAddress.slice(0, 8)}…{portfolio.chainAddress.slice(-6)}
                  </a>
                )}
                {portfolio.lastImportTime && (
                  <span className="flex items-center gap-1.5" style={{ fontSize: 12, color: t.SUBINK }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                    Last synced {formatRelative(portfolio.lastImportTime)}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={handleExportCsv}
              style={{
                padding: '10px 18px',
                borderRadius: 999,
                background: t.CARD,
                color: t.INK,
                fontSize: 13,
                fontWeight: 500,
                border: `1px solid ${t.HAIR_HEAVY}`,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'background-color 160ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = t.CARD_3; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = t.CARD; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
              Export
            </button>
            <button
              onClick={() => { setEditWalletName(portfolio.name); setEditWalletChainType(portfolio.chainType ?? ''); setEditWalletChainAddress(portfolio.chainAddress ?? ''); setEditWallet(portfolio); }}
              style={{
                padding: '10px 18px',
                borderRadius: 999,
                background: t.CARD,
                color: t.INK,
                fontSize: 13,
                fontWeight: 500,
                border: `1px solid ${t.HAIR_HEAVY}`,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'background-color 160ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = t.CARD_3; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = t.CARD; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
              Edit
            </button>
            {portfolio.chainType && (
              <button
                onClick={handleImport}
                disabled={importing}
                style={{
                  padding: '10px 18px',
                  borderRadius: 999,
                  background: t.LAVENDER_DEEP,
                  color: t.ON_TINT,
                  fontSize: 13,
                  fontWeight: 600,
                  border: 'none',
                  cursor: importing ? 'not-allowed' : 'pointer',
                  opacity: importing ? 0.7 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: t.SH_BADGE_LAV,
                  transition: 'box-shadow 160ms ease',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  {importing ? 'sync' : 'travel_explore'}
                </span>
                {importing ? 'Scanning…' : `Scan ${portfolio.chainType}`}
              </button>
            )}
            <button
              onClick={openAddTx}
              style={{
                padding: '11px 20px',
                borderRadius: 999,
                background: t.CTA_INK_BG,
                color: t.CTA_INK_FG,
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: t.SH_CTA_INK,
                transition: 'box-shadow 160ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = t.SH_CTA_INK_H; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = t.SH_CTA_INK; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
              Add transaction
            </button>
            <button
              onClick={() => setDeleteWallet(portfolio)}
              style={{
                padding: '10px 14px',
                borderRadius: 999,
                background: 'transparent',
                color: t.SUBINK,
                fontSize: 13,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'color 160ms ease, background-color 160ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = t.RED_DEEP; e.currentTarget.style.background = t.RED_BG; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = t.SUBINK; e.currentTarget.style.background = 'transparent'; }}
            >
              Delete
            </button>
          </div>
        </div>

        {/* Edit + Delete modals when triggered from detail */}
        <WalletFormModal
          mode="edit"
          wallet={editWallet}
          name={editWalletName} setName={setEditWalletName}
          chainType={editWalletChainType} setChainType={setEditWalletChainType}
          chainAddress={editWalletChainAddress} setChainAddress={setEditWalletChainAddress}
          saving={savingEditWallet}
          onClose={() => setEditWallet(null)}
          onSubmit={handleEditWallet}
        />
        <DeleteWalletModal
          wallet={deleteWallet}
          deleting={deletingWallet}
          onClose={() => setDeleteWallet(null)}
          onConfirm={() => {
            const wasSelected = deleteWallet?.id === selectedWalletId;
            handleDeleteWallet();
            if (wasSelected) setSelectedWalletId(null);
          }}
        />

        {/* Import result banner */}
        {importResult && !importResult.error && (
          <div
            className="flex items-center gap-3"
            style={{
              background: t.MINT_BG,
              border: `1px solid ${t.MINT_CIRCLE_BORDER}`,
              borderRadius: 16,
              padding: '12px 18px',
              color: t.INK,
            }}
          >
            <span className="material-symbols-outlined" style={{ color: t.MINT_DEEP }}>check_circle</span>
            <span style={{ fontSize: 14 }}>
              Import complete —{' '}
              <span style={{ color: t.MINT_DEEP, fontWeight: 600 }}>{importResult.imported} new</span>
              , {importResult.skipped} skipped, {importResult.failed} failed
            </span>
            <button
              onClick={() => setImportResult(null)}
              className="ml-auto material-symbols-outlined"
              style={{ color: t.SUBINK, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18 }}
              aria-label="Dismiss"
            >
              close
            </button>
          </div>
        )}
        {importResult?.error && (
          <div
            className="flex items-center gap-3"
            style={{
              background: t.RED_BG,
              border: `1px solid ${t.RED_BG_2}`,
              borderRadius: 16,
              padding: '12px 18px',
              color: t.RED_DEEP,
            }}
          >
            <span className="material-symbols-outlined">error</span>
            <span style={{ fontSize: 14 }}>
              {importResult.message ?? 'Import failed. Check that your API key and wallet address are configured correctly.'}
            </span>
            <button
              onClick={() => setImportResult(null)}
              className="ml-auto material-symbols-outlined"
              style={{ color: t.RED_DEEP, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, opacity: 0.7 }}
              aria-label="Dismiss"
            >
              close
            </button>
          </div>
        )}

        {/* Hero balance card + summary */}
        <div className="grid grid-cols-12 gap-6">
          <div
            className="col-span-12 lg:col-span-5"
            style={{
              background: `linear-gradient(180deg, ${t.CARD} 0%, ${t.CARD_2} 60%, ${t.CARD_3} 100%)`,
              border: `1px solid ${t.HAIR_HEAVY}`,
              borderRadius: 28,
              boxShadow: t.SH_HERO,
              padding: 32,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: -40, right: -60,
                width: 220, height: 220,
                borderRadius: 999,
                background: t.BLOB_MINT,
                filter: 'blur(40px)',
                pointerEvents: 'none',
              }}
            />
            <div style={eyebrowStyle(t)}>BALANCE · CURRENT VALUE</div>
            <div
              style={{
                ...headlineStyle,
                fontWeight: 600,
                fontSize: 60,
                lineHeight: 1,
                letterSpacing: '-0.03em',
                color: t.INK,
                marginTop: 18,
                marginBottom: 18,
              }}
            >
              {formatEur(totalCurrentValue)}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="inline-flex items-center gap-1"
                style={{
                  padding: '5px 12px',
                  borderRadius: 999,
                  background: isPortfolioProfit ? t.MINT_BG : t.RED_BG,
                  color: isPortfolioProfit ? t.MINT_DEEP : t.RED_DEEP,
                  border: `1px solid ${isPortfolioProfit ? t.MINT_CIRCLE_BORDER : t.RED_BG_2}`,
                  ...monoStyle,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  {isPortfolioProfit ? 'trending_up' : 'trending_down'}
                </span>
                {profitPct}
              </span>
              <span style={{ ...monoStyle, fontSize: 13, color: t.SUBINK }}>
                {isPortfolioProfit ? '+' : ''}{formatEur(totalProfit)} all-time
              </span>
            </div>

            <div
              className="grid grid-cols-2 gap-4 mt-8 pt-6"
              style={{ borderTop: `1px solid ${t.HAIR_DIV}` }}
            >
              <div>
                <div style={eyebrowStyle(t)}>INVESTED</div>
                <div style={{ ...headlineStyle, fontWeight: 600, fontSize: 22, color: t.INK, marginTop: 6 }}>
                  {formatEur(totalInvested)}
                </div>
              </div>
              <div>
                <div style={eyebrowStyle(t)}>P&amp;L</div>
                <div
                  style={{
                    ...headlineStyle,
                    fontWeight: 600,
                    fontSize: 22,
                    color: isPortfolioProfit ? t.MINT_DEEP : t.RED_DEEP,
                    marginTop: 6,
                  }}
                >
                  {isPortfolioProfit ? '+' : ''}{formatEur(totalProfit)}
                </div>
              </div>
            </div>
          </div>

          {/* Chart card */}
          <div
            className="col-span-12 lg:col-span-7 flex flex-col"
            style={{
              background: t.CARD,
              border: `1px solid ${t.HAIR_HEAVY}`,
              borderRadius: 28,
              boxShadow: t.SH_CARD,
              padding: 28,
            }}
          >
            <div className="flex justify-between items-start gap-4 mb-6 flex-wrap">
              <div>
                <div style={eyebrowStyle(t)}>VALUE · OVER TIME</div>
                <h2 style={{ ...headlineStyle, fontWeight: 600, fontSize: 20, color: t.INK, marginTop: 6 }}>
                  Cost vs market value
                </h2>
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <div className="flex items-center gap-1.5" style={{ fontSize: 12, color: t.SUBINK }}>
                    <span style={{ width: 14, height: 2, background: t.LAVENDER_DEEP, display: 'inline-block', borderRadius: 2 }} />
                    Market value
                  </div>
                  <div className="flex items-center gap-1.5" style={{ fontSize: 12, color: t.SUBINK }}>
                    <span style={{ width: 14, borderTop: `2px dashed ${t.MINT_DEEP}`, display: 'inline-block', opacity: 0.8 }} />
                    Cost basis
                  </div>
                </div>
              </div>
              <div
                className="flex p-1"
                style={{
                  background: t.CARD_3,
                  border: `1px solid ${t.HAIR_HEAVY}`,
                  borderRadius: 999,
                }}
              >
                {timeRanges.map((range) => (
                  <button
                    key={range}
                    onClick={() => setActiveRange(range)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 500,
                      border: 'none',
                      cursor: 'pointer',
                      background: activeRange === range ? t.CARD : 'transparent',
                      color: activeRange === range ? t.INK : t.SUBINK,
                      boxShadow: activeRange === range ? t.SH_PILL : 'none',
                      transition: 'all 160ms ease',
                    }}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 relative min-h-[280px] w-full">
              {chartPoints.length < 2 ? (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ color: t.SUBINK, fontSize: 13 }}
                >
                  No transaction data for this period.
                </div>
              ) : (
                <>
                  <div
                    className="absolute left-0 top-0 bottom-8 w-20 flex flex-col justify-between pr-2 pointer-events-none"
                    style={{ ...monoStyle, fontSize: 10, color: t.SUBINK }}
                  >
                    <span>{formatEur(maxV)}</span>
                    <span>{formatEur((maxV + minV) / 2)}</span>
                    <span>{formatEur(minV)}</span>
                  </div>
                  <div className="absolute left-20 right-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ borderTop: `1px dashed ${t.HAIR}` }} className="w-full"></div>
                    ))}
                  </div>
                  <svg
                    className="absolute left-20 top-0 bottom-8 w-[calc(100%-80px)] h-[calc(100%-32px)]"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="walletSparkFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={t.MINT} stopOpacity="0.45" />
                        <stop offset="100%" stopColor={t.MINT} stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="walletSparkStroke" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor={t.LAVENDER_DEEP} />
                        <stop offset="100%" stopColor={t.MINT_DEEP} />
                      </linearGradient>
                    </defs>
                    {valueAreaPath && <path d={valueAreaPath} fill="url(#walletSparkFill)" />}
                    {valuePath && (
                      <path
                        d={valuePath}
                        fill="none"
                        stroke="url(#walletSparkStroke)"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                    )}
                    {costPath && (
                      <path
                        d={costPath}
                        fill="none"
                        stroke={t.MINT_DEEP}
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        vectorEffect="non-scaling-stroke"
                        opacity="0.7"
                      />
                    )}
                  </svg>
                  <div
                    className="absolute bottom-0 left-20 right-0 flex justify-between"
                    style={{ ...monoStyle, fontSize: 10, color: t.SUBINK }}
                  >
                    {getChartLabels(activeRange).map((l) => <span key={l}>{l}</span>)}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Holdings */}
        <div
          style={{
            background: t.CARD,
            border: `1px solid ${t.HAIR_HEAVY}`,
            borderRadius: 28,
            boxShadow: t.SH_CARD,
            overflow: 'hidden',
          }}
        >
          <div
            className="flex justify-between items-center gap-4 flex-wrap"
            style={{
              padding: '24px 28px',
              borderBottom: `1px solid ${t.HAIR_DIV}`,
            }}
          >
            <div>
              <div style={eyebrowStyle(t)}>WALLET · HOLDINGS</div>
              <h2 style={{ ...headlineStyle, fontWeight: 600, fontSize: 22, color: t.INK, marginTop: 6 }}>
                Holdings
              </h2>
            </div>
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: t.SUBINK, fontSize: 18 }}
              >
                search
              </span>
              <input
                placeholder="Search assets…"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: t.PAPER,
                  border: `1px solid ${t.HAIR_HEAVY}`,
                  borderRadius: 999,
                  padding: '9px 14px 9px 38px',
                  color: t.INK,
                  fontSize: 13,
                  width: 260,
                  outline: 'none',
                  transition: 'border-color 160ms ease, box-shadow 160ms ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = t.MINT_DEEP;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${t.MINT_BG}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = t.HAIR_HEAVY;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {filteredAssets.length === 0 ? (
            <div className="px-7 py-14 text-center">
              <span
                className="inline-flex w-14 h-14 rounded-full items-center justify-center mb-4"
                style={{
                  background: t.CREAM_CHIP,
                  border: `1px solid ${t.CREAM_CHIP_BORDER}`,
                  color: t.CREAM_DEEP,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 26 }}>account_balance_wallet</span>
              </span>
              <h3 style={{ ...headlineStyle, fontWeight: 600, fontSize: 20, color: t.INK }}>
                No assets yet
              </h3>
              <p style={{ color: t.SUBINK, fontSize: 14, marginTop: 8, marginBottom: 20 }}>
                Add a transaction to get started tracking this wallet.
              </p>
              <button
                onClick={openAddTx}
                style={{
                  padding: '11px 20px',
                  borderRadius: 999,
                  background: t.CTA_INK_BG,
                  color: t.CTA_INK_FG,
                  fontSize: 13,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: t.SH_CTA_INK,
                }}
              >
                Add transaction
              </button>
            </div>
          ) : (
            <div>
              {/* Header row */}
              <div
                className="hidden md:grid"
                style={{
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1.2fr 1fr',
                  padding: '12px 28px',
                  borderBottom: `1px solid ${t.HAIR_DIV}`,
                  background: t.CARD_2,
                  ...monoStyle,
                  fontSize: 10,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: t.SUBINK,
                }}
              >
                <div>Asset</div>
                <div className="text-right">Amount</div>
                <div className="text-right">Avg. buy</div>
                <div className="text-right">Current price</div>
                <div className="text-right">Profit / Loss</div>
                <div className="text-right">Total value</div>
              </div>

              {filteredAssets.map((asset, idx) => {
                const meta = coinMeta(asset.coinId);
                const avgBuyPrice = asset.totalAmount > 0 ? asset.totalInvested / asset.totalAmount : 0;
                const isProfit = asset.profit >= 0;
                const profitPctAsset = formatPct(asset.profit, asset.totalInvested);
                const isLast = idx === filteredAssets.length - 1;
                return (
                  <div
                    key={asset.id}
                    className="md:grid flex flex-col md:flex-row"
                    style={{
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1.2fr 1fr',
                      padding: '18px 28px',
                      borderBottom: isLast ? 'none' : `1px solid ${t.HAIR_DIV}`,
                      transition: 'background-color 160ms ease',
                      alignItems: 'center',
                      gap: 12,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = t.CARD_2; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div className="flex items-center gap-3">
                      <CoinChip coinId={asset.coinId} size={40} />
                      <div>
                        <div style={{ ...headlineStyle, fontWeight: 600, fontSize: 15, color: t.INK }}>{meta.name}</div>
                        <div style={{ ...monoStyle, fontSize: 11, letterSpacing: '0.16em', color: t.SUBINK, marginTop: 2 }}>
                          {meta.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="md:text-right" style={{ ...monoStyle, fontSize: 13, color: t.INK }}>
                      <span className="md:hidden" style={{ ...monoStyle, fontSize: 10, color: t.SUBINK, letterSpacing: '0.22em', marginRight: 8 }}>AMOUNT</span>
                      {asset.totalAmount?.toFixed(8)}
                    </div>
                    <div className="md:text-right" style={{ ...monoStyle, fontSize: 13, color: t.SUBINK }}>
                      <span className="md:hidden" style={{ fontSize: 10, letterSpacing: '0.22em', marginRight: 8 }}>AVG BUY</span>
                      {formatEur(avgBuyPrice)}
                    </div>
                    <div className="md:text-right" style={{ ...monoStyle, fontSize: 13, color: t.INK }}>
                      <span className="md:hidden" style={{ ...monoStyle, fontSize: 10, color: t.SUBINK, letterSpacing: '0.22em', marginRight: 8 }}>PRICE</span>
                      {formatEur(asset.currentPrice)}
                    </div>
                    <div className="md:text-right">
                      <div style={{ ...monoStyle, fontSize: 13, color: isProfit ? t.MINT_DEEP : t.RED_DEEP }}>
                        {(isProfit ? '+' : '') + formatEur(asset.profit)}
                      </div>
                      <span
                        className="inline-block mt-1"
                        style={{
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: isProfit ? t.MINT_BG : t.RED_BG,
                          color: isProfit ? t.MINT_DEEP : t.RED_DEEP,
                          border: `1px solid ${isProfit ? t.MINT_CIRCLE_BORDER : t.RED_BG_2}`,
                          ...monoStyle,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {profitPctAsset}
                      </span>
                    </div>
                    <div className="md:text-right" style={{ ...monoStyle, fontSize: 14, color: t.INK, fontWeight: 600 }}>
                      <span className="md:hidden" style={{ ...monoStyle, fontSize: 10, color: t.SUBINK, letterSpacing: '0.22em', marginRight: 8, fontWeight: 400 }}>TOTAL</span>
                      {formatEur(asset.currentValue)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Wallet;
