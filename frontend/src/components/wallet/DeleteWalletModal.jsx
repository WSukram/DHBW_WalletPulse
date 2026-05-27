import React from 'react';
import {
  LIGHT,
  DARK,
  headlineStyle,
  monoStyle,
  bodyFontFamily,
  usePrefersDark,
} from '../../theme/softStack';

const DeleteWalletModal = ({ wallet, deleting, onClose, onConfirm }) => {
  const isDark = usePrefersDark();
  const t = isDark ? DARK : LIGHT;
  if (!wallet) return null;

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
        aria-labelledby="delete-wallet-title"
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

        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-3">
            <span
              className="inline-flex w-10 h-10 rounded-full items-center justify-center shrink-0"
              style={{
                background: t.RED_BG,
                color: t.RED_DEEP,
                border: `1px solid ${t.RED_BG_2}`,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>delete</span>
            </span>
            <div>
              <div style={{ ...monoStyle, fontSize: 10, letterSpacing: '0.22em', color: t.SUBINK, marginBottom: 6 }}>
                DANGER · DELETE
              </div>
              <h3 id="delete-wallet-title" style={{ ...headlineStyle, fontWeight: 600, fontSize: 24, color: t.INK, lineHeight: 1.15 }}>
                Delete wallet
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

        <p style={{ fontSize: 14, color: t.SUBINK, marginTop: 14, marginBottom: 12 }}>
          Are you sure you want to delete{' '}
          <span style={{ color: t.INK, fontWeight: 600 }}>"{wallet.name}"</span>?
        </p>
        <p style={{ fontSize: 13, color: t.RED_DEEP, marginBottom: 22 }}>
          This will permanently remove the wallet and all its assets and transactions. This cannot be undone.
        </p>

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
              boxShadow: t.SH_CTA_INK,
              transition: 'box-shadow 160ms ease, transform 160ms ease',
            }}
            onMouseEnter={(e) => { if (!deleting) e.currentTarget.style.boxShadow = t.SH_CTA_INK_H; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = t.SH_CTA_INK; }}
          >
            {deleting ? 'Deleting…' : 'Delete wallet'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteWalletModal;
