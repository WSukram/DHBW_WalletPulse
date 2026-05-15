import React from 'react';

const DeleteWalletModal = ({ wallet, deleting, onClose, onConfirm }) => {
  if (!wallet) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-container rounded-xl p-6 w-full max-w-sm border border-outline-variant/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-heading-md text-heading-md text-on-surface mb-1">Delete Wallet</h3>
        <p className="text-sm text-on-surface-variant mb-2">
          Are you sure you want to delete <span className="text-on-surface font-medium">"{wallet.name}"</span>?
        </p>
        <p className="text-sm text-error mb-5">This will permanently remove the wallet and all its assets and transactions. This cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-on-surface-variant font-label-sm text-label-sm hover:text-on-surface transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={deleting} className="px-4 py-2 rounded-lg bg-error text-on-error font-label-sm text-label-sm hover:bg-error/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {deleting ? 'Deleting…' : 'Delete Wallet'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteWalletModal;
