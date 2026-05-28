import React, { useEffect } from 'react';
import { coinMeta } from '../../utils/coins';
import {
  LIGHT,
  DARK,
  headlineStyle,
  monoStyle,
  bodyFontFamily,
  usePrefersDark,
} from '../../theme/softStack';

const coinTint = (coinId, t) => {
  switch (coinId) {
    case 'bitcoin':  return { bg: t.CREAM_CHIP,  border: t.CREAM_CHIP_BORDER };
    case 'ethereum': return { bg: t.LAVENDER,    border: t.HAIR_HEAVY };
    case 'solana':   return { bg: t.MINT_BG,     border: t.MINT_CIRCLE_BORDER };
    default:         return { bg: t.CARD_3,      border: t.HAIR_HEAVY };
  }
};

const DeleteTransactionModal = ({ tx, deleting, onClose, onConfirm, formatEur, formatDate }) => {
  const isDark = usePrefersDark();
  const t = isDark ? DARK : LIGHT;

  useEffect(() => {
    if (!tx) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tx, onClose]);

  if (!tx) return null;
  const meta = coinMeta(tx.coinId);
  const tint = coinTint(tx.coinId, t);
  const total = tx.amount * tx.buyPrice;

  const deleteShadow = isDark
    ? '0 14px 30px -10px rgba(255,143,160,0.45)'
    : '0 14px 30px -10px rgba(201,69,60,0.5)';
  const deleteShadowHover = isDark
    ? '0 18px 36px -10px rgba(255,143,160,0.6)'
    : '0 18px 36px -10px rgba(201,69,60,0.65)';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(8px) saturate(140%)',
        WebkitBackdropFilter: 'blur(8px) saturate(140%)',
        fontFamily: bodyFontFamily,
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-tx-title"
        className="w-full max-w-[440px]"
        style={{
          background: t.CARD,
          border: `1px solid ${t.HAIR_HEAVY}`,
          borderRadius: 24,
          boxShadow: t.SH_HERO,
          padding: 28,
          color: t.INK,
          animation: 'softStackPop 180ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`@keyframes softStackPop { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }`}</style>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: t.RED_BG, border: `1px solid ${t.HAIR_HEAVY}`, color: t.RED_DEEP }}
            >
              <span className="material-symbols-outlined text-[22px]">delete</span>
            </div>
            <div>
              <div style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.22em', color: t.SUBINK, marginBottom: 4 }}>
                DELETE · TRANSACTION
              </div>
              <h3 id="delete-tx-title" style={{ ...headlineStyle, fontWeight: 600, fontSize: 22, color: t.INK, lineHeight: 1.15 }}>
                Delete transaction?
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="material-symbols-outlined"
            style={{
              color: t.SUBINK,
              fontSize: 22,
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              transition: 'background-color 160ms ease, color 160ms ease',
              cursor: 'pointer',
              border: 'none',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = t.CARD_3; e.currentTarget.style.color = t.INK; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.SUBINK; }}
          >
            close
          </button>
        </div>

        {/* Transaction summary chip block */}
        <div
          className="mt-5 px-4 py-4 rounded-2xl"
          style={{ background: t.CARD_2, border: `1px solid ${t.HAIR_HEAVY}` }}
        >
          <div className="flex items-center gap-3">
            <span
              className="inline-flex w-9 h-9 rounded-full items-center justify-center text-[14px] font-bold"
              style={{ background: tint.bg, border: `1px solid ${tint.border}`, color: t.INK }}
            >
              {meta.icon}
            </span>
            <div className="flex flex-col min-w-0">
              <span style={{ ...headlineStyle, fontWeight: 600, fontSize: 14, color: t.INK }}>{meta.name}</span>
              <span style={{ ...monoStyle, fontSize: 11, color: t.SUBINK }} className="truncate">{tx.walletName}</span>
            </div>
          </div>
          <div
            className="mt-4 pt-4 grid grid-cols-3 gap-3"
            style={{ borderTop: `1px solid ${t.HAIR_DIV}` }}
          >
            <div>
              <div style={{ ...monoStyle, fontSize: 9, letterSpacing: '0.22em', color: t.SUBINK, textTransform: 'uppercase', marginBottom: 4 }}>
                Amount
              </div>
              <div className="tabular-nums" style={{ ...monoStyle, fontSize: 12, color: t.INK }}>
                {tx.amount.toFixed(8)}
              </div>
            </div>
            <div>
              <div style={{ ...monoStyle, fontSize: 9, letterSpacing: '0.22em', color: t.SUBINK, textTransform: 'uppercase', marginBottom: 4 }}>
                Price
              </div>
              <div className="tabular-nums" style={{ ...monoStyle, fontSize: 12, color: t.INK }}>
                {formatEur(tx.buyPrice)}
              </div>
            </div>
            <div>
              <div style={{ ...monoStyle, fontSize: 9, letterSpacing: '0.22em', color: t.SUBINK, textTransform: 'uppercase', marginBottom: 4 }}>
                Date
              </div>
              <div className="tabular-nums" style={{ ...monoStyle, fontSize: 12, color: t.INK }}>
                {formatDate(tx.date)}
              </div>
            </div>
          </div>
          <div
            className="mt-3 pt-3 flex items-center justify-between"
            style={{ borderTop: `1px solid ${t.HAIR_DIV}` }}
          >
            <span style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.22em', color: t.SUBINK, textTransform: 'uppercase' }}>
              Total
            </span>
            <span className="tabular-nums" style={{ ...monoStyle, fontSize: 14, fontWeight: 600, color: t.INK }}>
              {formatEur(total)}
            </span>
          </div>
        </div>

        <p className="mt-4 text-[13px]" style={{ color: t.RED_DEEP }}>
          This action cannot be undone.
        </p>

        <div className="flex gap-3 justify-end items-center mt-5">
          <button
            onClick={onClose}
            style={{
              padding: '11px 18px',
              borderRadius: 999,
              background: 'transparent',
              color: t.SUBINK,
              fontSize: 14,
              fontWeight: 500,
              border: `1px solid ${t.HAIR_HEAVY}`,
              cursor: 'pointer',
              transition: 'color 160ms ease, background-color 160ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = t.INK; e.currentTarget.style.background = t.CARD_2; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = t.SUBINK; e.currentTarget.style.background = 'transparent'; }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{
              padding: '12px 22px',
              borderRadius: 999,
              background: t.RED_DEEP,
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              cursor: deleting ? 'not-allowed' : 'pointer',
              opacity: deleting ? 0.6 : 1,
              boxShadow: deleteShadow,
              transition: 'box-shadow 160ms ease, transform 160ms ease',
            }}
            onMouseEnter={(e) => { if (!deleting) e.currentTarget.style.boxShadow = deleteShadowHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = deleteShadow; }}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTransactionModal;
