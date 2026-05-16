import React from 'react';
import { inputCls, labelCls } from '../../utils/styles';

/**
 * Shared modal for both creating and editing a wallet. `mode` is 'create' or
 * 'edit'. In 'edit' mode the modal renders only when `wallet` is non-null;
 * in 'create' mode visibility is gated on `open`.
 */
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
  const visible = mode === 'create' ? open : !!wallet;
  if (!visible) return null;

  const isEdit = mode === 'edit';
  const heading = isEdit ? 'Edit Wallet' : 'New Wallet';
  const subtext = isEdit
    ? `Update name or blockchain address for "${wallet.name}".`
    : 'Give your wallet a name to get started.';
  const submitIdle = isEdit ? 'Save' : 'Create Wallet';
  const submitBusy = isEdit ? 'Saving…' : 'Creating…';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-container rounded-xl p-6 w-full max-w-sm border border-outline-variant/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-heading-md text-heading-md text-on-surface mb-1">{heading}</h3>
        <p className="text-sm text-on-surface-variant mb-5">{subtext}</p>
        <div className="space-y-4 mb-5">
          <div>
            <label className={labelCls}>Wallet Name</label>
            <input
              autoFocus
              className={inputCls}
              placeholder="e.g. Main Portfolio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
            />
          </div>
          <div>
            <label className={labelCls}>Blockchain (optional)</label>
            <select className={inputCls} value={chainType} onChange={(e) => setChainType(e.target.value)}>
              <option value="">None — manual entry only</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="SOL">Solana (SOL)</option>
            </select>
          </div>
          {chainType && (
            <div>
              <label className={labelCls}>Wallet Address</label>
              <input
                className={inputCls}
                placeholder={chainType === 'ETH' ? '0x...' : chainType === 'BTC' ? 'bc1q... or 1A...' : 'Sol address...'}
                value={chainAddress}
                onChange={(e) => setChainAddress(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-on-surface-variant font-label-sm text-label-sm hover:text-on-surface transition-colors">Cancel</button>
          <button onClick={onSubmit} disabled={saving || !name.trim()} className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? submitBusy : submitIdle}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletFormModal;
