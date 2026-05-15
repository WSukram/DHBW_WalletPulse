import React from 'react';
import { inputCls, labelCls } from '../../utils/styles';

const EditWalletModal = ({
  wallet, name, setName, chainType, setChainType, chainAddress, setChainAddress,
  saving, onClose, onSave,
}) => {
  if (!wallet) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-container rounded-xl p-6 w-full max-w-sm border border-outline-variant/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-heading-md text-heading-md text-on-surface mb-1">Edit Wallet</h3>
        <p className="text-sm text-on-surface-variant mb-5">Update name or blockchain address for "{wallet.name}".</p>
        <div className="space-y-4 mb-5">
          <div>
            <label className={labelCls}>Wallet Name</label>
            <input
              autoFocus
              className={inputCls}
              placeholder="e.g. Main Portfolio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSave()}
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
          <button onClick={onSave} disabled={saving || !name.trim()} className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditWalletModal;
