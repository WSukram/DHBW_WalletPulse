import React from 'react';
import {
  LIGHT,
  DARK,
  headlineStyle,
  monoStyle,
  bodyFontFamily,
  usePrefersDark,
} from '../../theme/softStack';

const AddTransactionModal = ({
  open, form, setForm, coinOptions, saving, errorMsg, onClose, onSave, formatEur,
}) => {
  const isDark = usePrefersDark();
  const t = isDark ? DARK : LIGHT;
  if (!open) return null;

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

  const amt = parseFloat(form.amount || 0);
  const price = parseFloat(form.buyPrice || 0);

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
        className="w-full max-w-[480px]"
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
              NEW · TRANSACTION
            </div>
            <h3 style={{ ...headlineStyle, fontWeight: 600, fontSize: 24, color: t.INK, lineHeight: 1.15 }}>
              Add transaction
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
              cursor: 'pointer',
              border: 'none',
              transition: 'background-color 160ms ease, color 160ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = t.CARD_3; e.currentTarget.style.color = t.INK; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.SUBINK; }}
          >
            close
          </button>
        </div>
        <p style={{ fontSize: 14, color: t.SUBINK, marginTop: 6, marginBottom: 22 }}>
          Record a new purchase for this wallet.
        </p>

        <div className="space-y-4">
          <div>
            <label style={labelStyle}>Coin</label>
            <select
              style={inputStyle}
              value={form.coinId}
              onChange={(e) => setForm((f) => ({ ...f, coinId: e.target.value }))}
              onFocus={focusOn}
              onBlur={focusOff}
            >
              <option value="">Select a coin…</option>
              {coinOptions.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Amount</label>
              <input
                type="number" min="0" step="any"
                style={{ ...inputStyle, ...monoStyle, fontSize: 14 }}
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                onFocus={focusOn}
                onBlur={focusOff}
              />
            </div>
            <div>
              <label style={labelStyle}>Buy price (EUR)</label>
              <input
                type="number" min="0" step="any"
                style={{ ...inputStyle, ...monoStyle, fontSize: 14 }}
                placeholder="0.00"
                value={form.buyPrice}
                onChange={(e) => setForm((f) => ({ ...f, buyPrice: e.target.value }))}
                onFocus={focusOn}
                onBlur={focusOff}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Purchase date</label>
            <input
              type="date"
              style={inputStyle}
              value={form.date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              onFocus={focusOn}
              onBlur={focusOff}
            />
          </div>
          {form.amount && form.buyPrice && (
            <div
              style={{
                background: t.MINT_BG,
                border: `1px solid ${t.MINT_CIRCLE_BORDER}`,
                borderRadius: 14,
                padding: '12px 16px',
                fontSize: 13,
                color: t.SUBINK,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.22em' }}>TOTAL COST</span>
              <span style={{ ...monoStyle, fontSize: 15, color: t.INK, fontWeight: 600 }}>
                {formatEur(amt * price)}
              </span>
            </div>
          )}
          {errorMsg && (
            <div
              style={{
                background: t.RED_BG,
                border: `1px solid ${t.RED_BG_2}`,
                borderRadius: 12,
                padding: '10px 14px',
                color: t.RED_DEEP,
                fontSize: 13,
              }}
            >
              {errorMsg}
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end items-center mt-6">
          <button
            onClick={onClose}
            style={{
              padding: '11px 18px',
              borderRadius: 999,
              background: 'transparent',
              color: t.SUBINK,
              fontSize: 14,
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              transition: 'color 160ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = t.INK; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = t.SUBINK; }}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            style={{
              padding: '12px 22px',
              borderRadius: 999,
              background: t.CTA_INK_BG,
              color: t.CTA_INK_FG,
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.5 : 1,
              boxShadow: t.SH_CTA_INK,
              transition: 'box-shadow 160ms ease',
            }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.boxShadow = t.SH_CTA_INK_H; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = t.SH_CTA_INK; }}
          >
            {saving ? 'Saving…' : 'Add transaction'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionModal;
