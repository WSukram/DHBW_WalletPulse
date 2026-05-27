import React from 'react';
import {
  LIGHT,
  DARK,
  headlineStyle,
  monoStyle,
  bodyFontFamily,
  usePrefersDark,
} from '../../theme/softStack';

const WalletFormModal = ({
  mode = 'create',
  open,
  wallet,
  name,
  setName,
  chainType,
  setChainType,
  chainAddress,
  setChainAddress,
  saving,
  onClose,
  onSubmit,
}) => {
  const isDark = usePrefersDark();
  const t = isDark ? DARK : LIGHT;

  const visible = mode === 'create' ? open : !!wallet;
  if (!visible) return null;

  const isEdit = mode === 'edit';
  const heading = isEdit ? 'Edit wallet' : 'New wallet';
  const subtext = isEdit
    ? `Update name or blockchain address for "${wallet.name}".`
    : 'Give your wallet a name to get started.';
  const submitIdle = isEdit ? 'Save changes' : 'Create wallet';
  const submitBusy = isEdit ? 'Saving…' : 'Creating…';

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
          transformOrigin: 'center',
          animation: 'softStackPop 180ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`@keyframes softStackPop { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }`}</style>
        <div className="flex items-start justify-between mb-1">
          <div>
            <div style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.22em', color: t.SUBINK, marginBottom: 6 }}>
              {isEdit ? 'EDIT · WALLET' : 'CREATE · WALLET'}
            </div>
            <h3 style={{ ...headlineStyle, fontWeight: 600, fontSize: 24, color: t.INK, lineHeight: 1.15 }}>
              {heading}
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
        <p style={{ fontSize: 14, color: t.SUBINK, marginTop: 6, marginBottom: 22 }}>{subtext}</p>

        <div className="space-y-4 mb-6">
          <div>
            <label style={labelStyle}>Wallet name</label>
            <input
              autoFocus
              style={inputStyle}
              placeholder="e.g. Main Portfolio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
              onFocus={focusOn}
              onBlur={focusOff}
            />
          </div>
          <div>
            <label style={labelStyle}>Blockchain (optional)</label>
            <select
              style={inputStyle}
              value={chainType}
              onChange={(e) => setChainType(e.target.value)}
              onFocus={focusOn}
              onBlur={focusOff}
            >
              <option value="">None — manual entry only</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="SOL">Solana (SOL)</option>
            </select>
          </div>
          {chainType && (
            <div>
              <label style={labelStyle}>Wallet address</label>
              <input
                style={{ ...inputStyle, ...monoStyle, fontSize: 13 }}
                placeholder={chainType === 'ETH' ? '0x…' : chainType === 'BTC' ? 'bc1q… or 1A…' : 'Solana address…'}
                value={chainAddress}
                onChange={(e) => setChainAddress(e.target.value)}
                onFocus={focusOn}
                onBlur={focusOff}
              />
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
            onClick={onSubmit}
            disabled={saving || !name.trim()}
            style={{
              padding: '12px 22px',
              borderRadius: 999,
              background: t.CTA_INK_BG,
              color: t.CTA_INK_FG,
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              cursor: saving || !name.trim() ? 'not-allowed' : 'pointer',
              opacity: saving || !name.trim() ? 0.5 : 1,
              boxShadow: t.SH_CTA_INK,
              transition: 'box-shadow 160ms ease, transform 160ms ease',
            }}
            onMouseEnter={(e) => { if (!saving && name.trim()) e.currentTarget.style.boxShadow = t.SH_CTA_INK_H; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = t.SH_CTA_INK; }}
          >
            {saving ? submitBusy : submitIdle}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletFormModal;
