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

const EditTransactionModal = ({ tx, form, setForm, saving, errorMsg, onClose, onSave, formatEur }) => {
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

  const labelStyle = {
    ...monoStyle,
    fontSize: 10,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: t.SUBINK,
    display: 'block',
    marginBottom: 8,
  };

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 12,
    background: t.PAPER,
    border: `1px solid ${t.HAIR_HEAVY}`,
    color: t.INK,
    fontFamily: bodyFontFamily,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 160ms ease, box-shadow 160ms ease',
  };

  const focusOn = (e) => {
    e.currentTarget.style.borderColor = t.MINT_DEEP;
    e.currentTarget.style.boxShadow = `0 0 0 3px ${t.MINT_BG}`;
  };
  const focusOff = (e) => {
    e.currentTarget.style.borderColor = t.HAIR_HEAVY;
    e.currentTarget.style.boxShadow = 'none';
  };

  const canSave = !!form.amount && !!form.date && !saving;

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
      role="dialog"
      aria-modal="true"
      aria-label="Edit transaction"
    >
      <div
        className="w-full max-w-[460px]"
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

        <div className="flex items-start justify-between mb-1">
          <div>
            <div style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.22em', color: t.SUBINK, marginBottom: 6 }}>
              EDIT · TRANSACTION
            </div>
            <h3 style={{ ...headlineStyle, fontWeight: 600, fontSize: 24, color: t.INK, lineHeight: 1.15 }}>
              Edit transaction
            </h3>
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

        {/* Coin chip + wallet line */}
        <div
          className="flex items-center gap-2.5 mt-3 mb-5 px-3 py-2.5 rounded-2xl"
          style={{ background: t.CARD_2, border: `1px solid ${t.HAIR_HEAVY}` }}
        >
          <span
            className="inline-flex w-7 h-7 rounded-full items-center justify-center text-[13px] font-bold"
            style={{ background: tint.bg, border: `1px solid ${tint.border}`, color: t.INK }}
          >
            {meta.icon}
          </span>
          <div className="flex items-baseline gap-2 min-w-0">
            <span style={{ ...headlineStyle, fontWeight: 600, fontSize: 14, color: t.INK }}>{meta.name}</span>
            <span style={{ ...monoStyle, fontSize: 11, color: t.SUBINK }}>·</span>
            <span style={{ ...monoStyle, fontSize: 11, color: t.SUBINK }} className="truncate">{tx.walletName}</span>
          </div>
        </div>

        <div className="space-y-4 mb-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-tx-amount" style={labelStyle}>Amount</label>
              <input
                id="edit-tx-amount"
                type="number"
                min="0"
                step="any"
                style={{ ...inputStyle, ...monoStyle, fontSize: 13 }}
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                onFocus={focusOn}
                onBlur={focusOff}
              />
            </div>
            <div>
              <label htmlFor="edit-tx-price" style={labelStyle}>Buy price (EUR)</label>
              <input
                id="edit-tx-price"
                type="number"
                min="0"
                step="any"
                style={{ ...inputStyle, ...monoStyle, fontSize: 13 }}
                value={form.buyPrice}
                onChange={(e) => setForm((f) => ({ ...f, buyPrice: e.target.value }))}
                onFocus={focusOn}
                onBlur={focusOff}
              />
            </div>
          </div>
          <div>
            <label htmlFor="edit-tx-date" style={labelStyle}>Purchase date</label>
            <input
              id="edit-tx-date"
              type="date"
              style={{ ...inputStyle, ...monoStyle, fontSize: 13 }}
              value={form.date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              onFocus={focusOn}
              onBlur={focusOff}
            />
          </div>

          {form.amount && form.buyPrice && (
            <div
              className="px-4 py-3 rounded-2xl flex items-center justify-between"
              style={{ background: t.MINT_TINT, border: `1px solid ${t.HAIR_HEAVY}` }}
            >
              <span style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.22em', color: t.SUBINK, textTransform: 'uppercase' }}>
                Total cost
              </span>
              <span className="tabular-nums" style={{ ...monoStyle, fontSize: 14, fontWeight: 600, color: t.INK }}>
                {formatEur(parseFloat(form.amount || 0) * parseFloat(form.buyPrice || 0))}
              </span>
            </div>
          )}

          {errorMsg && (
            <div
              className="px-4 py-3 rounded-2xl"
              style={{ background: t.RED_BG, border: `1px solid ${t.HAIR_HEAVY}`, color: t.RED_DEEP, fontSize: 13 }}
              role="alert"
            >
              {errorMsg}
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end items-center">
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
            onClick={onSave}
            disabled={!canSave}
            style={{
              padding: '12px 22px',
              borderRadius: 999,
              background: t.CTA_INK_BG,
              color: t.CTA_INK_FG,
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              cursor: canSave ? 'pointer' : 'not-allowed',
              opacity: canSave ? 1 : 0.5,
              boxShadow: t.SH_CTA_INK,
              transition: 'box-shadow 160ms ease, transform 160ms ease',
            }}
            onMouseEnter={(e) => { if (canSave) e.currentTarget.style.boxShadow = t.SH_CTA_INK_H; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = t.SH_CTA_INK; }}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTransactionModal;
