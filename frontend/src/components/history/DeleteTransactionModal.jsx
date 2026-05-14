import React from 'react';
import { coinMeta } from '../../utils/coins';

const DeleteTransactionModal = ({ tx, deleting, onClose, onConfirm, formatEur, formatDate }) => {
  if (!tx) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-container rounded-xl p-6 w-full max-w-sm border border-outline-variant/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-error text-[20px]">delete</span>
        </div>
        <h3 className="font-heading-md text-heading-md text-on-surface mb-2">Delete Transaction</h3>
        <p className="text-sm text-on-surface-variant mb-1">
          {coinMeta(tx.coinId).name} · {tx.amount.toFixed(8)} units
        </p>
        <p className="text-sm text-on-surface-variant mb-5">
          Purchased on {formatDate(tx.date)} at {formatEur(tx.buyPrice)}/unit
        </p>
        <p className="text-sm text-error/80 mb-5">This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-on-surface-variant font-label-sm text-label-sm hover:text-on-surface transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 rounded-lg bg-error text-on-error font-label-sm text-label-sm hover:bg-error/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTransactionModal;
